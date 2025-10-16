<script lang="ts">
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    
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

<header style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 9999 !important; background: white !important; border-bottom: 1px solid #e5e7eb !important; width: 100% !important;">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="text-xl font-extrabold text-gray-900"><a href="/">3DX Scanner</a></div>

        <button class="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-200" onclick={toggleMenu} aria-label="Menu">
            <span class="w-5 h-0.5 bg-gray-800 block relative before:content-[''] before:w-5 before:h-0.5 before:bg-gray-800 before:block before:translate-y-[-6px] after:content-[''] after:w-5 after:h-0.5 after:bg-gray-800 after:block after:translate-y-[6px]"></span>
        </button>

        <div class={`hidden md:flex items-center gap-8`}>
            <a href="/" class="group relative text-black visited:text-black hover:text-black focus:text-black">
                Accueil
                <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
            </a>
            <a href="/models3D" class="group relative text-black visited:text-black hover:text-black focus:text-black">
                Nos modèles
                <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
            </a>
            {#if resolvedAuth}
                <a href="/profile" class="group relative text-black visited:text-black hover:text-black focus:text-black">
                    Mon compte
                    <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
                </a>
            {:else}
                <a href="/login" class="group relative text-black visited:text-black hover:text-black focus:text-black">
                    Connexion
                    <span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
                </a>
            {/if}
        </div>
    </nav>

    {#if isMenuOpen}
        <div class="md:hidden border-t border-gray-200 bg-white">
            <div class="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 text-black">
                <a href="/" class="group relative text-black visited:text-black hover:text-black focus:text-black">Accueil<span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span></a>
                <a href="/models3D" class="group relative text-black visited:text-black hover:text-black focus:text-black">Nos modèles<span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span></a>
                {#if resolvedAuth}
                    <a href="/profile" class="group relative text-black visited:text-black hover:text-black focus:text-black">Mon compte<span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span></a>
                {:else}
                    <a href="/login" class="group relative text-black visited:text-black hover:text-black focus:text-black">Connexion<span class="absolute left-0 -bottom-1 h-0.5 w-full bg-black scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span></a>
                {/if}
            </div>
        </div>
    {/if}
</header>
