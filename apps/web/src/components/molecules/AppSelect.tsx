"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
    label: string;
    value: string | boolean;
}

export interface AppSelectProps {
    title?: string;
    options: SelectOption[];
    setValue: (value: string) => void;
    className?: string;
    placeholder?: string;
    titleClassName?: string;
}

const AppSelect = ({
    title,
    options,
    setValue,
    className,
    placeholder,
    titleClassName,
}: AppSelectProps) => {
    return (
        <Select onValueChange={setValue}>
            <div className="flex flex-col min-w-max">
                {!!title && (
                    <h3 className={cn("mb-3 text-nowrap text-zinc-300", titleClassName)}>{title}</h3>
                )}
                <SelectTrigger
                    className={cn(
                        "w-full border-zinc-700 bg-zinc-800 text-white",
                        className
                    )}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                    {options?.map((option) => {
                        return (
                            <SelectItem
                                key={String(option.value)}
                                value={String(option.value)}
                                className="text-white hover:bg-zinc-700 focus:bg-zinc-700 focus:text-white"
                            >
                                {option.label}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </div>
        </Select>
    );
};

export default AppSelect;
