export type Theme = "light" | "dark";

export const THEME_COOKIE = "theme";

/** Returns null when no explicit choice has been made yet (follow system preference). */
export function parseTheme(value: string | undefined): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}
