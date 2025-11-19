<script lang="ts">
    import { Button } from '$lib/components/ui/button';
</script>

<div class="min-h-screen overflow-x-hidden bg-background">
    <section id="hero" class="min-h-screen flex items-center relative py-8 bg-muted">
        <div class="max-w-2xl z-10 px-24 w-4/5">
            <h1 class="text-6xl font-extrabold leading-tight mb-6 text-foreground">
                <span class="bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">3DX Scanner</span>
                <br>Professionnel
            </h1>
            <p class="text-2xl text-muted-foreground mb-8 leading-relaxed">
                Transformez vos objets physiques en modèles 3D de haute précision
            </p>
            <div class="flex gap-4">
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
        <div class="absolute left-1/2 bottom-20 transform -translate-x-1/2 z-10 flex justify-center items-center animate-bounce pointer-events-none">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8V28" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="text-foreground"/>
                <path d="M10 20L18 28L26 20" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-foreground"/>
            </svg>
        </div>
    </section>
    <section id="features" class="py-24 px-8 bg-background">
        <h2 class="text-center text-4xl mb-12 text-foreground">Fonctionnalités</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div class="bg-card p-8 rounded-lg text-center transition-transform duration-300 hover:-translate-y-1">
                <h3 class="text-card-foreground mb-4 text-2xl">Numérisation précise</h3>
                <p class="text-muted-foreground leading-relaxed">Capturez vos objets avec une précision millimétrique grâce à notre technologie avancée</p>
            </div>
            <div class="bg-card p-8 rounded-lg text-center transition-transform duration-300 hover:-translate-y-1">
                <h3 class="text-card-foreground mb-4 text-2xl">Reconstruction 3D</h3>
                <p class="text-muted-foreground leading-relaxed">Transformez vos captures en modèles 3D détaillés et optimisés</p>
            </div>
            <div class="bg-card p-8 rounded-lg text-center transition-transform duration-300 hover:-translate-y-1">
                <h3 class="text-card-foreground mb-4 text-2xl">Export multiple</h3>
                <p class="text-muted-foreground leading-relaxed">Exportez vos modèles dans différents formats pour une compatibilité maximale</p>
            </div>
        </div>
    </section>
    <div class="w-full flex justify-center items-center h-4.5 my-0 p-0">
        <div class="w-45 h-1.5 bg-border rounded-sm opacity-55 mx-auto shadow-lg"></div>
    </div>
    <section id="how-it-works" class="py-24 px-8 bg-muted">
        <h2 class="text-center text-4xl mb-12 text-foreground">Comment ça marche ?</h2>
        <div class="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-5xl mx-auto flex-nowrap">
            <div class="min-w-55 max-w-65 w-full p-6 pt-12 rounded-lg bg-card shadow-lg border-none transition-all duration-300 text-center relative hover:shadow-2xl hover:-translate-y-1.5 hover:scale-105 hover:z-10">
                <div class="w-14 h-14 text-xl mx-auto mb-4 bg-primary text-primary-foreground flex items-center justify-center rounded-full font-bold shadow-lg border-2 border-background relative -top-8">1</div>
                <h3 class="text-xl font-bold mb-2 -mt-2 text-card-foreground">Capturez</h3>
                <p class="text-base text-muted-foreground mb-0">Prenez plusieurs photos de votre objet sous différents angles</p>
            </div>
            <div class="w-10 h-1 bg-border self-center mx-2 opacity-55 rounded-sm hidden md:block"></div>
            <div class="min-w-55 max-w-65 w-full p-6 pt-12 rounded-lg bg-card shadow-lg border-none transition-all duration-300 text-center relative hover:shadow-2xl hover:-translate-y-1.5 hover:scale-105 hover:z-10">
                <div class="w-14 h-14 text-xl mx-auto mb-4 bg-primary text-primary-foreground flex items-center justify-center rounded-full font-bold shadow-lg border-2 border-background relative -top-8">2</div>
                <h3 class="text-xl font-bold mb-2 -mt-2 text-card-foreground">Traitez</h3>
                <p class="text-base text-muted-foreground mb-0">Notre algorithme analyse et traite vos images</p>
            </div>
            <div class="w-10 h-1 bg-border self-center mx-2 opacity-55 rounded-sm hidden md:block"></div>
            <div class="min-w-55 max-w-65 w-full p-6 pt-12 rounded-lg bg-card shadow-lg border-none transition-all duration-300 text-center relative hover:shadow-2xl hover:-translate-y-1.5 hover:scale-105 hover:z-10">
                <div class="w-14 h-14 text-xl mx-auto mb-4 bg-primary text-primary-foreground flex items-center justify-center rounded-full font-bold shadow-lg border-2 border-background relative -top-8">3</div>
                <h3 class="text-xl font-bold mb-2 -mt-2 text-card-foreground">Visualisez</h3>
                <p class="text-base text-muted-foreground mb-0">Obtenez votre modèle 3D prêt à l'emploi</p>
            </div>
        </div>
    </section>
    <div class="w-full flex justify-center items-center h-4.5 my-0 p-0">
        <div class="w-45 h-1.5 bg-border rounded-sm opacity-55 mx-auto shadow-lg"></div>
    </div>
    <section id="pricing" class="py-24 px-8 bg-background">
        <h2 class="text-center text-4xl mb-12 text-foreground">Tarifs</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div class="bg-card p-8 rounded-lg text-center relative transition-transform duration-300 hover:-translate-y-1">
                <h3 class="text-2xl font-bold mb-4 text-card-foreground">Gratuit</h3>
                <div class="text-5xl font-bold text-card-foreground my-4">0€</div>
                <ul class="list-none p-0 my-8">
                    <li class="my-4 text-muted-foreground">1 Go de stockage cloud</li>
                    <li class="my-4 text-muted-foreground">Export ply</li>
                    <li class="my-4 text-muted-foreground">Support communautaire</li>
                </ul>
                <Button
                    variant="outline"
                    href="/signup"
                >
                    Commencer
                </Button>
            </div>
            <div class="bg-card p-8 rounded-lg text-center relative transition-transform duration-300 hover:-translate-y-1 border-2 border-primary scale-105">
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium">Populaire</div>
                <h3 class="text-2xl font-bold mb-4 text-card-foreground">Pro</h3>
                <div class="text-5xl font-bold text-card-foreground my-4">7.99€<span class="text-base text-muted-foreground">/mois</span></div>
                <ul class="list-none p-0 my-8">
                    <li class="my-4 text-muted-foreground">500 Go de stockage cloud</li>
                    <li class="my-4 text-muted-foreground">Exports ply, obj, fbx, glb</li>
                    <li class="my-4 text-muted-foreground">Support prioritaire</li>
                    <li class="my-4 text-muted-foreground">Accès API</li>
                </ul>
                <Button
                    variant="default"
                    href="/signup"
                >
                    Commencer
                </Button>
            </div>
            <div class="bg-card p-8 rounded-lg text-center relative transition-transform duration-300 hover:-translate-y-1">
                <h3 class="text-2xl font-bold mb-4 text-card-foreground">Entreprise</h3>
                <div class="text-5xl font-bold text-card-foreground my-4">Sur mesure</div>
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