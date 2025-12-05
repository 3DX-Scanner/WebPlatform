import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import Inspect from "vite-plugin-inspect";

export default defineConfig({
	plugins: [
        tailwindcss(),
        Inspect(),
        sveltekit()
    ]
});
