import { FC } from "react";
import { IconProps } from "./icon";

export const up: FC<IconProps> = ({ svg, paths }) => {
    return (
        <svg style={svg} viewBox="0 0 512 512">
            <path
                style={paths[0] || {}}
                d="M414 321.94L274.22 158.82a24 24 0 00-36.44 0L98 321.94c-13.34 15.57-2.28 39.62 18.22 39.62h279.6c20.5 0 31.56-24.05 18.18-39.62z"
            ></path>
        </svg>
    );
};
