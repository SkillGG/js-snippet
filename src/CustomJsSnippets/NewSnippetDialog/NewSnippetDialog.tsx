import { FC, useRef, useState } from "react";
import { Snippet } from "../../snippet/snippet";

interface NewSnippetDialogProps {
    addSnippet(s: Snippet): void;
    snippetNumber: number;
}

const NewSnippetDialog: FC<NewSnippetDialogProps> = ({
    addSnippet,
    snippetNumber,
}) => {
    const thisRef = useRef<HTMLDialogElement>(null);
    const idRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const closeModal = () => {
        if (idRef.current) idRef.current.value = "";
        setError(null);
        thisRef.current?.close();
    };

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
                        <div className="dialogInputContainer">
                            <label data-required="true">Snippet ID</label>
                            <br />
                            <input
                                type="text"
                                className="snippetIDInput"
                                ref={idRef}
                                onInput={() => setError(null)}
                                placeholder={`snippet${snippetNumber}`}
                            />
                        </div>
                        <div className="dialogSaveButtons">
                            <button
                                onClick={() => {
                                    if (!idRef.current) return;
                                    const value =
                                        idRef.current.value ||
                                        `snippet${snippetNumber}`;
                                    if (!/^[a-z0-9_-]+$/i.exec(value)) {
                                        setError(
                                            "Incorrect ID! Allowed: [a-zA-Z0-9_-]+"
                                        );
                                        return;
                                    }
                                    addSnippet({
                                        code: "",
                                        name: value,
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
