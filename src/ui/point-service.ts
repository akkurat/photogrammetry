import { Point } from "fabric/fabric-impl"
import { Dispatch } from "react"

export type camKey = 'X'|'Y'|'Z'|'alpha'|'beta'|'gamma'|'f'|'width'|'height'

export class MCamera {
    imgUrl: string;
    params: Record<camKey,number> = {
        X: 0, Y: 0, Z: 10, alpha: 0, beta: 0, gamma: 0, f: 5,
        width: 1,
        height: 1
    }
    constructor(imgUrl:string) {
        this.imgUrl = imgUrl
    }
    mappings: Map<string, PointWithId<Point2D>> = new Map();
    /**
     * Global point Id in 3d space
     */
    // TODO: meta info image size and so on

    addMapping(point: PointWithId<Point2D>) {
        this.mappings.set(point.id, point)
    }
}


/**
 * Use u / v to make
 * clear 2d points are just a local
 * transformation
 */
type Point2D = {
    u: number
    v: number
}
type Point3D = {
    x: number
    y: number
    z: number
}

interface PointWithId<T extends Point2D | Point3D> {
    id: string
    p: T
}

class PointService {
    updateCameraParam(id: string, content: Partial<Record<camKey,number>>) {
        Object.assign(this.cameras.get(id)?.params, content )
        this.sendMappings()
    }
    addCamera(imgUrl: string) {
        this.cameras.set(imgUrl, new MCamera(imgUrl))
        this.sendMappings()
    }
    getCameras() {
        return [...this.cameras.values()]
    }
    listeners: any[]
    subscribe(setValues) {
        this.listeners.push(setValues)
    }


    points: Set<string>
    cameras: Map<string, MCamera>
    constructor() {
        this.points = new Set()
        this.listeners = []
        this.cameras = new Map()
    }

    addPointWithMapping(mappingId: string, mapping: PointWithId<Point2D>): void {
        const _camera = this.cameras.get(mappingId)

        if (!this.points.has(mapping.id)) {
            this.points.add(mapping.id)
        }

        _camera.addMapping(mapping)
        this.sendMappings()

    }

    sendMappings() {
        console.log('send')
        this.listeners.forEach(l => l(this.getMappings()))
    }

    getMappings() {
        return [...this.points].map(pId => ({ pId, points: Object.values(this.cameras).map(m => m.mappings.get(pId)) }))
    }
    getApproximations(): [number,number,number][] {
        if (this.cameras.size > 0) {
            const hm = [...this.cameras.values().next().value.mappings.values()]
            return hm.map((p: PointWithId<Point2D>) => ([p.p.u, p.p.v, 0]))
        }
        return []
    }
}

export const pointService = new PointService()

