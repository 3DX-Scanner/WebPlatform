<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { cn } from '$lib/utils';
    
    type Subscription = {
        planId: number;
        planName: string;
        isActive: boolean;
        startDate: string;
        endDate?: string | null;
        storageLimit: number;
    };
    
    type UserStats = {
        storageUsedMB?: number;
        storageLimitGB?: number;
        storagePercentage?: string;
    };
    
    let {
        subscription,
        userStats,
        isCancellingSubscription = false,
        formatStorageUsed,
        onCancelSubscription,
        class: className,
        ...restProps
    }: {
        subscription: Subscription;
        userStats: UserStats;
        isCancellingSubscription?: boolean;
        formatStorageUsed: (usedMB: number) => string;
        onCancelSubscription?: () => void;
        class?: string;
    } & import('svelte/elements').HTMLAttributes<HTMLDivElement> = $props();
    
    function formatPercentage(percentage: number): string {
        if (percentage === 0) return '0%';
        if (percentage < 0.01) return percentage.toFixed(3) + '%';
        if (percentage < 0.1) return percentage.toFixed(2) + '%';
        if (percentage < 1) return percentage.toFixed(1) + '%';
        return percentage.toFixed(0) + '%';
    }
    
    function handleCancelClick() {
        if (onCancelSubscription) {
            onCancelSubscription();
        }
    }
</script>

<div 
    class={cn(
        "rounded-xl p-6 border border-border shadow-sm bg-card",
        className
    )}
    {...restProps}
>
    <div class="flex items-center justify-between mb-4">
        <div>
            <h4 class="text-xl font-bold text-card-foreground mb-2">
                {#if subscription.isActive && subscription.planName.toLowerCase() !== 'free' && subscription.planName.toLowerCase() !== 'gratuit'}
                    Plan {subscription.planName}
                {:else}
                    Plan Gratuit
                {/if}
            </h4>
            <p class="text-muted-foreground">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Actif
                </span>
            </p>
        </div>
        <div class="text-right">
            {#if true}
                {@const usedStorageMB = userStats.storageUsedMB || 0}
                {@const totalStorageGB = userStats.storageLimitGB || Math.round(subscription.storageLimit / 1024)}
                {@const usedFormatted = formatStorageUsed(usedStorageMB)}
                {@const percentage = parseFloat(userStats.storagePercentage || '0')}
                {@const progressColor = percentage > 90 ? 'from-red-500 to-red-600' : percentage > 75 ? 'from-orange-500 to-yellow-500' : percentage > 50 ? 'from-blue-500 to-cyan-500' : 'from-green-500 to-emerald-500'}
                <div class="mb-3">
                    <div class="flex items-center justify-end gap-3 mb-2">
                        <p class="text-2xl font-bold text-card-foreground">{usedFormatted} / {totalStorageGB} Go</p>
                        <div class="w-32">
                            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                    class={cn("h-2 rounded-full transition-all duration-300 ease-out bg-gradient-to-r", progressColor)}
                                    style="width: {Math.min(100, Math.max(percentage > 0 ? 2 : 0, percentage))}%"
                                ></div>
                            </div>
                        </div>
                    </div>
                    <p class="text-xs text-muted-foreground text-right">
                        {formatPercentage(percentage)} utilisé
                    </p>
                </div>
                <p class="text-sm text-muted-foreground">de stockage</p>
            {/if}
        </div>
    </div>
    
    <div class="flex items-center justify-between text-sm">
        {#if subscription.isActive && subscription.planName.toLowerCase() !== 'free' && subscription.planName.toLowerCase() !== 'gratuit'}
            <div class="flex gap-8">
                <div>
                    <span class="text-muted-foreground">Début:</span>
                    <span class="ml-2 font-medium text-card-foreground">
                        {new Date(subscription.startDate).toLocaleDateString('fr-FR')}
                    </span>
                </div>
                {#if subscription.endDate}
                    <div>
                        <span class="text-muted-foreground">Fin:</span>
                        <span class="ml-2 font-medium text-card-foreground">
                            {new Date(subscription.endDate).toLocaleDateString('fr-FR')}
                        </span>
                    </div>
                {/if}
            </div>
        {:else}
            <div class="text-muted-foreground">
                Pas de limite de durée
            </div>
        {/if}
        
        {#if subscription.isActive && subscription.planName !== 'free'}
            <Button 
                variant="outline" 
                onclick={handleCancelClick}
                disabled={isCancellingSubscription}
                size="sm"
            >
                {#if isCancellingSubscription}
                    Annulation...
                {:else}
                    Annuler l'abonnement
                {/if}
            </Button>
        {/if}
    </div>
</div>