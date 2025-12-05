<script>
    import HeaderComponent from '$lib/components/Header/HeaderComponent.svelte';
    import FooterComponent from '$lib/components/Footer/FooterComponent.svelte';
    
    let { children, data } = $props();
</script>

<div class="min-h-screen overflow-x-hidden w-full max-w-screen bg-background">
    <HeaderComponent />
    {@render children()}
    <FooterComponent />
</div>