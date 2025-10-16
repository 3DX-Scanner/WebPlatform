<script lang="ts">
    let { 
        color = 'primary', 
        variant = 'raised', 
        href = undefined, 
        disabled = false, 
        onClick = undefined, 
        classe = '', 
        children 
    }: {
        color?: 'primary' | 'secondary';
        variant?: 'raised' | 'outlined';
        href?: string;
        disabled?: boolean;
        onClick?: () => void;
        classe?: string;
        children?: any;
    } = $props();

    const base = 'inline-flex items-center justify-center font-medium rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    const size = 'px-4 py-2 text-base';
    function cls() {
        const palette = color === 'primary'
            ? (variant === 'raised'
                ? 'bg-gray-900 text-white hover:bg-gray-700 focus:ring-gray-600 shadow'
                : 'border-2 border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white')
            : (variant === 'raised'
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 shadow'
                : 'border-2 border-gray-300 text-black hover:bg-gray-100');
        return `${base} ${size} ${palette} ${classe}`;
    }
</script>

{#if href}
    <a {href} class={cls()} aria-disabled={disabled}>
        {@render children?.()}
    </a>
{:else}
    <button class={cls()} onclick={onClick} disabled={disabled}>
        {@render children?.()}
    </button>
{/if}