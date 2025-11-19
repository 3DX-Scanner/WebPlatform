<script>
    import { onMount } from 'svelte';
    import HeaderComponent from '$lib/components/Header/HeaderComponent.svelte';
    import FooterComponent from '$lib/components/Footer/FooterComponent.svelte';
    import { theme } from '$lib/stores/theme';
    
    let { children, data } = $props();

    // Initialiser immédiatement
    theme.initialize();
    
    onMount(() => {
        theme.initialize();
        console.log('🎨 Thème actuel:', $theme);
        console.log('📋 Classe dark sur HTML?', document.documentElement.classList.contains('dark'));
    });

    // Réagir aux changements de thème
    $effect(() => {
        const currentTheme = $theme;
        if (typeof document !== 'undefined') {
            if (currentTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            console.log('✅ Thème appliqué:', currentTheme);
        }
    });
</script>

<HeaderComponent isAuthenticated={data?.isAuthenticated ?? false} />
{@render children()}
<FooterComponent />