import * as React from "react"
import { fabric } from "fabric"
import { pointService } from "./point-service"

export class KannWas extends React.Component<{ mappingId: string }> {
    rcanvas: React.RefObject<HTMLCanvasElement>
    fcanvas: fabric.Canvas
    count = 1
    mappingId: string
    constructor(props: Readonly<{ mappingId: string }>) {
        super(props)
        this.rcanvas = React.createRef()
        this.mappingId = props.mappingId
    }
    componentDidMount(): void {
        this.fcanvas = new fabric.Canvas(this.rcanvas.current)
        this.fcanvas.setWidth(800)
        this.fcanvas.setHeight(1000)
        this.fcanvas.on('mouse:up', e => this.handleMouseUp(e))
    }
    private handleMouseUp(e: fabric.IEvent<MouseEvent>) {
        console.log(e)
        if (e.isClick && e.target === null) {
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
        return <div>
            <input type="file" onChange={e => this.handleFileChanged(e)}></input>
            <canvas ref={this.rcanvas}></canvas>
        </div>
    }

    private handleFileChanged(e: React.ChangeEvent<HTMLInputElement>) {
        console.log(e, this)
        const files = e.target.files
        if (files.length > 0) {
            this.loadImage(files[0])
        }
    }
    private loadImage(file: File) {
        const imgURL = URL.createObjectURL(file)
        fabric.Image.fromURL(imgURL, fimg => {
            this.fcanvas.setHeight(fimg.height)
            this.fcanvas.setWidth(fimg.width)
            // this.fimg = fimg
            this.fcanvas.setBackgroundImage(fimg, () => { })


        })
    }
}