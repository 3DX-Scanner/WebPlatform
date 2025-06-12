<script lang="ts">
    import './home.css';
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

    // Configuration de la scène 3D
    function initThreeJS() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(-10, 5, 27);
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
        camera.position.set(-10, 5, 27);
        camera.lookAt(0, 5, 0);

        // Paramètres de la sphère
        const radius = 24;
        const widthSegments = 32;
        const heightSegments = 16;

        // Création de la géométrie du tore
        const geometry = new THREE.TorusGeometry(16, 6, 16, 100);

        // Création d'un ShaderMaterial pour le wireframe avec dégradé
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color('#1976d2') }, // couleur primaire
                color2: { value: new THREE.Color('#ff4081') }  // couleur accent
            },
            vertexShader: `
                varying float vY;
                void main() {
                    vY = position.y;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                varying float vY;
                void main() {
                    float t = (vY + 20.0) / 40.0; // Ajuste selon la taille de ta forme
                    gl_FragColor = vec4(mix(color1, color2, t), 1.0);
                }
            `,
            wireframe: true
        });

        // Création du mesh
        const torus = new THREE.Mesh(geometry, material);
        torus.position.x = 0;
        scene.add(torus);

        // Effet de neige
        const snowCount = 200;
        const snowGeometry = new THREE.BufferGeometry();
        const snowPositions = new Float32Array(snowCount * 3);
        for (let i = 0; i < snowCount; i++) {
            snowPositions[i * 3] = (Math.random() - 0.5) * 80; // x
            snowPositions[i * 3 + 1] = Math.random() * 60 + 10; 
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
            torus.rotation.y = time * 0.5;
            torus.rotation.x = Math.sin(time * 0.3) * 0.2;

            // Animation de la neige
            const positions = snowGeometry.attributes.position.array;
            for (let i = 0; i < snowCount; i++) {
                positions[i * 3 + 1] -= 0.15; 
                if (positions[i * 3 + 1] < -10) {
                    positions[i * 3 + 1] = Math.random() * 60 + 10; 
                    positions[i * 3] = (Math.random() - 0.5) * 80;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
                }
            }
            snowGeometry.attributes.position.needsUpdate = true;

            controls.update();
            renderer.render(scene, camera);
        }

        animate();
        camera.aspect = container.clientWidth / container.clientHeight;
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    onMount(() => {
        initThreeJS();
    });
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