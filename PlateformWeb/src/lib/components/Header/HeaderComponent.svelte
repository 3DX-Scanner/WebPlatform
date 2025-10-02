<script lang="ts">
    import { onMount } from 'svelte';
    import { isAuthenticated, user, logout } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import './Header.css';
    
    let isMenuOpen = false;
    let isScrolled = false;
    
    onMount(() => {
        const handleScroll = () => {
            isScrolled = window.scrollY > 0;
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    });
    
    // Gestion du menu mobile
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }
    
    function handleLogout() {
        logout();
        goto('/');
    }
</script>

<header class:scrolled={isScrolled}>
    <nav>
        <div class="logo">
            <a href="/">3DX Scanner</a>
        </div>
        
        <!-- Menu mobile -->
        <button class="menu-button" on:click={toggleMenu} aria-label="Menu">
            <span class="menu-icon"></span>
        </button>
        
        <!-- Navigation desktop -->
        <div class="nav-links" class:active={isMenuOpen}>
            <a href="/" class="nav-link">Accueil</a>
            <a href="/models3D" class="nav-link">Nos modèles</a>
            {#if $isAuthenticated}
                <a href="/profile" class="nav-link">Mon compte</a>
            {:else}
                <a href="/login" class="nav-link">Connexion</a>
            {/if}
        </div>
    </nav>
</header>
