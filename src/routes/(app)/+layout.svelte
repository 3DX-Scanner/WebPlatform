<script>
    import HeaderComponent from '$lib/components/Header/HeaderComponent.svelte';
    import FooterComponent from '$lib/components/Footer/FooterComponent.svelte';
    let { children, data } = $props();
</script>

<HeaderComponent isAuthenticated={data?.isAuthenticated ?? false} />
{@render children()}
<FooterComponent />