import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function getInitialTheme() {
    if (browser) {
        const saved = localStorage.getItem('theme');
        if (saved) {
            return saved as 'light' | 'dark';
        }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    }
    return 'light';
}

export const theme = writable<'light' | 'dark'>(getInitialTheme());

export function toggleTheme() {
    theme.update(current => {
        const newTheme = current === 'light' ? 'dark' : 'light';
        if (browser) {
            localStorage.setItem('theme', newTheme);
        }
        return newTheme;
    });
}

export function applyTheme(themeValue: 'light' | 'dark') {
    if (browser) {
        if (themeValue === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
}
