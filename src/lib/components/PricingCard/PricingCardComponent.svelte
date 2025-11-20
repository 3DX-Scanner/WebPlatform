<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    
    type PlanId = 'free' | 'pro' | 'enterprise';
    type ButtonVariant = 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
    
    let {
        id,
        name,
        price,
        period = '',
        description,
        gradient,
        borderColor,
        buttonText,
        buttonVariant = 'outline',
        disabled = false,
        onSelect
    }: {
        id: PlanId;
        name: string;
        price: string;
        period?: string;
        description: string;
        gradient: string;
        borderColor: string;
        buttonText: string;
        buttonVariant?: ButtonVariant;
        disabled?: boolean;
        onSelect?: (id: PlanId) => void;
    } = $props();
    
    function handleClick() {
        if (onSelect) {
            onSelect(id);
        }
    }
</script>

<div 
    class="bg-card/80 backdrop-blur-sm border-2 {borderColor} rounded-2xl p-8 relative transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl {id === 'pro' ? 'scale-105 shadow-lg shadow-cyan-500/20' : 'hover:shadow-xl'} group"
>
    <div class="text-center mb-6">
        <h3 class="text-2xl md:text-3xl font-bold mb-2 text-foreground">{name}</h3>
        <p class="text-sm text-muted-foreground mb-4">{description}</p>
        <div class="flex items-baseline justify-center gap-1 mb-2">
            {#if price === 'Sur mesure'}
                <span class="text-3xl md:text-4xl font-bold bg-gradient-to-r {gradient} bg-clip-text text-transparent">
                    {price}
                </span>
            {:else}
                <span class="text-4xl md:text-5xl font-bold {id === 'pro' ? 'text-cyan-500 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 dark:bg-clip-text dark:text-transparent' : 'bg-gradient-to-r ' + gradient + ' bg-clip-text text-transparent'}">
                    {price}
                </span>
                {#if period}
                    <span class="text-base text-muted-foreground">{period}</span>
                {/if}
            {/if}
        </div>
    </div>
    
    <Button
        variant={buttonVariant}
        class="w-full {id === 'pro' ? 'bg-cyan-500 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 hover:bg-cyan-600 dark:hover:from-cyan-600 dark:hover:to-blue-700 text-white border-0' : ''}"
        disabled={disabled}
        onclick={handleClick}
    >
        {buttonText}
    </Button>
</div>

