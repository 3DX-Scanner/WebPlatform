<script>
    import HeaderComponent from '$lib/components/Header/HeaderComponent.svelte';
    import FooterComponent from '$lib/components/Footer/FooterComponent.svelte';
    let isAuthenticated = false;

    let { children } = $props();
</script>

<HeaderComponent {isAuthenticated} />
{@render children()}
<FooterComponent />