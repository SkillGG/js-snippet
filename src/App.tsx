import { useEffect, useState } from "react";
import CustomJSSnippets from "./cjs";
import "./App.css";

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
                        __html: outJS.replace(/\n/, "<br/>"),
                    }}
                ></div>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(
                            outJS.replace(/<br class="span"\/>/g, "\n")
                        );
                        setCopied("Copied to clipboard!");
                    }}
                >
                    Copy code
                </button>
                <span>{copied}</span>
            </div>
        </>
    );
}

export default App;
