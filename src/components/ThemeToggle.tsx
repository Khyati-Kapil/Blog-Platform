"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (theme === "light") root.classList.add("light");
  if (theme === "dark") root.classList.add("dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme | null) ?? "light";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="flex items-center gap-1 rounded-full border border-stone-200/80 bg-[var(--surface)]/70 p-1 text-xs dark:border-stone-700/70 dark:bg-stone-900/60">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`rounded-full px-2.5 py-1 font-semibold transition ${
          theme === "light"
            ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
            : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        }`}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`rounded-full px-2.5 py-1 font-semibold transition ${
          theme === "dark"
            ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
            : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        }`}
      >
        Dark
      </button>
    </div>
  );
}
