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
  import { theme } from '$lib/stores/theme';

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
    // Couleur de fond selon le thème
    scene.background = new THREE.Color($theme === 'dark' ? 0x1a1a1a : 0xf0f0f0);

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
    
    // Style le canvas pour être responsive
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    
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

    // Ajouter une grille de référence avec couleurs adaptées au thème
    const gridColor1 = $theme === 'dark' ? 0x555555 : 0x888888;
    const gridColor2 = $theme === 'dark' ? 0x333333 : 0x444444;
    gridHelper = new THREE.GridHelper(20, 20, gridColor1, gridColor2);
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
    
    disposeAxesGroup();
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

  // Matériau par défaut pour les modèles
  const createDefaultMaterial = () => new THREE.MeshPhongMaterial({
    color: 0x888888,
    side: THREE.DoubleSide,
    flatShading: false,
    shininess: 30,
    specular: 0x222222
  });

  // Fonction générique pour gérer les erreurs de chargement
  const handleLoadError = (format: string, error?: any) => {
    if (error) {
      console.error(`Erreur lors du chargement du fichier ${format}:`, error);
    }
    isLoading = false;
  };

  function loadPLYModel() {
    const loader = new PLYLoader();
    loader.load(
      modelPath,
      (geometry) => {
        try {
          const modelGroup = new THREE.Group();
          
          if (!geometry.attributes.normal) {
            geometry.computeVertexNormals();
          }

          const mesh = new THREE.Mesh(geometry, createDefaultMaterial());
          modelGroup.add(mesh);

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
          handleLoadError('PLY', error);
        }
      },
      undefined,
      (error) => handleLoadError('PLY', error)
    );
  }

  function loadGLBModel() {
    const loader = new GLTFLoader();
    const fileLoader = new THREE.FileLoader();
    fileLoader.setResponseType('arraybuffer');
    fileLoader.load(
      modelPath,
      (data) => {
        try {
          const u8 = new Uint8Array(data as ArrayBuffer);
          const headerText = new TextDecoder().decode(u8.subarray(0, 4));
          if (headerText !== 'glTF') {
            handleLoadError('GLB');
            return;
          }

          loader.parse(
            data as ArrayBuffer,
            '',
            (gltf) => setupModel(gltf.scene),
            () => handleLoadError('GLB')
          );
        } catch {
          handleLoadError('GLB');
        }
      },
      undefined,
      () => handleLoadError('GLB')
    );
  }

  function loadOBJModel() {
    const loader = new OBJLoader();
    loader.load(
      modelPath,
      (object) => {
        try {
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (!child.material || (child.material as THREE.Material).type === 'MeshBasicMaterial') {
                child.material = createDefaultMaterial();
              }
            }
          });

          setupModel(object, 0.08);
        } catch (error) {
          handleLoadError('OBJ', error);
        }
      },
      undefined,
      (error) => handleLoadError('OBJ', error)
    );
  }

  function loadSTLModel() {
    const loader = new STLLoader();
    loader.load(
      modelPath,
      (geometry) => {
        try {
          const modelGroup = new THREE.Group();
          geometry.computeVertexNormals();
          
          const mesh = new THREE.Mesh(geometry, createDefaultMaterial());
          modelGroup.add(mesh);

          setupModel(modelGroup);
        } catch (error) {
          handleLoadError('STL', error);
        }
      },
      undefined,
      (error) => handleLoadError('STL', error)
    );
  }

  function loadFBXModel() {
    const loader = new FBXLoader();
    loader.load(
      modelPath,
      (object) => {
        try {
          setupModel(object);
        } catch (error) {
          handleLoadError('FBX', error);
        }
      },
      undefined,
      (error) => handleLoadError('FBX', error)
    );
  }

  function loadDAEModel() {
    const loader = new ColladaLoader();
    loader.load(
      modelPath,
      (collada) => {
        try {
          setupModel(collada.scene);
        } catch (error) {
          handleLoadError('DAE', error);
        }
      },
      undefined,
      (error) => handleLoadError('DAE', error)
    );
  }

  function loadGLTFModel() {
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        try {
          setupModel(gltf.scene);
        } catch (error) {
          handleLoadError('GLTF', error);
        }
      },
      undefined,
      (error) => handleLoadError('GLTF', error)
    );
  }

  // Nettoyer les ressources d'un objet 3D
  const disposeObject = (object: THREE.Object3D) => {
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        const mat = mesh.material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m?.dispose());
        } else if (mat) {
          mat.dispose();
        }
      }
    });
  };

  // Nettoyer les axes helpers
  const disposeAxesGroup = () => {
    if (!axesGroup) return;
    
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
    axesGroup = null;
  };

  // Configuration des formats supportés et non supportés
  const MODEL_LOADERS: Record<string, () => void> = {
    '.ply': loadPLYModel,
    '.glb': loadGLBModel,
    '.gltf': loadGLTFModel,
    '.obj': loadOBJModel,
    '.stl': loadSTLModel,
    '.fbx': loadFBXModel,
    '.dae': loadDAEModel
  };

  const UNSUPPORTED_FORMATS = ['.x3d', '.blend', '.blend1', '.usdc', '.abc', '.svg', '.mtl'];

  function loadCurrentModel() {
    if (model) {
      scene.remove(model);
      disposeObject(model);
    }

    disposeAxesGroup();

    isLoading = true;
    loadingMessage = 'Chargement du modèle 3D...';
    
    const lowerPath = modelPath.toLowerCase();
    const extension = Object.keys(MODEL_LOADERS).find(ext => lowerPath.endsWith(ext));
    
    if (extension) {
      MODEL_LOADERS[extension]();
    } else if (UNSUPPORTED_FORMATS.some(ext => lowerPath.endsWith(ext))) {
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

  // Mettre à jour les couleurs quand le thème change
  $effect(() => {
    const currentTheme = $theme;
    
    if (scene && gridHelper && renderer) {
      scene.background = new THREE.Color(currentTheme === 'dark' ? 0x1a1a1a : 0xf0f0f0);
      
      const gridColor1 = currentTheme === 'dark' ? 0x555555 : 0x888888;
      const gridColor2 = currentTheme === 'dark' ? 0x333333 : 0x444444;
      
      scene.remove(gridHelper);
      if (gridHelper.geometry) gridHelper.geometry.dispose();
      if (gridHelper.material) {
        if (Array.isArray(gridHelper.material)) {
          gridHelper.material.forEach((mat: THREE.Material) => mat.dispose());
        } else {
          gridHelper.material.dispose();
        }
      }
      
      gridHelper = new THREE.GridHelper(20, 20, gridColor1, gridColor2);
      scene.add(gridHelper);
      
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
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
    if (!container || !camera || !renderer) return;
    
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    
    if (newWidth > 0 && newHeight > 0) {
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight, false);
    }
  };

  onMount(() => {
    initializeScene();
    loadCurrentModel();

    // Utiliser ResizeObserver pour surveiller le conteneur directement
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        handleResize();
      }
    });
    
    if (container) {
      resizeObserver.observe(container);
    }

    // Garder window resize comme fallback
    window.addEventListener('resize', handleResize);
    
    return () => {
      resizeObserver.disconnect();
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
        // Le ResizeObserver va gérer le redimensionnement automatiquement
        setTimeout(handleResize, 100);
      });
    } else {
      document.exitFullscreen().then(() => {
        isFullscreen = false;
        // Le ResizeObserver va gérer le redimensionnement automatiquement
        setTimeout(handleResize, 100);
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
  class="{noCard ? 'rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] relative mx-auto w-full' : 'rounded-xl overflow-hidden shadow-2xl bg-gray-100 relative w-full'}" 
  bind:this={container} 
  style="max-width: {width}px; max-height: {height}px; aspect-ratio: {width}/{height};"
>
  {#if isLoading}
    <div class="absolute inset-0 flex flex-col items-center justify-center z-10" style="background-color: {$theme === 'dark' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)'}">
      <!-- Spinner avec animation bien visible -->
      <div class="relative mb-6">
        <div class="w-16 h-16 rounded-full border-4 border-transparent" style="border-top-color: {$theme === 'dark' ? '#60a5fa' : '#2563eb'}; border-right-color: {$theme === 'dark' ? '#60a5fa' : '#2563eb'}; animation: spin 0.8s linear infinite;"></div>
        <div class="absolute inset-0 w-16 h-16 rounded-full" style="border: 4px solid {$theme === 'dark' ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)'}"></div>
      </div>
      
      <!-- Message de chargement -->
      <div class="text-lg font-semibold mb-4" style="color: {$theme === 'dark' ? '#e5e7eb' : '#1f2937'}">{loadingMessage}</div>
      
      <!-- Barre de progression -->
      <div class="w-64 h-2 rounded-full overflow-hidden" style="background-color: {$theme === 'dark' ? '#374151' : '#e5e7eb'}">
        <div 
          class="h-full transition-all duration-300 ease-out rounded-full" 
          style="width: {loadingProgress}%; background: linear-gradient(to right, {$theme === 'dark' ? '#60a5fa, #93c5fd' : '#2563eb, #3b82f6'})"
        ></div>
      </div>
    </div>
  {/if}
  
  <style>
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  </style>
  
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