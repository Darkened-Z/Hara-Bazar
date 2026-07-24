"use client";

import { useState, useEffect } from "react";

export function FlashCountdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    function update() {
      const diff = Math.max(0, endOfDay.getTime() - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ h, m, s });
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{ display: "flex", gap: 4 }}>
      <div style={boxStyle}>{pad(time.h)}</div>
      <div style={colonStyle}>:</div>
      <div style={boxStyle}>{pad(time.m)}</div>
      <div style={colonStyle}>:</div>
      <div style={boxStyle}>{pad(time.s)}</div>
    </div>
  );
}

const boxStyle: React.CSSProperties = {
  background: "#DC2626", color: "#fff", fontSize: 11, fontWeight: 800,
  padding: "3px 6px", borderRadius: 5, minWidth: 26, textAlign: "center",
};

const colonStyle: React.CSSProperties = {
  color: "#DC2626", fontWeight: 800, fontSize: 12, lineHeight: "22px",
};
