import { useEffect, useState } from "react";
import CustomJSSnippets from "./CustomJsSnippets/CustomJsSnippets";
import Footer from "./Footer";
import "./App.css";
import IconButton from "./CustomJsSnippets/IconButton/IconButton";

function App() {
    const [outJS, setOutJS] = useState("");

    const [copied, setCopied] = useState("");

    useEffect(() => {
        if (outJS.length > 0) w3CodeColor();
        setCopied("");
    }, [outJS]);

    return (
        <>
            <CustomJSSnippets setJS={setOutJS} />
            <div id="out">
                <h3>JS Output:</h3>
                <div
                    className="w3-code jsHigh notranslate"
                    dangerouslySetInnerHTML={{
                        __html: outJS
                            .replace(/<</g, "\u9998")
                            .replace(/>>/g, "\u9999")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/\u9998/g, "<")
                            .replace(/\u9999/g, ">")
                            .replace(/!(\/)B!/g, "<$1b")
                            .replace(/{B}/g, ">")
                            .replace(/\n/g, "<br/>")
                            .replace(/\t/g, "&emsp;"),
                    }}
                ></div>
                <IconButton
                    title="Copy the code"
                    icon="copy"
                    iconProps={{
                        svg: {},
                        paths: [
                            {
                                fill: "none",
                                stroke: "black",
                                strokeWidth: "35px",
                            },
                        ],
                    }}
                    id="copyCode"
                    containerId="copyCodeContainer"
                    onClick={() => {
                        navigator.clipboard.writeText(outJS);
                        setCopied("Copied to clipboard!");
                    }}
                />
                <span>{copied}</span>
            </div>
            <Footer />
        </>
    );
}

export default App;
