<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  let { 
    modelPath, 
    width = 600, 
    height = 600, 
    autoRotate = false, 
    showControls = true 
  }: {
    modelPath: string;
    width?: number;
    height?: number;
    autoRotate?: boolean;
    showControls?: boolean;
  } = $props();

  let container: HTMLElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let model: THREE.Group;
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

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.autoRotate = isAutoRotating;
    controls.autoRotateSpeed = 0.5;
    controls.zoomSpeed = 2.0;
    controls.panSpeed = 1.0;
    controls.rotateSpeed = 1.0;
    controls.minDistance = 0.01;
    controls.maxDistance = 50;
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

    isLoading = true;
    loadingMessage = 'Chargement du modèle 3D...';
    loadGLBModel();
  }

  $effect(() => {
    if (scene && controls && modelPath) {
      loadCurrentModel();
    }
  });

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

                model.position.set(-center.x, -center.y, -center.z);
                const scale = 2.5 / safeMax;
                model.scale.setScalar(scale);

                const fov = camera.fov * (Math.PI / 180);
                const distance = (safeMax / 2) / Math.tan(fov / 2);
                camera.position.set(0, 0, distance * 2.2);
                controls.target.set(0, 0, 0);
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
  class="rounded-xl overflow-hidden shadow-2xl bg-gray-100 relative" 
  bind:this={container} 
  style="width: {width}px; height: {height}px;"
>
  {#if isLoading}
    <div class="absolute inset-0 bg-gray-100/90 flex flex-col items-center justify-center z-10">
      <div class="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <div class="text-lg text-gray-800 mb-4">{loadingMessage}</div>
      <div class="w-52 h-1 bg-gray-300 rounded-sm overflow-hidden">
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

