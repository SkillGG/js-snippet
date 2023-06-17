import { CSSProperties, FC, MouseEventHandler } from "react";
import { trash } from "../icons/trash";
import { none } from "../icons/none";
import { IconProps } from "../icons/icon";
import { up } from "../icons/up";
import { down } from "../icons/down";

import "./iconButton.css";
import { copy } from "../icons/copy";
import { settings } from "../icons/settings";

interface IconButtonProps {
    icon: keyof typeof ICONS;
    iconProps?: IconProps;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    classes?: string[];
    containerClasses?: string[];
    style?: CSSProperties;
    id?: string;
    containerId?: string;
    title?: string;
}

const ICONS = {
    trash: trash,
    none: none,
    up: up,
    down: down,
    copy: copy,
    settings: settings,
};

const IconButton: FC<IconButtonProps> = ({
    icon,
    title,
    onClick,
    iconProps,
    id,
    classes,
    style,
    containerId,
    containerClasses,
}) => {
    return (
        <>
            <span
                className={[
                    "iconButtonContainer",
                    ...(containerClasses || []),
                ].join(" ")}
                id={containerId}
            >
                <button
                    title={title}
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
