<script lang="ts">
    import CardComponent from '$lib/components/Card/CardComponent.svelte';

    let { 
        model,
        onClick = () => {},
        isSelected = false
    }: {
        model: {
            id: number;
            title: string;
            subtitle: string;
            content: string;
            image: string;
            category: string;
            downloads: number;
            rating: number;
            modelPath: string;
            plyPath?: string;
        };
        onClick?: () => void;
        isSelected?: boolean;
    } = $props();

    function handleClick() {
        onClick();
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
        }
    }
</script>

<div 
    class="cursor-pointer transition-all duration-300 rounded-2xl outline-none overflow-hidden bg-white dark:bg-gray-800 {isSelected ? 'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] ring-4 ring-blue-500/30 dark:ring-blue-400/30 scale-[1.02] -translate-y-2' : 'shadow-lg hover:shadow-xl hover:-translate-y-1'} focus:outline-2 focus:outline-blue-500 dark:focus:outline-blue-400 focus:outline-offset-2 active:translate-y-0"
    role="button"
    tabindex="0"
    onclick={handleClick}
    onkeydown={handleKeydown}
    aria-label={`Voir le modèle ${model.title}`}
>
    <CardComponent
        title={model.title}
        subtitle={model.subtitle}
        content=""
        image={model.image}
        elevation="none"
        variant="default"
        padding="none"
    >
        {#snippet title$extra()}
            <span class="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                {model.category}
            </span>
        {/snippet}
    </CardComponent>
</div>
