import { FC, useEffect, useState } from "react";
import { Placeholder, Snippet } from "../snippet/snippet";
import NewSnippetDialog from "./NewSnippetDialog/NewSnippetDialog";
import WebSnippetDialog from "./WebSnippetDialog/WebSnippetDialog";

interface CustomJSSnippetsProps {
    setJS: React.Dispatch<React.SetStateAction<string>>;
}

const DEFAULT_PLACEHOLDER_REGEX = "^[a-zA-Z0-9]+$";

const CustomJSSnippets: FC<CustomJSSnippetsProps> = ({ setJS }) => {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [placeholderValues, setPlaceholderValues] = useState<{
        [key: string]: {
            [key: string]: string;
        };
    }>({});

    const [erroneous, setErroneous] = useState<false | string>(false);

    const validateValue = (
        ev: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
        snippet: Snippet,
        ph: Placeholder
    ) => {
        const patternRX = new RegExp(ph.required.patternString);
        const value = ev.target.value;
        console.log(patternRX, value, !patternRX.exec(value));
        if (!patternRX.exec(value)) {
            ev.target.style.borderColor = "red";
            setErroneous(
                `<b style='font-style:italic; color:red;'>${snippet.name}.${ph.id}</b>: wrong pattern!
                Correct pattern:
                <b style="color:lightblue">${ph.required.patternString}</b>\n`
            );
        } else {
            ev.target.style.borderColor = "unset";
            setErroneous(false);
        }
    };

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
    }, [placeholderValues, snippets]);

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

        // generate outJS

        if (!erroneous)
            setJS(() => {
                const code = snippets.reduce((p, n) => {
                    let snipCode: string = n.code;
                    n.placeholders.forEach((ph) => {
                        snipCode = snipCode.replace(
                            ph.needle,
                            placeholderValues?.[n.name]?.[ph.id] ||
                                ph.required.default ||
                                ""
                        );
                    });
                    return p + `/* Snippet ${n.name} */\n` + snipCode + "\n\n";
                }, "");
                return code;
            });
        else
            setJS(() => {
                return `/* Error in ${erroneous} */`;
            });
    }, [snippets, placeholderValues, setJS, erroneous]);

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
                                                                        validateValue(
                                                                            ev,
                                                                            snippet,
                                                                            ph
                                                                        );
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
                                                                    validateValue(
                                                                        ev,
                                                                        snippet,
                                                                        ph
                                                                    );
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
