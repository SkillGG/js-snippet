import { CSSProperties, ChangeEventHandler, FC } from "react";
import "./checkbox.css";
import { edit } from "../icons/edit";
import { mark } from "../icons/mark";
import { none } from "../icons/none";
import { IconProps } from "../icons/icon";

interface CustomCheckboxProps {
    checked: boolean;
    label?: string;
    icon?: keyof typeof ICONS;
    style?: CSSProperties;
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
    icon,
    iconProps,
    style,
    checked,
    onChange,
    reversedColors = false,
}) => {
    return (
        <>
            <label className="checkboxContainer">
                {label}
                <input
                    type="checkbox"
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
                <span className="checkmark" style={style} aria-tabIndex={1}>
                    {ICONS[icon || "none"](iconProps || { svg: {}, paths: [] })}
                </span>
            </label>
        </>
    );
};

export default CustomCheckbox;
