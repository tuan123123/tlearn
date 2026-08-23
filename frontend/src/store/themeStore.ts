import { create } from "zustand"

export type ColorTheme = "dark" | "light"

const THEME_STORAGE_KEY = "tlearn-color-theme"

function getInitialTheme(): ColorTheme {
  if (typeof window === "undefined") {
    return "light"
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

interface ThemeState {
  theme: ColorTheme
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === "dark" ? "light" : "dark"
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
      return { theme }
    }),
}))
