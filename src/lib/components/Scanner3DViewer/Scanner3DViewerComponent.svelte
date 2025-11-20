<script lang="ts">
    import { onMount } from 'svelte';
    import * as THREE from 'three';
    import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

    let canvasContainer: HTMLDivElement;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let model: THREE.Group;
    let animationId: number;
    let isLoaded = $state(false);

    onMount(() => {
        initThreeJS();
        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            if (renderer) {
                renderer.dispose();
            }
            window.removeEventListener('resize', onWindowResize);
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
                isLoaded = true;
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

<div class="relative w-full aspect-square max-w-[700px] lg:-mt-20">
    <div 
        bind:this={canvasContainer} 
        class="w-full h-full absolute inset-0 z-10 overflow-hidden"
        class:opacity-0={!isLoaded}
        class:opacity-100={isLoaded}
        class:transition-opacity={true}
        class:duration-500={true}
    ></div>
</div>

<style>
    :global(canvas) {
        display: block;
        background: transparent !important;
        max-width: 100% !important;
        max-height: 100% !important;
        object-fit: contain;
    }

    .aspect-square {
        aspect-ratio: 1;
    }

    @media (max-width: 768px) {
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

