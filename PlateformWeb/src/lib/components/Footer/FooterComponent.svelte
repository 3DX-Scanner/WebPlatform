<script>
    import './Footer.css';
    const currentYear = new Date().getFullYear();
</script>

<footer>
    <div class="footer-content">
        <div class="footer-section">
            <h3>Scanner3D</h3>
            <p>Votre solution de numérisation 3D professionnelle</p>
        </div>
        
        <div class="footer-section">
            <h4>Navigation</h4>
            <ul>
                <li><a href="/">Accueil</a></li>
                <li><a href="/services">Services</a></li>
                <li><a href="/about">À propos</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
        </div>
        
        <div class="footer-section">
            <h4>Contact</h4>
            <ul>
                <li>Email: contact@scanner3d.com</li>
                <li>Tél: +33 1 23 45 67 89</li>
                <li>Adresse: 123 Rue de l'Innovation, 75000 Paris</li>
            </ul>
        </div>
        
        <div class="footer-section">
            <h4>Suivez-nous</h4>
            <div class="social-links">
                <a href="#" aria-label="LinkedIn">LinkedIn</a>
                <a href="#" aria-label="Twitter">Twitter</a>
                <a href="#" aria-label="Facebook">Facebook</a>
            </div>
        </div>
    </div>
    
    <div class="footer-bottom">
        <p>&copy; {currentYear} Scanner3D. Tous droits réservés.</p>
    </div>
</footer>