import * as Three from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Editor {
    private container: HTMLElement;

    private scene: Three.Scene;
    private camera: Three.PerspectiveCamera;
    private renderer: Three.WebGLRenderer;
    private controls: OrbitControls;

    constructor(container: HTMLElement, baseDistance: number = 5, baseAngle: number = 35) {
        this.container = container;

        this.scene = new Three.Scene();
        this.scene.background = new Three.Color(new Three.Color().setRGB(0.02, 0.02, 0.02));
        this.camera = new Three.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.renderer = new Three.WebGLRenderer();

        this.renderer.setPixelRatio(2);
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;

        const gridHelper = new Three.GridHelper(20, 20);
        this.scene.add(gridHelper);

        this.camera.position.set(0, baseDistance * Math.sin(-baseAngle), baseDistance * Math.cos(-baseAngle));
        this.camera.lookAt(0, 0, 0);

        this.animate();
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    resize = () => {
        console.log(this.container.clientWidth, this.container.clientHeight);
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
}

export class ScannerConnector {
    constructor() {

    }
}