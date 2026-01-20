"use client"

import { useState, KeyboardEvent } from "react"
import { X, Tag as TagIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface TransactionTagsInputProps {
    value: string[]
    onChange: (tags: string[]) => void
    placeholder?: string
}

export function TransactionTagsInput({
    value = [],
    onChange,
    placeholder = "Nhập tag và nhấn Enter...",
}: TransactionTagsInputProps) {
    const [inputValue, setInputValue] = useState("")

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addTag()
        } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
            // Remove last tag when backspace on empty input
            removeTag(value.length - 1)
        }
    }

    const addTag = () => {
        const trimmed = inputValue.trim()
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed])
            setInputValue("")
        }
    }

    const removeTag = (index: number) => {
        onChange(value.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-2">
            <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
            />

            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((tag, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                        >
                            <TagIcon className="h-3 w-3" />
                            <span className="text-xs">{tag}</span>
                            <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                Nhấn Enter để thêm tag
            </p>
        </div>
    )
}
