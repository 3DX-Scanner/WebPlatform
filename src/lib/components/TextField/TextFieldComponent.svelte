<script lang="ts">
    import { Eye, EyeOff } from 'lucide-svelte';
    
    let { variant = 'outlined', value = $bindable(''), label = '', required = false, type = 'text', placeholder = '', disabled = false, error = '', helperText = '', classe = '' } = $props();
    let isFocused = $state(false);
    let showPassword = $state(false);
    const hasValue = $derived(value && value.length > 0);
    const isPassword = $derived(type === 'password');
    const inputType = $derived(isPassword && showPassword ? 'text' : type);
</script>

<div class={`relative w-full mb-4 ${classe}`}>
    <div class="relative">
        <input 
            id={label}
            class={`w-full ${variant === 'outlined' ? 'border border-gray-300 dark:border-gray-600' : variant === 'filled' ? 'border border-transparent bg-gray-50 dark:bg-gray-700' : 'border-b border-gray-300 dark:border-gray-600'} ${isPassword ? 'pr-10' : ''} px-3 py-2 text-gray-900 dark:text-white placeholder-transparent bg-white dark:bg-gray-800 ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''} ${error ? 'border-red-500 dark:border-red-400' : ''}`}
            style="outline: none !important; box-shadow: none !important;"
            onfocus={() => isFocused = true}
            onblur={() => isFocused = false}
            type={inputType}
            bind:value
            {required}
            placeholder={placeholder || ''}
            {disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={label ? `${label}-help` : undefined}
        />
        {#if isPassword}
            <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors"
                onclick={() => showPassword = !showPassword}
                tabindex="-1"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
                {#if showPassword}
                    <EyeOff size={20} />
                {:else}
                    <Eye size={20} />
                {/if}
            </button>
        {/if}
    </div>
    {#if label}
        <label 
            for={label} 
            class={`absolute left-3 transition-all duration-200 pointer-events-none ${isFocused || hasValue ? '-top-2.5 text-xs bg-white dark:bg-gray-800 px-1 text-blue-400 dark:text-blue-300' : 'top-2 text-base text-gray-400 dark:text-gray-500'} ${error ? 'text-red-500 dark:text-red-400' : ''}`}
        >
            {label}{#if required}<span class="text-red-600 dark:text-red-400 text-xs ml-0.5">*</span>{/if}
        </label>
    {/if}
    {#if helperText && !error}
        <p id={label ? `${label}-help` : undefined} class="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
    {/if}
    {#if error}
        <p class="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
    {/if}
</div>

