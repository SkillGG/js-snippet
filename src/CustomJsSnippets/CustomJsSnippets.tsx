import { FC, useEffect, useState } from "react";
import {
    Placeholder,
    Snippet,
    SnippetImports,
    SnippetImportLinkType,
    SnippetPlaceholderValue,
} from "../snippet/snippet";
import NewSnippetDialog from "./NewSnippetDialog/NewSnippetDialog";
import WebSnippetDialog from "./WebSnippetDialog/WebSnippetDialog";
import { z } from "zod";

import "./dialogs.css";
import NewPlaceholderDialog from "./NewPlaceholderDialog/NewPlaceholderDialog";
import {
    FetchError,
    fetchSnippet,
    isFetchError,
} from "./WebSnippetDialog/utils";
import CustomCheckbox from "./CustomCheckbox/CustomCheckbox";
import IconButton from "./IconButton/IconButton";

interface CustomJSSnippetsProps {
    setJS: React.Dispatch<React.SetStateAction<string>>;
}

const MAX_SNIPPET_COUNT = Number.MAX_VALUE;
const DEFAULT_PLACEHOLDER_REGEX = "^[a-zA-Z0-9]+$";

const LS_SNIPPET_DATA = "cutomJSnippets";
const LS_SNIPPET_ERRORDATA = "cutomJSnippets_error";

type PlaceHolderError = { name: string; error: string; phid: string };
type SnippetImportLink = { name: string; linkType: SnippetImportLinkType };

declare global {
    interface Window {
        LSDATA: string | null;
    }
}

