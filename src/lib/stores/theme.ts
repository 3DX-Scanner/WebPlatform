import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

interface ThemeStore extends Writable<Theme> {
    setTheme: (theme: Theme) => void;
    toggle: () => void;
    initialize: () => void;
}

function createThemeStore(): ThemeStore {
    // Initialisation du thème
    const getInitialTheme = (): Theme => {
        if (browser) {
            // 1. Vérifier localStorage
            const saved = localStorage.getItem('theme');
            if (saved && (saved === 'light' || saved === 'dark')) {
                return saved;
            }
            // 2. Vérifier les préférences système
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    };

    const { subscribe, set, update } = writable<Theme>(getInitialTheme());

    // Fonction pour appliquer le thème au DOM
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

    // Fonction pour sauvegarder dans localStorage
    const saveToStorage = (theme: Theme) => {
        if (browser) {
            localStorage.setItem('theme', theme);
        }
    };

    return {
        subscribe,
        
        // Définir le thème
        setTheme: (theme: Theme) => {
            set(theme);
            applyThemeToDOM(theme);
            saveToStorage(theme);
        },
        
        // Basculer entre light et dark
        toggle: () => {
            update(current => {
                const newTheme: Theme = current === 'light' ? 'dark' : 'light';
                applyThemeToDOM(newTheme);
                saveToStorage(newTheme);
                return newTheme;
            });
        },
        
        // Initialiser le thème (à appeler au démarrage de l'app)
        initialize: () => {
            const initialTheme = getInitialTheme();
            set(initialTheme);
            applyThemeToDOM(initialTheme);
        },

        // Conserver les méthodes du store de base
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

// Export du store singleton
export const theme = createThemeStore();

// Fonctions helper pour compatibilité avec l'ancien code
export const toggleTheme = () => theme.toggle();
export const setTheme = (value: Theme) => theme.setTheme(value);
export const initializeTheme = () => theme.initialize();
