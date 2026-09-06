import { cookies } from "next/headers";
import { parseTheme, THEME_COOKIE, type Theme } from "@/utils/theme";

export async function getServerTheme(): Promise<Theme | null> {
  const cookieStore = await cookies();
  return parseTheme(cookieStore.get(THEME_COOKIE)?.value);
}
