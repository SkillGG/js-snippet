export type Placeholder = {
    id: string;
    needle: string;
    multiline: boolean;
    required: { default?: string; pattern: RegExp };
};

export type Snippet = {
    code: string;
    name: string;
    placeholders: Placeholder[];
};
