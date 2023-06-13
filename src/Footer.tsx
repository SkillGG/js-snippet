import { FC } from "react";

import "./Footer.css";

const footer: FC<object> = () => {
    return (
        <footer>
            <div id="infoBox">
                <div style={{ display: "inline-block" }}>Made by: SkillGG </div>
                <div style={{ display: "inline-block", float: "right" }}>
                    <a href="https://github.com/skillgg">[Github]</a>
                </div>
            </div>
        </footer>
    );
};

export default footer;
