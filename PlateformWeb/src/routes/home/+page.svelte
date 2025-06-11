<script lang="ts">
    import { onMount } from 'svelte';
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import HeaderComponent from '$lib/components/Header/HeaderComponent.svelte';

    let container: HTMLElement;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;
    let mixer: THREE.AnimationMixer;
    let clock: THREE.Clock;
    let isAuthenticated = false;

    // Animation de défilement
    let currentSection = 0;
    const sections = ['hero', 'features', 'how-it-works', 'pricing'];

    function scrollToSection(sectionId: string) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Configuration de la scène 3D
    function initThreeJS() {
        scene = new THREE.Scene();
        // Fond transparent
        // Pas de scene.background, le renderer est déjà en alpha
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(-10, 5, 30);
        camera.lookAt(0, 5, 0);
        
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setClearColor(0x000000, 0); // transparent
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Contrôles de la caméra
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;

        // Éclairage
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        // Ajout d'une lumière ponctuelle pour des reflets nets
        const pointLight = new THREE.PointLight(0xffffff, 1.2, 100);
        pointLight.position.set(-5, 8, 10);
        scene.add(pointLight);

        // Position de la caméra
        camera.position.set(-10, 5, 30);
        camera.lookAt(0, 5, 0);

        // Paramètres de la sphère
        const radius = 24;
        const widthSegments = 32;
        const heightSegments = 16;

        // Création de la géométrie de la sphère
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

        // Matériau en wireframe
        const material = new THREE.MeshBasicMaterial({
            color: 0x2194ce,
            wireframe: true
        });

        // Création du mesh
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = 0;
        scene.add(sphere);

        // Effet de neige
        const snowCount = 200;
        const snowGeometry = new THREE.BufferGeometry();
        const snowPositions = new Float32Array(snowCount * 3);
        for (let i = 0; i < snowCount; i++) {
            snowPositions[i * 3] = (Math.random() - 0.5) * 80; // x
            snowPositions[i * 3 + 1] = Math.random() * 60 + 10; // y (au-dessus de la sphère)
            snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 80; // z
        }
        snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
        const snowMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 });
        const snow = new THREE.Points(snowGeometry, snowMaterial);
        scene.add(snow);

        // Animation
        clock = new THREE.Clock();
        
        function animate() {
            requestAnimationFrame(animate);
            const time = clock.getElapsedTime();
            sphere.rotation.y = time * 0.5;
            sphere.rotation.x = Math.sin(time * 0.3) * 0.2;

            // Animation de la neige
            const positions = snowGeometry.attributes.position.array;
            for (let i = 0; i < snowCount; i++) {
                positions[i * 3 + 1] -= 0.15; // vitesse de chute
                if (positions[i * 3 + 1] < -10) {
                    positions[i * 3 + 1] = Math.random() * 60 + 10; // replacer en haut
                    positions[i * 3] = (Math.random() - 0.5) * 80;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
                }
            }
            snowGeometry.attributes.position.needsUpdate = true;

            controls.update();
            renderer.render(scene, camera);
        }

        animate();

        // Gestion du redimensionnement
        camera.aspect = container.clientWidth / container.clientHeight;
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    onMount(() => {
        initThreeJS();
    });
</script>

<HeaderComponent {isAuthenticated} />

<div class="page-container">
    <!-- Section Hero avec animation 3D -->
    <section id="hero" class="hero-section" style="position: relative;">
        <div class="hero-content">
            <h1 class="hero-title">
                <span class="gradient-text">Scanner 3D</span>
                <br>Professionnel
            </h1>
            <p class="hero-subtitle">
                Transformez vos objets physiques en modèles 3D de haute précision
            </p>
            <div class="hero-buttons">
                <ButtonComponent
                    color="primary"
                    variant="raised"
                    on:click={() => scrollToSection('features')}
                >
                    Découvrir
                </ButtonComponent>
                {#if !isAuthenticated}
                    <ButtonComponent
                        color="secondary"
                        variant="outlined"
                        on:click={() => window.location.href = '/signup'}
                    >
                        Commencer
                    </ButtonComponent>
                {/if}
            </div>
        </div>
        <div class="hero-3d" bind:this={container}></div>
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
                <div class="feature-icon">
                    <!-- Colle ici le SVG correspondant -->
                </div>
                <h3>Numérisation précise</h3>
                <p>Capturez vos objets avec une précision millimétrique grâce à notre technologie avancée</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <!-- Colle ici le SVG correspondant -->
                </div>
                <h3>Reconstruction 3D</h3>
                <p>Transformez vos captures en modèles 3D détaillés et optimisés</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <!-- Colle ici le SVG correspondant -->
                </div>
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
                    color="primary"
                    variant="outlined"
                    on:click={() => window.location.href = '/signup'}
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
                    on:click={() => window.location.href = '/signup'}
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
                    on:click={() => window.location.href = '/contact'}
                >
                    Contactez-nous
                </ButtonComponent>
            </div>
        </div>
    </section>
</div>

<style>
:global(body) {
    background: var(--color-background-alt) !important;
}

.page-container {
    background: var(--color-background-alt) !important;
    min-height: 100vh;
    overflow-x: hidden;
}

section {
    background: var(--color-background-alt) !important;
    margin: 0 auto;
    padding: 2.5rem 0 2rem 0;
    border-radius: 0;
    position: relative;
    box-shadow: none !important;
    border: none !important;
}

.section-separator {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 18px;
    margin: 0;
    padding: 0;
}
.section-separator::after {
    content: '';
    display: block;
    width: 180px;
    height: 6px;
    background: var(--color-text-primary);
    border-radius: 3px;
    opacity: 0.55;
    margin: 0 auto;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
}

section + section {
    margin-top: 0;
    border-top: 1.5px solid var(--color-border);
    box-shadow: 0 -2px 12px 0 rgba(0,0,0,0.03);
}

/* Section Hero */
.hero-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    position: relative;
    padding: 2rem 0;
    background: var(--color-background-alt);
    border-radius: 0;
    box-shadow: none;
}

