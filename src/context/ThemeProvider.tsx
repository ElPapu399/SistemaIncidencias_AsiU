import { useEffect, useLayoutEffect, useState } from "react";
import type { ReactNode } from 'react';
import type { ThemePreference } from "./ThemeContext";
import { ThemeContext } from "./ThemeContext";

const STORAGE_KEY = 'asiu-theme';

function readPreference(): ThemePreference {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if(saved === 'light' || saved === 'dark' || saved === 'system') {
            return saved;
        }
    } catch {
        // Automático
    }

    return 'system';
}

export default function ThemeProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [preference, setPreference] = useState(readPreference);
    const [systemDark, setSystemDark] = useState(
        () => window.matchMedia('(prefers-color-scheme: dark)').matches,
    );

    useEffect(() => {
        const query = window.matchMedia('(prefers-color-scheme: dark)');

        function update(event: MediaQueryListEvent) {
            setSystemDark(event.matches);
        }

        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        function syncPreference(event: StorageEvent) {
            if (event.key === STORAGE_KEY || event.key === null) {
                setPreference(readPreference());
            }
        }
        window.addEventListener('storage', syncPreference);
        return () => window.removeEventListener('storage', syncPreference);
    }, []);

    const resolvedTheme =
        preference === 'system'
            ? systemDark ? 'dark' : 'light'
            : preference;

    useLayoutEffect(() => {
        document.documentElement.dataset.theme = resolvedTheme;
        const meta = document.querySelector('meta[name="theme-color"]');
        meta?.setAttribute('content', resolvedTheme === 'dark' ? '#0f172a' : '#f1f5f9');

        try {
            localStorage.setItem(STORAGE_KEY, preference);
        } catch {
            // Sigue funcionando aun no guarde
        }
    }, [preference, resolvedTheme]);

    return (
        <ThemeContext.Provider
            value={{ preference, resolvedTheme, setPreference}}
        >
            {children}
        </ThemeContext.Provider>
    )
}
