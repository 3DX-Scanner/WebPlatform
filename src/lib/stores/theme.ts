import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

interface ThemeStore extends Writable<Theme> {
    setTheme: (theme: Theme) => void;
    toggle: () => void;
    initialize: () => void;
}

function createThemeStore(): ThemeStore {
    const getInitialTheme = (): Theme => {
        if (browser) {
            const saved = localStorage.getItem('theme');
            if (saved && (saved === 'light' || saved === 'dark')) {
                return saved;
            }
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    };

    const { subscribe, set, update } = writable<Theme>(getInitialTheme());

    const applyThemeToDOM = (theme: Theme) => {
        if (browser) {
            const root = document.documentElement;
            if (theme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    };

    const saveToStorage = (theme: Theme) => {
        if (browser) {
            localStorage.setItem('theme', theme);
        }
    };

    return {
        subscribe,
        
        setTheme: (theme: Theme) => {
            set(theme);
            applyThemeToDOM(theme);
            saveToStorage(theme);
        },
        
        toggle: () => {
            update(current => {
                const newTheme: Theme = current === 'light' ? 'dark' : 'light';
                applyThemeToDOM(newTheme);
                saveToStorage(newTheme);
                return newTheme;
            });
        },
        
        initialize: () => {
            const initialTheme = getInitialTheme();
            set(initialTheme);
            applyThemeToDOM(initialTheme);
        },

        set: (theme: Theme) => {
            set(theme);
            applyThemeToDOM(theme);
            saveToStorage(theme);
        },
        
        update: (fn: (current: Theme) => Theme) => {
            update(current => {
                const newTheme = fn(current);
                applyThemeToDOM(newTheme);
                saveToStorage(newTheme);
                return newTheme;
            });
        }
    };
}

export const theme = createThemeStore();

export const toggleTheme = () => theme.toggle();
export const setTheme = (value: Theme) => theme.setTheme(value);
export const initializeTheme = () => theme.initialize();
