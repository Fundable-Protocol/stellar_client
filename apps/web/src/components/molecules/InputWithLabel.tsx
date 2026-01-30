"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface InputWithLabelProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    title?: string;
}

const InputWithLabel = ({
    title,
    className,
    ...props
}: InputWithLabelProps) => {
    return (
        <div className="flex flex-col w-full">
            {title && (
                <h3 className="text-zinc-300 mb-3 text-nowrap">{title}</h3>
            )}

            <Input
                className={cn(
                    "border-zinc-700 bg-zinc-800 rounded h-12 placeholder:text-zinc-500 text-white",
                    className
                )}
                {...props}
            />
        </div>
    );
};

export default InputWithLabel;
