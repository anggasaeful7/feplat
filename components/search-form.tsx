"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { SearchIcon } from "@/app/_components/icons";

export interface SearchFormProps {
  placeholder?: string;
  parameterName?: string;
  className?: string;
}

export function SearchForm({
  placeholder = "Search...",
  parameterName = "search",
  className = "relative max-w-xs",
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const initial = searchParams.get(parameterName) ?? "";
  const [value, setValue] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (initial !== prevInitial) {
    setValue(initial);
    setPrevInitial(initial);
  }

  function commit(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set(parameterName, next);
    else params.delete(parameterName);
    params.delete("offset"); // Reset pagination offset on new search query
    router.replace(`${pathname}${params.size ? `?${params.toString()}` : ""}`);
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setValue(next);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => commit(next.trim()), 300);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (debounce.current) clearTimeout(debounce.current);
    commit(value.trim());
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <span className="pointer-events-none absolute inset-y-0 left-0 grid w-9 place-items-center text-muted">
        <SearchIcon className="h-4 w-4" />
      </span>
      <input
        type="search"
        name={parameterName}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-10 w-72 max-w-full rounded-full border border-border bg-surface pl-9 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
      />
    </form>
  );
}
