<script lang="ts">
    import {onMount} from 'svelte';
    import {afterNavigate} from '$app/navigation';
    import {Button} from "$lib/components/ui/button";
    import {toggleMode} from "mode-watcher";
    import { SunIcon, MoonIcon } from '@lucide/svelte';

    let { isAuthenticated = false } = $props();
    let resolvedAuth = $state(isAuthenticated);
    let isMenuOpen = $state(false);
    
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
</script>

<header class="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border w-full shadow-lg">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="text-xl font-extrabold text-foreground"><a href="/">3DX Scanner</a></div>

        <div class="md:hidden flex items-center gap-2">
            <Button onclick={toggleMode} variant="ghost" size="icon">
                <SunIcon class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0"/>
                <MoonIcon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"/>
                <span class="sr-only">Toggle theme</span>
            </Button>
            <button class="inline-flex items-center justify-center w-10 h-10 rounded-md border border-border" onclick={toggleMenu} aria-label="Menu">
                <span class="w-5 h-0.5 bg-foreground block relative before:content-[''] before:w-5 before:h-0.5 before:bg-foreground before:block before:translate-y-[-6px] after:content-[''] after:w-5 after:h-0.5 after:bg-foreground after:block after:translate-y-[6px]"></span>
            </button>
        </div>

        <div class={`hidden md:flex items-center gap-8`}>
            <a href="/" class="group relative text-foreground visited:text-foreground hover:text-foreground focus:text-foreground">
                Accueil
                <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-foreground scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
            </a>
            <a href="/models3D" class="group relative text-foreground visited:text-foreground hover:text-foreground focus:text-foreground">
                Explorer
                <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-foreground scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
            </a>
            {#if resolvedAuth}
                <a href="/editor" class="group relative text-foreground visited:text-foreground hover:text-foreground focus:text-foreground">
                    Dashboard
                    <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-foreground scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
                </a>
                <a href="/profile" class="group relative text-foreground visited:text-foreground hover:text-foreground focus:text-foreground">
                    Mon compte
                    <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-foreground scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
                </a>
            {:else}
                <a href="/login" class="group relative text-foreground visited:text-foreground hover:text-foreground focus:text-foreground">
                    Connexion
                    <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-foreground scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
                </a>
            {/if}
            <div class="ml-4">
                <Button onclick={toggleMode} variant="ghost" size="icon">
                    <SunIcon class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0"/>
                    <MoonIcon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"/>
                    <span class="sr-only">Toggle theme</span>
                </Button>
            </div>
        </div>
    </nav>

    {#if isMenuOpen}
        <div class="md:hidden border-t border-border bg-background">
            <div class="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 text-foreground">
                <a href="/" class="group relative text-foreground visited:text-foreground hover:text-foreground focus:text-foreground">Accueil<span class="absolute left-0 -bottom-1 h-0.5 w-full bg-foreground scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span></a>
                <a href="/models3D" class="group relative text-foreground visited:text-foreground hover:text-foreground focus:text-foreground">Nos modèles<span class="absolute left-0 -bottom-1 h-0.5 w-full bg-foreground scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span></a>
                {#if resolvedAuth}
                    <a href="/profile" class="group relative text-foreground visited:text-foreground hover:text-foreground focus:text-foreground">Mon compte<span class="absolute left-0 -bottom-1 h-0.5 w-full bg-foreground scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span></a>
                {:else}
                    <a href="/login" class="group relative text-foreground visited:text-foreground hover:text-foreground focus:text-foreground">Connexion<span class="absolute left-0 -bottom-1 h-0.5 w-full bg-foreground scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span></a>
                {/if}
            </div>
        </div>
    {/if}
</header>
