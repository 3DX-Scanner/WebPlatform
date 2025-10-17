<script lang="ts">
    import CardComponent from '$lib/components/Card/CardComponent.svelte';

    let { 
        model,
        onClick = () => {}
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
    class="cursor-pointer transition-all duration-300 rounded-2xl outline-none overflow-hidden bg-white shadow-lg hover:shadow-xl hover:-translate-y-1 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 active:translate-y-0"
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
            <span class="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {model.category}
            </span>
        {/snippet}
    </CardComponent>
</div>
