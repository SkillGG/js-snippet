import { z } from "zod";
import { SnippetRepo, Snippet, SnippetLink } from "../../snippet/snippet";

type FetchError = { err: string };

export const isFetchError = (o: object | FetchError): o is FetchError =>
    (o as FetchError).err ? true : false;

export const fetchRepoData = async (
    url: string,
    abort: AbortController
): Promise<Required<SnippetRepo> | FetchError> => {
    const repoSchema = z.object({
        repoID: z.string(),
        snippetLinks: z.array(SnippetLink),
    });
    const responseSchema = z.union([repoSchema, z.object({ err: z.string() })]);
    const response = await fetch(url, { signal: abort.signal })
        .then((r) => {
            if (!r.ok) throw new Error("Unable to fetch!");
            return r.json();
        })
        .catch((r) => {
            console.error(r);
            return { err: "Fetching error" + (r as Error).message };
        });
    const responseData = responseSchema.safeParse(response);
    if (!responseData.success) {
        console.error("Wrong response type!");
        return { err: responseData.error.message };
    }
    if (isFetchError(responseData.data)) {
        return responseData.data;
    }
    return { repoURL: url, ...responseData.data };
};

export const fetchSnippet = async (
    url: string,
    i?: RequestInit
): Promise<Snippet | FetchError> => {
    const responseSchema = Snippet.omit({ readonly: true }).or(
        z.object({ err: z.string() })
    );
    const response = await fetch(url, i)
        .then((r) => {
            if (r.ok) return r.json();
            else {
                console.error("Fetch failed");
                throw new Error("Fetch failed!");
            }
        })
        .catch((err) => {
            return { err: "Fetch failed! " + (err as Error).message };
        });
    const responseData = responseSchema.safeParse(response, {
        errorMap: (i) => {
            switch (i) {
                default:
                    return {
                        message: `The snippet is incorrectly written!
                        Please write an issue on github!`,
                    };
            }
        },
    });
    if (!responseData.success)
        return {
            err: responseData.error.errors.reduce(
                (p, n) => p + n.message + "<br/>",
                ""
            ),
        };
    if (isFetchError(responseData.data)) return responseData.data;
    return { ...responseData.data, readonly: true };
};
