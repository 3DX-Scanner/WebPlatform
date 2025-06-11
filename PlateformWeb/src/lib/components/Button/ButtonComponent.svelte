<script lang="ts">
    import './Button.css';
    export let color: 'primary' | 'secondary' = 'primary';
    export let variant: 'raised' | 'outlined' = 'raised';
    export let href: string | undefined = undefined;
    export let disabled: boolean = false;
    export let onClick: (() => void) | undefined = undefined;
</script>

{#if href}
    <a {href} class="mui-btn {color} {variant} {disabled ? 'disabled' : ''}">
        <slot />
    </a>
{:else}
    <button 
    class="mui-btn {color} {variant} {disabled ? 'disabled' : ''}" 
    on:click={onClick}
    disabled={disabled}>
        <slot />
    </button>
{/if}