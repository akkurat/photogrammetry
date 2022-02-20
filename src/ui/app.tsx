import { FunctionComponent } from "react"
import * as React from 'react'
import { fabric } from "fabric"
import { KannWas } from "./kannwas"
import { PointTable } from "./points"
import { ThreedPreview } from "./preview"
import { pointService } from "./point-service"



export const App = () => {

    const [values, setValues] = React.useState([])
    React.useEffect(() => { pointService.subscribe(setValues) })
    const points = values.map((a, i) => [0, i+2, i])

    return <div className="grid">{
        [<ThreedPreview points={points} />,
        <PointTable points={values} />,
        [...Array(10).keys()].map(i =>
            <div className="elgrid">
                <h2>{i}</h2>
                <KannWas mappingId="i" />
            </div>

        )]} </div>
}