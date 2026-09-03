import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type Point = { x: number; y: number };

export function SignaturePad({
    onConfirm,
    onCancel,
}: {
    onConfirm: (dataUrl: string) => void;
    onCancel: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawing, setDrawing] = useState(false);
    const [hasStrokes, setHasStrokes] = useState(false);
    const lastPoint = useRef<Point | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#17221e';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, []);

    function getPoint(event: React.MouseEvent | React.TouchEvent): Point {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if ('touches' in event) {
            const touch = event.touches[0];

            return {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY,
            };
        }

        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY,
        };
    }

    function startDraw(event: React.MouseEvent | React.TouchEvent) {
        event.preventDefault();
        setDrawing(true);
        lastPoint.current = getPoint(event);
    }

    function draw(event: React.MouseEvent | React.TouchEvent) {
        event.preventDefault();

        if (!drawing) {
            return;
        }

        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        const current = getPoint(event);
        const prev = lastPoint.current ?? current;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
        lastPoint.current = current;
        setHasStrokes(true);
    }

    function endDraw() {
        setDrawing(false);
        lastPoint.current = null;
    }

    function clear() {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasStrokes(false);
    }

    function confirm() {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        onConfirm(canvas.toDataURL('image/png'));
    }

    return (
        <div className="flex flex-col gap-3 p-4">
            <p className="text-sm font-medium text-white">
                Draw your signature
            </p>
            <canvas
                ref={canvasRef}
                width={400}
                height={160}
                className="w-full cursor-crosshair touch-none rounded border border-white/20 bg-white"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
            />
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    onClick={clear}
                >
                    Clear
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    size="sm"
                    className="ml-auto bg-lime-300 text-slate-950 hover:bg-lime-200"
                    disabled={!hasStrokes}
                    onClick={confirm}
                >
                    Use Signature
                </Button>
            </div>
        </div>
    );
}
