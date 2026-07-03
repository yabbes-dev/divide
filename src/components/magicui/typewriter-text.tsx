"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export function TypewriterText({
  text,
  className,
  speed = 45,
}: TypewriterTextProps) {
  const reduceMotion = useReducedMotion();
  const [displayed, setDisplayed] = useState(reduceMotion ? text : "");
  const [done, setDone] = useState(!!reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    setDisplayed("");
    setDone(false);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
        setDone(true);
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [reduceMotion, speed, text]);

  return (
    <p className={cn("min-h-[1.5rem] text-sm text-muted-foreground", className)}>
      {displayed}
      {!done && (
        <span className="ml-0.5 inline-block w-0.5 animate-pulse bg-primary" aria-hidden>
          &nbsp;
        </span>
      )}
    </p>
  );
}
