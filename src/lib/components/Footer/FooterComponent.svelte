<script>
    const currentYear = new Date().getFullYear();
    let { minimal = false } = $props();
</script>

<footer class="!bg-black !text-white relative z-50">
    {#if !minimal}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
            <h3 class="text-xl font-bold !text-white">3DX Scanner</h3>
            <p class="!text-white/70 mt-2">Votre solution de numérisation 3D professionnelle</p>
        </div>
        <div>
            <h4 class="text-sm font-semibold !text-white">Navigation</h4>
            <ul class="mt-3 space-y-2 !text-white/80">
                <li><a href="/" class="hover:underline !text-white/80 hover:!text-white">Accueil</a></li>
                <li><a href="/services" class="hover:underline !text-white/80 hover:!text-white">Services</a></li>
                <li><a href="/about" class="hover:underline !text-white/80 hover:!text-white">À propos</a></li>
                <li><a href="/contact" class="hover:underline !text-white/80 hover:!text-white">Contact</a></li>
            </ul>
        </div>
        <div>
            <h4 class="text-sm font-semibold !text-white">Contact</h4>
            <ul class="mt-3 space-y-2 !text-white/80">
                <li class="!text-white/80">Email: contact@scanner3d.com</li>
                <li class="!text-white/80">Tél: +33 1 23 45 67 89</li>
                <li class="!text-white/80">Adresse: 123 Rue de l'Innovation, 75000 Paris</li>
            </ul>
        </div>
        <div>
            <h4 class="text-sm font-semibold !text-white">Suivez-nous</h4>
            <div class="mt-3 flex gap-4">
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" class="!text-white/80 hover:!text-[#0077B5] transition-all duration-300 font-medium hover:underline decoration-[#0077B5] underline-offset-4">LinkedIn</a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" class="!text-white/80 hover:!text-[#1DA1F2] transition-all duration-300 font-medium hover:underline decoration-[#1DA1F2] underline-offset-4">Twitter</a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" class="!text-white/80 hover:!text-[#1877F2] transition-all duration-300 font-medium hover:underline decoration-[#1877F2] underline-offset-4">Facebook</a>
            </div>
        </div>
    </div>
    {/if}
    <div class="border-t !border-white/15">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm !text-white/70">&copy; {currentYear} 3DX Scanner. Tous droits réservés.</div>
    </div>
</footer>