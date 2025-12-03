<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/components/ui/button';
    import HeaderComponent from '$lib/components/Header/HeaderComponent.svelte';
    import FooterComponent from '$lib/components/Footer/FooterComponent.svelte';
    let errorStatus = $derived($page.status);
</script>

<div class="min-h-screen overflow-x-hidden w-full max-w-screen bg-background">
    <HeaderComponent isAuthenticated={false} />
    
    <div class="min-h-[calc(100vh-280px)] w-full flex items-center justify-center relative py-16">
        <!-- Droite -->
        <div class="absolute top-20 right-10 w-48 h-48 bg-cyan-400/30 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-32 right-40 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>
        
        <!-- Gauche -->
        <div class="absolute top-20 left-10 w-48 h-48 bg-purple-400/30 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 left-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-32 left-40 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
        
        <!-- Contenu centré -->
        <div class="relative z-10 text-center px-4">
            <h1 class="error-code font-black text-foreground/80 leading-none mb-8">
                {errorStatus}
            </h1>
            
            <h2 class="text-2xl md:text-3xl font-semibold text-foreground mb-4">
                Page non trouvée.
            </h2>
            
            <p class="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Désolé, nous ne trouvons pas la page que vous recherchez.
            </p>
            
            <Button
                href="/"
                size="lg"
                class="rounded-full"
            >
                Retour à l'accueil
            </Button>
        </div>
    </div>
    
    <FooterComponent />
</div>

<style>
    .error-code {
        font-size: 10rem;
        line-height: 1;
    }
    
    @media (min-width: 768px) {
        .error-code {
            font-size: 16rem;
        }
    }
    
    @media (min-width: 1024px) {
        .error-code {
            font-size: 20rem;
        }
    }
</style>

