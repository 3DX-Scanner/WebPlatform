<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { X, AlertTriangle, AlertCircle, Info } from 'lucide-svelte';
    import { fly, fade } from 'svelte/transition';
    import { Button } from '$lib/components/ui/button';

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
        border: string;
        iconComponent: typeof AlertTriangle;
    }> = {
        danger: {
            icon: 'text-destructive',
            iconBg: 'bg-destructive/10',
            border: 'border-destructive/20',
            iconComponent: AlertTriangle
        },
        warning: {
            icon: 'text-amber-500',
            iconBg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            iconComponent: AlertCircle
        },
        info: {
            icon: 'text-primary',
            iconBg: 'bg-primary/10',
            border: 'border-primary/20',
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
        <div class="absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity duration-300"></div>
        
        <!-- Dialog -->
        <div 
            class="relative bg-card rounded-3xl shadow-2xl w-full max-w-md border border-border overflow-hidden"
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
                        <h3 class="text-xl font-bold text-foreground tracking-tight">
                            {title}
                        </h3>
                    </div>
                    
                    <!-- Bouton fermer amélioré -->
                    <Button
                        variant="ghost"
                        size="icon"
                        onclick={handleCancel}
                        class="flex-shrink-0 w-8 h-8 text-muted-foreground hover:text-foreground"
                        aria-label="Fermer"
                    >
                        <X class="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <!-- Content avec padding amélioré -->
            <div class="px-6 pb-6">
                <p class="text-muted-foreground leading-relaxed whitespace-pre-line text-[15px]">
                    {message}
                </p>
            </div>

            <!-- Actions avec design moderne -->
            <div class="flex items-center justify-center gap-3 p-6 pt-4 border-t border-border">
                <Button
                    type="button"
                    variant="outline"
                    onclick={handleCancel}
                >
                    {cancelText}
                </Button>
                <Button
                    type="button"
                    variant={variant === 'danger' ? 'destructive' : 'default'}
                    onclick={handleConfirm}
                >
                    {confirmText}
                </Button>
            </div>
        </div>
    </div>
{/if}

