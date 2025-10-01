<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import './3DViewver.css';

  export let modelPath: string;
  export let width: number = 600;
  export let height: number = 600;
  export let autoRotate: boolean = false;
  export let showControls: boolean = true;
  export let showPointCloud: boolean = false;
  export let plyPath: string = '';

  let container: HTMLElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let model: THREE.Group | THREE.Points;
  let isLoading = true;
  let loadingProgress = 0;
  let isFullscreen = false;
  let isAutoRotating = autoRotate;
  let loadingMessage = 'Chargement du modèle 3D...';

  // Fonction pour initialiser la scène
  function initializeScene() {
    // Initialiser la scène
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Initialiser la caméra
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Initialiser le renderer
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

    // Ajouter les lumières
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

    // Ajouter les contrôles orbitaux
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.autoRotate = isAutoRotating;
    controls.autoRotateSpeed = 0.5;
    
    // Sensibilité de zoom améliorée
    controls.zoomSpeed = 2.0; // Zoom plus rapide
    controls.panSpeed = 1.0; // Pan plus rapide
    controls.rotateSpeed = 1.0; // Rotation plus rapide
    
    // Limites de zoom très étendues
    controls.minDistance = 0.01;
    controls.maxDistance = 50; // Beaucoup plus loin
  }

  // Fonction pour charger le modèle actuel
  function loadCurrentModel() {
    console.log('loadCurrentModel called, showPointCloud:', showPointCloud, 'plyPath:', plyPath);
    
    // Nettoyer la scène avant de charger un nouveau modèle
    if (model) {
      scene.remove(model);
      // Vérifier si c'est un Points (nuage de points) ou un Group (modèle GLB)
      if ('geometry' in model && model.geometry) {
        model.geometry.dispose();
      }
      if ('material' in model && model.material) {
        if (Array.isArray(model.material)) {
          model.material.forEach((mat: THREE.Material) => mat.dispose());
        } else {
          model.material.dispose();
        }
      }
    }

    isLoading = true;
    
    if (showPointCloud && plyPath) {
      console.log('Loading PLY model:', plyPath);
      loadingMessage = 'Chargement du nuage de points...';
      loadPLYModel();
    } else {
      console.log('Loading GLB model:', modelPath);
      loadingMessage = 'Chargement du modèle 3D...';
      loadGLBModel();
    }
  }

  // Réactivité pour recharger quand showPointCloud change
  $: if (scene && controls && showPointCloud !== undefined) {
    console.log('Reactive statement triggered, showPointCloud changed to:', showPointCloud);
    loadCurrentModel();
  }

  // Fonction pour charger le modèle GLB
  function loadGLBModel() {
      console.log('loadGLBModel called with path:', modelPath);
      const loader = new GLTFLoader();
      
      loader.load(
        modelPath,
        (gltf) => {
          console.log('GLB model loaded successfully');
          model = gltf.scene;
          
          // Centrer et ajuster la taille du modèle
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          // FORCER le modèle au CENTRE et SUPER PRÈS
          model.position.set(0, 0, 0); // Directement au centre
          
          // Ajuster la taille pour qu'elle rentre dans la vue
          const maxDim = Math.max(size.x, size.y, size.z);
          console.log('Taille du modèle:', size, 'Dimension max:', maxDim);
          
          // FORCER le modèle à être ÉNORME et SUPER PRÈS
          const scale = 20 / maxDim; // Scale encore plus énorme
          model.scale.setScalar(scale);
          
          // Positionner la caméra encore plus loin par défaut
          camera.position.set(0, 0, 8);
          controls.target.set(0, 0, 0);
          controls.update();
          
          scene.add(model);
          
          isLoading = false;
          console.log('Starting animation for GLB model');
          animate();
        },
        (progress) => {
          loadingProgress = (progress.loaded / progress.total) * 100;
          console.log('GLB loading progress:', loadingProgress + '%');
        },
        (error) => {
          console.error('Erreur lors du chargement du modèle GLB:', error);
          isLoading = false;
        }
      );
    }

  // Fonction pour charger le modèle PLY
  function loadPLYModel() {
      console.log('loadPLYModel called with path:', plyPath);
      fetch(plyPath)
        .then(response => {
          console.log('PLY fetch response:', response.status);
          return response.text();
        })
        .then(plyContent => {
          console.log('PLY content loaded, length:', plyContent.length);
          const points = parsePLY(plyContent);
          
          // Créer la géométrie des points
          const geometry = new THREE.BufferGeometry();
          const positions = new Float32Array(points.length * 3);
          
          for (let i = 0; i < points.length; i++) {
            positions[i * 3] = points[i].x;
            positions[i * 3 + 1] = points[i].y;
            positions[i * 3 + 2] = points[i].z;
          }
          
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          
          // Créer le matériau des points
          const material = new THREE.PointsMaterial({
            color: 0xff6b6b,
            size: 0.05,
            sizeAttenuation: true
          });
          
          // Créer l'objet points
          model = new THREE.Points(geometry, material);
          
          // Positionner la caméra
          camera.position.set(0, 0, 8);
          controls.target.set(0, 0, 0);
          controls.update();
          
          scene.add(model);
          
          isLoading = false;
          console.log('Starting animation for PLY model');
          animate();
          
          console.log(`Nuage de points chargé avec ${points.length} points`);
        })
        .catch(error => {
          console.error('Erreur lors du chargement du fichier PLY:', error);
          isLoading = false;
        });
    }

    
  // Fonction pour parser le fichier PLY
  function parsePLY(content: string) {
      console.log('Parsing PLY content...');
      const lines = content.split('\n');
      const points = [];
      let vertexCount = 0;
      let inVertexSection = false;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('element vertex')) {
          vertexCount = parseInt(trimmedLine.split(' ')[2]);
          console.log('Expected vertex count:', vertexCount);
        } else if (trimmedLine === 'end_header') {
          inVertexSection = true;
          console.log('Starting to parse vertices...');
        } else if (inVertexSection && trimmedLine && !trimmedLine.startsWith('ply')) {
          const coords = trimmedLine.split(/\s+/).map(Number);
          if (coords.length >= 3 && !isNaN(coords[0]) && !isNaN(coords[1]) && !isNaN(coords[2])) {
            points.push({
              x: coords[0],
              y: coords[1],
              z: coords[2]
            });
          }
        }
      }
      
      console.log(`Parsed ${points.length} points from PLY file`);
      return points;
    }

  // Fonction d'animation
  function animate() {
      requestAnimationFrame(animate);
      if (controls) controls.update();
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }

  // Gérer le redimensionnement
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

  // Fonction publique pour forcer le rechargement (peut être appelée depuis l'extérieur)
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

<div class="viewer-container" bind:this={container} style="width: {width}px; height: {height}px; position: relative;">
  {#if isLoading}
    <div class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">{loadingMessage}</div>
      <div class="loading-progress">
        <div class="progress-bar" style="width: {loadingProgress}%"></div>
      </div>
    </div>
  {/if}
  
  {#if showControls}
    <div class="viewer-controls">
      <button 
        class="control-btn" 
        on:click={() => { toggleFullscreen(); }}
        title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
      >
        {isFullscreen ? '⛶' : '⛶'}
      </button>
    </div>
  {/if}
</div>

