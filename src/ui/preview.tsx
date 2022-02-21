import * as React from "react"
import * as THREE from "three"
import { Euler, Vector2, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry"
import { MCamera } from "./point-service";
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

type ThreedPreviewProps = {
    points: [number, number, number][];
    cameras: MCamera[]
};

export class ThreedPreview extends React.Component<ThreedPreviewProps>
{
    scene: THREE.Scene;
    private initScene(dom: HTMLDivElement) {
        this.scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100000);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(500, 500);
        dom.appendChild(renderer.domElement);

        camera.position.z = 10;
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 0.0001;
        controls.maxDistance = 200;
        controls.target.set(0, 0, 0);
        controls.update();
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(this.scene, camera);
        }
        animate()
    }

    private approximation(points: [number, number, number][]) {
        // Center
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);

        console.log('replace geom')

        const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        for (const point of points) {
            const geometry2 = new THREE.BoxGeometry();
            // geometry2.translate(...point)
            const cube2 = new THREE.Mesh(geometry2, material2)
            this.scene.add(cube2)
        }
    }

    private showCameras(cameras: MCamera[]) {
        const material = new MeshLineMaterial({ sizeAttenuation: false, color: 0xff00ff, lineWidth: 0.01 });
        const materialMesh = new THREE.MeshBasicMaterial({ color: 0x0000ff });

        for (const camera of cameras) {
            const p = camera.params
            const scale = 1/p.width;

            const focus = new Vector3(0.5, scale * p.height * 0.5, 0)

            const imagePoints = [...camera.mappings.values()].map( mapping => new Vector3(mapping.p.u*scale, mapping.p.v*scale, -1) )
            
            const chull = new ConvexGeometry( imagePoints )
            
            this.scene.add( new THREE.Mesh(chull, materialMesh ))
            
            for(const imagePoint of imagePoints) {
                const line = new MeshLine();
                const extension = new Vector3().subVectors(focus, imagePoint)
                const endpoint = focus.clone().addScaledVector(extension, 10)
                line.setPoints( [imagePoint, focus, endpoint])
                const mesh = new THREE.Mesh( line, material)
                mesh.setRotationFromEuler(new Euler(p.alpha/180*Math.PI, p.beta/180*Math.PI, p.gamma/180*Math.PI))
                mesh.translateX(p.X)
                mesh.translateY(p.Y)
                mesh.translateZ(p.Z)
                this.scene.add(mesh)
            }
            
            const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            for (const point of imagePoints) {
                const geometry2 = new THREE.BoxGeometry(0.1,0.1,0.1);
                geometry2.translate(point.x, point.y, point.z)
                const cube2 = new THREE.Mesh(geometry2, material2)
                this.scene.add(cube2)
            }
            
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
        this.scene.clear()
        this.approximation(this.props.points)
        this.showCameras(this.props.cameras)
    }


    render() {
        return <div ref={this.target}></div>
    }
}


