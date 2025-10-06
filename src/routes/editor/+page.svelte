<script lang="ts">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
    import {onMount} from "svelte";

    let container: HTMLDivElement;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let cube: THREE.Mesh;
    let controls: OrbitControls;

    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x333333);
        camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer();

        renderer.setPixelRatio(2);
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;

        const gridHelper = new THREE.GridHelper(20, 20);
        scene.add(gridHelper);

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        camera.position.z = 5;

        window.addEventListener('resize', onWindowResize);

        animate();
    }

    function animate() {
        requestAnimationFrame(animate);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        controls.update();
        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    onMount(() => {
        init();

        return () => {
            window.removeEventListener('resize', onWindowResize);
            renderer.dispose();
            controls.dispose();
            scene.clear();
            container.removeChild(renderer.domElement);
        };
    });
</script>

<div class="flex flex-col w-screen h-screen">
    <div class="h-12 bg-neutral-950"></div>
    <div class="flex flex-1">
        <div class="w-1/6 bg-neutral-900"></div>
        <div class="flex-1" bind:this={container}></div>
    </div>
</div>