const CustomJSSnippets: FC<CustomJSSnippetsProps> = ({ setJS }) => {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [placeholderValues, setPlaceholderValues] =
        useState<SnippetPlaceholderValue>({});
    const [firstLoad, setFirstLoad] = useState(false);
    const [placeholderAddSnippetName, setPlaceholderAddSnippetName] =
        useState("");
    const [loadError, setLoadError] = useState<string | null>(null);
    const [erroneous, setErroneous] = useState<false | PlaceHolderError[]>(
        false
    );
    const [snippetLinks, setSnippetLinks] = useState<SnippetImports>({});
    const [editErrorCode, setEditErrorCode] = useState<string[]>([]);

    useEffect(() => {
        const readFromLS = () => {
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
                        .tuple([
                            z.array(LSSnippet),
                            SnippetPlaceholderValue,
                            SnippetImports.optional(),
                        ])
                        .safeParse(jsonData);
                    if (parsedData.success) {
                        const [sn, spv, lnks] = parsedData.data;
                        setSnippets(() => sn);
                        setPlaceholderValues(() => spv);
                        setSnippetLinks(() => lnks || {});
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
        readFromLS();
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
                    if (!rx.exec(value || ph.required.default || "")) {
                        field.style.borderColor = "red";
                        hasError.push({
                            name: snippet.name,
                            phid: ph.id,
                            error: `/*
                            \t<<b class="w3overrideRed">>${snippet.name}.${ph.id}<</b>>: wrong pattern!
                            \tCorrect pattern:
                            \t<<b class="w3overrideLightBlue">>${ph.required.patternString}<</b>>
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
                setErroneous((prev) => {
                    return prev
                        ? [
                              ...prev.map((perr) => {
                                  return (
                                      hasError.find(
                                          (err) =>
                                              perr.name === err.name &&
                                              perr.phid === err.phid
                                      ) || perr
                                  );
                              }),
                              ...hasError.filter(
                                  (err) =>
                                      !prev.find(
                                          (perr) =>
                                              err.name === perr.name &&
                                              err.phid === perr.phid
                                      )
                              ),
                          ]
                        : [...hasError];
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
            const data = [snippets, placeholderValues, snippetLinks];
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
                const err = errored.filter((sn) => snip.name === sn.name);
                let snipCode: string =
                    err.length > 0
                        ? err.reduce(
                              (p, n) => p + `\n${n.error}`,
                              snip.errorCode || ""
                          )
                        : snip.code;
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

        if (snippets.length !== Object.keys(snippetLinks).length) {
            window.LSDATA = localStorage.getItem(LS_SNIPPET_DATA);
            setLoadError(
                `Something went wrong with parsing your saved data!
                <br/>Unfortunately data could not be restored!<br/>
                <button onclick="navigator.clipboard.writeText(LSDATA)">Click to copy erroneous data to clipboard to share with devs</button>
            `
            );
            setSnippets([]);
            setSnippetLinks({});
            setPlaceholderValues({});
        }

        // generate outJS
        saveToLS();
        const code = reduceSnippets(erroneous || []);
        setJS(() => code);
    }, [
        snippets,
        placeholderValues,
        setJS,
        erroneous,
        firstLoad,
        snippetLinks,
    ]);

    const resolveSnippetImports = async (
        snippet: Snippet
    ): Promise<
        { snippet: Snippet; linkType: SnippetImportLinkType }[] | FetchError
    > => {
        const { imports } = snippet;
        if (!imports || imports.length <= 0) return [];

        const returns: {
            snippet: Snippet;
            linkType: SnippetImportLinkType;
        }[] = [];
        for (let i = 0; i < imports.length; i++) {
            const snip = await fetchSnippet(imports[i].link);
            if (isFetchError(snip)) return { err: "Could not resolve import!" };

            const snipID = await addSnippet(snip);

            if (!snipID) return { err: "Could not add import!" };
            snip.name = snipID;

            returns.push({ snippet: snip, linkType: imports[i].linkType });
        }
        return returns;
    };

    const addSnippet = async (
        snippetToAdd: Snippet
    ): Promise<string | null> => {
        // resolve imports
        const importSnippets = await resolveSnippetImports(snippetToAdd);
        if (isFetchError(importSnippets)) {
            alert("Snippet error!");
            return null;
        }
        const importLinks: SnippetImportLink[] = [];
        for (let i = 0; i < importSnippets.length; i++) {
            const snippetID = importSnippets[i].snippet.name;
            if (!snippetID) return null;
            importLinks.push({
                name: snippetID,
                linkType: importSnippets[i].linkType,
            });
        }
        if (snippetToAdd.overrideMode === "overwrite") {
            setSnippets((p) => {
                if (p.find((s) => s.name === snippetToAdd.name))
                    return p.map((snip) =>
                        snip.name === snippetToAdd.name ? snippetToAdd : snip
                    );
                else return [...p, snippetToAdd];
            });
        } else {
            const sameSnippets = [
                ...snippets,
                ...importSnippets.map((s) => s.snippet),
            ].filter((snip) =>
                new RegExp(
                    `^${snippetToAdd.name.replace(/-/g, "\\-")}(\\(\\d+\\))?$`
                ).exec(snip.name)
            );
            if (sameSnippets.length > 0) {
                const lastSnip = sameSnippets[sameSnippets.length - 1];
                const snipRx = /\((\d+)\)/.exec(lastSnip.name);
                const snipNum = snipRx ? parseInt(snipRx[1], 10) + 1 : 1;
                snippetToAdd.name = `${snippetToAdd.name}(${snipNum})`;
            }

            setSnippets((p) => {
                return [...p, snippetToAdd];
            });
        }
        setSnippetLinks((prev) => {
            return { ...prev, [snippetToAdd.name]: importLinks };
        });
        return snippetToAdd.name;
    };

    const removeSnippet = (snippetName: string, p = "") => {
        const snippetNamesToRemove = [
            ...Object.entries(snippetLinks)
                .filter((q) => q[0] !== snippetName)
                .filter((f) =>
                    f[1].find(
                        (lnk) =>
                            lnk.name === snippetName &&
                            (lnk.linkType === "dependson" ||
                                lnk.linkType === "both")
                    )
                )
                .map((q) => q[0]), // dependson
            ...(snippetLinks[snippetName]
                ?.filter(
                    (q) => q.linkType === "both" || q.linkType === "isdependent"
                )
                ?.map((q) => q.name) || []), //isdependant
        ];
        snippetNamesToRemove
            .filter((n) => p !== n)
            .forEach((name) => removeSnippet(name, snippetName));
        setSnippets((p) => {
            return p.filter(({ name }) => name !== snippetName);
        });
        setPlaceholderValues((prevv) => {
            if (prevv[snippetName]) delete prevv[snippetName];
            return { ...prevv };
        });
        setSnippetLinks((prev) => {
            if (prev[snippetName]) delete prev[snippetName];
            return { ...prev };
        });
    };

    const addPlaceholder = (snippetname: string, placeholder: Placeholder) => {
        if (placeholder) {
            setSnippets((prev) => {
                return prev.map((snip) => {
                    return snip.name === snippetname
                        ? {
                              ...snip,
                              placeholders: [...snip.placeholders, placeholder],
                          }
                        : snip;
                });
            });
        }
    };

    const removePlaceholder = (snippetname: string, phid: string) => {
        setSnippets((prev) => {
            return prev.map((snip) => {
                if (snip.name !== snippetname) return snip;
                return {
                    ...snip,
                    placeholders: snip.placeholders.filter((ph) => {
                        return ph.id !== phid;
                    }),
                };
            });
        });
        setPlaceholderValues((prev) => {
            delete prev[snippetname][phid];
            return { ...prev };
        });
    };

    const moveSnippet = (index: number, count: number) => {
        const newSnippets = [...snippets];
        const ns = newSnippets.splice(index, 1);
        newSnippets.splice(index + count, 0, ...ns);
        setSnippets(() => newSnippets);
    };

    const moveSnippetUp = (snippetname: string, count: number) => {
        const snip = snippets.find((s) => s.name === snippetname);
        if (!snip) return false;
        const lowestDep = [
            ...snippetLinks[snippetname]
                .filter((l) => l.linkType === "dependson")
                .map((q) => {
                    return {
                        i: snippets.findIndex(({ name }) => name === q.name),
                        name: q.name,
                    };
                }),
        ].reduce((p, { i }) => (p > i ? p : i), -1);
        const snippetindex = snippets.findIndex(
            ({ name }) => name === snippetname
        );
        const withBoth = snippetLinks[snippetname]
            .filter((q) => q.linkType === "both")
            .map((q) => snippets.findIndex(({ name }) => name === q.name))
            .reduce((p, n) => (n > p ? n : p), -1);
        if (snippetindex - count > lowestDep && snippetindex - count > withBoth)
            //move up
            moveSnippet(snippetindex, -count);
    };

    const moveSnippetDown = (snippetname: string, count: number) => {
        const snip = snippets.find((s) => s.name === snippetname);
        if (!snip) return false;

        const highestDep = [
            ...Object.keys(snippetLinks)
                .filter((f) => f !== snippetname)
                .filter((x) =>
                    snippetLinks[x].find(
                        (q) =>
                            q.linkType === "dependson" && q.name === snippetname
                    )
                )
                .map((q) => snippets.findIndex(({ name }) => name === q)),
        ].reduce((p, i) => (i < 0 ? p : p > i ? i : p), MAX_SNIPPET_COUNT);
        const withBoth = snippets
            .filter((sn) =>
                snippetLinks[sn.name].find(
                    (q) => q.linkType === "both" && q.name === snippetname
                )
            )
            .map((q) => snippets.findIndex((z) => z === q))
            .reduce((p, n) => (n < p ? n : p), MAX_SNIPPET_COUNT);
        const snippetindex = snippets.findIndex(
            ({ name }) => name === snippetname
        );
        if (
            snippetindex + count < highestDep &&
            snippetindex + count < withBoth
        )
            //move down
            moveSnippet(snippetindex, count);
    };

    return (
        <>
            <NewSnippetDialog
                addSnippet={addSnippet}
                snippetNumber={snippets.length + 1}
            />
            <WebSnippetDialog addSnippet={addSnippet} />
            <NewPlaceholderDialog
                addPlaceholder={(p: Placeholder) => {
                    addPlaceholder(placeholderAddSnippetName, p);
                    setPlaceholderAddSnippetName("");
                }}
            />
            <div>
                {loadError && (
                    <>
                        <div
                            className="loadError"
                            dangerouslySetInnerHTML={{ __html: loadError }}
                        ></div>
                    </>
                )}
                {snippets.map((snippet, i, a) => {
                    return (
                        <div key={`${snippet.name}`} className="snippet">
                            <div className="snippet_name">
                                {snippet.name}
                                <CustomCheckbox
                                    title="Toggle Edit Mode"
                                    icon={"edit"}
                                    checked={snippet.readonly}
                                    onChange={() => {
                                        document
                                            .querySelector<HTMLButtonElement>(
                                                "#copyCode"
                                            )
                                            ?.focus();
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
                                <IconButton
                                    title="Remove snippet"
                                    icon="trash"
                                    style={{ backgroundColor: "#f36921" }}
                                    onClick={() => removeSnippet(snippet.name)}
                                />
                                {i > 0 && (
                                    <IconButton
                                        title="Move snippet up"
                                        icon="up"
                                        onClick={() =>
                                            moveSnippetUp(snippet.name, 1)
                                        }
                                    />
                                )}
                                {i < a.length - 1 && (
                                    <IconButton
                                        title="Move snippet down"
                                        icon="down"
                                        onClick={() =>
                                            moveSnippetDown(snippet.name, 1)
                                        }
                                    />
                                )}
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
                                        <br />
                                        <div>
                                            Code if errored:
                                            <CustomCheckbox
                                                reversedColors={true}
                                                icon={"edit"}
                                                checked={
                                                    !!editErrorCode.find(
                                                        (ec) =>
                                                            ec === snippet.name
                                                    )
                                                }
                                                onChange={() => {
                                                    setEditErrorCode((prev) => {
                                                        return prev.find(
                                                            (ec) =>
                                                                ec ===
                                                                snippet.name
                                                        )
                                                            ? prev.filter(
                                                                  (ec) =>
                                                                      ec !==
                                                                      snippet.name
                                                              )
                                                            : [
                                                                  ...prev,
                                                                  snippet.name,
                                                              ];
                                                    });
                                                }}
                                            />
                                        </div>
                                        {editErrorCode.find(
                                            (ec) => ec === snippet.name
                                        ) && (
                                            <textarea
                                                rows={5}
                                                cols={100}
                                                value={snippet.errorCode}
                                                onChange={(ev) => {
                                                    setSnippets((p) => {
                                                        return p.map((sn) => {
                                                            return sn.name ===
                                                                snippet.name
                                                                ? {
                                                                      ...sn,
                                                                      errorCode:
                                                                          ev
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : sn;
                                                        });
                                                    });
                                                }}
                                            ></textarea>
                                        )}
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
                                                        <IconButton
                                                            icon="trash"
                                                            style={{
                                                                backgroundColor:
                                                                    "#f36921",
                                                            }}
                                                            title="Remove placeholder"
                                                            onClick={() => {
                                                                removePlaceholder(
                                                                    snippet.name,
                                                                    ph.id
                                                                );
                                                            }}
                                                        />
                                                    </li>
                                                );
                                            })}
                                            <li
                                                key={"addplaceholder"}
                                                id="addplaceholder"
                                            >
                                                <button
                                                    onClick={() => {
                                                        setPlaceholderAddSnippetName(
                                                            () => snippet.name
                                                        );
                                                        document
                                                            .querySelector<HTMLDialogElement>(
                                                                "dialog#newPlaceholderDialog"
                                                            )
                                                            ?.showModal();
                                                    }}
                                                >
                                                    Add placeholder
                                                </button>
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
                    <button
                        className="addSnippet"
                        onClick={() => {
                            document
                                .querySelector<HTMLDialogElement>(
                                    "dialog#newSnippetDialog"
                                )
                                ?.showModal();
                        }}
                    >
                        Add snippet
                    </button>
                    <button
                        className="addSnippet"
                        onClick={() => {
                            document
                                .querySelector<HTMLDialogElement>(
                                    "dialog#webSnippetDialog"
                                )
                                ?.showModal();
                        }}
                    >
                        Load from web
                    </button>
                </div>
            </div>
        </>
    );
};

export default CustomJSSnippets;
