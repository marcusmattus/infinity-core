import { useEffect, useRef, useState, type RefObject } from "react";

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** `null` until the check runs — the page renders its fallback until then. */
export function useWebGL(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      setSupported(Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl")));
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}

/** Phones render at a lower ceiling: the stack is legible, the fan stays off. */
export function useMaxDpr(): number {
  const [max, setMax] = useState(1.5);
  useEffect(() => {
    const small = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const update = () => setMax(small.matches ? 1.35 : 2);
    update();
    small.addEventListener("change", update);
    return () => small.removeEventListener("change", update);
  }, []);
  return max;
}

/**
 * Scroll position through a tall section, 0–1, delivered on animation frames.
 * The callback is read from a ref so a changing closure never re-subscribes.
 */
export function useScrollProgress(
  sectionRef: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
) {
  const callback = useRef(onProgress);
  callback.current = onProgress;

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const distance = section.offsetHeight - window.innerHeight;
      if (distance <= 0) {
        callback.current(0);
        return;
      }
      const travelled = -section.getBoundingClientRect().top / distance;
      callback.current(travelled < 0 ? 0 : travelled > 1 ? 1 : travelled);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sectionRef]);
}
