export type Placeholder = {
    id: string;
    needle: string;
    required: { default?: string; pattern: RegExp };
};

export type Snippet = {
    code: string;
    name: string;
    placeholders: Placeholder[];
};
