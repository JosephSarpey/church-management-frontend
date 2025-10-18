"use client";

import { Input } from "./ui/Input";
import { Search } from "lucide-react";
import { ComponentProps } from "react";

interface SearchInputProps extends Omit<ComponentProps<"input">, "onChange"> {
  onSearch: (value: string) => void;
}

export function SearchInput({ onSearch, className = "", ...props }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        className="w-full pl-9"
        onChange={(e) => onSearch(e.target.value)}
        {...props}
      />
    </div>
  );
}