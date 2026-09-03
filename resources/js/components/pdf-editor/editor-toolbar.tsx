import {
    ArrowLeft,
    Circle,
    Download,
    Highlighter,
    ImagePlus,
    LineChart,
    LoaderCircle,
    MousePointer2,
    Redo2,
    RectangleHorizontal,
    Save,
    Signature,
    Strikethrough,
    Type,
    Undo2,
    Underline,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EditorTool } from '@/types/pdf-editor';

const tools: { id: EditorTool; label: string; icon: typeof Type }[] = [
    { id: 'select', label: 'Select', icon: MousePointer2 },
    { id: 'text', label: 'Add text', icon: Type },
    { id: 'image', label: 'Add image', icon: ImagePlus },
    { id: 'signature', label: 'Signature', icon: Signature },
    { id: 'rectangle', label: 'Rectangle', icon: RectangleHorizontal },
    { id: 'circle', label: 'Circle', icon: Circle },
    { id: 'line', label: 'Line', icon: LineChart },
    { id: 'highlight', label: 'Highlight', icon: Highlighter },
    { id: 'underline', label: 'Underline', icon: Underline },
    { id: 'strikethrough', label: 'Strike-through', icon: Strikethrough },
];

export function EditorToolbar({
    tool,
    onToolChange,
    onUndo,
    onRedo,
    onZoom,
    onSave,
    onExport,
    onBackToDashboard,
    canUndo,
    canRedo,
    saving = false,
    exporting = false,
}: {
    tool: EditorTool;
    onToolChange: (tool: EditorTool) => void;
    onUndo: () => void;
    onRedo: () => void;
    onZoom: (direction: 'in' | 'out') => void;
    onSave: () => void;
    onExport: () => void;
    onBackToDashboard?: () => void;
    canUndo: boolean;
    canRedo: boolean;
    saving?: boolean;
    exporting?: boolean;
}) {
    return (
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 bg-slate-950 px-2 py-2 text-white sm:px-3">
            {/* Back to Dashboard */}
            {onBackToDashboard && (
                <div className="flex shrink-0 items-center gap-1 border-r border-white/10 pr-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/10"
                        onClick={onBackToDashboard}
                        title="Back to Dashboard"
                        aria-label="Back to Dashboard"
                    >
                        <ArrowLeft className="size-4 sm:mr-1" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                </div>
            )}

            {/* Tool buttons */}
            <div className="flex shrink-0 items-center gap-1 border-r border-white/10 pr-2">
                {tools.map(({ id, label, icon: Icon }) => (
                    <Button
                        key={id}
                        type="button"
                        variant={tool === id ? 'secondary' : 'ghost'}
                        size="icon"
                        className="size-9 text-white hover:bg-white/10 hover:text-white sm:size-8"
                        onClick={() => onToolChange(id)}
                        title={label}
                        aria-label={label}
                    >
                        <Icon className="size-4" />
                    </Button>
                ))}
            </div>

            {/* Undo / Redo */}
            <div className="flex shrink-0 items-center gap-1 border-r border-white/10 pr-2 pl-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 text-white hover:bg-white/10 sm:size-8"
                    disabled={!canUndo}
                    onClick={onUndo}
                    title="Undo (Ctrl+Z)"
                    aria-label="Undo"
                >
                    <Undo2 className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 text-white hover:bg-white/10 sm:size-8"
                    disabled={!canRedo}
                    onClick={onRedo}
                    title="Redo (Ctrl+Y)"
                    aria-label="Redo"
                >
                    <Redo2 className="size-4" />
                </Button>
            </div>

            {/* Zoom */}
            <div className="flex shrink-0 items-center gap-1 pl-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 text-white hover:bg-white/10 sm:size-8"
                    onClick={() => onZoom('out')}
                    title="Zoom out"
                    aria-label="Zoom out"
                >
                    <ZoomOut className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 text-white hover:bg-white/10 sm:size-8"
                    onClick={() => onZoom('in')}
                    title="Zoom in"
                    aria-label="Zoom in"
                >
                    <ZoomIn className="size-4" />
                </Button>
            </div>

            {/* Save / Export */}
            <div className="ml-auto flex shrink-0 items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    disabled={saving}
                    onClick={onSave}
                    aria-label="Save changes"
                >
                    {saving ? (
                        <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    className="bg-lime-300 text-slate-950 hover:bg-lime-200"
                    disabled={exporting}
                    onClick={onExport}
                    aria-label="Export PDF"
                >
                    {exporting ? (
                        <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                        <Download className="size-4" />
                    )}
                    {exporting ? 'Exporting…' : 'Export'}
                </Button>
            </div>
        </div>
    );
}
