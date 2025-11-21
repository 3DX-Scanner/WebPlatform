<script>
    import { Button } from '$lib/components/ui/button';
    
    const currentYear = new Date().getFullYear();
    let { minimal = false } = $props();
</script>

<footer class="bg-black text-white">
    {#if !minimal}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
            <h3 class="text-xl font-bold text-white">3DX Scanner</h3>
            <p class="text-gray-400 mt-2">Votre solution de numérisation 3D professionnelle</p>
        </div>
        <div>
            <h4 class="text-sm font-semibold text-white">Navigation</h4>
            <div class="mt-3 space-y-2 flex flex-col items-start">
                <Button variant="ghost" href="/" class="text-gray-400 hover:text-white hover:bg-white/10 justify-start h-auto py-1 px-2 rounded-md transition-all duration-200">
                    Accueil
                </Button>
                <Button variant="ghost" href="/services" class="text-gray-400 hover:text-white hover:bg-white/10 justify-start h-auto py-1 px-2 rounded-md transition-all duration-200">
                    Services
                </Button>
                <Button variant="ghost" href="/about" class="text-gray-400 hover:text-white hover:bg-white/10 justify-start h-auto py-1 px-2 rounded-md transition-all duration-200">
                    À propos
                </Button>
                <Button variant="ghost" href="/contact" class="text-gray-400 hover:text-white hover:bg-white/10 justify-start h-auto py-1 px-2 rounded-md transition-all duration-200">
                    Contact
                </Button>
            </div>
        </div>
        <div>
            <h4 class="text-sm font-semibold text-white">Contact</h4>
            <ul class="mt-3 space-y-2 text-gray-400">
                <li>3dxscanner@gmail.com</li>
                <li>+33 1 23 45 67 89</li>
                <li>6 Av. de Clavières, 30100 Alès</li>
            </ul>
        </div>
        <div>
            <h4 class="text-sm font-semibold text-white">Suivez-nous</h4>
            <div class="mt-3 flex gap-2 flex-wrap">
                <Button variant="ghost" href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" class="text-gray-400 hover:text-white hover:bg-white/10 h-auto py-1 px-2 rounded-md transition-all duration-200">
                    LinkedIn
                </Button>
                <Button variant="ghost" href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" class="text-gray-400 hover:text-white hover:bg-white/10 h-auto py-1 px-2 rounded-md transition-all duration-200">
                    Twitter
                </Button>
                <Button variant="ghost" href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" class="text-gray-400 hover:text-white hover:bg-white/10 h-auto py-1 px-2 rounded-md transition-all duration-200">
                    Facebook
                </Button>
            </div>
        </div>
    </div>
    {/if}
    <div class="border-t border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-400">&copy; {currentYear} 3DX Scanner. Tous droits réservés.</div>
    </div>
</footer>