<script>
    const currentYear = new Date().getFullYear();
    let { minimal = false } = $props();
</script>

<footer class="bg-card text-card-foreground">
    {#if !minimal}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
            <h3 class="text-xl font-bold">3DX Scanner</h3>
            <p class="text-muted-foreground mt-2">Votre solution de numérisation 3D professionnelle</p>
        </div>
        <div>
            <h4 class="text-sm font-semibold">Navigation</h4>
            <ul class="mt-3 space-y-2 text-muted-foreground">
                <li><a href="/" class="hover:underline">Accueil</a></li>
                <li><a href="/services" class="hover:underline">Services</a></li>
                <li><a href="/about" class="hover:underline">À propos</a></li>
                <li><a href="/contact" class="hover:underline">Contact</a></li>
            </ul>
        </div>
        <div>
            <h4 class="text-sm font-semibold">Contact</h4>
            <ul class="mt-3 space-y-2 text-muted-foreground">
                <li>contact@3dx.com</li>
                <li>+33 1 23 45 67 89</li>
                <li>6 Av. de Clavières, 30100 Alès</li>
            </ul>
        </div>
        <div>
            <h4 class="text-sm font-semibold">Suivez-nous</h4>
            <div class="mt-3 flex gap-4 text-muted-foreground">
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" class="hover:underline">LinkedIn</a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" class="hover:underline">Twitter</a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" class="hover:underline">Facebook</a>
            </div>
        </div>
    </div>
    {/if}
    <div class="border-t border-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-muted-foreground">&copy; {currentYear} 3DX Scanner. Tous droits réservés.</div>
    </div>
</footer>