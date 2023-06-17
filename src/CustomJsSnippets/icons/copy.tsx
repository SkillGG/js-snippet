import { FC } from "react";
import { IconProps } from "./icon";

export const copy: FC<IconProps> = ({ svg, paths }) => (
    <svg style={svg} viewBox="0 0 512 512">
        <rect
            x="128"
            y="128"
            width="350"
            height="350"
            rx="57"
            ry="57"
            stroke-linejoin="round"
            style={paths[0] || {}}
        ></rect>
        <path
            d="M383.5 128l.5-24a56.16 56.16 0 00-56-56H112a64.19 64.19 0 00-64 64v216a56.16 56.16 0 0056 56h24"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="iconPath"
            style={paths[1] || {}}
        ></path>
    </svg>
);
