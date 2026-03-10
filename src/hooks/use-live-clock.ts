"use client";

import { useState, useEffect } from "react";

export function useLiveClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    function update() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "UTC",
        }) + " UTC"
      );
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}
