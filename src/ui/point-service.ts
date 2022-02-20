import { Point } from "fabric/fabric-impl"
import { Dispatch } from "react"

class Mapping {
    mappings: Map<string,PointWithId<Point2D>> = new Map();
    /**
     * Global point Id in 3d space
     */
    // TODO: meta info image size and so on

    addMapping( point: PointWithId<Point2D>) {
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
    listeners: any[]
    subscribe(setValues) {
        this.listeners.push(setValues)
    }
        
    
    points: Set<string>
    mappings: Map<string,Mapping>
    constructor() {
        this.points = new Set() 
        this.listeners = []
        this.mappings = new Map()
    }

    addPointWithMapping(mappingId: string, mapping: PointWithId<Point2D> ): void {
        if( !this.mappings.has(mappingId) )
        {
            this.mappings.set(mappingId, new Mapping() )
        }
        const _mapping = this.mappings.get(mappingId)

        if( !this.points.has(mapping.id) ) {
            this.points.add(mapping.id)
        }

        _mapping.addMapping(mapping)
       this.sendMappings()

    }

    sendMappings() {
        this.listeners.forEach( l => l(this.getMappings()))
    }

    getMappings() {
        return [...this.points].map( pId => ({pId, points: Object.values(this.mappings).map( m => m.mappings.get(pId))}))
    }
}

export const pointService = new PointService()

