import { z } from "zod";

export const SnippetAddMode = z.literal("overwrite").or(z.literal("duplicate"));

// ["both", "none", "dependson", "isdependent"]
export const SnippetImportLinkType = z.union([
    z.literal("both"),
    z.literal("none"),
    z.literal("dependson"),
    z.literal("isdependent"),
]);

export const SnippetImports = z.record(
    z.string(),
    z.array(
        z.object({
            name: z.string(),
            linkType: SnippetImportLinkType,
        })
    )
);

export const Placeholder = z.object({
    id: z.string().regex(/^[a-z0-9]+$/i),
    needle: z.string(),
    multiline: z.boolean(),
    required: z.object({
        default: z.optional(z.string()),
        patternString: z.string(),
    }),
});

export const SnippetLink = z.object({
    repoID: z.string(),
    name: z.string(),
    link: z.string(),
    category: z.string(),
});

export const Snippet = z.object({
    code: z.string(),
    name: z.string().regex(/^[a-z0-9_-]+$/i),
    readonly: z.boolean(),
    placeholders: z.array(Placeholder),
    overrideMode: SnippetAddMode,
    imports: z
        .array(
            z.object({
                overrideMode: SnippetAddMode.optional(),
                link: z.string(),
                linkType: SnippetImportLinkType,
            })
        )
        .optional(),
});

export const SnippetRepo = z.object({
    repoURL: z.string(),
    repoID: z.optional(z.string().regex(/^[a-z0-9_]+$/i)),
    snippetLinks: z.optional(z.array(SnippetLink)),
});

export const SnippetPlaceholderValue = z.record(
    z.string(),
    z.record(z.string(), z.string())
);

export type SnippetPlaceholderValue = z.infer<typeof SnippetPlaceholderValue>;

export type SnippetLink = z.infer<typeof SnippetLink>;

export type SnippetRepo = z.infer<typeof SnippetRepo>;

export type SnippetAddMode = z.infer<typeof SnippetAddMode>;

export type SnippetImports = z.infer<typeof SnippetImports>;

export type SnippetImportLinkType = z.infer<typeof SnippetImportLinkType>;

export type Placeholder = z.infer<typeof Placeholder>;

export type Snippet = z.infer<typeof Snippet>;

export type RepoStatus = {
    status: "up" | "down";
    snippetCount: number;
    errorMessage: string;
};
