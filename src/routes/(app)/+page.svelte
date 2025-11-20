<script lang="ts">
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import { onMount } from 'svelte';
    import * as THREE from 'three';
    import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

    let canvasContainer: HTMLDivElement;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let model: THREE.Group;
    let animationId: number;

    onMount(() => {
        initThreeJS();
        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            if (renderer) {
                renderer.dispose();
            }
        };
    });

    function initThreeJS() {
        // Create scene
        scene = new THREE.Scene();
        scene.background = null; // Transparent background

        // Create camera
        camera = new THREE.PerspectiveCamera(
            50,
            canvasContainer.clientWidth / canvasContainer.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 4.5);

        // Create renderer
        renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        renderer.setClearColor(0x000000, 0); // Transparent background
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        canvasContainer.appendChild(renderer.domElement);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0x3b82f6, 1);
        directionalLight1.position.set(5, 5, 5);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xec4899, 0.8);
        directionalLight2.position.set(-5, -5, 5);
        scene.add(directionalLight2);

        const pointLight = new THREE.PointLight(0x9333ea, 1, 100);
        pointLight.position.set(0, 3, 3);
        scene.add(pointLight);

        // Load OBJ model
        const loader = new OBJLoader();
        loader.load(
            '/assets/3DXScanner.obj',
            (obj) => {
                model = obj;
                
                // Center the model perfectly
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                // Position at exact center but lower
                model.position.x = -center.x;
                model.position.y = -center.y - 0.5; // Descendre le modèle
                model.position.z = -center.z;

                // Scale the model to fit nicely in the frame (réduit)
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2.0 / maxDim;
                model.scale.multiplyScalar(scale);

                // Apply material that preserves original colors
                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        // Si le mesh a déjà un matériau, on le garde et on l'améliore
                        if (child.material) {
                            const originalColor = child.material.color || new THREE.Color(0xcccccc);
                            child.material = new THREE.MeshStandardMaterial({
                                color: originalColor,
                                metalness: 0.5,
                                roughness: 0.4,
                                emissive: originalColor,
                                emissiveIntensity: 0.1
                            });
                        } else {
                            // Sinon on applique un matériau gris neutre
                            child.material = new THREE.MeshStandardMaterial({
                                color: 0xcccccc,
                                metalness: 0.5,
                                roughness: 0.4
                            });
                        }
                    }
                });

                scene.add(model);
            },
            (progress) => {
                console.log('Loading:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error loading model:', error);
            }
        );

        // Handle window resize
        window.addEventListener('resize', onWindowResize);

        // Start animation
        animate();
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        // Rotate model
        if (model) {
            model.rotation.y += 0.005;
            model.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
        }

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        if (canvasContainer && camera && renderer) {
            const width = canvasContainer.clientWidth;
            const height = canvasContainer.clientHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
    }
</script>

