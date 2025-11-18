<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  let { 
    modelPath, 
    width = 600, 
    height = 600, 
    autoRotate = false, 
    showControls = true,
    noCard = false
  }: {
    modelPath: string;
    width?: number;
    height?: number;
    autoRotate?: boolean;
    showControls?: boolean;
    noCard?: boolean;
  } = $props();

  let container: HTMLElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let model: THREE.Group;
  let gridHelper: THREE.GridHelper | null = null;
  let axesGroup: THREE.Group | null = null;
  let isLoading = $state(true);
  let loadingProgress = $state(0);
  let isFullscreen = $state(false);
  let isAutoRotating = $state(autoRotate);
  let loadingMessage = $state('Chargement du modèle 3D...');

  function initializeScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-10, -10, -5);
    scene.add(directionalLight2);

    // Ajouter une grille de référence
    // Couleurs adaptées pour être visibles sur fond clair et sombre
    gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
    scene.add(gridHelper);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.autoRotate = isAutoRotating;
    controls.autoRotateSpeed = 0.5;
    controls.zoomSpeed = 1.5;
    controls.panSpeed = 0.8;
    controls.rotateSpeed = 0.8;
    controls.minDistance = 0.1;
    controls.maxDistance = 50;
    controls.screenSpacePanning = false;
  }

  function loadPLYModel() {
    const loader = new PLYLoader();

    if (!modelPath || !modelPath.toLowerCase().endsWith('.ply')) {
      isLoading = false;
      return;
    }

    loader.load(
      modelPath,
      (geometry) => {
        try {
          // Créer un groupe pour contenir le modèle
          model = new THREE.Group();
          
          // Calculer les normales si elles n'existent pas
          if (!geometry.attributes.normal) {
            geometry.computeVertexNormals();
          }

          // Créer un matériau de mesh normal avec un rendu plus réaliste
          const meshMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            side: THREE.DoubleSide,
            flatShading: false,
            shininess: 30,
            specular: 0x222222
          });

          // Créer la mesh principale
          const mesh = new THREE.Mesh(geometry, meshMaterial);
          model.add(mesh);

          // Si le modèle n'a pas de faces (seulement des points), créer aussi des points
          if (!geometry.attributes.normal && geometry.attributes.position) {
            const pointsMaterial = new THREE.PointsMaterial({
              color: 0x666666,
              size: 0.005,
              sizeAttenuation: true
            });
            const points = new THREE.Points(geometry, pointsMaterial);
            model.add(points);
          }

          scene.add(model);
          model.updateMatrixWorld(true);

          // Ajuster la position et la taille
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const safeMax = (!isFinite(maxDim) || maxDim <= 0) ? 1 : maxDim;

          const scale = 4.5 / safeMax;
          model.scale.setScalar(scale);
          
          // Recalculer la bounding box après le scale pour positionner correctement
          const scaledBox = new THREE.Box3().setFromObject(model);
          const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
          const scaledMin = scaledBox.min;
          
          // Repositionner le modèle pour qu'il soit posé sur la grille (Y=0)
          // Centrer en X et Z, mais placer le bas du modèle sur Y=0
          model.position.set(-scaledCenter.x, -scaledMin.y, -scaledCenter.z);

          // Créer des axes X, Y, Z personnalisés avec des couleurs et épaisseurs spécifiques
          const scaledSize = scaledBox.getSize(new THREE.Vector3());
          const axesSize = Math.max(scaledSize.x, scaledSize.y, scaledSize.z) * 0.5;
          
          if (axesGroup) {
            scene.remove(axesGroup);
            axesGroup.traverse((child) => {
              if (child instanceof THREE.ArrowHelper) {
                // ArrowHelper contient une ligne et un cône, nettoyer leurs ressources
                if (child.line) {
                  child.line.geometry.dispose();
                  if (child.line.material instanceof THREE.Material) {
                    child.line.material.dispose();
                  }
                }
                if (child.cone) {
                  child.cone.geometry.dispose();
                  if (child.cone.material instanceof THREE.Material) {
                    child.cone.material.dispose();
                  }
                }
              } else if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                if (child.material instanceof THREE.Material) {
                  child.material.dispose();
                }
              }
            });
          }
          
          axesGroup = new THREE.Group();
          
          // Créer les 3 axes avec des flèches (ArrowHelper) partant du centre
          const axisLength = axesSize;
          const arrowHeadLength = axisLength * 0.15; // 15% de la longueur pour la pointe
          const arrowHeadWidth = axisLength * 0.08; // 8% de la longueur pour la largeur de la pointe
          const arrowShaftRadius = axisLength * 0.02; // 2% pour le rayon du cylindre
          
          // Axe X (Rouge) - flèche pointant vers +X
          const xArrow = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0), // Direction X
            new THREE.Vector3(0, 0, 0), // Origine au centre
            axisLength, // Longueur
            0xff0000, // Couleur rouge
            arrowHeadLength,
            arrowHeadWidth
          );
          axesGroup.add(xArrow);
          
          // Axe Y (Vert) - flèche pointant vers +Y
          const yArrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0), // Direction Y
            new THREE.Vector3(0, 0, 0), // Origine au centre
            axisLength, // Longueur
            0x00ff00, // Couleur verte
            arrowHeadLength,
            arrowHeadWidth
          );
          axesGroup.add(yArrow);
          
          // Axe Z (Bleu) - flèche pointant vers +Z
          const zArrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1), // Direction Z
            new THREE.Vector3(0, 0, 0), // Origine au centre
            axisLength, // Longueur
            0x0000ff, // Couleur bleue
            arrowHeadLength,
            arrowHeadWidth
          );
          axesGroup.add(zArrow);
          
          axesGroup.position.copy(model.position);
          scene.add(axesGroup);

          const fov = camera.fov * (Math.PI / 180);
          const distance = (safeMax / 2) / Math.tan(fov / 2);
          camera.position.set(0, 0, distance * 0.7);
          controls.target.set(0, 0, 0);
          controls.minDistance = 0.1;
          controls.maxDistance = distance * 3;
          controls.update();

          isLoading = false;
          animate();
        } catch (error) {
          console.error('Erreur lors du chargement du modèle PLY:', error);
          isLoading = false;
        }
      },
      undefined,
      (error) => {
        console.error('Erreur lors du chargement du fichier PLY:', error);
        isLoading = false;
      }
    );
  }

  function loadGLBModel() {
    const loader = new GLTFLoader();

    if (!modelPath || !modelPath.toLowerCase().endsWith('.glb')) {
      isLoading = false;
      return;
    }

    const fileLoader = new THREE.FileLoader();
    fileLoader.setResponseType('arraybuffer');
    fileLoader.load(
      modelPath,
      (data) => {
        try {
          const u8 = new Uint8Array(data as ArrayBuffer);
          const headerText = new TextDecoder().decode(u8.subarray(0, 4));
          if (headerText !== 'glTF') {
            isLoading = false;
            return;
          }

          loader.parse(
            data as ArrayBuffer,
            '',
            (gltf) => {
              model = gltf.scene;
              scene.add(model);
              model.updateMatrixWorld(true);

              const box = new THREE.Box3().setFromObject(model);
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);
              const safeMax = (!isFinite(maxDim) || maxDim <= 0) ? 1 : maxDim;

              const scale = 4.5 / safeMax;
              model.scale.setScalar(scale);
              
              // Recalculer la bounding box après le scale pour positionner correctement
              const scaledBox = new THREE.Box3().setFromObject(model);
              const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
              const scaledMin = scaledBox.min;
              
              // Repositionner le modèle pour qu'il soit posé sur la grille (Y=0)
              // Centrer en X et Z, mais placer le bas du modèle sur Y=0
              model.position.set(-scaledCenter.x, -scaledMin.y, -scaledCenter.z);

              // Créer des axes X, Y, Z personnalisés avec des couleurs et épaisseurs spécifiques
              const scaledSize = scaledBox.getSize(new THREE.Vector3());
              const axesSize = Math.max(scaledSize.x, scaledSize.y, scaledSize.z) * 0.5;
              
              if (axesGroup) {
                scene.remove(axesGroup);
                axesGroup.traverse((child) => {
                  if (child instanceof THREE.ArrowHelper) {
                    // ArrowHelper contient une ligne et un cône, nettoyer leurs ressources
                    if (child.line) {
                      child.line.geometry.dispose();
                      if (child.line.material instanceof THREE.Material) {
                        child.line.material.dispose();
                      }
                    }
                    if (child.cone) {
                      child.cone.geometry.dispose();
                      if (child.cone.material instanceof THREE.Material) {
                        child.cone.material.dispose();
                      }
                    }
                  } else if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if (child.material instanceof THREE.Material) {
                      child.material.dispose();
                    }
                  }
                });
              }
              
              axesGroup = new THREE.Group();
              
              // Créer les 3 axes avec des flèches (ArrowHelper) partant du centre
              const axisLength = axesSize;
              const arrowHeadLength = axisLength * 0.15; // 15% de la longueur pour la pointe
              const arrowHeadWidth = axisLength * 0.08; // 8% de la longueur pour la largeur de la pointe
              const arrowShaftRadius = axisLength * 0.02; // 2% pour le rayon du cylindre
              
              // Axe X (Rouge) - flèche pointant vers +X
              const xArrow = new THREE.ArrowHelper(
                new THREE.Vector3(1, 0, 0), // Direction X
                new THREE.Vector3(0, 0, 0), // Origine au centre
                axisLength, // Longueur
                0xff0000, // Couleur rouge
                arrowHeadLength,
                arrowHeadWidth
              );
              axesGroup.add(xArrow);
              
              // Axe Y (Vert) - flèche pointant vers +Y
              const yArrow = new THREE.ArrowHelper(
                new THREE.Vector3(0, 1, 0), // Direction Y
                new THREE.Vector3(0, 0, 0), // Origine au centre
                axisLength, // Longueur
                0x00ff00, // Couleur verte
                arrowHeadLength,
                arrowHeadWidth
              );
              axesGroup.add(yArrow);
              
              // Axe Z (Bleu) - flèche pointant vers +Z
              const zArrow = new THREE.ArrowHelper(
                new THREE.Vector3(0, 0, 1), // Direction Z
                new THREE.Vector3(0, 0, 0), // Origine au centre
                axisLength, // Longueur
                0x0000ff, // Couleur bleue
                arrowHeadLength,
                arrowHeadWidth
              );
              axesGroup.add(zArrow);
              
              axesGroup.position.copy(model.position);
              scene.add(axesGroup);

              const fov = camera.fov * (Math.PI / 180);
              const distance = (safeMax / 2) / Math.tan(fov / 2);
              camera.position.set(0, 0, distance * 0.7);
              controls.target.set(0, 0, 0);
              controls.minDistance = 0.1;
              controls.maxDistance = distance * 3;
              controls.update();

              isLoading = false;
              animate();
            },
            () => { isLoading = false; }
          );
        } catch {
          isLoading = false;
        }
      },
      undefined,
      () => { isLoading = false; }
    );
  }

  function loadCurrentModel() {
    if (model) {
      scene.remove(model);
      model.traverse((child) => {
        const potentialMesh = child as THREE.Mesh;
        if ((potentialMesh as any).isMesh) {
          if (potentialMesh.geometry) {
            potentialMesh.geometry.dispose();
          }
          const mat = potentialMesh.material as unknown;
          if (Array.isArray(mat)) {
            (mat as THREE.Material[]).forEach((m) => m && m.dispose && m.dispose());
          } else if (mat && (mat as THREE.Material).dispose) {
            (mat as THREE.Material).dispose();
          }
        }
      });
    }

    // Supprimer l'ancien axesGroup s'il existe
    if (axesGroup) {
      scene.remove(axesGroup);
      axesGroup.traverse((child) => {
        if (child instanceof THREE.ArrowHelper) {
          // ArrowHelper contient une ligne et un cône, nettoyer leurs ressources
          if (child.line) {
            child.line.geometry.dispose();
            if (child.line.material instanceof THREE.Material) {
              child.line.material.dispose();
            }
          }
          if (child.cone) {
            child.cone.geometry.dispose();
            if (child.cone.material instanceof THREE.Material) {
              child.cone.material.dispose();
            }
          }
        } else if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
      axesGroup = null;
    }

    isLoading = true;
    loadingMessage = 'Chargement du modèle 3D...';
    
    if (modelPath.toLowerCase().endsWith('.ply')) {
      loadPLYModel();
    } else if (modelPath.toLowerCase().endsWith('.glb')) {
      loadGLBModel();
    } else {
      isLoading = false;
      loadingMessage = 'Format de fichier non supporté';
    }
  }

  $effect(() => {
    if (scene && controls && modelPath) {
      loadCurrentModel();
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  const handleResize = () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  };

  onMount(() => {
    initializeScene();
    loadCurrentModel();

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer) {
        renderer.dispose();
      }
    };
  });

  export function reload() {
    if (scene && controls) {
      loadCurrentModel();
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        isFullscreen = true;
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      });
    } else {
      document.exitFullscreen().then(() => {
        isFullscreen = false;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      });
    }
  }

  onDestroy(() => {
    if (renderer) {
      renderer.dispose();
    }
  });
