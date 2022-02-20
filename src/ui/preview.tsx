import * as React from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export class ThreedPreview extends React.Component<{ points: [number, number, number][] }>
{
    scene: THREE.Scene;
    private initScene(dom: HTMLDivElement) {
        this.scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(500, 500);
        dom.appendChild(renderer.domElement);

        camera.position.z = 5;
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 1;
        controls.maxDistance = 200;
        controls.target.set(0, 0, 0);
        controls.update();
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(this.scene, camera);
        }
        animate()
    }

    private replaceGeometry( points: [number, number, number][]) {
        // Center
        this.scene.clear()
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);

        console.log('replace geom')

        const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        for (const point of points) {
            const geometry2 = new THREE.BoxGeometry();
            geometry2.translate(...point)
            const cube2 = new THREE.Mesh(geometry2, material2)
            this.scene.add(cube2)
        }
    }

    target: React.RefObject<HTMLDivElement> = React.createRef()
    constructor(props) {
        super(props)
    }
    
    componentDidMount(): void {
        this.initScene(this.target.current)
    }
    
    componentDidUpdate(prevProps: Readonly<{ points: [number, number, number][]; }>, prevState: Readonly<{}>, snapshot?: any): void {
        this.replaceGeometry(this.props.points)
    }
    

    render() {
        return <div ref={this.target}></div>
    }
}


