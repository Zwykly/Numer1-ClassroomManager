import { Search, X } from "lucide-react";
import { clsx as cn } from "clsx";

export type EntityPickerItem = {
    id: string;
    label: string;
};

type EntityPickerProps = {
    title: string;
    selected: EntityPickerItem[];
    results: EntityPickerItem[];
    search: string;
    onSearchChange: (value: string) => void;
    onAdd: (item: EntityPickerItem) => void;
    onRemove: (id: string) => void;
    isSearching?: boolean;
    placeholder?: string;
    emptyText?: string;
    className?: string;
};

export function EntityPicker({
    title,
    selected,
    results,
    search,
    onSearchChange,
    onAdd,
    onRemove,
    isSearching,
    placeholder,
    emptyText,
    className,
}: EntityPickerProps) {
    return (
        <div className={cn("flex w-full flex-col rounded-xl border border-light-grey p-3", className)}>
            <span className="px-1 text-xs font-bold uppercase tracking-wide text-darker-grey">
                {title} ({selected.length})
            </span>

            <div className="mt-2 flex max-h-36 flex-col gap-1.5 overflow-y-auto">
                {selected.length === 0 && (
                    <span className="py-4 text-center text-sm text-darker-grey">None selected yet.</span>
                )}
                {selected.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-lg bg-light-grey/60 px-2 py-1.5"
                    >
                        <span className="flex-1 truncate text-sm text-black">{item.label}</span>
                        <button
                            type="button"
                            title="Remove"
                            onClick={() => onRemove(item.id)}
                            className="text-darker-grey transition hover:text-orange"
                        >
                            <X size={15} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-grey bg-white px-3 py-2 focus-within:border-orange">
                <Search size={16} className="text-darker-grey" />
                <input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-black placeholder:text-darker-grey focus:outline-none"
                />
            </div>

            <div className="mt-2 flex max-h-40 flex-col gap-1.5 overflow-y-auto">
                {isSearching && (
                    <span className="py-3 text-center text-sm text-darker-grey">Searching...</span>
                )}
                {!isSearching && results.length === 0 && (
                    <span className="py-3 text-center text-sm text-darker-grey">
                        {emptyText ?? "No results."}
                    </span>
                )}
                {!isSearching &&
                    results.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onAdd(item)}
                            className="flex items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm text-black/80 transition hover:bg-orange/10 hover:text-orange"
                        >
                            <span className="truncate">{item.label}</span>
                        </button>
                    ))}
            </div>
        </div>
    );
}