</script>

<div 
  class="{noCard ? 'rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] relative mx-auto' : 'rounded-xl overflow-hidden shadow-2xl bg-gray-100 relative'}" 
  bind:this={container} 
  style="width: {width}px; height: {height}px;"
>
  {#if isLoading}
    <div class="absolute inset-0 {noCard ? 'bg-white/90 dark:bg-gray-800/90' : 'bg-gray-100/90'} flex flex-col items-center justify-center z-10">
      <div class="w-10 h-10 border-4 {noCard ? 'border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400' : 'border-gray-300 border-t-blue-600'} rounded-full animate-spin mb-4"></div>
      <div class="text-lg {noCard ? 'text-gray-800 dark:text-white' : 'text-gray-800'} mb-4">{loadingMessage}</div>
      <div class="w-52 h-1 {noCard ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-300'} rounded-sm overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 ease-out" 
          style="width: {loadingProgress}%"
        ></div>
      </div>
    </div>
  {/if}
  
  {#if showControls}
    <div class="absolute top-2.5 right-2.5 flex flex-col gap-2 z-[5]">
      <button 
        class="w-10 h-10 border-none rounded-lg bg-black/70 text-white text-base cursor-pointer flex items-center justify-center transition-all duration-200 ease-in-out backdrop-blur-sm hover:bg-black/90 hover:scale-105 active:scale-95" 
        onclick={() => { toggleFullscreen(); }}
        title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
      >
        {isFullscreen ? '✕' : '⛶'}
      </button>
    </div>
  {/if}
</div>