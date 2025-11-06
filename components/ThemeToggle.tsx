// /components/ThemeToggle.tsx
"use client";
import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setMode(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);
  const toggle = () => {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };
  return (
    <button className="button ghost" onClick={toggle} aria-label="Toggle theme">
      {mode === "light" ? "🌙" : "☀️"}
    </button>
  );
}
