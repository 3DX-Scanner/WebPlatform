<script>
    import HeaderComponent from '$lib/components/Header/HeaderComponent.svelte';
    import FooterComponent from '$lib/components/Footer/FooterComponent.svelte';
    import '../app.css';
    let isAuthenticated = false;
</script>

<HeaderComponent {isAuthenticated} />
<main>
    <slot /> 
</main>
<FooterComponent />
