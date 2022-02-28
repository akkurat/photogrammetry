import { FunctionComponent } from "react"
import * as React from 'react'
import { fabric } from "fabric"
import { KannWas } from "./kannwas"
import { PointTable } from "./points"
import { ThreedPreview } from "./preview"
import { pointService } from "./point-service"

let count = 0

const handleFileChanged: ((e: React.ChangeEvent<HTMLInputElement>) => void) = (e) => {
    const files = e.target.files
    if (files.length > 0) {
        const imgURL = URL.createObjectURL(files[0])
        pointService.addCamera((imgURL))
        pointService.updateCameraParam(imgURL, { beta: 100 * count })
        count++
    }
}

export const App = () => {

    const [values, setValues] = React.useState([])
    React.useEffect(() => { pointService.subscribe((v) => { console.log('whaat'); setValues(v) }) }, [])
    const points = pointService.getApproximations()
    const cameras = pointService.getCameras()

    return <>
        <div className="preview-row">
            <ThreedPreview points={points} cameras={cameras} />
            <label id="newFile">
                <input type="file" onChange={e => handleFileChanged(e)}></input>
            </label>
        </div>
        <div className="grid">
            {[
                // <PointTable points={values} />,
                cameras.map(c =>
                    <div className="elgrid">
                        <h2>{c.id}</h2>
                        <KannWas mappingId={'' + c.imgUrl} camera={c.params} imgUrl={c.imgUrl} />
                    </div>

                )]}
        </div>
    </>
}