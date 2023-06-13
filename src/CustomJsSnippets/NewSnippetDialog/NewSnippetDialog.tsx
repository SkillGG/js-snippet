import { FC, useEffect, useRef, useState } from "react";
import { Snippet } from "../../snippet/snippet";

interface NewSnippetDialogProps {
    addSnippet(s: Snippet, i?: Snippet[]): void;
    snippetNumber: number;
}

import "./newSnippet.css";

const NewSnippetDialog: FC<NewSnippetDialogProps> = ({
    addSnippet,
    snippetNumber,
}) => {
    const thisRef = useRef<HTMLDialogElement>(null);
    const idRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const closeModal = () => {
        if (idRef.current) idRef.current.value = `snippet${snippetNumber}`;
        thisRef.current?.close();
    };

    useEffect(() => {
        if (idRef.current) idRef.current.value = `snippet${snippetNumber}`;
    }, [snippetNumber]);

    return (
        <>
            <dialog
                ref={thisRef}
                id="newSnippetDialog"
                onClick={(e) => {
                    if ((e.target as HTMLElement).tagName === "DIALOG")
                        closeModal();
                }}
            >
                <div id="newSnippetContent" className="dialogContent">
                    <div id="newSnippetForm">
                        <div>
                            <label>Snippet ID: </label>
                            <br />
                            <input ref={idRef} onInput={() => setError(null)} />
                        </div>
                        <div className="dialogSaveButtons">
                            <button
                                onClick={() => {
                                    if (!idRef.current?.value) {
                                        setError("No ID Provided!");
                                        return;
                                    }
                                    if (
                                        !/^[a-z0-9_-]+$/i.exec(
                                            idRef.current.value
                                        )
                                    ) {
                                        setError(
                                            "Incorrect ID! Use only a-z0-9 and _ or -"
                                        );
                                        return;
                                    }
                                    addSnippet({
                                        code: "",
                                        name: idRef.current.value,
                                        placeholders: [],
                                        overrideMode: "duplicate",
                                        readonly: false,
                                    });
                                    closeModal();
                                }}
                            >
                                Add
                            </button>
                            <button
                                onClick={() => {
                                    closeModal();
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                    {error && <div className="dialogerror">{error}</div>}
                </div>
            </dialog>
        </>
    );
};

export default NewSnippetDialog;
