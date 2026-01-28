"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value"> & {
    value: string;
    maxHeight?: number; // px
};

export function AutoResizeTextarea({
    value,
    className,
    maxHeight = 560,
    ...props
}: Props) {
    const ref = React.useRef<HTMLTextAreaElement | null>(null);

    const resize = React.useCallback(() => {
        const el = ref.current;
        if (!el) return;

        el.style.height = "0px";
        const next = Math.min(el.scrollHeight, maxHeight);
        el.style.height = `${next}px`;

        // only allow internal scroll if we hit max height
        el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [maxHeight]);

    React.useLayoutEffect(() => {
        resize();
    }, [value, resize]);

    return (
        <Textarea
            ref={ref}
            value={value}
            className={cn(
                "resize-none overflow-hidden",
                "bg-white/[0.03] border-white/10 text-white/90 placeholder:text-white/40",
                "leading-relaxed",
                className
            )}
            {...props}
        />
    );
}
