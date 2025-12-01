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
  import { theme } from 'mode-watcher';

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
  
  function getCSSHexColor(cssVar: string): number {
    if (typeof document === 'undefined') return 0x1a1a1a;
    const root = document.documentElement;
    const colorValue = getComputedStyle(root).getPropertyValue(cssVar).trim();
    if (!colorValue) return 0x1a1a1a;
    return parseInt(colorValue.replace('#', ''), 16);
  }

  function initializeScene() {
    scene = new THREE.Scene();
    const bgColor = getCSSHexColor('--scene-bg');
    scene.background = new THREE.Color(bgColor);

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

    const gridColor1 = getCSSHexColor('--grid-color-1');
    const gridColor2 = getCSSHexColor('--grid-color-2');
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

  function setupModel(loadedModel: THREE.Group | THREE.Object3D, zoomFactor: number = 1.0) {
    model = loadedModel as THREE.Group;
    scene.add(model);
    model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const safeMax = (!isFinite(maxDim) || maxDim <= 0) ? 1 : maxDim;

    const scale = 4.5 / safeMax;
    model.scale.setScalar(scale);
    
    const scaledBox = new THREE.Box3().setFromObject(model);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    const scaledMin = scaledBox.min;
    
    model.position.set(-scaledCenter.x, -scaledMin.y, -scaledCenter.z);

    const scaledSize = scaledBox.getSize(new THREE.Vector3());
    const axesSize = Math.max(scaledSize.x, scaledSize.y, scaledSize.z) * 0.5;
    
    disposeAxesGroup();
    axesGroup = new THREE.Group();
    
    const axisLength = axesSize;
    const arrowHeadLength = axisLength * 0.15;
    const arrowHeadWidth = axisLength * 0.08;
    
    const xArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      axisLength,
      0xff0000,
      arrowHeadLength,
      arrowHeadWidth
    );
    axesGroup.add(xArrow);
    
    const yArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      axisLength,
      0x00ff00,
      arrowHeadLength,
      arrowHeadWidth
    );
    axesGroup.add(yArrow);
    
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

    const fov = camera.fov * (Math.PI / 180);
    const distance = (safeMax / 2) / Math.tan(fov / 2);
    
    const azimuth = Math.PI / 4;
    const polar = Math.PI / 3;
    const cameraDistance = distance * zoomFactor;
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

  const createDefaultMaterial = () => new THREE.MeshPhongMaterial({
    color: 0x888888,
    side: THREE.DoubleSide,
    flatShading: false,
    shininess: 30,
    specular: 0x222222
  });

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

  $effect(() => {
    const _ = theme?.current;
    
    if (scene && gridHelper && renderer) {
      const bgColor = getCSSHexColor('--scene-bg');
      scene.background = new THREE.Color(bgColor);
      
      const gridColor1 = getCSSHexColor('--grid-color-1');
      const gridColor2 = getCSSHexColor('--grid-color-2');
      
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

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        handleResize();
      }
    });
    
    if (container) {
      resizeObserver.observe(container);
    }

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
        setTimeout(handleResize, 100);
      });
    } else {
      document.exitFullscreen().then(() => {
        isFullscreen = false;
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
  class="{noCard ? 'rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] relative mx-auto w-full' : 'rounded-xl overflow-hidden shadow-2xl bg-card border border-border relative w-full'}" 
  bind:this={container} 
  style="max-width: {width}px; max-height: {height}px; aspect-ratio: {width}/{height};"
>
  {#if isLoading}
    <div class="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/95 backdrop-blur-sm">
      <div class="relative mb-6">
        <div class="w-16 h-16 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
        <div class="absolute inset-0 w-16 h-16 rounded-full border-4 border-muted"></div>
      </div>
      
      <div class="text-lg font-semibold mb-4 text-foreground">{loadingMessage}</div>
      
      <div class="w-64 h-2 rounded-full overflow-hidden bg-muted">
        <div 
          class="h-full transition-all duration-300 ease-out rounded-full bg-primary" 
          style="width: {loadingProgress}%"
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
        class="w-10 h-10 border-none rounded-lg bg-card/80 backdrop-blur-sm border border-border text-foreground cursor-pointer flex items-center justify-center transition-all duration-200 ease-in-out hover:bg-card hover:scale-105 active:scale-95 shadow-lg" 
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