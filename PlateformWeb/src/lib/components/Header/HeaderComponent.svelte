<script lang="ts">
    import { onMount } from 'svelte';
    
    // Props
    export let isAuthenticated: boolean = false;
    
    // État local
    let isMenuOpen = false;
    let isScrolled = false;
    
    // Gestion du scroll
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
        // TODO: Implémenter la logique de déconnexion
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
            {#if isAuthenticated}
                <a href="/dashboard" class="nav-link">Tableau de bord</a>
                <a href="/profile" class="nav-link">Profil</a>
                <button class="nav-button" on:click={handleLogout}>Déconnexion</button>
            {:else}
                <a href="/login" class="nav-link">Connexion</a>
                <a href="/signup" class="nav-button primary">Inscription</a>
            {/if}
        </div>
    </nav>
</header>

<style>
    header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: white;
        z-index: 1000;
        transition: all 0.3s ease;
    }
    
    header.scrolled {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .logo a {
        font-size: 1.5rem;
        font-weight: bold;
        color: #4CAF50;
        text-decoration: none;
    }
    
    .nav-links {
        display: flex;
        gap: 1.5rem;
        align-items: center;
    }
    
    .nav-link {
        color: #333;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;
    }
    
    .nav-link:hover {
        color: #4CAF50;
    }
    
    .nav-button {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        background: none;
        color: #333;
    }
    
    .nav-button:hover {
        color: #4CAF50;
    }
    
    .nav-button.primary {
        background-color: #4CAF50;
        color: white;
    }
    
    .nav-button.primary:hover {
        background-color: #45a049;
    }
    
    .menu-button {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
    }
    
    .menu-icon {
        display: block;
        width: 24px;
        height: 2px;
        background-color: #333;
        position: relative;
        transition: all 0.3s;
    }
    
    .menu-icon::before,
    .menu-icon::after {
        content: '';
        position: absolute;
        width: 24px;
        height: 2px;
        background-color: #333;
        transition: all 0.3s;
    }
    
    .menu-icon::before {
        top: -6px;
    }
    
    .menu-icon::after {
        bottom: -6px;
    }
    
    @media (max-width: 768px) {
        .menu-button {
            display: block;
        }
        
        .nav-links {
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            background-color: white;
            padding: 1rem;
            flex-direction: column;
            align-items: stretch;
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .nav-links.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
        }
        
        .nav-link,
        .nav-button {
            padding: 0.75rem;
            text-align: center;
        }
        
        .nav-button.primary {
            margin-top: 0.5rem;
        }
    }
</style>
