import { FC, useEffect, useRef, useState } from "react";
import {
    RepoStatus,
    Snippet,
    SnippetLink,
    SnippetRepo,
} from "../../snippet/snippet";
import { z } from "zod";

import { fetchRepoData, fetchSnippet, isFetchError } from "./utils";

interface WebSnippetDialogProps {
    addSnippet(s: Snippet): void;
}

const URI_REGEX =
    /^(?:(?:(?:[a-z0-9]*?:\/{2,})?(?:[a-z0-9]+?\.[a-z0-9]+?)\/(.*?)?)|(?:(?:\.|\/){1,2}(?:.*?\/)+(.*?)))\.repo\.json$/i;

const WebSnippetDialog: FC<WebSnippetDialogProps> = ({ addSnippet }) => {
    const [repoLinks, setRepoLinks] = useState<string[]>([]);
    const [snippetRepos, setSnippetRepos] = useState<SnippetRepo[]>([]);

    const [webSnippetError, setWebSnippetError] = useState<string | null>(null);
    const [repoError, setRepoError] = useState<string | null>(null);
    const [repoStatuses, setRepoStatuses] = useState<
        Record<string, RepoStatus>
    >({});

    const snippetRef = useRef<HTMLDialogElement>(null);
    const reposRef = useRef<HTMLDialogElement>(null);

    const closeSnippetModal = () => snippetRef.current?.close();

    const closeReposModal = () => {
        setRepoError(null);
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
        if (repoLinks.length > 0) {
            (async () => {
                const promiseArray: Promise<Required<SnippetRepo> | null>[] =
                    repoLinks.map(async (repolink, i) => {
                        const newData = await fetchRepoData(
                            repolink,
                            fetchAborters[i]
                        );
                        if (isFetchError(newData)) {
                            setRepoStatuses((prev) => {
                                return {
                                    ...prev,
                                    [repolink]: {
                                        status: "down",
                                        snippetCount: 0,
                                        errorMessage: newData.err,
                                    },
                                };
                            });
                            console.error(
                                "There was error fetching or parsing data!",
                                newData.err
                            );
                            return null;
                        } else {
                            setRepoStatuses((prev) => {
                                return {
                                    ...prev,
                                    [repolink]: {
                                        status: "up",
                                        snippetCount:
                                            newData.snippetLinks.length,
                                        errorMessage: "",
                                    },
                                };
                            });
                            return newData;
                        }
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
            addSnippet({
                ...snippetData,
                readonly: true,
            });
            closeSnippetModal();
        }
    };

    const removeRepo = (link: string) => {
        setSnippetRepos((prev) => prev.filter((sr) => sr.repoURL !== link));
        setRepoLinks((prev) => prev.filter((lnk) => lnk !== link));
        setRepoStatuses((prev) => {
            delete prev[link];
            return { ...prev };
        });
    };

    type SnippetCategory = {
        name: string;
        links: SnippetLink[];
    };
    const webSnippetCategories = snippetRepos.reduce<SnippetCategory[]>(
        (p, n) => {
            const categories: SnippetCategory[] = [...p];
            n.snippetLinks?.forEach((sl) => {
                const cat = categories.find((c) => c.name === sl.category);
                if (cat) cat.links.push(sl);
                else categories.push({ name: sl.category, links: [sl] });
            });
            return categories;
        },
        []
    );

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
                        {repoLinks.map((repoURL) => {
                            const existingRepo = snippetRepos.find(
                                (repo) => repo.repoURL === repoURL
                            );
                            return (
                                <li key={`${repoURL}`}>
                                    <div className="repoStatus">
                                        <b title={repoURL}>
                                            {existingRepo?.repoID ||
                                                repoURL.replace(
                                                    URI_REGEX,
                                                    "$1$2"
                                                )}

                                            <a
                                                className="no-underline"
                                                href={repoURL}
                                                target="_blank"
                                            >
                                                🔗
                                            </a>
                                        </b>{" "}
                                        <span
                                            className="repoIsOnline"
                                            data-status={
                                                repoStatuses[repoURL]?.status ||
                                                "down"
                                            }
                                        >
                                            {repoStatuses[repoURL]?.status ===
                                            "up"
                                                ? "UP"
                                                : "DOWN"}{" "}
                                            {repoStatuses[repoURL]?.status ===
                                            "up" ? (
                                                <>
                                                    (
                                                    {repoStatuses[repoURL]
                                                        ?.snippetCount || "0"}
                                                    )
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setRepoError(
                                                                repoStatuses[
                                                                    repoURL
                                                                ]
                                                                    ?.errorMessage ||
                                                                    "The repo is down!"
                                                            );
                                                        }}
                                                        className="emptyButton"
                                                    >
                                                        ℹ️
                                                    </button>
                                                </>
                                            )}
                                        </span>{" "}
                                        {existingRepo?.repoID !== "master" && (
                                            <button
                                                onClick={() =>
                                                    removeRepo(repoURL)
                                                }
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                        <li>
                            <button
                                onClick={() => {
                                    try {
                                        const repoUrl = prompt("Repo Url", "");
                                        if (!repoUrl) return;
                                        if (
                                            (z.string().url().safeParse(repoUrl)
                                                .success &&
                                                /\.repo\.json$/.exec(
                                                    repoUrl
                                                )) ||
                                            URI_REGEX.exec(repoUrl)
                                        ) {
                                            setRepoLinks((links) => {
                                                if (!links.includes(repoUrl))
                                                    return [...links, repoUrl];
                                                return links;
                                            });
                                        } else
                                            throw "Invalid repo URI! Make sure it ends with <name>.repo.json!";
                                    } catch (err) {
                                        if (typeof err === "string")
                                            setRepoError(() => err as string);
                                        else if (typeof err === "object")
                                            setRepoError(
                                                () => (err as Error).message
                                            );
                                        else
                                            setRepoError(() =>
                                                JSON.stringify(err)
                                            );
                                    }
                                }}
                            >
                                Add repo
                            </button>
                        </li>
                    </ul>
                    {repoError && (
                        <span
                            className="dialogerror"
                            dangerouslySetInnerHTML={{
                                __html: repoError.replace(/\n/g, "<br/>"),
                            }}
                        ></span>
                    )}
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
                    <button
                        onClick={() => {
                            document
                                .querySelector<HTMLDialogElement>(
                                    "dialog#repoDialog"
                                )
                                ?.showModal();
                        }}
                    >
                        Repo list
                    </button>
                    <ul className="webSnippetList">
                        {webSnippetCategories.map((cat) => {
                            return (
                                <li key={cat.name}>
                                    <b>{cat.name}</b>
                                    <ul className="webSnippetCategory">
                                        {cat.links.map((link) => {
                                            return (
                                                <li
                                                    key={`${link.repoID}${link.name}`}
                                                >
                                                    <div>{link.name}</div>
                                                    <button
                                                        onClick={() =>
                                                            clickedAddSnippet(
                                                                link
                                                            )
                                                        }
                                                    >
                                                        Add
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
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
