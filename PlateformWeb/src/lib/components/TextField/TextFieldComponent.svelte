<script lang="ts">
    import './TextField.css';
    // Props du composant
    export let variant: 'outlined' | 'filled' | 'standard' = 'outlined';
    export let value: string = '';
    export let label: string = '';
    export let required: boolean = false;
    export let type: string = 'text';
    export let placeholder: string = '';
    export let disabled: boolean = false;
    export let error: string = '';
    export let helperText: string = '';
    export let classe: string = '';

    let isFocused = false;
    let hasValue = false;
    $: hasValue = value.length > 0;
</script>

<div class="textfield-container {variant} {disabled ? 'disabled' : ''} {error ? 'error' : ''} {classe}">
    <div class="textfield-wrapper">
        <input
            type={type}
            id={label}
            bind:value
            required={required}
            {placeholder}
            {disabled}
            on:focus={() => isFocused = true}
            on:blur={() => isFocused = false}
            class="input"
        />
        <label for={label} class="label {isFocused || hasValue ? 'active' : ''}">
            {label}
            {#if required}
                <span class="required">*</span>
            {/if}
        </label>
        {#if variant === 'outlined'}
            <!-- svelte-ignore element_invalid_self_closing_tag -->
            <div class="outline" />
        {/if}
    </div>
    {#if helperText && !error}
        <span class="helper-text">{helperText}</span>
    {/if}
    {#if error}
        <span class="error-text">{error}</span>
    {/if}
</div>

