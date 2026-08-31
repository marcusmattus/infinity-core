import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceCommand = {
  id: string;
  label: string;
  phrase: string;
  keywords: string[];
};

export const VOICE_COMMANDS: VoiceCommand[] = [
  {
    id: "device",
    label: "Show the device",
    phrase: '"Show the device"',
    keywords: ["device", "hardware", "specs", "dock", "holodock", "engine"],
  },
  {
    id: "stack",
    label: "Show the platform",
    phrase: '"Show the platform"',
    keywords: ["platform", "layers", "stack", "three layers"],
  },
  {
    id: "spatialos",
    label: "Show SpatialOS",
    phrase: '"Show SpatialOS"',
    keywords: [
      "spatialos",
      "spatial os",
      "operating layer",
      "runtime",
      "agent kernel",
      "app bridge",
    ],
  },
  {
    id: "mcp-gateway",
    label: "Connect an MCP server",
    phrase: '"Connect an MCP server"',
    keywords: ["gateway", "mcp server", "connect server", "tools", "discovery"],
  },
  {
    id: "build",
    label: "Build a spatial app",
    phrase: '"Build a spatial app"',
    keywords: ["build", "onboarding", "first app", "simulator", "install sdk", "publish"],
  },
  {
    id: "dashboard",
    label: "Open the dashboard",
    phrase: '"Open the dashboard"',
    keywords: ["dashboard", "console", "projects", "agent builder", "api keys"],
  },
  {
    id: "openware",
    label: "Explain Openware",
    phrase: '"Explain Openware"',
    keywords: ["openware", "plugin", "manifest", "extension", "integrations"],
  },
  {
    id: "mcp",
    label: "Open the SDK",
    phrase: '"Open the SDK"',
    keywords: ["mcp", "sdk", "code", "developer", "inspector", "camera server"],
  },
  {
    id: "access",
    label: "Request access",
    phrase: '"Request access"',
    keywords: ["access", "credentials", "api key", "sign up", "request access"],
  },
  {
    id: "top",
    label: "Go to top",
    phrase: '"Go to top"',
    keywords: ["top", "home", "beginning"],
  },
];

export function matchCommand(input: string): VoiceCommand | null {
  const text = input.toLowerCase();
  for (const command of VOICE_COMMANDS) {
    if (command.keywords.some((keyword) => text.includes(keyword))) return command;
  }
  return null;
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

export function useVoiceCommands(onCommand: (command: VoiceCommand) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("idle — awaiting input");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const commandRef = useRef(onCommand);
  commandRef.current = onCommand;

  const handleText = useCallback((text: string) => {
    setTranscript(text);
    const command = matchCommand(text);
    if (command) {
      setStatus(`matched → ${command.label}`);
      commandRef.current(command);
    } else {
      setStatus("no matching command — try one of the listed intents");
    }
  }, []);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    setSupported(true);
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? "";
      handleText(text);
    };
    recognition.onerror = () => {
      setListening(false);
      setStatus("microphone unavailable — use the text console below");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    };
  }, [handleText]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setStatus("voice capture unsupported in this browser — use the text console");
      return;
    }
    try {
      recognition.start();
      setListening(true);
      setStatus("listening…");
    } catch {
      setStatus("already listening");
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
    setStatus("idle — awaiting input");
  }, []);

  return { supported, listening, transcript, status, start, stop, handleText };
}
