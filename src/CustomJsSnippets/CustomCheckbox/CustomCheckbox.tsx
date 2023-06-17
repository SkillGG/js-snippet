import { CSSProperties, ChangeEventHandler, FC } from "react";
import "./checkbox.css";
import { edit } from "../icons/edit";
import { mark } from "../icons/mark";
import { none } from "../icons/none";
import { IconProps } from "../icons/icon";

interface CustomCheckboxProps {
    checked: boolean;
    label?: string;
    title?: string;
    icon?: keyof typeof ICONS;
    className?: string;
    containerClass?: string;
    style?: CSSProperties;
    containerStyle?: CSSProperties;
    id?: string;
    containerId?: string;
    iconProps?: IconProps;
    onChange: ChangeEventHandler<HTMLInputElement> | undefined;
    reversedColors?: boolean;
}

const ICONS = {
    edit: edit,
    mark: mark,
    none: none,
};

const CustomCheckbox: FC<CustomCheckboxProps> = ({
    label,
    className,
    containerClass,
    id,
    containerId,
    title,
    icon,
    iconProps,
    style,
    checked,
    onChange,
    containerStyle,
    reversedColors = false,
}) => {
    return (
        <>
            <label
                id={containerId}
                style={containerStyle}
                className={`checkboxContainer ${containerClass || ""}`}
            >
                {label}
                <input
                    type="checkbox"
                    className={className}
                    checked={reversedColors ? !checked : checked}
                    onChange={
                        reversedColors
                            ? (ev) => {
                                  const evX = { ...ev };
                                  evX.target.checked = checked;
                                  onChange?.(ev);
                              }
                            : onChange
                    }
                />
                <span
                    id={id}
                    title={title}
                    className={`checkmark ${className || ""}`}
                    style={style}
                >
                    {ICONS[icon || "none"](iconProps || { svg: {}, paths: [] })}
                </span>
            </label>
        </>
    );
};

export default CustomCheckbox;
