import { FunctionComponent } from "react"
import * as React from 'react'
import { fabric } from "fabric"
import { KannWas } from "./kannwas"
import { PointTable } from "./points"
import { ThreedPreview } from "./preview"
import { pointService } from "./point-service"



export const App = () => {

    const [values, setValues] = React.useState([])
    React.useEffect(() => { pointService.subscribe((v) => {console.log('whaat');setValues(v)}) }, [])
    const points = pointService.getApproximations()

    return <div className="grid">{
        [<ThreedPreview points={points} />,
        <PointTable points={values} />,
        [...Array(10).keys()].map(i =>
            <div className="elgrid">
                <h2>{i}</h2>
                <KannWas mappingId={''+i} />
            </div>

        )]} </div>
}