.hero-content {
    max-width: 600px;
    z-index: 1;
    padding: 6rem;
    width: 80%;
}

.hero-title {
    font-size: 4rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 1.5rem;
}

.gradient-text {
    background: linear-gradient(45deg, var(--color-primary), var(--color-accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero-subtitle {
    font-size: 1.5rem;
    color: var(--color-text-secondary);
    margin-bottom: 2rem;
    line-height: 1.6;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
}

.hero-3d {
    position: absolute;
    top: 0;
    right: 0;
    width: 55%;
    height: 100%;
    z-index: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: transparent !important;
    overflow: hidden;
}
.hero-3d canvas {
    width: 100% !important;
    height: 100% !important;
    display: block;
    background: transparent !important;
    margin-right: -50%;
}

.hero-3d::after {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 60px;
    pointer-events: none;
    background: linear-gradient(to bottom, transparent, var(--color-background-alt) 90%);
    z-index: 2;
}

/* Section Fonctionnalités */
.features-section {
    padding: 6rem 2rem;
    background: var(--color-background);
}

.section-title {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: var(--color-text-primary);
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.feature-card {
    background: var(--color-background);
    padding: 2rem;
    border-radius: var(--border-radius-lg);
    box-shadow: none !important;
    border: none !important;
    transition: transform var(--transition-normal);
    text-align: center;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature-card h3 {
    color: var(--color-text-primary);
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.feature-card p {
    color: var(--color-text-secondary);
    line-height: 1.6;
}

/* Section Comment ça marche */
.how-it-works-section {
    padding: 6rem 2rem;
    background: var(--color-background-alt);
}

.steps-container.steps-inline {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    gap: 2rem;
    max-width: 1100px;
    margin: 0 auto;
    flex-wrap: nowrap;
}

.step.step-small {
    min-width: 220px;
    max-width: 260px;
    width: 100%;
    padding: 1.5rem 1.2rem 1.2rem 1.2rem;
    border-radius: var(--border-radius-lg);
    background: #fff !important;
    box-shadow: 0 4px 24px 0 rgba(25, 118, 210, 0.08), 0 2px 8px rgba(0,0,0,0.06);
    border: none !important;
    transition: box-shadow 0.25s, transform 0.18s;
    text-align: center;
    position: relative;
}

.step.step-small:hover {
    box-shadow: 0 12px 40px rgba(25, 118, 210, 0.16), 0 2px 8px rgba(0,0,0,0.08);
    transform: translateY(-6px) scale(1.035);
    z-index: 2;
}

.step.step-small .step-number {
    width: 56px;
    height: 56px;
    font-size: 1.35rem;
    margin: 0 auto 1rem auto;
    background: var(--color-text-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
    border: 2.5px solid #fff;
    position: relative;
    top: -32px;
}

.step.step-small h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    margin-top: -0.5rem;
    color: var(--color-text-primary);
}

.step.step-small p {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin-bottom: 0;
}

.step-connector {
    width: 40px;
    height: 2.5px;
    background: var(--color-text-primary);
    align-self: center;
    margin: 0 0.5rem;
    opacity: 0.55;
    border-radius: 2px;
}

/* Section Tarifs */
.pricing-section {
    padding: 6rem 2rem;
    background: var(--color-background);
}

.pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.pricing-card {
    background: var(--color-background);
    padding: 2rem;
    border-radius: var(--border-radius-lg);
    box-shadow: none !important;
    text-align: center;
    position: relative;
    transition: transform var(--transition-normal);
}

.pricing-card:hover {
    transform: translateY(-5px);
}

.pricing-card.featured {
    border: 2px solid var(--color-primary);
    transform: scale(1.05);
}

.featured-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-primary);
    color: var(--color-text-light);
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius-sm);
    font-size: 0.9rem;
    font-weight: 500;
}

.price {
    font-size: 3rem;
    font-weight: bold;
    color: var(--color-text-primary);
    margin: 1rem 0;
}

.price span {
    font-size: 1rem;
    color: var(--color-text-secondary);
}

.pricing-card ul {
    list-style: none;
    padding: 0;
    margin: 2rem 0;
}

.pricing-card li {
    margin: 1rem 0;
    color: var(--color-text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
    .hero-section {
        flex-direction: column;
        text-align: center;
        padding: 1rem;
    }

    .hero-content {
        padding: 1rem;
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .hero-subtitle {
        font-size: 1.2rem;
    }

    .hero-buttons {
        justify-content: center;
    }

    .hero-3d {
        position: relative;
        width: 100%;
        height: 300px;
        margin-top: 2rem;
    }

    .steps-container.steps-inline {
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
    }

    .step-connector {
        width: 2px;
        height: 30px;
        margin: 0.5rem 0;
    }

    .pricing-card.featured {
        transform: none;
    }
}

@media (max-width: 900px) {
    .steps-container.steps-inline {
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
    }
    .step-connector {
        width: 2px;
        height: 30px;
        margin: 0.5rem 0;
    }
    .step.step-small .step-number {
        top: 0;
    }
}

.scroll-down-arrow {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2.5rem;
    margin-bottom: 0.5rem;
    animation: bounceDown 1.5s infinite;
}

@keyframes bounceDown {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(18px); }
}

.scroll-down-arrow-hero {
    position: absolute;
    left: 50%;
    bottom: 80px;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: bounceDown 1.5s infinite;
    pointer-events: none;
}
</style>
  