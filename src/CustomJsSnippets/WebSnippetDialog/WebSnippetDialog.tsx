import { FC, useEffect, useRef, useState } from "react";
import { Snippet, SnippetLink, SnippetRepo } from "../../snippet/snippet";
import { z } from "zod";

import { fetchRepoData, fetchSnippet, isFetchError } from "./utils";

interface WebSnippetDialogProps {
    addSnippet(s: Snippet, i?: Snippet[]): void;
}

const WebSnippetDialog: FC<WebSnippetDialogProps> = ({ addSnippet }) => {
    const [repoLinks, setRepoLinks] = useState<string[]>([]);
    const [snippetRepos, setSnippetRepos] = useState<SnippetRepo[]>([]);

    const [webSnippetError, setWebSnippetError] = useState<string | null>(null);

    const snippetRef = useRef<HTMLDialogElement>(null);
    const reposRef = useRef<HTMLDialogElement>(null);

    const closeSnippetModal = () => {
        // if (snippetRef.current) snippetRef.current.value = `snippet${snippetNumber}`;
        snippetRef.current?.close();
    };

    const closeReposModal = () => {
        // if (idRef.current) idRef.current.value = `snippet${snippetNumber}`;
        reposRef.current?.close();
    };

    useEffect(() => {
        const zLocalRepoLinks = z.array(z.string());
        const zLocalRepoLinksData = zLocalRepoLinks.safeParse(
            JSON.parse(localStorage.getItem("repoList") || "[]")
        );
        const repoLinks: string[] = [
            "./master.repo.json",
            ...(zLocalRepoLinksData.success ? zLocalRepoLinksData.data : []),
        ];
        setRepoLinks(repoLinks);
    }, []);

    useEffect(() => {
        const fetchAborters = repoLinks.map(() => new AbortController());
        console.log("fetching data from repos", repoLinks);
        if (repoLinks.length > 0) {
            (async () => {
                const promiseArray: Promise<Required<SnippetRepo> | null>[] =
                    repoLinks.map(async (repolink, i) => {
                        const newData = await fetchRepoData(
                            repolink,
                            fetchAborters[i]
                        );
                        if (isFetchError(newData)) {
                            console.error(
                                "There was error fetching or parsing data!",
                                newData.err
                            );
                            return null;
                        } else return newData;
                    });
                const repoData = await Promise.all(promiseArray);
                setSnippetRepos(() => {
                    const newRepoData = repoData.reduce<
                        Required<SnippetRepo>[]
                    >((p, n) => {
                        return n ? [...p, n] : p;
                    }, []);
                    return newRepoData;
                });
            })();
        }
        return () => {
            // abort
            fetchAborters.forEach((ab) => ab.abort());
            return;
        };
    }, [repoLinks]);

    const clickedAddSnippet = async (snippet: SnippetLink) => {
        // add snippet
        const snippetData = await fetchSnippet(
            snippet.link,
            new AbortController()
        );
        if (isFetchError(snippetData)) setWebSnippetError(snippetData.err);
        else {
            const importedSnips = [];
            if (snippetData.imports) {
                for (let i = 0; i < snippetData.imports.length; i++) {
                    const impSnip = await fetchSnippet(
                        snippetData.imports[i].link
                    );
                    if (isFetchError(impSnip)) {
                        setWebSnippetError(
                            "Failed to download import snippets"
                        );
                        return;
                    }
                    importedSnips.push({
                        ...impSnip,
                        overrideMode:
                            snippetData.imports[i].overrideMode ||
                            impSnip.overrideMode,
                    });
                }
            }
            addSnippet(
                {
                    ...snippetData,
                    readonly: true,
                },
                importedSnips
            );
            closeSnippetModal();
        }
    };

    return (
        <>
            <dialog
                ref={reposRef}
                onClick={(ev) => {
                    if ((ev.target as HTMLElement).tagName === "DIALOG")
                        closeReposModal();
                }}
                id="repoDialog"
            >
                <div className="dialogContent">
                    <ul>
                        {snippetRepos.map((repo) => {
                            return (
                                <li key={`${repo.repoID || repo.repoURL}`}>
                                    {repo.repoID || repo.repoURL}
                                </li>
                            );
                        })}
                        <li
                            onClick={() => {
                                const repoUrl = prompt("RepoUrl", "");
                                if (
                                    repoUrl &&
                                    z.string().url().safeParse(repoUrl).success
                                )
                                    setRepoLinks((links) => {
                                        if (!links.includes(repoUrl))
                                            return [...links, repoUrl];
                                        return links;
                                    });
                            }}
                        >
                            Add repo
                        </li>
                    </ul>
                </div>
            </dialog>
            <dialog
                ref={snippetRef}
                onClick={(ev) => {
                    if ((ev.target as HTMLElement).tagName === "DIALOG")
                        closeSnippetModal();
                }}
                id="webSnippetDialog"
            >
                <div className="dialogContent">
                    <ul>
                        {snippetRepos
                            .reduce<SnippetLink[]>((p, n) => {
                                return [...p, ...(n.snippetLinks || [])];
                            }, [])
                            .map((snippet) => {
                                return (
                                    <li
                                        key={`${snippet.repoID}${snippet.name}`}
                                    >
                                        {snippet.name}
                                        <button
                                            onClick={() =>
                                                clickedAddSnippet(snippet)
                                            }
                                        >
                                            Add
                                        </button>
                                    </li>
                                );
                            })}
                    </ul>
                    {webSnippetError && (
                        <span
                            className="dialogerror"
                            dangerouslySetInnerHTML={{
                                __html: webSnippetError.replace(/\n/g, "<br/>"),
                            }}
                        ></span>
                    )}
                </div>
            </dialog>
        </>
    );
};

export default WebSnippetDialog;
