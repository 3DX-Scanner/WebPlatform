<script lang="ts">
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import { theme, toggleTheme, applyTheme } from '$lib/stores/theme';
    
    let { isAuthenticated = false } = $props();
    let resolvedAuth = $state(isAuthenticated);
    let isMenuOpen = $state(false);
    let currentTheme = $state('light');
    
    $effect(() => {
        const unsubscribe = theme.subscribe(value => {
            currentTheme = value;
            applyTheme(value);
        });
        return unsubscribe;
    });
    
    async function refreshAuth() {
        try {
            const res = await fetch('/api/auth/status');
            if (res.ok) {
                const data = await res.json();
                resolvedAuth = Boolean(data?.authenticated);
            }
        } catch {}
    }

    onMount(() => {
        resolvedAuth = isAuthenticated;
        refreshAuth();
    });

    afterNavigate(() => {
        refreshAuth();
    });
    
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }
    
    function handleThemeToggle() {
        toggleTheme();
    }
    
</script>

<header class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 w-full shadow-lg">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="text-xl font-extrabold text-gray-900 dark:text-white"><a href="/">3DX Scanner</a></div>

        <div class="md:hidden flex items-center gap-2">
            <button
                onclick={handleThemeToggle}
                class="p-2 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-800 transition-colors"
                aria-label="Basculer le thème"
            >
                {#if currentTheme === 'light'}
                    <!-- Icône lune -->
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                    </svg>
                {:else}
                    <!-- Icône soleil -->
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                {/if}
            </button>
            <button class="inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 dark:border-gray-600" onclick={toggleMenu} aria-label="Menu">
                <span class="w-5 h-0.5 bg-gray-800 dark:bg-gray-200 block relative before:content-[''] before:w-5 before:h-0.5 before:bg-gray-800 dark:before:bg-gray-200 before:block before:translate-y-[-6px] after:content-[''] after:w-5 after:h-0.5 after:bg-gray-800 dark:after:bg-gray-200 after:block after:translate-y-[6px]"></span>
            </button>
        </div>

        <div class={`hidden md:flex items-center gap-8`}>
            <a href="/" class="group relative text-black dark:text-white visited:text-black dark:visited:text-white hover:text-black dark:hover:text-white focus:text-black dark:focus:text-white">
                Accueil
                <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
            </a>
            <a href="/models3D" class="group relative text-black visited:text-black hover:text-black focus:text-black">
                Solutions
                <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
            </a>
            <a href="/models3D" class="group relative text-black visited:text-black hover:text-black focus:text-black">
                Parcourir
                <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
            </a>
            {#if resolvedAuth}
                <a href="/editor" class="group relative text-black visited:text-black hover:text-black focus:text-black">
                    Dashboard
                    <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
                </a>
                <a href="/profile" class="group relative text-black visited:text-black hover:text-black focus:text-black">
                    Mon compte
                    <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black dark:bg-white scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
                </a>
            {:else}
                <a href="/login" class="group relative text-black dark:text-white visited:text-black dark:visited:text-white hover:text-black dark:hover:text-white focus:text-black dark:focus:text-white">
                    Connexion
                    <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black dark:bg-white scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
                </a>
            {/if}
            <div class="ml-4">
                <button 
                    onclick={handleThemeToggle}
                    class="p-2 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Basculer le thème"
                >
                    {#if currentTheme === 'light'}
                        <!-- Icône lune -->
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                    {:else}
                        <!-- Icône soleil -->
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    {/if}
                </button>
            </div>
        </div>
    </nav>

    {#if isMenuOpen}
        <div class="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div class="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 text-black dark:text-white">
                <a href="/" class="group relative text-black dark:text-white visited:text-black dark:visited:text-white hover:text-black dark:hover:text-white focus:text-black dark:focus:text-white">Accueil<span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black dark:bg-white scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span></a>
                <a href="/models3D" class="group relative text-black dark:text-white visited:text-black dark:visited:text-white hover:text-black dark:hover:text-white focus:text-black dark:focus:text-white">Nos modèles<span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black dark:bg-white scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span></a>
                {#if resolvedAuth}
                    <a href="/profile" class="group relative text-black dark:text-white visited:text-black dark:visited:text-white hover:text-black dark:hover:text-white focus:text-black dark:focus:text-white">Mon compte<span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black dark:bg-white scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span></a>
                {:else}
                    <a href="/login" class="group relative text-black dark:text-white visited:text-black dark:visited:text-white hover:text-black dark:hover:text-white focus:text-black dark:focus:text-white">Connexion<span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black dark:bg-white scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span></a>
                {/if}
            </div>
        </div>
    {/if}
</header>
