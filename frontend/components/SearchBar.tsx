"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  initialValue?: string;
  size?: "default" | "lg";
}

export function SearchBar({
  initialValue = "",
  size = "default",
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`/search?${params.toString()}`);
  }

  const isLg = size === "lg";

  return (
    <form
      onSubmit={handleSubmit}
      className={`group relative flex w-full items-center gap-2 ${
        isLg
          ? "rounded-xl border border-border/60 bg-background/60 p-1.5 shadow-glow-sm transition-shadow focus-within:shadow-glow"
          : ""
      }`}
    >
      <div className="relative flex-1">
        <Search
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary ${
            isLg ? "h-5 w-5" : "h-4 w-4"
          }`}
        />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            isLg
              ? "Search papers, authors, or research topics…"
              : "Search papers, authors, or topics…"
          }
          className={
            isLg
              ? "h-12 border-none bg-transparent pl-11 pr-4 text-base shadow-none focus-visible:ring-0"
              : "pl-10"
          }
        />
      </div>
      <Button
        type="submit"
        size={isLg ? "lg" : "default"}
        className={isLg ? "h-12 px-7 shadow-glow-sm" : ""}
      >
        Search
      </Button>
    </form>
  );
}
