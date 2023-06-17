import { CSSProperties, FC, MouseEventHandler } from "react";
import { trash } from "../icons/trash";
import { none } from "../icons/none";
import { IconProps } from "../icons/icon";
import { up } from "../icons/up";
import { down } from "../icons/down";

import "./iconButton.css";
import { copy } from "../icons/copy";

interface IconButtonProps {
    icon: keyof typeof ICONS;
    iconProps?: IconProps;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    classes?: string[];
    style?: CSSProperties;
    id?: string;
    containerId?: string;
}

const ICONS = {
    trash: trash,
    none: none,
    up: up,
    down: down,
    copy: copy,
};

const IconButton: FC<IconButtonProps> = ({
    icon,
    onClick,
    iconProps,
    id,
    classes,
    style,
    containerId,
}) => {
    return (
        <>
            <span className="iconButtonContainer" id={containerId}>
                <button
                    style={style}
                    className={["iconButton", ...(classes || [])].join(" ")}
                    id={id}
                    onClick={onClick}
                >
                    {ICONS[icon || "none"](iconProps || { svg: {}, paths: [] })}
                </button>
            </span>
        </>
    );
};

export default IconButton;
