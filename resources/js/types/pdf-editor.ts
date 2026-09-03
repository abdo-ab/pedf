export type EditorTool =
    | 'select'
    | 'text'
    | 'image'
    | 'signature'
    | 'rectangle'
    | 'circle'
    | 'line'
    | 'highlight'
    | 'underline'
    | 'strikethrough';

export type EditorObject = {
    id: string;
    page: number;
    type: Exclude<EditorTool, 'select'>;
    /** Fractional position relative to page width (0–1). */
    x: number;
    /** Fractional position relative to page height (0–1). */
    y: number;
    /** Fractional width relative to page width (0–1). */
    width: number;
    /** Fractional height relative to page height (0–1). */
    height: number;
    text?: string;
    /** CSS hex color string, e.g. "#17221e". */
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    /** Identifier of the source PDF text this object replaces, when applicable. */
    sourceTextId?: string;
    rotation?: number;
    opacity?: number;
    /** Cover the original PDF text before drawing a replacement text overlay. */
    coverOriginal?: boolean;
    /** Base64-encoded image data URI for image/signature objects. */
    data?: string;
};

export type EditorDocument = {
    route_key: string;
    name: string;
    page_count: number | null;
    file_url: string;
    edits: EditorObject[];
};
