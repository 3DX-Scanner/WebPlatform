<script lang="ts">
    import { onMount } from 'svelte';
    import './Header.css';
    
    export let isAuthenticated: boolean = false;
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
        console.log('Déconnexion...');
    }
</script>

<header class:scrolled={isScrolled}>
    <nav>
        <div class="logo">
            <a href="/">Scanner3D</a>
        </div>
        
        <!-- Menu mobile -->
        <button class="menu-button" on:click={toggleMenu} aria-label="Menu">
            <span class="menu-icon"></span>
        </button>
        
        <!-- Navigation desktop -->
        <div class="nav-links" class:active={isMenuOpen}>
            <a href="/" class="nav-link">Accueil</a>
            {#if isAuthenticated}
                <a href="/dashboard" class="nav-link">Tableau de bord</a>
                <a href="/profile" class="nav-link">Profil</a>
                <button class="nav-button" on:click={handleLogout}>Déconnexion</button>
            {:else}
                <a href="/login" class="nav-link">Connexion</a>
            {/if}
        </div>
    </nav>
</header>
