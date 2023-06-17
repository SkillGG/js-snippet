import { FC } from "react";
import { IconProps } from "./icon";

export const trash: FC<IconProps> = ({ svg, paths }) => (
    <svg style={svg} viewBox="0 0 512 512">
        <path
            d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="iconPath"
            style={paths[0] || {}}
        ></path>
        <path
            strokeLinecap="round"
            strokeMiterlimit="10"
            d="M80 112h352"
            style={paths[0] || {}}
            className="iconPath"
        ></path>
        <path
            d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={paths[0] || {}}
            className="iconPath"
        ></path>
    </svg>
);
