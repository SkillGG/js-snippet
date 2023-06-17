interface IconStyles {
    backgroundColor?: string;
    stroke?: string;
    fill?: string;
    width?: string;
    height?: string;
    strokeWidth?: string;
}

export interface IconProps {
    svg: IconStyles;
    paths: IconStyles[];
}
