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
                ? 'bg-gray-900 dark:bg-blue-600 text-white hover:bg-gray-700 dark:hover:bg-blue-700 focus:ring-gray-600 dark:focus:ring-blue-500 shadow'
                : 'border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white focus:ring-blue-500 dark:focus:ring-blue-400')
            : (variant === 'raised'
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 shadow'
                : 'border-2 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500 dark:focus:ring-gray-400');
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