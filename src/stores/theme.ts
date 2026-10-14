import { atom } from 'nanostores'

export type Theme = 'light' | 'dark' | 'system'

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const storedTheme = window.localStorage.getItem('theme')
  return storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system' ? storedTheme : 'dark'
}

export const themeStore = atom<Theme>(getInitialTheme())
