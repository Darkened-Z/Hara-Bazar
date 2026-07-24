"use client";

import { useState, useEffect } from "react";

const banners = [
  { bg: "linear-gradient(135deg, #1B3A2D, #2A5A42)", eyebrow: "Fresh Sale", title: "Up to 50% Off", sub: "Cooking oil & ghee deals" },
  { bg: "linear-gradient(135deg, #E85D2A, #F5A623)", eyebrow: "Mega Savings", title: "Free Delivery", sub: "On orders above Rs 2,000" },
  { bg: "linear-gradient(135deg, #1976D2, #42A5F5)", eyebrow: "New Arrivals", title: "Fresh Dairy", sub: "Milk, butter & cheese now available" },
];

export function HeroBanner() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const b = banners[idx];

  return (
    <>
      <div className="hero-banner" style={{ background: b.bg, transition: 'background 0.5s' }}>
        <div className="eyebrow">{b.eyebrow}</div>
        <h2>{b.title}</h2>
        <p>{b.sub}</p>
      </div>
      <div className="hero-dots">
        {banners.map((_, i) => (
          <div
            key={i}
            className={`hero-dot ${i === idx ? "active" : ""}`}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>
    </>
  );
}
