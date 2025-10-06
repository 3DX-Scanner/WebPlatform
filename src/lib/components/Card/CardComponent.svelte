<script lang="ts">
    import './Card.css';
    export let title: string = '';
    export let subtitle: string = '';
    export let content: string = '';
    export let image: string = '';
    export let elevation: 'none' | 'low' | 'medium' | 'high' = 'medium';
    export let variant: 'default' | 'outlined' | 'filled' = 'default';
    export let padding: 'none' | 'small' | 'medium' | 'large' = 'medium';
    export let width: string = '100%';
    export let height: string = 'auto';
    export let className: string = '';

    $: elevationClass = {
        'none': '',
        'low': 'card-elevation-low',
        'medium': 'card-elevation-medium',
        'high': 'card-elevation-high'
    }[elevation];

    $: variantClass = {
        'default': 'card-variant-default',
        'outlined': 'card-variant-outlined',
        'filled': 'card-variant-filled'
    }[variant];

    $: paddingClass = {
        'none': 'card-padding-none',
        'small': 'card-padding-small',
        'medium': 'card-padding-medium',
        'large': 'card-padding-large'
    }[padding];
</script>

<div 
    class="card {elevationClass} {variantClass} {paddingClass} {className}"
    style="width: {width}; height: {height};"
>
    {#if image}
        <div class="card-image">
            <img src={image} alt={title} />
        </div>
    {/if}
    
    <div class="card-content">
        {#if title}
            <h3 class="card-title">{title}</h3>
        {/if}
        
        {#if subtitle}
            <p class="card-subtitle">{subtitle}</p>
        {/if}
        
        {#if content}
            <div class="card-body">
                {content}
            </div>
        {/if}
        
        <div class="card-actions">
            <slot name="actions" />
        </div>
    </div>
</div>