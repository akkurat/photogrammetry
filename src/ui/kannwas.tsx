import * as React from "react"
import { fabric } from "fabric"
import { camKey, pointService } from "./point-service"



type KannwasProps = {
    mappingId: string
    camera: Record<camKey, number>
    imgUrl: string
}

export class KannWas extends React.Component<KannwasProps> {
    rcanvas: React.RefObject<HTMLCanvasElement>
    fcanvas: fabric.Canvas
    count = 1
    mappingId: string
    constructor(props: Readonly<KannwasProps>) {
        super(props)
        this.rcanvas = React.createRef()
        this.mappingId = props.mappingId
    }
    componentDidMount(): void {
        this.fcanvas = new fabric.Canvas(this.rcanvas.current)
        this.fcanvas.setWidth(800)
        this.fcanvas.setHeight(1000)
        this.fcanvas.on('mouse:up', e => this.handleMouseUp(e))
        this.loadImage(this.props.imgUrl)
    }
    
    private handleMouseUp(e: fabric.IEvent<MouseEvent>) {
        if (e.isClick && e.target === null) {
            console.log(e)
            this.addCircle(e.absolutePointer)
        }
    }
    addCircle(p: { x: number, y: number }) {
        pointService.addPointWithMapping(this.mappingId, { id: ''+this.count, p:{u:p.x, v:p.y}} )

        const circle = new fabric.Circle({ radius: 10, fill: 'red', top: p.y, left: p.x, originX: 'center', originY: 'center' })
        const text = new fabric.Text('' + this.count++, { top: p.y, left: p.x, })

        const group = new fabric.Group([circle, text])
        group.hasControls = false
        this.fcanvas.add(group)
    }

    render(): React.ReactNode {
        const camera={X:10,Y:10,Z:0,alpha:0,beta:0,gamma:0,...this.props?.camera}
        return <div className="kannwas">
            {[...Object.entries(camera)].map(([k,v]) =><div><label>{k}<input type="number" value={v} onChange={e => {pointService.updateCameraParam(this.mappingId,{[k]: e.target.value})} }/></label></div>)}
            <canvas ref={this.rcanvas}></canvas>
        </div>
    }

    private loadImage(imgURL: string) {
        fabric.Image.fromURL(imgURL, fimg => {
            this.fcanvas.setHeight(fimg.height)
            this.fcanvas.setWidth(fimg.width)
            pointService.updateCameraParam(this.mappingId,{width: fimg.width, height: fimg.height})
            // this.fimg = fimg
            this.fcanvas.setBackgroundImage(fimg, () => { })


        })
    }
}