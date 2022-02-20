import { useEffect, useState } from "react";
import React = require("react");
import { pointService } from "./point-service";

export const PointTable: React.FunctionComponent<{points:[number,number,number][]}> = ({points}) =>
{

    return <div>{
        points.map( v => <p>
            {JSON.stringify(v)}
        </p>)}
    </div>
}