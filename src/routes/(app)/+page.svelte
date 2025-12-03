<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import Scanner3DViewerComponent from '$lib/components/Scanner3DViewer/Scanner3DViewerComponent.svelte';
</script>

<div class="min-h-screen w-full overflow-x-hidden bg-background">
    <section id="hero" class="min-h-screen flex items-center justify-center relative py-16 overflow-hidden hero-section">
        <div class="w-full flex flex-col lg:flex-row items-center relative z-10">
            <!-- Left side: Text content -->
            <div class="w-full lg:w-1/3 z-20 space-y-6 lg:space-y-8 text-center lg:text-left pl-8 sm:pl-16 lg:pl-32 xl:pl-40 pr-4">
                <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight">
                    <span class="hero-gradient-text">
                        3DX Scanner
                    </span>
                    <span class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground drop-shadow-2xl"> Professionnel</span>
                </h1>
                
                <p class="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed font-light">
                    Transformez vos objets physiques en modèles 3D en quelques minutes
                </p>
                
                <div class="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
                    <Button
                        variant="outline"
                        href="/models3D"
                    >
                        Découvrir
                    </Button>
                    <Button
                        variant="outline"
                        href="/login"
                    >
                        Commencer
                    </Button>
                </div>
            </div>

            <!-- Right side: 3D Model Viewer -->
