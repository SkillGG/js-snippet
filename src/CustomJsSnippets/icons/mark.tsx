import { FC } from "react";
import { IconProps } from "./icon";

export const mark: FC<IconProps> = ({ svg, paths }) => (
    <svg viewBox="0 0 512 512" style={svg}>
        <path
            style={paths[0] || {}}
            className="iconPath"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M416 128L192 384l-96-96"
        ></path>
    </svg>
);
