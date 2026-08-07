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
    label: "Show hardware specs",
    phrase: '"Show hardware specs"',
    keywords: ["hardware", "specs", "device", "node", "infinity-1"],
  },
  {
    id: "mcp",
    label: "Launch MCP inspector",
    phrase: '"Launch MCP inspector"',
    keywords: ["mcp", "inspector", "camera server", "sdk", "code"],
  },
  {
    id: "onboarding",
    label: "Start onboarding",
    phrase: '"Start onboarding"',
    keywords: ["onboarding", "developer kit", "access key", "sign up", "start"],
  },
  {
    id: "capabilities",
    label: "Explain capabilities",
    phrase: '"Explain capabilities"',
    keywords: ["capabilities", "features", "fusion", "why"],
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