<!--            <div class="w-full lg:w-2/3 flex justify-end items-start relative pr-8 sm:pr-12 lg:pr-16">-->
<!--                <Scanner3DViewerComponent />-->
<!--            </div>-->
        </div>

        <!-- Scroll down arrow -->
        <div class="absolute left-1/2 bottom-20 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce pointer-events-none">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-cyan-500 dark:text-cyan-400">
                <path d="M18 8V28" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                <path d="M10 20L18 28L26 20" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
    </section>
    <section id="features" class="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-background relative">
        <h2 class="text-center text-3xl md:text-4xl mb-8 md:mb-12 text-foreground font-bold">Fonctionnalités</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <div class="bg-card/40 backdrop-blur-sm border border-cyan-500/20 dark:border-cyan-400/20 p-8 rounded-xl text-center transition-all duration-300 hover:-translate-y-2 hover:border-cyan-500/40 dark:hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/20 dark:hover:shadow-cyan-400/20">
                <h3 class="text-foreground mb-4 text-2xl font-bold">Numérisation précise</h3>
                <p class="text-muted-foreground leading-relaxed">Capturez vos objets avec une précision millimétrique grâce à notre technologie avancée</p>
            </div>
            <div class="bg-card/40 backdrop-blur-sm border border-purple-500/20 dark:border-purple-400/20 p-8 rounded-xl text-center transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/40 dark:hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-500/20 dark:hover:shadow-purple-400/20">
                <h3 class="text-foreground mb-4 text-2xl font-bold">Reconstruction 3D</h3>
                <p class="text-muted-foreground leading-relaxed">Transformez vos captures en modèles 3D détaillés et optimisés</p>
            </div>
            <div class="bg-card/40 backdrop-blur-sm border border-pink-500/20 dark:border-pink-400/20 p-8 rounded-xl text-center transition-all duration-300 hover:-translate-y-2 hover:border-pink-500/40 dark:hover:border-pink-400/40 hover:shadow-xl hover:shadow-pink-500/20 dark:hover:shadow-pink-400/20">
                <h3 class="text-foreground mb-4 text-2xl font-bold">Export multiple</h3>
                <p class="text-muted-foreground leading-relaxed">Exportez vos modèles dans différents formats pour une compatibilité maximale</p>
            </div>
        </div>
    </section>
    <div class="w-full flex justify-center items-center h-4.5 my-0 p-0">
        <div class="w-45 h-1.5 bg-cyan-500 rounded-sm opacity-55 mx-auto shadow-lg shadow-cyan-500/50"></div>
    </div>
    <section id="how-it-works" class="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-background relative">
        <h2 class="text-center text-3xl md:text-4xl mb-8 md:mb-12 text-foreground font-bold">Comment ça marche ?</h2>
        <div class="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-5xl mx-auto flex-nowrap">
            <div class="min-w-55 max-w-65 w-full p-6 pt-12 rounded-xl bg-card/40 backdrop-blur-sm border border-cyan-500/20 dark:border-cyan-400/20 shadow-xl transition-all duration-300 text-center relative hover:shadow-2xl hover:-translate-y-1.5 hover:scale-105 hover:z-10 hover:border-cyan-500/40 dark:hover:border-cyan-400/40">
                <div class="w-14 h-14 text-xl mx-auto mb-4 bg-cyan-600 dark:bg-cyan-500 text-white flex items-center justify-center rounded-full font-bold shadow-lg border-2 border-cyan-400 relative -top-8">1</div>
                <h3 class="text-xl font-bold mb-2 -mt-2 text-foreground">Capturez</h3>
                <p class="text-base text-muted-foreground mb-0">Prenez plusieurs photos de votre objet sous différents angles</p>
            </div>
            <div class="w-10 h-1 bg-cyan-500 self-center mx-2 opacity-55 rounded-sm hidden md:block"></div>
            <div class="min-w-55 max-w-65 w-full p-6 pt-12 rounded-xl bg-card/40 backdrop-blur-sm border border-purple-500/20 dark:border-purple-400/20 shadow-xl transition-all duration-300 text-center relative hover:shadow-2xl hover:-translate-y-1.5 hover:scale-105 hover:z-10 hover:border-purple-500/40 dark:hover:border-purple-400/40">
                <div class="w-14 h-14 text-xl mx-auto mb-4 bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center rounded-full font-bold shadow-lg border-2 border-purple-400 relative -top-8">2</div>
                <h3 class="text-xl font-bold mb-2 -mt-2 text-foreground">Traitez</h3>
                <p class="text-base text-muted-foreground mb-0">Notre algorithme analyse et traite vos images</p>
            </div>
            <div class="w-10 h-1 bg-purple-500 self-center mx-2 opacity-55 rounded-sm hidden md:block"></div>
            <div class="min-w-55 max-w-65 w-full p-6 pt-12 rounded-xl bg-card/40 backdrop-blur-sm border border-pink-500/20 dark:border-pink-400/20 shadow-xl transition-all duration-300 text-center relative hover:shadow-2xl hover:-translate-y-1.5 hover:scale-105 hover:z-10 hover:border-pink-500/40 dark:hover:border-pink-400/40">
                <div class="w-14 h-14 text-xl mx-auto mb-4 bg-pink-600 dark:bg-pink-500 text-white flex items-center justify-center rounded-full font-bold shadow-lg border-2 border-pink-400 relative -top-8">3</div>
                <h3 class="text-xl font-bold mb-2 -mt-2 text-foreground">Visualisez</h3>
                <p class="text-base text-muted-foreground mb-0">Obtenez votre modèle 3D prêt à l'emploi</p>
            </div>
        </div>
    </section>
    <div class="w-full flex justify-center items-center h-4.5 my-0 p-0">
        <div class="w-45 h-1.5 bg-purple-500 rounded-sm opacity-55 mx-auto shadow-lg shadow-purple-500/50"></div>
    </div>
    <section id="pricing" class="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-background relative">
        <h2 class="text-center text-3xl md:text-4xl mb-8 md:mb-12 text-foreground font-bold">Tarifs</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <div class="bg-card/40 backdrop-blur-sm border border-border/20 p-8 rounded-xl text-center relative transition-all duration-300 hover:-translate-y-2 hover:border-border/40 hover:shadow-xl">
                <h3 class="text-2xl font-bold mb-4 text-foreground">Gratuit</h3>
                <div class="text-5xl font-bold text-cyan-500 dark:text-cyan-400 my-4">0€</div>
                <ul class="list-none p-0 my-8">
                    <li class="my-4 text-muted-foreground">1 Go de stockage cloud</li>
                    <li class="my-4 text-muted-foreground">Export ply</li>
                    <li class="my-4 text-muted-foreground">Support communautaire</li>
                </ul>
                <Button
                    variant="outline"
                    href="/subscription"
                >
                    Commencer
                </Button>
            </div>
            <div class="bg-card/80 backdrop-blur-sm border-2 border-cyan-500 dark:border-cyan-400 p-8 rounded-xl text-center relative transition-all duration-300 hover:-translate-y-2 scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 dark:hover:shadow-cyan-400/30 shadow-lg shadow-cyan-500/20 dark:shadow-cyan-400/20">
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">Populaire</div>
                <h3 class="text-2xl font-bold mb-4 text-foreground">Pro</h3>
                <div class="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent my-4">7.99€<span class="text-base text-muted-foreground">/mois</span></div>
                <ul class="list-none p-0 my-8">
                    <li class="my-4 text-muted-foreground">500 Go de stockage cloud</li>
                    <li class="my-4 text-muted-foreground">Exports ply, obj, fbx, glb</li>
                    <li class="my-4 text-muted-foreground">Support prioritaire</li>
                    <li class="my-4 text-muted-foreground">Accès API</li>
                </ul>
                <Button
                    variant="default"
                    href="/subscription"
                >
                    Commencer
                </Button>
            </div>
            <div class="bg-card/40 backdrop-blur-sm border border-purple-500/20 dark:border-purple-400/20 p-8 rounded-xl text-center relative transition-all duration-300 hover:-translate-y-2 hover:border-purple-400/40 dark:hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-500/20 dark:hover:shadow-purple-400/20">
                <h3 class="text-2xl font-bold mb-4 text-foreground">Entreprise</h3>
                <div class="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent my-4">Sur mesure</div>
                <ul class="list-none p-0 my-8">
                    <li class="my-4 text-muted-foreground">Fonctionnalités personnalisées</li>
                    <li class="my-4 text-muted-foreground">Assistance entreprise</li>
                    <li class="my-4 text-muted-foreground">Formation incluse</li>
                    <li class="my-4 text-muted-foreground">Intégration sur mesure</li>
                </ul>
                <Button
                    variant="outline"
                    href="/contact"
                >
                    Contactez-nous
                </Button>
            </div>
        </div>
    </section>
</div>

<style>
    .hero-section {
        position: relative;
    }

    @media (max-width: 1280px) {
        .hero-gradient-text {
            font-size: clamp(2.5rem, 8vw, 4rem);
        }
    }

    @media (max-width: 1024px) {
        .hero-section {
            padding-top: 5rem;
            padding-bottom: 3rem;
        }
    }

    @media (max-width: 768px) {
        .hero-section {
            min-height: auto;
            padding-top: 4rem;
            padding-bottom: 2rem;
        }
    }
</style>