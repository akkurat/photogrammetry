import { FunctionComponent } from "react"
import * as React from 'react'
import { fabric } from "fabric"
import { KannWas } from "./kannwas"
import { PointTable } from "./points"
import { ThreedPreview } from "./preview"
import { pointService } from "./point-service"


const handleFileChanged: ((e: React.ChangeEvent<HTMLInputElement>) => void) = (e) => {
    const files = e.target.files
    if (files.length > 0) {
        const imgURL = URL.createObjectURL(files[0])
        pointService.addCamera((imgURL))
    }
}

export const App = () => {

    const [values, setValues] = React.useState([])
    React.useEffect(() => { pointService.subscribe((v) => { console.log('whaat'); setValues(v) }) }, [])
    const points = pointService.getApproximations()
    const cameras = pointService.getCameras()

    return <div className="grid">{
        [
            <input type="file" onChange={e => handleFileChanged(e)}></input>,
            <ThreedPreview points={points} cameras={cameras}/>,
            // <PointTable points={values} />,
            cameras.map(c =>
                <div className="elgrid">
                    <h2>{c.id}</h2>
                    <KannWas mappingId={'' + c.imgUrl} camera={c.params} imgUrl={c.imgUrl}/>
                </div>

            )]} </div>
}