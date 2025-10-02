<script>
    import { onMount } from 'svelte';
    import HeaderComponent from '$lib/components/Header/HeaderComponent.svelte';
    import FooterComponent from '$lib/components/Footer/FooterComponent.svelte';
    import { isAuthenticated, checkAuth } from '$lib/stores/auth';
    import '../app.css';

    onMount(async () => {
        // Vérifier l'authentification au chargement de la page
        await checkAuth();
    });
</script>

<HeaderComponent />
<main>
    <slot /> 
</main>
<FooterComponent />
