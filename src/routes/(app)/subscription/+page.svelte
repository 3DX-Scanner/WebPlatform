<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Check, X } from '@lucide/svelte';
    import { CardPricing } from '$lib/components/ui/card';
    
    let { data } = $props();
    
    const currentSubscription = (data as any).currentSubscription;
    const currentPlanFromData = currentSubscription 
        ? (currentSubscription.planName.toLowerCase() as 'free' | 'pro' | 'enterprise')
        : 'free';
    let currentPlan = $state<'free' | 'pro' | 'enterprise'>(currentPlanFromData);
    
    const planConfig: Record<string, {
        period: string;
        description: string;
        gradient: string;
        borderColor: string;
        buttonText: string;
        buttonVariant: 'default' | 'outline';
        disabled: boolean;
    }> = {
        free: {
            period: '',
            description: 'Parfait pour commencer',
            gradient: 'from-gray-600 to-gray-700',
            borderColor: 'border-gray-500/20',
            buttonText: 'Plan actuel',
            buttonVariant: 'outline',
            disabled: true
        },
        pro: {
            period: '/mois',
            description: 'Le plus populaire',
            gradient: 'from-cyan-500 to-cyan-500 dark:from-cyan-500 dark:to-blue-600',
            borderColor: 'border-cyan-500',
            buttonText: 'Passer au plan Pro',
            buttonVariant: 'default',
            disabled: false
        },
        enterprise: {
            period: '/mois',
            description: 'Pour les équipes',
            gradient: 'from-purple-600 to-pink-600',
            borderColor: 'border-purple-500/20',
            buttonText: 'Contactez-nous',
            buttonVariant: 'outline',
            disabled: false
        }
    };
    
    const plans = (data.plans || []).map((dbPlan: any) => {
        const config = planConfig[dbPlan.id] || planConfig.free;
        const priceValue = typeof dbPlan.price === 'number' 
            ? dbPlan.price 
            : typeof dbPlan.price === 'string' 
                ? parseFloat(dbPlan.price) 
                : Number(dbPlan.price) || 0;
        
        const isCurrentPlan = dbPlan.isCurrentPlan || false;
        
        return {
            id: dbPlan.id,
            planId: dbPlan.planId as string,
            name: dbPlan.name === 'Enterprise' ? 'Entreprise' : dbPlan.name,
            price: dbPlan.id === 'enterprise' ? 'Sur mesure' : (priceValue === 0 ? '0' : priceValue.toFixed(2)),
            period: config.period,
            description: config.description,
            gradient: config.gradient,
            borderColor: config.borderColor,
            buttonText: isCurrentPlan ? 'Plan actuel' : config.buttonText,
            buttonVariant: isCurrentPlan ? 'outline' : config.buttonVariant,
            disabled: isCurrentPlan || config.disabled,
            isCurrentPlan
        };
    });
    
    const comparisonFeatures = data.comparisonFeatures || [];
    
    let isLoading = $state(false);
    
    async function handlePlanSelect(planId: 'free' | 'pro' | 'enterprise') {
        if (planId === 'enterprise') {
            window.location.href = '/contact';
            return;
        }
        
        if (planId === 'free') {
            return;
        }
        
        const plan = plans.find(p => p.id === planId);
        if (!plan || !plan.planId) {
            alert('Erreur: Plan introuvable');
            return;
        }
        
        if (plan.isCurrentPlan) {
            return;
        }
        
        try {
            const authResponse = await fetch('/api/auth/status');
            const authData = await authResponse.json();
            
            if (!authData.authenticated) {
                const returnUrl = encodeURIComponent('/subscription');
                window.location.href = `/login?redirect=${returnUrl}`;
                return;
            }
        } catch (error) {
            window.location.href = '/login';
            return;
        }
        
        isLoading = true;
        try {
            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ planId: plan.planId })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error(data.error || 'Erreur lors de la création de la session de paiement');
            }
            
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('URL de paiement non reçue');
            }
        } catch (error: any) {
            isLoading = false;
            alert(error.message || 'Une erreur est survenue lors du paiement.');
        }
    }
    
</script>

