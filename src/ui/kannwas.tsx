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
    rcanvasContainer: React.RefObject<HTMLDivElement>

    constructor(props: Readonly<KannwasProps>) {
        super(props)
        this.rcanvas = React.createRef()
        this.rcanvasContainer = React.createRef()
        this.mappingId = props.mappingId
    }
    componentDidMount(): void {
        this.fcanvas = new fabric.Canvas(this.rcanvas.current, {})
        this.setCanvasSize()
        this.fcanvas.on('mouse:up', e => this.handleMouseUp(e))
        this.loadImage(this.props.imgUrl)

        window.addEventListener('resize', e => this.setCanvasSize())
    }

    private setCanvasSize() {
        const h = this.rcanvasContainer.current.clientHeight, w = this.rcanvasContainer.current.clientWidth
        this.fcanvas.setHeight(h)
        this.fcanvas.setWidth(w)
            // this.fcanvas.setHeight(fimg.height)
            // this.fcanvas.setWidth(fimg.width)
            // fimg.scale(Math.min(h/fimg.height, w/fimg.width))
            this.fcanvas.backgroundImage?.scaleToWidth(w)
    }

    private handleMouseUp(e: fabric.IEvent<MouseEvent>) {
        if (e.isClick && e.target === null) {
            console.log(e)
            this.addCircle(e.absolutePointer)
        }
    }
    addCircle(p: { x: number, y: number }) {
        pointService.addPointWithMapping(this.mappingId, { id: '' + this.count, p: { u: p.x, v: p.y } })

        const circle = new fabric.Circle({ radius: 10, fill: 'red', top: p.y, left: p.x, originX: 'center', originY: 'center' })
        const text = new fabric.Text('' + this.count++, { top: p.y, left: p.x, })

        const group = new fabric.Group([circle, text])
        group.hasControls = false
        this.fcanvas.add(group)
    }

    render(): React.ReactNode {
        const camera = this.props.camera
        return <div className="kannwas">
            <div className="settings">
                {[...Object.entries(camera)].map(([k, v]) =>
                    <label className="setting">
                        <div>{k}</div>
                        <div><input type="number" value={v} onChange={e => { pointService.updateCameraParam(this.mappingId, { [k]: parseFloat(e.target.value) }) }} /></div>
                    </label>
                )}
            </div>
            <div className="canvasContainer" ref={this.rcanvasContainer}>
                <canvas ref={this.rcanvas}></canvas>
            </div>
        </div>
    }

    private loadImage(imgURL: string) {
        fabric.Image.fromURL(imgURL, fimg => {
            const [h,w] = [this.fcanvas.height, this.fcanvas.width]
            // this.fcanvas.setHeight(fimg.height)
            // this.fcanvas.setWidth(fimg.width)
            // fimg.scale(Math.min(h/fimg.height, w/fimg.width))
            fimg.scaleToWidth(w)
            fimg.originX='left'
            fimg.originY='top'
            
            pointService.updateCameraParam(this.mappingId, { width: fimg.width, height: fimg.height })
            // this.fimg = fimg
            this.fcanvas.setBackgroundImage(fimg, () => { })


        })
    }
}