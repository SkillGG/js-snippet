import { FC, useRef, useState } from "react";
import { Placeholder } from "../../snippet/snippet";

interface NewPlaceholderDialogProps {
    addPlaceholder(p: Placeholder): void;
}

const NewPlaceholderDialog: FC<NewPlaceholderDialogProps> = ({
    addPlaceholder,
}) => {
    const thisRef = useRef<HTMLDialogElement>(null);
    const idRef = useRef<HTMLInputElement>(null);
    const needleRef = useRef<HTMLInputElement>(null);
    const defaultRef = useRef<HTMLInputElement>(null);
    const patternRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isMultiline, setIsMultiline] = useState(false);
    const [isDefault, setIsDefault] = useState(false);

    const closeModal = () => {
        if (idRef.current) idRef.current.value = "";
        setError(null);
        thisRef.current?.close();
    };

    return (
        <>
            <dialog
                ref={thisRef}
                id="newPlaceholderDialog"
                onClick={(e) => {
                    if ((e.target as HTMLElement).tagName === "DIALOG")
                        closeModal();
                }}
            >
                <div id="newSnippetContent" className="dialogContent">
                    <div id="newSnippetForm">
                        <div className="phData dialogInputContainer">
                            <label data-required="true" aria-required="true">
                                Name
                            </label>
                            <br />
                            <input
                                type="text"
                                className="phNameInput"
                                ref={idRef}
                                onInput={() => setError(null)}
                            />
                        </div>
                        <div className="phData dialogInputContainer">
                            <label data-required="true" aria-required="true">
                                Needle (searched text)
                            </label>
                            <br />
                            <input
                                type="text"
                                className="phNeedleInput"
                                ref={needleRef}
                                onInput={() => setError(null)}
                            />
                        </div>
                        <div className="phData dialogInputContainer">
                            <label>Pattern ()</label>
                            <br />
                            <input
                                type="text"
                                className="phNeedleInput"
                                ref={patternRef}
                                onInput={() => setError(null)}
                            />
                        </div>
                        <div className="phData dialogInputContainer">
                            <label>Default</label>
                            <input
                                type="checkbox"
                                className="phDefault"
                                checked={isDefault}
                                onChange={() => setIsDefault((p) => !p)}
                            />
                            {isDefault && (
                                <>
                                    <br />
                                    <input ref={defaultRef} type="text" />
                                </>
                            )}
                        </div>
                        <div className="phData dialogInputContainer">
                            <label>Multiline</label>
                            <input
                                type="checkbox"
                                className="phMultiline"
                                checked={isMultiline}
                                onChange={() => setIsMultiline((p) => !p)}
                            />
                        </div>
                        <div className="dialogSaveButtons">
                            <button
                                onClick={() => {
                                    try {
                                        if (
                                            !idRef.current ||
                                            !needleRef.current ||
                                            !patternRef.current
                                        )
                                            throw "Unexpected error";

                                        const { value: name } = idRef.current;
                                        const { value: needle } =
                                            needleRef.current;
                                        const { value: pattern } =
                                            patternRef.current;

                                        if (!name) throw "No name provided!";
                                        if (!/^[a-z0-9_-]+$/i.exec(name))
                                            throw "Incorrect Name! Allowed: [a-zA-Z0-9_-]+";
                                        if (!needle)
                                            throw "No needle provided!";

                                        const newPH: Placeholder = {
                                            id: name,
                                            multiline: isMultiline,
                                            needle: needle,
                                            required: {
                                                patternString: pattern || "",
                                                default:
                                                    (isDefault &&
                                                        defaultRef.current
                                                            ?.value) ||
                                                    undefined,
                                            },
                                        };
                                        addPlaceholder(newPH);
                                        closeModal();
                                    } catch (err) {
                                        if (typeof err === "object")
                                            setError(
                                                () => (err as Error).message
                                            );
                                        else if (typeof err === "string")
                                            setError(() => err as string);
                                        else
                                            setError(() => JSON.stringify(err));
                                    }
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

export default NewPlaceholderDialog;
