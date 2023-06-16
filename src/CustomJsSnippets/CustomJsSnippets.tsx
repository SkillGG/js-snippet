import { FC, useEffect, useState } from "react";
import {
    Placeholder,
    Snippet,
    SnippetPlaceholderValue,
} from "../snippet/snippet";
import NewSnippetDialog from "./NewSnippetDialog/NewSnippetDialog";
import WebSnippetDialog from "./WebSnippetDialog/WebSnippetDialog";
import { z } from "zod";

interface CustomJSSnippetsProps {
    setJS: React.Dispatch<React.SetStateAction<string>>;
}

const DEFAULT_PLACEHOLDER_REGEX = "^[a-zA-Z0-9]+$";

const LS_SNIPPET_DATA = "cutomJSnippets";
const LS_SNIPPET_ERRORDATA = "cutomJSnippets_error";

type PlaceHolderError = { name: string; error: string };

const CustomJSSnippets: FC<CustomJSSnippetsProps> = ({ setJS }) => {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [placeholderValues, setPlaceholderValues] =
        useState<SnippetPlaceholderValue>({});
    const [firstLoad, setFirstLoad] = useState(false);

    const [loadError, setLoadError] = useState<string | null>(
        localStorage.getItem(LS_SNIPPET_ERRORDATA)
    );
    const [erroneous, setErroneous] = useState<false | PlaceHolderError[]>(
        false
    );

    useEffect(() => {
        const readFromLS = (): [Snippet[], SnippetPlaceholderValue] | null => {
            setFirstLoad(true);
            const lsData = localStorage.getItem(LS_SNIPPET_DATA);
            if (lsData) {
                try {
                    const jsonData = JSON.parse(lsData);
                    const LSSnippet = Snippet.merge(
                        z.object({
                            name: z.string().regex(/^[a-z0-9_-]+(\(\d+\))?$/i),
                        })
                    );
                    const parsedData = z
                        .tuple([z.array(LSSnippet), SnippetPlaceholderValue])
                        .safeParse(jsonData);
                    if (parsedData.success) {
                        const [sn, spv] = parsedData.data;
                        setSnippets(() => sn);
                        setPlaceholderValues(() => spv);
                    } else throw parsedData.error;
                } catch (err) {
                    console.error(err);
                    localStorage.setItem(LS_SNIPPET_ERRORDATA, lsData);
                    localStorage.removeItem(LS_SNIPPET_DATA);
                    return null;
                }
            }
            return null;
        };
        const lsData = readFromLS();
        if (lsData) {
            const [snips, values] = lsData;
            setSnippets(() => snips);
            setPlaceholderValues(() => values);
        }
    }, []);

    useEffect(() => {
        snippets.forEach((snip) => {
            if (placeholderValues[snip.name] === undefined) {
                let placeHolders: { [key: string]: string } = {};
                snip.placeholders.forEach((ph) => {
                    placeHolders = {
                        ...placeHolders,
                        [ph.id]: ph.required.default || "",
                    };
                });
                setPlaceholderValues((p) => {
                    return { ...p, [snip.name]: placeHolders };
                });
            } else {
                snip.placeholders.forEach((ph) => {
                    if (placeholderValues[snip.name][ph.id] === undefined) {
                        setPlaceholderValues((p) => {
                            return {
                                ...p,
                                [snip.name]: {
                                    ...p[snip.name],
                                    [ph.id]: ph.required.default || "",
                                },
                            };
                        });
                    }
                });
            }
        });

        const validateValues = (snippet: Snippet) => {
            const fields = document.querySelectorAll<
                HTMLInputElement | HTMLTextAreaElement
            >(`[data-snippet-name="${snippet.name}"]`);
            if (!fields || !fields.length) return;
            const hasError: PlaceHolderError[] = [];
            fields.forEach((field) => {
                const { value } = field;
                const phID = field.dataset.snippetPhid;
                const ph = snippet.placeholders.find((ph) => ph.id === phID);
                if (!ph) return;
                try {
                    const rx = new RegExp(
                        ph.required.patternString || DEFAULT_PLACEHOLDER_REGEX
                    );
                    if (!rx.exec(value)) {
                        field.style.borderColor = "red";
                        hasError.push({
                            name: snippet.name,
                            error: `/*
                            \t<b class="w3overrideRed">${snippet.name}.${ph.id}</b>: wrong pattern!
                            \tCorrect pattern:
                            \t<b class="w3overrideLightBlue">${ph.required.patternString}</b>
                            */\n`,
                        });
                    } else {
                        field.style.borderColor = "unset";
                        setErroneous(false);
                    }
                } catch (err) {
                    return;
                }
            });
            if (hasError.length) {
                const err = {
                    name: snippet.name,
                    error: hasError.reduce((p, n) => p + "\n" + n.error, ""),
                };
                setErroneous((prev) => {
                    return prev ? [...prev, err] : [err];
                });
            }
        };
        snippets.forEach((snippet) => {
            validateValues(snippet);
        });
    }, [placeholderValues, snippets]);

    useEffect(() => {
        const saveToLS = () => {
            if (!firstLoad) return;
            const data = [snippets, placeholderValues];
            const saveData = JSON.stringify(data);
            localStorage.setItem(LS_SNIPPET_DATA, saveData);
        };
        snippets.forEach((snip) => {
            if (placeholderValues[snip.name] === undefined) {
                let placeHolders: { [key: string]: string } = {};
                snip.placeholders.forEach((ph) => {
                    placeHolders = {
                        ...placeHolders,
                        [ph.id]: ph.required.default || "",
                    };
                });
                setPlaceholderValues((p) => {
                    return { ...p, [snip.name]: placeHolders };
                });
            } else {
                snip.placeholders.forEach((ph) => {
                    if (placeholderValues[snip.name][ph.id] === undefined) {
                        setPlaceholderValues((p) => {
                            return {
                                ...p,
                                [snip.name]: {
                                    ...p[snip.name],
                                    [ph.id]: ph.required.default || "",
                                },
                            };
                        });
                    }
                });
            }
        });
        const reduceSnippets = (errored: PlaceHolderError[]) => {
            return snippets.reduce((prev, snip) => {
                const err = errored.find((sn) => snip.name === sn.name);
                let snipCode: string = err ? err.error : snip.code;
                snip.placeholders.forEach((ph) => {
                    snipCode = snipCode.replace(
                        ph.needle,
                        placeholderValues?.[snip.name]?.[ph.id] ||
                            ph.required.default ||
                            ""
                    );
                });
                return (
                    prev + `/* Snippet ${snip.name} */\n` + snipCode + "\n\n"
                );
            }, "");
        };
        // generate outJS
        saveToLS();
        setJS(() => reduceSnippets(erroneous || []));
    }, [snippets, placeholderValues, setJS, erroneous, firstLoad]);

    const addSnippet = (
        snippetToAdd: Snippet,
        importSnippets: Snippet[] = []
    ) => {
        for (let i = 0; i < importSnippets.length; i++)
            addSnippet(importSnippets[i]);
        if (snippetToAdd.overrideMode === "overwrite") {
            setSnippets((p) => {
                if (p.find((s) => s.name === snippetToAdd.name))
                    return p.map((snip) =>
                        snip.name === snippetToAdd.name ? snippetToAdd : snip
                    );
                else return [...p, snippetToAdd];
            });
        } else {
            const sameSnippets = snippets.filter((snip) =>
                new RegExp(
                    `^${snippetToAdd.name.replace(/-/g, "\\-")}(\\(\\d+\\))?`
                ).exec(snip.name)
            );
            if (sameSnippets.length > 0) {
                const lastSnip = sameSnippets[sameSnippets.length - 1];
                const snipRx = /\((\d+)\)/.exec(lastSnip.name);
                const snipNum = snipRx ? parseInt(snipRx[1], 10) + 1 : 1;
                snippetToAdd.name = `${snippetToAdd.name}(${snipNum})`;
            }
            setSnippets((p) => {
                return [...p, { ...snippetToAdd }];
            });
        }
    };

    const removeSnippet = (snippetName: string) => {
        setSnippets((p) => {
            return p.filter((snip) => snip.name !== snippetName);
        });
        setPlaceholderValues((pv) => {
            const x = { ...pv };
            delete x[snippetName];
            return x;
        });
    };

    return (
        <>
            <NewSnippetDialog
                addSnippet={addSnippet}
                snippetNumber={snippets.length + 1}
            />
            <WebSnippetDialog addSnippet={addSnippet} />
            <div>
                {snippets.map((snippet) => {
                    return (
                        <div key={`${snippet.name}`} className="snippet">
                            <div className="snippet_name">
                                {snippet.name}{" "}
                                <input
                                    type="checkbox"
                                    checked={snippet.readonly}
                                    onChange={() => {
                                        setSnippets((p) => {
                                            return p.map((snip) => {
                                                return snip.name ===
                                                    snippet.name
                                                    ? {
                                                          ...snip,
                                                          readonly:
                                                              !snippet.readonly,
                                                      }
                                                    : snip;
                                            });
                                        });
                                    }}
                                />
                                <button
                                    onClick={() => removeSnippet(snippet.name)}
                                >
                                    Remove
                                </button>
                            </div>
                            {!snippet.readonly && (
                                <>
                                    <h4>
                                        <div>Code:</div>
                                        <textarea
                                            rows={5}
                                            cols={100}
                                            value={snippet.code}
                                            onChange={(ev) => {
                                                setSnippets((p) => {
                                                    return p.map((sn) => {
                                                        return sn.name ===
                                                            snippet.name
                                                            ? {
                                                                  ...sn,
                                                                  code: ev
                                                                      .target
                                                                      .value,
                                                              }
                                                            : sn;
                                                    });
                                                });
                                            }}
                                        ></textarea>
                                    </h4>
                                    <h4>
                                        Placeholders (settings):
                                        <ul id="settings">
                                            {snippet.placeholders.map((ph) => {
                                                return (
                                                    <li
                                                        key={`${snippet.name}_${ph.needle}`}
                                                        id={`${snippet.name}_${ph.needle}`}
                                                    >
                                                        {ph.needle}{" "}
                                                        <input
                                                            placeholder="default"
                                                            value={
                                                                ph.required
                                                                    .patternString
                                                            }
                                                            onChange={(ev) => {
                                                                setSnippets(
                                                                    (p) => {
                                                                        return p.map(
                                                                            (
                                                                                s
                                                                            ) => {
                                                                                if (
                                                                                    s.name ===
                                                                                    snippet.name
                                                                                )
                                                                                    return {
                                                                                        ...s,
                                                                                        placeholders:
                                                                                            s.placeholders.map(
                                                                                                (
                                                                                                    x
                                                                                                ) => {
                                                                                                    if (
                                                                                                        x.needle ===
                                                                                                        ph.needle
                                                                                                    )
                                                                                                        return {
                                                                                                            ...x,
                                                                                                            required:
                                                                                                                {
                                                                                                                    ...x.required,
                                                                                                                    patternString:
                                                                                                                        ev
                                                                                                                            .target
                                                                                                                            .value,
                                                                                                                },
                                                                                                        };
                                                                                                    return x;
                                                                                                }
                                                                                            ),
                                                                                    };
                                                                                else
                                                                                    return s;
                                                                            }
                                                                        );
                                                                    }
                                                                );
                                                            }}
                                                        />
                                                        <input
                                                            placeholder="default"
                                                            value={
                                                                ph.required
                                                                    .default ||
                                                                ""
                                                            }
                                                            onChange={(ev) => {
                                                                setSnippets(
                                                                    (p) => {
                                                                        return p.map(
                                                                            (
                                                                                s
                                                                            ) => {
                                                                                if (
                                                                                    s.name ===
                                                                                    snippet.name
                                                                                )
                                                                                    return {
                                                                                        ...s,
                                                                                        placeholders:
                                                                                            s.placeholders.map(
                                                                                                (
                                                                                                    x
                                                                                                ) => {
                                                                                                    if (
                                                                                                        x.needle ===
                                                                                                        ph.needle
                                                                                                    )
                                                                                                        return {
                                                                                                            ...x,
                                                                                                            required:
                                                                                                                {
                                                                                                                    ...x.required,
                                                                                                                    default:
                                                                                                                        ev
                                                                                                                            .target
                                                                                                                            .value,
                                                                                                                },
                                                                                                        };
                                                                                                    return x;
                                                                                                }
                                                                                            ),
                                                                                    };
                                                                                else
                                                                                    return s;
                                                                            }
                                                                        );
                                                                    }
                                                                );
                                                            }}
                                                        />
                                                    </li>
                                                );
                                            })}
                                            <li
                                                key={"addplaceholder"}
                                                onClick={() => {
                                                    let id: string | null;
                                                    do {
                                                        id = prompt(
                                                            "Placeholder ID?",
                                                            ""
                                                        );
                                                        if (id === null) return;
                                                    } while (
                                                        !/^[a-z]+$/.exec(id) &&
                                                        snippet.placeholders.find(
                                                            (ph) => ph.id === id
                                                        )
                                                    );
                                                    let needle: string | null;
                                                    do {
                                                        needle = prompt(
                                                            "Characters to change?",
                                                            ""
                                                        );
                                                        if (needle === null)
                                                            return;
                                                    } while (
                                                        snippet.placeholders.find(
                                                            (ph) =>
                                                                ph.needle ===
                                                                needle
                                                        )
                                                    );
                                                    const pattern = prompt(
                                                        "Allowed value pattern?",
                                                        DEFAULT_PLACEHOLDER_REGEX
                                                    );
                                                    const multiline = !!prompt(
                                                        "Is Multiline?",
                                                        ""
                                                    );
                                                    const defaultValue = prompt(
                                                        "Default value?",
                                                        ""
                                                    );

                                                    if (needle && id) {
                                                        const newPlaceholder: Placeholder =
                                                            {
                                                                id,
                                                                needle,
                                                                multiline,
                                                                required: {
                                                                    patternString:
                                                                        pattern ||
                                                                        DEFAULT_PLACEHOLDER_REGEX,
                                                                    default:
                                                                        defaultValue ||
                                                                        undefined,
                                                                },
                                                            };
                                                        setSnippets((prev) => {
                                                            return prev.map(
                                                                (snip) => {
                                                                    return snip.name ===
                                                                        snippet.name
                                                                        ? {
                                                                              ...snippet,
                                                                              placeholders:
                                                                                  [
                                                                                      ...snippet.placeholders,
                                                                                      newPlaceholder,
                                                                                  ],
                                                                          }
                                                                        : snip;
                                                                }
                                                            );
                                                        });
                                                    }
                                                }}
                                            >
                                                Add placeholder
                                            </li>
                                        </ul>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    JSON.stringify(
                                                        {
                                                            ...snippet,
                                                            name: snippet.name.replace(
                                                                /\(\d+\)/g,
                                                                ""
                                                            ),
                                                            readonly: undefined,
                                                        },
                                                        undefined,
                                                        1
                                                    )
                                                );
                                            }}
                                        >
                                            Get JSON
                                        </button>
                                    </h4>
                                </>
                            )}
                            {placeholderValues[snippet.name] &&
                                Object.keys(placeholderValues[snippet.name])
                                    .length > 0 && (
                                    <h4>
                                        Placeholders (values):
                                        <ul>
                                            {snippet.placeholders.map((ph) => {
                                                return (
                                                    <li
                                                        key={`${snippet.name}_${ph.needle}_value`}
                                                    >
                                                        {ph.id}:
                                                        {ph.multiline ? (
                                                            <>
                                                                <br />
                                                                <textarea
                                                                    className="placeholderValue"
                                                                    data-snippet-name={
                                                                        snippet.name
                                                                    }
                                                                    data-snippet-phid={
                                                                        ph.id
                                                                    }
                                                                    value={
                                                                        placeholderValues?.[
                                                                            snippet
                                                                                .name
                                                                        ]?.[
                                                                            ph
                                                                                .id
                                                                        ] || ""
                                                                    }
                                                                    onChange={(
                                                                        ev
                                                                    ) => {
                                                                        setPlaceholderValues(
                                                                            (
                                                                                p
                                                                            ) => {
                                                                                return {
                                                                                    ...p,
                                                                                    [snippet.name]:
                                                                                        {
                                                                                            ...p[
                                                                                                snippet
                                                                                                    .name
                                                                                            ],
                                                                                            [ph.id]:
                                                                                                ev
                                                                                                    .target
                                                                                                    .value ||
                                                                                                "",
                                                                                        },
                                                                                };
                                                                            }
                                                                        );
                                                                    }}
                                                                />
                                                            </>
                                                        ) : (
                                                            <input
                                                                className="placeholderValue"
                                                                data-snippet-name={
                                                                    snippet.name
                                                                }
                                                                data-snippet-phid={
                                                                    ph.id
                                                                }
                                                                type="text"
                                                                value={
                                                                    placeholderValues?.[
                                                                        snippet
                                                                            .name
                                                                    ]?.[
                                                                        ph.id
                                                                    ] || ""
                                                                }
                                                                onChange={(
                                                                    ev
                                                                ) => {
                                                                    setPlaceholderValues(
                                                                        (p) => {
                                                                            return {
                                                                                ...p,
                                                                                [snippet.name]:
                                                                                    {
                                                                                        ...p[
                                                                                            snippet
                                                                                                .name
                                                                                        ],
                                                                                        [ph.id]:
                                                                                            ev
                                                                                                .target
                                                                                                .value ||
                                                                                            "",
                                                                                    },
                                                                            };
                                                                        }
                                                                    );
                                                                }}
                                                            />
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </h4>
                                )}
                        </div>
                    );
                })}
                <div
                    className={
                        "addSnippetBlock" +
                        (snippets.length === 0 ? " addSnippetFlex" : "")
                    }
                >
                    <div
                        className="addSnippet"
                        onClick={() => {
                            const dialog: HTMLDialogElement | null =
                                document.querySelector(
                                    "dialog#newSnippetDialog"
                                );
                            if (dialog) dialog.showModal();
                        }}
                    >
                        Add snippet
                    </div>
                    <div
                        className="addSnippet"
                        onClick={() => {
                            const dialog: HTMLDialogElement | null =
                                document.querySelector(
                                    "dialog#webSnippetDialog"
                                );
                            if (dialog) dialog.showModal();
                        }}
                    >
                        Load from web
                    </div>
                </div>
            </div>
        </>
    );
};

export default CustomJSSnippets;
