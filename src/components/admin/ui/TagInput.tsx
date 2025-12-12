import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    label?: string;
    placeholder?: string;
    className?: string;
}

export function TagInput({
    value = [],
    onChange,
    label,
    placeholder = "Add a tag...",
    className
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    const addTag = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
            setInputValue('');
        }
    };

    const removeTag = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    {label}
                </label>
            )}
            <div className="flex flex-wrap gap-2 p-2 bg-secondary/30 border border-input rounded-lg focus-within:ring-1 focus-within:ring-ring focus-within:border-accent-brand">
                {value.map((tag, index) => (
                    <span
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-accent-brand/20 text-accent-brand text-xs font-medium rounded-full border border-accent-brand/30"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="hover:text-white transition-colors focus:outline-none"
                            title="Remove tag"
                            aria-label="Remove tag"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <div className="flex-1 min-w-[100px] flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={addTag}
                        placeholder={value.length === 0 ? placeholder : ""}
                        className="w-full bg-transparent border-none focus:outline-none text-sm p-0 placeholder:text-muted-foreground"
                    />
                </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">
                Press Enter or comma to add. Backspace to remove.
            </p>
        </div>
    );
}
