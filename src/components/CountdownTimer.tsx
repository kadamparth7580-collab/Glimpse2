"use client";

import { useEffect, useState } from "react";
import { getTimeRemaining } from "@/lib/utils";

export default function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(() => getTimeRemaining(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getTimeRemaining(expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (remaining.isExpired) {
    return <span className="text-ink/40">Expired</span>;
  }

  const isUrgent = remaining.totalMs < 1000 * 60 * 60; // under 1 hour left

  return (
    <span className={isUrgent ? "text-sage-dark" : "text-ink/50"}>
      {remaining.label}
    </span>
  );
}
