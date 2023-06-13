import { FC, useEffect, useState } from "react";
import { Placeholder, Snippet } from "./snippet/snippet";

interface CustomJSSnippetsProps {
    setJS: React.Dispatch<React.SetStateAction<string>>;
}

const CustomJSSnippets: FC<CustomJSSnippetsProps> = ({ setJS }) => {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [placeholderValues, setPlaceholderValues] = useState<{
        [key: string]: {
            [key: string]: string;
        };
    }>({});

    const [erroneous, setErroneous] = useState<false | string>(false);

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
                console.log("outcode", code);
                return code;
            });
        else
            setJS((p) => {
                return `/* Error in ${erroneous} */`;
            });
    }, [snippets, placeholderValues, setJS]);

    return (
        <>
            <div>
                {snippets.map((snippet) => {
                    return (
                        <div key={`${snippet.name}`} className="snippet">
                            <div className="snippet_name">{snippet.name}</div>
                            <h4>
                                <div>Code:</div>
                                <textarea
                                    rows={5}
                                    cols={100}
                                    value={snippet.code}
                                    onChange={(ev) => {
                                        setSnippets((p) => {
                                            return p.map((sn) => {
                                                return sn.name === snippet.name
                                                    ? {
                                                          ...sn,
                                                          code: ev.target.value,
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
                                                        ph.required.pattern
                                                            .source
                                                    }
                                                    onChange={(ev) => {
                                                        setSnippets((p) => {
                                                            return p.map(
                                                                (s) => {
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
                                                                                                        pattern:
                                                                                                            new RegExp(
                                                                                                                ev.target.value
                                                                                                            ),
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
                                                        });
                                                    }}
                                                />
                                                <input
                                                    placeholder="default"
                                                    value={
                                                        ph.required.default ||
                                                        ""
                                                    }
                                                    onChange={(ev) => {
                                                        setSnippets((p) => {
                                                            return p.map(
                                                                (s) => {
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
                                                        });
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
                                                if (needle === null) return;
                                            } while (
                                                snippet.placeholders.find(
                                                    (ph) => ph.needle === needle
                                                )
                                            );
                                            const pattern = prompt(
                                                "Allowed value pattern?",
                                                "[a-zA-Z0-9]+"
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
                                                            pattern: new RegExp(
                                                                pattern ||
                                                                    "[a-zA-Z0-9]+"
                                                            ),
                                                            default:
                                                                defaultValue ||
                                                                undefined,
                                                        },
                                                    };
                                                setSnippets((prev) => {
                                                    return prev.map((snip) => {
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
                                                    });
                                                });
                                            }
                                        }}
                                    >
                                        Add placeholder
                                    </li>
                                </ul>
                            </h4>
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
                                                                    snippet.name
                                                                ]?.[ph.id] || ""
                                                            }
                                                            onChange={(ev) => {
                                                                if (
                                                                    !ph.required.pattern.exec(
                                                                        ev
                                                                            .target
                                                                            .value
                                                                    )
                                                                ) {
                                                                    ev.target.style.borderColor =
                                                                        "red";
                                                                    setErroneous(
                                                                        `<b style='font-style:italic; color:red;'>${snippet.name}.${ph.id}</b>: wrong pattern!
                                                                        Correct pattern:
                                                                        <b style="color:lightblue">${ph.required.pattern.source}</b>\n`
                                                                    );
                                                                } else {
                                                                    ev.target.style.borderColor =
                                                                        "unset";
                                                                    setErroneous(
                                                                        false
                                                                    );
                                                                }
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
                                                    </>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={
                                                            placeholderValues?.[
                                                                snippet.name
                                                            ]?.[ph.id] || ""
                                                        }
                                                        onChange={(ev) => {
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
                            let name: string | null;
                            do {
                                name = prompt(
                                    "Snippet ID?",
                                    `snippet${snippets.length + 1}`
                                );
                                if (name === null) return;
                            } while (
                                !/^[a-z0-9_-]+$/i.exec(name) &&
                                !snippets.find((snip) => snip.name === name)
                            );
                            if (name) {
                                const newSnippet: Snippet = {
                                    name,
                                    code: "",
                                    placeholders: [],
                                };
                                setSnippets((p) => {
                                    return [...p, newSnippet];
                                });
                            }
                        }}
                    >
                        Add snippet
                    </div>
                    <div
                        className="addSnippet"
                        onClick={() => {
                            alert("TODO: Implement");
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
