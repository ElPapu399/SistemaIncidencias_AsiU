import { createContext } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
    preference: ThemePreference;
    resolvedTheme: 'light' | 'dark';
    setPreference: (value: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);