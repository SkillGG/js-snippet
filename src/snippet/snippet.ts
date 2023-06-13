import { z } from "zod";

export const zSnippetAddMode = z
    .literal("overwrite")
    .or(z.literal("duplicate"));

export const zPlaceholder = z.object({
    id: z.string().regex(/^[a-z0-9]+$/i),
    needle: z.string(),
    multiline: z.boolean(),
    required: z.object({
        default: z.optional(z.string()),
        patternString: z.string(),
    }),
});

export const zSnippetLink = z.object({
    repoID: z.string(),
    name: z.string(),
    link: z.string(),
});

export const zSnippet = z.object({
    code: z.string(),
    name: z.string().regex(/^[a-z0-9_-]+$/i),
    readonly: z.boolean(),
    placeholders: z.array(zPlaceholder),
    overrideMode: zSnippetAddMode,
    imports: z
        .array(
            z.object({
                overrideMode: zSnippetAddMode.optional(),
                link: z.string(),
            })
        )
        .optional(),
});

export const zSnippetRepo = z.object({
    repoURL: z.string(),
    repoID: z.optional(z.string().regex(/^[a-z0-9_]+$/i)),
    snippetLinks: z.optional(z.array(zSnippetLink)),
});

export type SnippetLink = z.infer<typeof zSnippetLink>;

export type SnippetRepo = z.infer<typeof zSnippetRepo>;

export type SnippetAddMode = z.infer<typeof zSnippetAddMode>;

export type Placeholder = z.infer<typeof zPlaceholder> & {
    required: { pattern?: RegExp };
};

export type Snippet = z.infer<typeof zSnippet>;
