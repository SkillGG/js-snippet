import { useEffect, useState } from "react";
import CustomJSSnippets from "./CustomJsSnippets/CustomJsSnippets";
import Footer from "./Footer";
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
                        __html: outJS.replace(/\n/g, "<br/>"),
                    }}
                ></div>
                <button
                    id="copyCode"
                    onClick={() => {
                        navigator.clipboard.writeText(outJS);
                        setCopied("Copied to clipboard!");
                    }}
                >
                    Copy code
                </button>
                <span>{copied}</span>
            </div>
            <Footer />
        </>
    );
}

export default App;
