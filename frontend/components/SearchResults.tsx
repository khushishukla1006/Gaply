"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  ExternalLink,
  Loader2,
  SearchX,
  Sparkles,
  Users,
} from "lucide-react";
import type { PaperSearchResult } from "@/types";
import { searchPapersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const [papers, setPapers] = useState<PaperSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!query) {
      setPapers([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const results = await searchPapersApi(query, controller.signal);
        setPapers(results);
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong while searching.";
        setError(message);
        setPapers([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [query, reloadKey]);

  if (!query) {
    return <EmptyState />;
  }

  if (isLoading) {
    return <SearchSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive/40 bg-destructive/5 animate-fade-in">
        <CardContent className="space-y-3 py-12 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <p className="font-medium">Couldn’t load search results</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (papers.length === 0) {
    return (
      <Card className="animate-fade-in border-border/70 bg-card/60">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <SearchX className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="font-medium">No papers match &ldquo;{query}&rdquo;</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try different keywords, broader terms, or an author&rsquo;s name.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {papers.length} {papers.length === 1 ? "paper" : "papers"} found
      </p>

      {papers.map((paper, i) => (
        <Card
          key={paper.id ?? `${paper.url ?? paper.title}-${i}`}
          className="hover-card animate-fade-in border-border/70 bg-card/60"
          style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
        >
          <CardContent className="space-y-3 p-6">
            <h2 className="text-lg font-semibold leading-snug md:text-xl">
              {paper.id ? (
                <Link
                  href={`/paper/${paper.id}`}
                  className="transition-colors hover:text-primary"
                >
                  {paper.title}
                </Link>
              ) : (
                paper.title
              )}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {paper.authors.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {paper.authors.slice(0, 4).join(", ")}
                  {paper.authors.length > 4 && ` +${paper.authors.length - 4}`}
                </span>
              )}
              {paper.year !== null && paper.year !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {paper.year}
                </span>
              )}
              {paper.journal && (
                <span className="truncate text-muted-foreground/80">
                  · {paper.journal}
                </span>
              )}
            </div>

            {paper.abstract ? (
              <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {paper.abstract}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground/70">
                No abstract available.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
              {paper.id && (
                <Link
                  href={`/paper/${paper.id}`}
                  className="inline-flex items-center gap-1 font-medium text-primary transition-transform hover:translate-x-0.5"
                >
                  View details
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
              {paper.url && (
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
                >
                  Source
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-4 w-32" />
      {[0, 1, 2, 3].map((i) => (
        <Card
          key={i}
          className="animate-fade-in border-border/70 bg-card/60"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <CardContent className="space-y-3 p-6">
            <div className="skeleton h-5 w-3/4" />
            <div className="flex gap-3">
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-3 w-16" />
            </div>
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-5/6" />
            <div className="skeleton h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
      <p className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Searching arXiv…
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="animate-fade-in border-dashed border-border/60 bg-card/40">
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <p className="font-medium">Start exploring</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Type a topic, author, or paper title above to search across millions
          of research papers.
        </p>
      </CardContent>
    </Card>
  );
}
