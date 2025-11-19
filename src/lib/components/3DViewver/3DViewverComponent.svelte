<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
  import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
  import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
  import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
  import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { Maximize2, X } from 'lucide-svelte';

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

  // Fonction générique pour setup du modèle (scaling, positionnement, axes, caméra)
  function setupModel(loadedModel: THREE.Group | THREE.Object3D, zoomFactor: number = 1.0) {
    model = loadedModel as THREE.Group;
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
    model.position.set(-scaledCenter.x, -scaledMin.y, -scaledCenter.z);

    // Créer des axes X, Y, Z
    const scaledSize = scaledBox.getSize(new THREE.Vector3());
    const axesSize = Math.max(scaledSize.x, scaledSize.y, scaledSize.z) * 0.5;
    
    // Nettoyer l'ancien axesGroup s'il existe
    if (axesGroup) {
      scene.remove(axesGroup);
      axesGroup.traverse((child) => {
        if (child instanceof THREE.ArrowHelper) {
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
    
    const axisLength = axesSize;
    const arrowHeadLength = axisLength * 0.15;
    const arrowHeadWidth = axisLength * 0.08;
    
    // Axe X (Rouge)
    const xArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      axisLength,
      0xff0000,
      arrowHeadLength,
      arrowHeadWidth
    );
    axesGroup.add(xArrow);
    
    // Axe Y (Vert)
    const yArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      axisLength,
      0x00ff00,
      arrowHeadLength,
      arrowHeadWidth
    );
    axesGroup.add(yArrow);
    
    // Axe Z (Bleu)
    const zArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, 0),
      axisLength,
      0x0000ff,
      arrowHeadLength,
      arrowHeadWidth
    );
    axesGroup.add(zArrow);
    
    axesGroup.position.copy(model.position);
    scene.add(axesGroup);

    // Positionner la caméra avec un facteur de zoom ajustable
    const fov = camera.fov * (Math.PI / 180);
    const distance = (safeMax / 2) / Math.tan(fov / 2);
    
    const azimuth = Math.PI / 4;
    const polar = Math.PI / 3;
    const cameraDistance = distance * zoomFactor; // Utiliser le facteur de zoom
    camera.position.set(
      cameraDistance * Math.sin(polar) * Math.cos(azimuth),
      cameraDistance * Math.cos(polar),
      cameraDistance * Math.sin(polar) * Math.sin(azimuth)
    );
    
    controls.target.set(0, 0, 0);
    controls.minDistance = 0.1;
    controls.maxDistance = distance * 3;
    controls.update();

    isLoading = false;
    animate();
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
          const modelGroup = new THREE.Group();
          
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
          modelGroup.add(mesh);

          // Si le modèle n'a pas de faces (seulement des points), créer aussi des points
          if (!geometry.attributes.normal && geometry.attributes.position) {
            const pointsMaterial = new THREE.PointsMaterial({
              color: 0x666666,
              size: 0.005,
              sizeAttenuation: true
            });
            const points = new THREE.Points(geometry, pointsMaterial);
            modelGroup.add(points);
          }

          setupModel(modelGroup);
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
              setupModel(gltf.scene);
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

  function loadOBJModel() {
    const loader = new OBJLoader();

    if (!modelPath || !modelPath.toLowerCase().endsWith('.obj')) {
      isLoading = false;
      return;
    }

    loader.load(
      modelPath,
      (object) => {
        try {
          // Appliquer un matériau par défaut si nécessaire
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (!child.material || (child.material as THREE.Material).type === 'MeshBasicMaterial') {
                child.material = new THREE.MeshPhongMaterial({
                  color: 0x888888,
                  side: THREE.DoubleSide,
                  flatShading: false,
                  shininess: 30,
                  specular: 0x222222
                });
              }
            }
          });

          setupModel(object, 0.08);
        } catch (error) {
          console.error('Erreur lors du chargement du modèle OBJ:', error);
          isLoading = false;
        }
      },
      undefined,
      (error) => {
        console.error('Erreur lors du chargement du fichier OBJ:', error);
        isLoading = false;
      }
    );
  }

  function loadSTLModel() {
    const loader = new STLLoader();

    if (!modelPath || !modelPath.toLowerCase().endsWith('.stl')) {
      isLoading = false;
      return;
    }

    loader.load(
      modelPath,
      (geometry) => {
        try {
          const modelGroup = new THREE.Group();
          geometry.computeVertexNormals();
          
          const material = new THREE.MeshPhongMaterial({
            color: 0x888888,
            side: THREE.DoubleSide,
            flatShading: false,
            shininess: 30,
            specular: 0x222222
          });

          const mesh = new THREE.Mesh(geometry, material);
          modelGroup.add(mesh);

          setupModel(modelGroup);
        } catch (error) {
          console.error('Erreur lors du chargement du modèle STL:', error);
          isLoading = false;
        }
      },
      undefined,
      (error) => {
        console.error('Erreur lors du chargement du fichier STL:', error);
        isLoading = false;
      }
    );
  }

  function loadFBXModel() {
    const loader = new FBXLoader();

    if (!modelPath || !modelPath.toLowerCase().endsWith('.fbx')) {
      isLoading = false;
      return;
    }

    loader.load(
      modelPath,
      (object) => {
        try {
          setupModel(object);
        } catch (error) {
          console.error('Erreur lors du chargement du modèle FBX:', error);
          isLoading = false;
        }
      },
      undefined,
      (error) => {
        console.error('Erreur lors du chargement du fichier FBX:', error);
        isLoading = false;
      }
    );
  }

  function loadDAEModel() {
    const loader = new ColladaLoader();

    if (!modelPath || !modelPath.toLowerCase().endsWith('.dae')) {
      isLoading = false;
      return;
    }

    loader.load(
      modelPath,
      (collada) => {
        try {
          setupModel(collada.scene);
        } catch (error) {
          console.error('Erreur lors du chargement du modèle DAE:', error);
          isLoading = false;
        }
      },
      undefined,
      (error) => {
        console.error('Erreur lors du chargement du fichier DAE:', error);
        isLoading = false;
      }
    );
  }

  function loadX3DModel() {
    // X3DLoader n'est pas disponible dans Three.js, utiliser un message d'erreur
    isLoading = false;
    loadingMessage = 'Le format X3D nécessite une conversion préalable vers GLB, GLTF, PLY, OBJ, STL, FBX ou DAE';
  }

  function loadGLTFModel() {
    const loader = new GLTFLoader();

    if (!modelPath || !modelPath.toLowerCase().endsWith('.gltf')) {
      isLoading = false;
      return;
    }

    loader.load(
      modelPath,
      (gltf) => {
        try {
          setupModel(gltf.scene);
        } catch (error) {
          console.error('Erreur lors du chargement du modèle GLTF:', error);
          isLoading = false;
        }
      },
      undefined,
      (error) => {
        console.error('Erreur lors du chargement du fichier GLTF:', error);
        isLoading = false;
      }
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
    
    const lowerPath = modelPath.toLowerCase();
    
    if (lowerPath.endsWith('.ply')) {
      loadPLYModel();
    } else if (lowerPath.endsWith('.glb')) {
      loadGLBModel();
    } else if (lowerPath.endsWith('.gltf')) {
      loadGLTFModel();
    } else if (lowerPath.endsWith('.obj')) {
      loadOBJModel();
    } else if (lowerPath.endsWith('.stl')) {
      loadSTLModel();
    } else if (lowerPath.endsWith('.fbx')) {
      loadFBXModel();
    } else if (lowerPath.endsWith('.dae')) {
      loadDAEModel();
    } else if (lowerPath.endsWith('.x3d') || lowerPath.endsWith('.blend') || lowerPath.endsWith('.blend1') || 
               lowerPath.endsWith('.usdc') || lowerPath.endsWith('.abc') || 
               lowerPath.endsWith('.svg') || lowerPath.endsWith('.mtl')) {
      isLoading = false;
      loadingMessage = 'Ce format nécessite une conversion préalable. Formats supportés: GLB, GLTF, PLY, OBJ, STL, FBX, DAE';
    } else {
      isLoading = false;
      loadingMessage = 'Format de fichier non supporté pour la visualisation';
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
        class="w-10 h-10 border-none rounded-lg bg-black/70 text-white cursor-pointer flex items-center justify-center transition-all duration-200 ease-in-out backdrop-blur-sm hover:bg-black/90 hover:scale-105 active:scale-95" 
        onclick={() => { toggleFullscreen(); }}
        title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
      >
        {#if isFullscreen}
          <X class="w-5 h-5" />
        {:else}
          <Maximize2 class="w-5 h-5" />
        {/if}
      </button>
    </div>
  {/if}
</div>