<div class="min-h-screen w-full bg-background">
    <section class="relative py-16 md:py-24 px-4 sm:px-6 md:px-8 overflow-hidden">
        <div class="max-w-4xl mx-auto text-center relative z-10">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
                <span class="hero-gradient-text">Choisissez votre plan</span>
            </h1>
            <p class="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Sélectionnez l'abonnement qui correspond le mieux à vos besoins. Tous les plans incluent nos fonctionnalités de base.
            </p>
        </div>
    </section>

    <section class="py-8 md:py-12 px-4 sm:px-6 md:px-8 relative">
        <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {#each plans as plan}
                    <CardPricing
                        id={plan.id}
                        name={plan.name}
                        price={plan.price}
                        period={plan.period}
                        description={plan.description}
                        gradient={plan.gradient}
                        borderColor={plan.borderColor}
                        buttonText={plan.buttonText}
                        buttonVariant={plan.buttonVariant}
                        disabled={plan.disabled || isLoading}
                        onSelect={handlePlanSelect}
                    />
                {/each}
            </div>
        </div>
    </section>

    <section class="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-background relative">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-center text-3xl md:text-4xl mb-8 text-foreground font-bold">Comparaison des plans</h2>
            
            <div class="mt-20 md:mt-24 overflow-x-auto">
                <div class="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/20 shadow-lg overflow-hidden">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-border/20 bg-muted/30">
                                <th class="text-left p-6 font-bold text-foreground">Fonctionnalité</th>
                                <th class="text-center p-6 font-bold text-foreground">Gratuit</th>
                                <th class="text-center p-6 font-bold text-foreground bg-cyan-500/10">
                                    <div class="flex flex-col items-center gap-1">
                                        <span>Pro</span>
                                    </div>
                                </th>
                                <th class="text-center p-6 font-bold text-foreground bg-purple-500/10">Entreprise</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each comparisonFeatures as feature, index}
                                <tr class="border-b border-border/10 hover:bg-muted/20 transition-colors {index % 2 === 0 ? 'bg-card/40' : ''}">
                                    <td class="p-6 font-semibold text-foreground">{feature.feature}</td>
                                    <td class="p-6 text-center">
                                        {#if typeof feature.free === 'boolean'}
                                            {#if feature.free}
                                                <div class="flex justify-center">
                                                    <Check size={16} class="text-green-600" />
                                                </div>
                                            {:else}
                                                <div class="flex justify-center">
                                                    <X size={16} class="text-red-500" />
                                                </div>
                                            {/if}
                                        {:else}
                                            <span class="text-foreground font-medium">{feature.free}</span>
                                        {/if}
                                    </td>
                                    <td class="p-6 text-center bg-cyan-500/5">
                                        {#if typeof feature.pro === 'boolean'}
                                            {#if feature.pro}
                                                <div class="flex justify-center">
                                                    <div class="w-6 h-6 rounded-full bg-cyan-500 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center">
                                                        <Check size={16} class="text-white" />
                                                    </div>
                                                </div>
                                            {:else}
                                                <div class="flex justify-center">
                                                    <X size={16} class="text-red-500" />
                                                </div>
                                            {/if}
                                        {:else}
                                            <span class="text-foreground font-medium">{feature.pro}</span>
                                        {/if}
                                    </td>
                                    <td class="p-6 text-center bg-purple-500/5">
                                        {#if typeof feature.enterprise === 'boolean'}
                                            {#if feature.enterprise}
                                                <div class="flex justify-center">
                                                    <div class="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                                                        <Check size={16} class="text-white" />
                                                    </div>
                                                </div>
                                            {:else}
                                                <div class="flex justify-center">
                                                    <X size={16} class="text-red-500" />
                                                </div>
                                            {/if}
                                        {:else}
                                            <span class="text-foreground font-medium">{feature.enterprise}</span>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="md:hidden mt-8 space-y-6">
                {#each plans as plan}
                    <div class="bg-card/80 backdrop-blur-sm border-2 {plan.borderColor} rounded-2xl p-6">
                        <h3 class="text-xl font-bold mb-4 text-foreground text-center">{plan.name}</h3>
                        <div class="space-y-3">
                            {#each comparisonFeatures as feature}
                                {@const featureValue = plan.id === 'free' ? feature.free : plan.id === 'pro' ? feature.pro : feature.enterprise}
                                <div class="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                                    <span class="text-sm text-muted-foreground">{feature.feature}</span>
                                    <div class="flex-shrink-0">
                                        {#if typeof featureValue === 'boolean'}
                                            {#if featureValue}
                                                {#if plan.id === 'free'}
                                                    <Check size={12} class="text-green-600" />
                                                {:else}
                                                    <div class="w-5 h-5 rounded-full {plan.id === 'pro' ? 'bg-cyan-500 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600' : 'bg-gradient-to-r ' + plan.gradient} flex items-center justify-center">
                                                        <Check size={12} class="text-white" />
                                                    </div>
                                                {/if}
                                            {:else}
                                                <X size={12} class="text-red-500" />
                                            {/if}
                                        {:else}
                                            <span class="text-sm font-medium text-foreground">{featureValue}</span>
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </section>
</div>
