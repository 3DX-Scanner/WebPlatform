<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Check, X } from '@lucide/svelte';
    import PricingCardComponent from '$lib/components/PricingCard/PricingCardComponent.svelte';
    
    let currentPlan = $state<'free' | 'pro' | 'enterprise'>('free');
    
    const plans: Array<{
        id: 'free' | 'pro' | 'enterprise';
        name: string;
        price: string;
        period: string;
        description: string;
        gradient: string;
        borderColor: string;
        buttonText: string;
        buttonVariant: 'default' | 'outline';
        disabled: boolean;
    }> = [
        {
            id: 'free',
            name: 'Gratuit',
            price: '0€',
            period: '',
            description: 'Parfait pour commencer',
            gradient: 'from-gray-600 to-gray-700',
            borderColor: 'border-gray-500/20',
            buttonText: 'Plan actuel',
            buttonVariant: 'outline' as const,
            disabled: true
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '7.99€',
            period: '/mois',
            description: 'Le plus populaire',
            gradient: 'from-cyan-500 to-cyan-500 dark:from-cyan-500 dark:to-blue-600',
            borderColor: 'border-cyan-500',
            buttonText: 'Passer au plan Pro',
            buttonVariant: 'default' as const,
            disabled: false
        },
        {
            id: 'enterprise',
            name: 'Entreprise',
            price: '20€',
            period: '/mois',
            description: 'Pour les équipes',
            gradient: 'from-purple-600 to-pink-600',
            borderColor: 'border-purple-500/20',
            buttonText: 'Contactez-nous',
            buttonVariant: 'outline' as const,
            disabled: false
        }
    ];
    
    // Tableau comparatif des fonctionnalités
    const comparisonFeatures = [
        {
            feature: 'Stockage cloud',
            free: '1 Go',
            pro: '500 Go',
            enterprise: 'Illimité'
        },
        {
            feature: 'Export PLY',
            free: true,
            pro: true,
            enterprise: true
        },
        {
            feature: 'Export OBJ',
            free: false,
            pro: true,
            enterprise: true
        },
        {
            feature: 'Export FBX',
            free: false,
            pro: true,
            enterprise: true
        },
        {
            feature: 'Export GLB',
            free: false,
            pro: true,
            enterprise: true
        },
        {
            feature: 'Export haute résolution',
            free: false,
            pro: true,
            enterprise: true
        },
        {
            feature: 'Scans illimités',
            free: false,
            pro: true,
            enterprise: true
        },
        {
            feature: 'Support communautaire',
            free: true,
            pro: true,
            enterprise: true
        },
        {
            feature: 'Support prioritaire',
            free: false,
            pro: true,
            enterprise: true
        },
        {
            feature: 'Assistance entreprise dédiée',
            free: false,
            pro: false,
            enterprise: true
        },
        {
            feature: 'Accès API',
            free: false,
            pro: true,
            enterprise: true
        },
        {
            feature: 'API personnalisée',
            free: false,
            pro: false,
            enterprise: true
        },
        {
            feature: 'Synchronisation cloud avancée',
            free: false,
            pro: true,
            enterprise: true
        },
        {
            feature: 'Formation incluse',
            free: false,
            pro: false,
            enterprise: true
        },
        {
            feature: 'Intégration sur mesure',
            free: false,
            pro: false,
            enterprise: true
        },
        {
            feature: 'Gestion multi-utilisateurs',
            free: false,
            pro: false,
            enterprise: true
        }
    ];
    
    function handlePlanSelect(planId: 'free' | 'pro' | 'enterprise') {
        if (planId === 'enterprise') {
            window.location.href = '/contact';
        } else if (planId === 'pro') {
            currentPlan = planId;
            alert('Redirection vers le paiement...');
        }
    }
    
</script>

<div class="min-h-screen w-full bg-background">
    <!-- Hero Section -->
    <section class="relative py-16 md:py-24 px-4 sm:px-6 md:px-8 overflow-hidden">
        <div class="max-w-4xl mx-auto text-center relative z-10">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
                <span class="hero-gradient-text">Choisissez votre plan</span>
            </h1>
            <p class="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Sélectionnez l'abonnement qui correspond le mieux à vos besoins. Tous les plans incluent nos fonctionnalités de base.
            </p>
        </div>
        
        <!-- Background decoration -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div class="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
    </section>

    <!-- Pricing Cards -->
    <section class="py-8 md:py-12 px-4 sm:px-6 md:px-8 relative">
        <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {#each plans as plan}
                    <PricingCardComponent
                        id={plan.id}
                        name={plan.name}
                        price={plan.price}
                        period={plan.period}
                        description={plan.description}
                        gradient={plan.gradient}
                        borderColor={plan.borderColor}
                        buttonText={plan.buttonText}
                        buttonVariant={plan.buttonVariant}
                        disabled={plan.disabled}
                        onSelect={handlePlanSelect}
                    />
                {/each}
            </div>
        </div>
    </section>

    <!-- Comparison Table -->
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
                                        <span class="text-xs font-normal text-muted-foreground">7.99€/mois</span>
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
            
            <!-- Mobile-friendly cards view (hidden on desktop) -->
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

<style>
    .hero-gradient-text {
        background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 25%, #8b5cf6 50%, #ec4899 75%, #06b6d4 100%);
        background-size: 300% 300%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradient-shift 8s ease infinite;
        filter: drop-shadow(0 0 30px rgba(59, 130, 246, 0.5));
    }

    @keyframes gradient-shift {
        0%, 100% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
    }
</style>
