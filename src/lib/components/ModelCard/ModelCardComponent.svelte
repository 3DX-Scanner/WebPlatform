<script lang="ts">
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';

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

<Card
    class="cursor-pointer transition-all duration-300 overflow-hidden hover:shadow-xl hover:-translate-y-1 focus:outline-2 focus:outline-blue-500 dark:focus:outline-blue-400 focus:outline-offset-2 active:translate-y-0 p-0"
    role="button"
    tabindex={0}
    onclick={handleClick}
    onkeydown={handleKeydown}
    aria-label={`Voir le modèle ${model.title}`}
>
    {#if model.image}
        <div class="card-image h-48 w-full overflow-hidden">
            <img
                src={model.image}
                alt={model.title}
                loading="lazy"
                decoding="async"
                class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
        </div>
    {/if}

    <CardHeader class="p-4">
        <div class="flex items-center justify-between gap-2">
            <CardTitle class="text-lg line-clamp-2">{model.title}</CardTitle>
            <Badge variant="secondary" class="shrink-0">
                {model.category}
            </Badge>
        </div>
        {#if model.subtitle}
            <p class="text-sm text-muted-foreground line-clamp-1">{model.subtitle}</p>
        {/if}
    </CardHeader>
</Card>
