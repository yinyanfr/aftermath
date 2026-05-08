import { useEffect, useRef } from "react";
import katex from "katex";

interface MathDisplayProps {
  math: string;
  displayMode?: boolean;
}

export default function MathDisplay({ math, displayMode = true }: MathDisplayProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    try {
      katex.render(math, containerRef.current, {
        displayMode,
        throwOnError: false,
      });
    } catch (e) {
      if (containerRef.current) {
        containerRef.current.textContent = math;
      }
    }
  }, [math, displayMode]);

  return <span ref={containerRef} />;
}