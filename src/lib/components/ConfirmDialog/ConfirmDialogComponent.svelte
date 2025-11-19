<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { X, AlertTriangle, AlertCircle, Info } from 'lucide-svelte';
    import { fly, fade } from 'svelte/transition';

    type VariantType = 'danger' | 'warning' | 'info';

    interface Props {
        isOpen?: boolean;
        title?: string;
        message?: string;
        confirmText?: string;
        cancelText?: string;
        variant?: VariantType;
    }

    let { 
        isOpen = false, 
        title = 'Confirmation',
        message = '',
        confirmText = 'Confirmer',
        cancelText = 'Annuler',
        variant = 'danger'
    }: Props = $props();
    
    const dispatch = createEventDispatcher();

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            handleCancel();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            handleCancel();
        }
    }

    function handleConfirm() {
        dispatch('confirm');
        isOpen = false;
    }

    function handleCancel() {
        dispatch('cancel');
        isOpen = false;
    }

    const variantStyles: Record<VariantType, { 
        icon: string; 
        iconBg: string;
        button: string; 
        buttonHover: string;
        border: string;
        iconComponent: typeof AlertTriangle;
    }> = {
        danger: {
            icon: 'text-red-500 dark:text-red-400',
            iconBg: 'bg-red-50 dark:bg-red-950/30',
            button: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus:ring-red-500',
            buttonHover: 'shadow-red-500/50',
            border: 'border-red-200 dark:border-red-800',
            iconComponent: AlertTriangle
        },
        warning: {
            icon: 'text-amber-500 dark:text-amber-400',
            iconBg: 'bg-amber-50 dark:bg-amber-950/30',
            button: 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 focus:ring-amber-500',
            buttonHover: 'shadow-amber-500/50',
            border: 'border-amber-200 dark:border-amber-800',
            iconComponent: AlertCircle
        },
        info: {
            icon: 'text-blue-500 dark:text-blue-400',
            iconBg: 'bg-blue-50 dark:bg-blue-950/30',
            button: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:ring-blue-500',
            buttonHover: 'shadow-blue-500/50',
            border: 'border-blue-200 dark:border-blue-800',
            iconComponent: Info
        }
    };

    const styles = variantStyles[variant];
    const IconComponent = styles.iconComponent;
</script>

{#if isOpen}
    <div 
        class="fixed inset-0 z-[1000] flex items-center justify-center p-4" 
        role="dialog" 
        aria-modal="true" 
        tabindex="-1" 
        onclick={handleBackdropClick} 
        onkeydown={handleKeydown}
        transition:fade={{ duration: 200 }}
    >
        <!-- Backdrop avec effet de flou amélioré -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"></div>
        
        <!-- Dialog -->
        <div 
            class="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
            transition:fly={{ y: 20, duration: 300, easing: (t) => t * (2 - t) }}
        >
            <!-- Header avec gradient subtil -->
            <div class="relative p-6 pb-4">
                <div class="flex items-start gap-4">
                    <!-- Icône avec animation -->
                    <div class="flex-shrink-0">
                        <div class="w-14 h-14 rounded-2xl {styles.iconBg} {styles.icon} flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110">
                            <IconComponent class="w-7 h-7" />
                        </div>
                    </div>
                    
                    <!-- Titre -->
                    <div class="flex-1 min-w-0 pt-1">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {title}
                        </h3>
                    </div>
                    
                    <!-- Bouton fermer amélioré -->
                    <button 
                        class="flex-shrink-0 w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center group"
                        onclick={handleCancel}
                        aria-label="Fermer"
                    >
                        <X class="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                    </button>
                </div>
            </div>

            <!-- Content avec padding amélioré -->
            <div class="px-6 pb-6">
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-[15px]">
                    {message}
                </p>
            </div>

            <!-- Actions avec design moderne -->
            <div class="flex items-center justify-end gap-3 p-6 pt-4 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/30">
                <button
                    type="button"
                    onclick={handleCancel}
                    class="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-sm hover:shadow"
                >
                    {cancelText}
                </button>
                <button
                    type="button"
                    onclick={handleConfirm}
                    class="px-5 py-2.5 text-sm font-semibold text-white {styles.button} rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl {styles.buttonHover} transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
{/if}

