<script lang="ts">
    import './home.css';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import HeaderComponent from '$lib/components/Header/HeaderComponent.svelte';
    let isAuthenticated = false;
</script>

<HeaderComponent {isAuthenticated} />

<div class="page-container">
    <section id="hero" class="hero-section" style="position: relative;">
        <div class="hero-content">
            <h1 class="hero-title">
                <span class="gradient-text">3DX Scanner</span>
                <br>Professionnel
            </h1>
            <p class="hero-subtitle">
                Transformez vos objets physiques en modèles 3D de haute précision
            </p>
            <div class="hero-buttons">
                <ButtonComponent
                    color="primary"
                    variant="raised"
                    href="/models3D"
                >
                    Découvrir
                </ButtonComponent>
                {#if !isAuthenticated}
                    <ButtonComponent
                        color="secondary"
                        variant="outlined"
                        href="/login"
                    >
                        Commencer
                    </ButtonComponent>
                {/if}
            </div>
        </div>
        <div class="scroll-down-arrow-hero">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8V28" stroke="black" stroke-width="3" stroke-linecap="round"/>
                <path d="M10 20L18 28L26 20" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
    </section>
    <section id="features" class="features-section">
        <h2 class="section-title">Fonctionnalités</h2>
        <div class="features-grid">
            <div class="feature-card">
                <h3>Numérisation précise</h3>
                <p>Capturez vos objets avec une précision millimétrique grâce à notre technologie avancée</p>
            </div>
            <div class="feature-card">
                <h3>Reconstruction 3D</h3>
                <p>Transformez vos captures en modèles 3D détaillés et optimisés</p>
            </div>
            <div class="feature-card">
                <h3>Export multiple</h3>
                <p>Exportez vos modèles dans différents formats pour une compatibilité maximale</p>
            </div>
        </div>
    </section>
    <div class="section-separator"></div>
    <section id="how-it-works" class="how-it-works-section">
        <h2 class="section-title">Comment ça marche ?</h2>
        <div class="steps-container steps-inline">
            <div class="step step-small">
                <div class="step-number">1</div>
                <h3>Capturez</h3>
                <p>Prenez plusieurs photos de votre objet sous différents angles</p>
            </div>
            <div class="step-connector"></div>
            <div class="step step-small">
                <div class="step-number">2</div>
                <h3>Traitez</h3>
                <p>Notre algorithme analyse et traite vos images</p>
            </div>
            <div class="step-connector"></div>
            <div class="step step-small">
                <div class="step-number">3</div>
                <h3>Visualisez</h3>
                <p>Obtenez votre modèle 3D prêt à l'emploi</p>
            </div>
        </div>
    </section>
    <div class="section-separator"></div>
    <section id="pricing" class="pricing-section">
        <h2 class="section-title">Tarifs</h2>
        <div class="pricing-grid">
            <div class="pricing-card">
                <h3>Gratuit</h3>
                <div class="price">0€</div>
                <ul>
                    <li>5 scans par mois</li>
                    <li>Export basique</li>
                    <li>Support communautaire</li>
                </ul>
                <ButtonComponent
                    color="secondary"
                    variant="outlined"
                    href="/signup"
                >
                    Commencer
                </ButtonComponent>
            </div>
            <div class="pricing-card featured">
                <div class="featured-badge">Populaire</div>
                <h3>Pro</h3>
                <div class="price">29€<span>/mois</span></div>
                <ul>
                    <li>Scans illimités</li>
                    <li>Export avancé</li>
                    <li>Support prioritaire</li>
                    <li>API accès</li>
                </ul>
                <ButtonComponent
                    color="primary"
                    variant="raised"
                    href="/signup"
                >
                    Essayer Pro
                </ButtonComponent>
            </div>
            <div class="pricing-card">
                <h3>Entreprise</h3>
                <div class="price">Sur mesure</div>
                <ul>
                    <li>Fonctionnalités personnalisées</li>
                    <li>Support dédié</li>
                    <li>Formation incluse</li>
                    <li>Intégration sur mesure</li>
                </ul>
                <ButtonComponent
                    color="secondary"
                    variant="outlined"
                    href="/contact"
                >
                    Contactez-nous
                </ButtonComponent>
            </div>
        </div>
    </section>
</div>