<div class="min-h-screen w-full overflow-x-hidden !bg-[#0f1729]">
    <section id="hero" class="min-h-screen flex items-center justify-center relative py-16 overflow-hidden hero-section">
        <div class="w-full flex flex-col lg:flex-row items-center relative z-10">
            <!-- Left side: Text content -->
            <div class="w-full lg:w-1/3 z-20 space-y-6 lg:space-y-8 text-center lg:text-left pl-8 sm:pl-16 lg:pl-32 xl:pl-40 pr-4">
                <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight">
                    <span class="hero-gradient-text">
                        3DX Scanner
                    </span>
                    <span class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl !text-white drop-shadow-2xl"> Professionnel</span>
                </h1>
                
                <p class="text-sm sm:text-base md:text-lg lg:text-xl !text-gray-300 leading-relaxed font-light">
                    Transformez vos objets physiques en <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold">modèles 3D</span> de haute précision avec une technologie de scan performante
                </p>
                
                <div class="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
                    <ButtonComponent
                        color="primary"
                        variant="outlined"
                        href="/models3D"
                        classe="!text-white hover:!text-white"
                    >
                        Découvrir
                    </ButtonComponent>
                    <ButtonComponent
                        color="secondary"
                        variant="outlined"
                        href="/login"
                        classe="!text-white hover:!text-white"
                    >
                        Commencer
                    </ButtonComponent>
                </div>
            </div>

            <!-- Right side: 3D Model Viewer -->
            <div class="w-full lg:w-2/3 flex justify-end items-start relative pr-8 sm:pr-12 lg:pr-16">
                <div class="relative w-full aspect-square max-w-[700px] lg:-mt-20">
                    <!-- 3D Viewer -->
                    <div 
                        bind:this={canvasContainer} 
                        class="w-full h-full absolute inset-0 z-10 overflow-hidden"
                    ></div>
                </div>
            </div>
        </div>

        <!-- Scroll down arrow -->
        <div class="absolute left-1/2 bottom-20 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce pointer-events-none">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8V28" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="text-cyan-400"/>
                <path d="M10 20L18 28L26 20" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-cyan-400"/>
            </svg>
        </div>
    </section>
    <section id="features" class="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-transparent relative">
        <h2 class="text-center text-3xl md:text-4xl mb-8 md:mb-12 !text-white font-bold">Fonctionnalités</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <div class="bg-gray-900/40 backdrop-blur-sm border border-cyan-500/20 p-8 rounded-xl text-center transition-all duration-300 hover:-translate-y-2 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/20">
                <h3 class="!text-white mb-4 text-2xl font-bold">Numérisation précise</h3>
                <p class="!text-gray-300 leading-relaxed">Capturez vos objets avec une précision millimétrique grâce à notre technologie avancée</p>
            </div>
            <div class="bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 p-8 rounded-xl text-center transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/20">
                <h3 class="!text-white mb-4 text-2xl font-bold">Reconstruction 3D</h3>
                <p class="!text-gray-300 leading-relaxed">Transformez vos captures en modèles 3D détaillés et optimisés</p>
            </div>
            <div class="bg-gray-900/40 backdrop-blur-sm border border-pink-500/20 p-8 rounded-xl text-center transition-all duration-300 hover:-translate-y-2 hover:border-pink-500/40 hover:shadow-xl hover:shadow-pink-500/20">
                <h3 class="!text-white mb-4 text-2xl font-bold">Export multiple</h3>
                <p class="!text-gray-300 leading-relaxed">Exportez vos modèles dans différents formats pour une compatibilité maximale</p>
            </div>
        </div>
    </section>
    <div class="w-full flex justify-center items-center h-4.5 my-0 p-0">
        <div class="w-45 h-1.5 bg-cyan-500 rounded-sm opacity-55 mx-auto shadow-lg shadow-cyan-500/50"></div>
    </div>
    <section id="how-it-works" class="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-transparent relative">
        <h2 class="text-center text-3xl md:text-4xl mb-8 md:mb-12 !text-white font-bold">Comment ça marche ?</h2>
        <div class="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-5xl mx-auto flex-nowrap">
            <div class="min-w-55 max-w-65 w-full p-6 pt-12 rounded-xl bg-gray-900/40 backdrop-blur-sm border border-cyan-500/20 shadow-xl transition-all duration-300 text-center relative hover:shadow-2xl hover:-translate-y-1.5 hover:scale-105 hover:z-10 hover:border-cyan-500/40">
                <div class="w-14 h-14 text-xl mx-auto mb-4 bg-cyan-600 !text-white flex items-center justify-center rounded-full font-bold shadow-lg border-2 border-cyan-400 relative -top-8">1</div>
                <h3 class="text-xl font-bold mb-2 -mt-2 !text-white">Capturez</h3>
                <p class="text-base !text-gray-300 mb-0">Prenez plusieurs photos de votre objet sous différents angles</p>
            </div>
            <div class="w-10 h-1 bg-cyan-500 self-center mx-2 opacity-55 rounded-sm hidden md:block"></div>
            <div class="min-w-55 max-w-65 w-full p-6 pt-12 rounded-xl bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 shadow-xl transition-all duration-300 text-center relative hover:shadow-2xl hover:-translate-y-1.5 hover:scale-105 hover:z-10 hover:border-purple-500/40">
                <div class="w-14 h-14 text-xl mx-auto mb-4 bg-purple-600 !text-white flex items-center justify-center rounded-full font-bold shadow-lg border-2 border-purple-400 relative -top-8">2</div>
                <h3 class="text-xl font-bold mb-2 -mt-2 !text-white">Traitez</h3>
                <p class="text-base !text-gray-300 mb-0">Notre algorithme analyse et traite vos images</p>
            </div>
            <div class="w-10 h-1 bg-purple-500 self-center mx-2 opacity-55 rounded-sm hidden md:block"></div>
            <div class="min-w-55 max-w-65 w-full p-6 pt-12 rounded-xl bg-gray-900/40 backdrop-blur-sm border border-pink-500/20 shadow-xl transition-all duration-300 text-center relative hover:shadow-2xl hover:-translate-y-1.5 hover:scale-105 hover:z-10 hover:border-pink-500/40">
                <div class="w-14 h-14 text-xl mx-auto mb-4 bg-pink-600 !text-white flex items-center justify-center rounded-full font-bold shadow-lg border-2 border-pink-400 relative -top-8">3</div>
                <h3 class="text-xl font-bold mb-2 -mt-2 !text-white">Visualisez</h3>
                <p class="text-base !text-gray-300 mb-0">Obtenez votre modèle 3D prêt à l'emploi</p>
            </div>
        </div>
    </section>
    <div class="w-full flex justify-center items-center h-4.5 my-0 p-0">
        <div class="w-45 h-1.5 bg-purple-500 rounded-sm opacity-55 mx-auto shadow-lg shadow-purple-500/50"></div>
    </div>
    <section id="pricing" class="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-transparent relative">
        <h2 class="text-center text-3xl md:text-4xl mb-8 md:mb-12 !text-white font-bold">Tarifs</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <div class="bg-gray-900/40 backdrop-blur-sm border border-gray-500/20 p-8 rounded-xl text-center relative transition-all duration-300 hover:-translate-y-2 hover:border-gray-400/40 hover:shadow-xl">
                <h3 class="text-2xl font-bold mb-4 !text-white">Gratuit</h3>
                <div class="text-5xl font-bold !text-cyan-400 my-4">0€</div>
                <ul class="list-none p-0 my-8">
                    <li class="my-4 !text-gray-300">1 Go de stockage cloud</li>
                    <li class="my-4 !text-gray-300">Export ply</li>
                    <li class="my-4 !text-gray-300">Support communautaire</li>
                </ul>
                <ButtonComponent
                    color="secondary"
                    variant="outlined"
                    href="/signup"
                    classe="!text-white hover:!text-white"
                >
                    Commencer
                </ButtonComponent>
            </div>
            <div class="!bg-gray-900/80 backdrop-blur-sm !border-2 !border-cyan-500 p-8 rounded-xl text-center relative transition-all duration-300 hover:-translate-y-2 scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 shadow-lg shadow-cyan-500/20">
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 !bg-gradient-to-r !from-cyan-500 !to-blue-500 !text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">Populaire</div>
                <h3 class="text-2xl font-bold mb-4 !text-white">Pro</h3>
                <div class="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent my-4">7.99€<span class="text-base !text-gray-400">/mois</span></div>
                <ul class="list-none p-0 my-8">
                    <li class="my-4 !text-gray-300">500 Go de stockage cloud</li>
                    <li class="my-4 !text-gray-300">Exports ply, obj, fbx, glb</li>
                    <li class="my-4 !text-gray-300">Support prioritaire</li>
                    <li class="my-4 !text-gray-300">Accès API</li>
                </ul>
                <ButtonComponent
                    color="primary"
                    variant="outlined"
                    href="/signup"
                    classe="!text-white hover:!text-white"
                >
                    Commencer
                </ButtonComponent>
            </div>
            <div class="bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 p-8 rounded-xl text-center relative transition-all duration-300 hover:-translate-y-2 hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-500/20">
                <h3 class="text-2xl font-bold mb-4 !text-white">Entreprise</h3>
                <div class="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent my-4">Sur mesure</div>
                <ul class="list-none p-0 my-8">
                    <li class="my-4 !text-gray-300">Fonctionnalités personnalisées</li>
                    <li class="my-4 !text-gray-300">Assistance entreprise</li>
                    <li class="my-4 !text-gray-300">Formation incluse</li>
                    <li class="my-4 !text-gray-300">Intégration sur mesure</li>
                </ul>
                <ButtonComponent
                    color="secondary"
                    variant="outlined"
                    href="/contact"
                    classe="!text-white hover:!text-white"
                >
                    Contactez-nous
                </ButtonComponent>
            </div>
        </div>
    </section>
</div>

<style>
    /* ===== HERO SECTION ===== */
    .hero-section {
        position: relative;
    }

    /* Hero Gradient Text */
    .hero-gradient-text {
        background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 25%, #8b5cf6 50%, #ec4899 75%, #06b6d4 100%);
        background-size: 300% 300%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradient-shift 8s ease infinite;
        filter: drop-shadow(0 0 30px rgba(59, 130, 246, 0.5));
    }

    @keyframes gradient-shift {
        0%, 100% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
    }

    /* ===== CANVAS 3D ===== */
    :global(canvas) {
        display: block;
        background: transparent !important;
        max-width: 100% !important;
        max-height: 100% !important;
        object-fit: contain;
    }

    /* Fix pour le conteneur du canvas */
    .aspect-square {
        aspect-ratio: 1;
    }

    /* ===== RESPONSIVE ===== */
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
        
        .aspect-square {
            max-width: 400px;
            margin: 0 auto;
        }
    }

    @media (max-width: 640px) {
        .aspect-square {
            max-width: 300px;
        }
    }
</style>