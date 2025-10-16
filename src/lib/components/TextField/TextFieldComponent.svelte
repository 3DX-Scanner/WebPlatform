<script lang="ts">
    let { variant = 'outlined', value = $bindable(''), label = '', required = false, type = 'text', placeholder = '', disabled = false, error = '', helperText = '', classe = '' } = $props();
    let isFocused = $state(false);
    const hasValue = $derived(value && value.length > 0);
</script>

<div class={`relative w-full mb-4 ${classe}`}>
    <input 
        id={label}
        class={`w-full ${variant === 'outlined' ? 'border border-gray-300' : variant === 'filled' ? 'border border-transparent bg-gray-50' : 'border-b border-gray-300'} px-3 py-2 text-gray-900 placeholder-transparent ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${error ? 'border-red-500' : ''}`}
        style="outline: none !important; box-shadow: none !important;"
        onfocus={() => isFocused = true}
        onblur={() => isFocused = false}
        {type}
        bind:value
        {required}
        placeholder={placeholder || label}
        {disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={label ? `${label}-help` : undefined}
    />
    {#if label}
        <label 
            for={label} 
            class={`absolute left-3 transition-all duration-200 pointer-events-none ${isFocused || hasValue ? '-top-2.5 text-xs bg-white px-1 text-blue-400' : 'top-2 text-base text-gray-400'} ${error ? 'text-red-500' : ''}`}
        >
            {label}{#if required}<span class="text-red-600 text-xs ml-0.5">*</span>{/if}
        </label>
    {/if}
    {#if helperText && !error}
        <p id={label ? `${label}-help` : undefined} class="mt-1 text-xs text-gray-500">{helperText}</p>
    {/if}
    {#if error}
        <p class="mt-1 text-xs text-red-600">{error}</p>
    {/if}
</div>

