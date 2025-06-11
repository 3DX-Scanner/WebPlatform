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

<style>
.mui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, border 0.2s;
  outline: none;
  text-decoration: none;
  min-width: 64px;
  min-height: 36px;
}
.mui-btn.raised.primary {
  background: #111;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
.mui-btn.raised.secondary {
  background: #e0e0e0;
  color: #333;
  box-shadow: 0 2px 4px rgba(0,0,0,0.10);
}
.mui-btn.raised.primary:hover {
  background: #000;
}
.mui-btn.raised.secondary:hover {
  background: #bdbdbd;
}
.mui-btn.outlined.primary {
  background: transparent;
  color: #4296ea;
  border: 2px solid #4296ea;
}
.mui-btn.outlined.secondary {
  background: transparent;
  color: #333;
  border: 2px solid #e0e0e0;
}
.mui-btn.outlined.primary:hover {
  background: rgba(66,150,234,0.08);
}
.mui-btn.outlined.secondary:hover {
  background: #f5f5f5;
}
.mui-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>