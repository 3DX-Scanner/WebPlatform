<script>
    import { onMount } from 'svelte';
    import HeaderComponent from '$lib/components/Header/HeaderComponent.svelte';
    import FooterComponent from '$lib/components/Footer/FooterComponent.svelte';
    import { theme } from '$lib/stores/theme';
    
    let { children, data } = $props();

    theme.initialize();
    
    onMount(() => {
        theme.initialize();
    });

    $effect(() => {
        const currentTheme = $theme;
        if (typeof document !== 'undefined') {
            if (currentTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    });
</script>

<HeaderComponent isAuthenticated={data?.isAuthenticated ?? false} />
{@render children()}
<FooterComponent />