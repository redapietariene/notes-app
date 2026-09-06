"use client";

import { useState } from "react";
import { THEME_COOKIE, type Theme } from "@/utils/theme";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export default function ThemeToggle({
  initialTheme,
}: {
  initialTheme: Theme | null;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme ?? "light");

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  const label = theme === "dark" ? "Dark" : "Light";

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-md px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-steel-soft hover:text-ink"
      aria-label={`Theme: ${label}. Click to switch to ${
        theme === "dark" ? "light" : "dark"
      } mode.`}
    >
      {label}
    </button>
  );
}
