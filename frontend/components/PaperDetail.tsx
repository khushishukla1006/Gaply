"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileText,
  Loader2,
  Users,
} from "lucide-react";
import type { PaperSearchResult } from "@/types";
import { ApiError, getPaperByIdApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ResearchGapAnalysisPanel } from "@/components/ResearchGapAnalysisPanel";
import { PaperChat } from "@/components/PaperChat";
import { CitationsPanel } from "@/components/CitationsPanel";

interface PaperDetailProps {
  id: string;
}

export function PaperDetail({ id }: PaperDetailProps) {
  const [paper, setPaper] = useState<PaperSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const result = await getPaperByIdApi(id, controller.signal);
        setPaper(result);
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          const message =
            err instanceof Error
              ? err.message
              : "Could not load this paper.";
          setError(message);
        }
        setPaper(null);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [id, reloadKey]);

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <BackLink />

      {isLoading && <PaperDetailSkeleton />}

      {!isLoading && notFound && (
        <NotFoundCard id={id} />
      )}

      {!isLoading && error && !notFound && (
        <ErrorCard
          message={error}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      )}

      {!isLoading && paper && <PaperContent paper={paper} />}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/search"
      className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to search
    </Link>
  );
}

function PaperContent({ paper }: { paper: PaperSearchResult }) {
  return (
    <>
      <div className="animate-slide-up">
        <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
          {paper.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {paper.authors.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {paper.authors.join(", ")}
            </span>
          )}
          {paper.year !== null && paper.year !== undefined && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {paper.year}
            </span>
          )}
          {paper.journal && (
            <span className="truncate text-muted-foreground/80">
              · {paper.journal}
            </span>
          )}
        </div>

        {paper.url && (
          <div className="mt-6">
            <Button asChild variant="outline" size="sm">
              <a href={paper.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View on arXiv
              </a>
            </Button>
          </div>
        )}
      </div>

      <Separator className="my-8" />

      <Card
        className="animate-fade-in border-border/70 bg-card/60"
        style={{ animationDelay: "60ms" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Abstract
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paper.abstract ? (
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {paper.abstract}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground/70">
              No abstract available for this paper.
            </p>
          )}
        </CardContent>
      </Card>

      {paper.abstract && (
        <>
          <div className="mt-6">
            <ResearchGapAnalysisPanel
              title={paper.title}
              abstract={paper.abstract}
            />
          </div>
          <div className="mt-6">
            <PaperChat title={paper.title} abstract={paper.abstract} />
          </div>
        </>
      )}

      <div className="mt-6">
        <CitationsPanel
          title={paper.title}
          authors={paper.authors}
          year={paper.year}
          journal={paper.journal}
          doi={paper.doi}
        />
      </div>
    </>
  );
}

function PaperDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="skeleton h-9 w-3/4" />
        <div className="skeleton h-9 w-1/2" />
        <div className="mt-4 flex gap-3">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-4 w-20" />
        </div>
      </div>

      <Separator />

      <Card className="border-border/70 bg-card/60">
        <CardContent className="space-y-2 p-6">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-5/6" />
          <div className="skeleton h-3 w-4/6" />
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading paper details…
      </p>
    </div>
  );
}

function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="space-y-3 py-12 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
        <p className="font-medium">Couldn’t load this paper</p>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

function NotFoundCard({ id }: { id: string }) {
  return (
    <Card>
      <CardContent className="space-y-3 py-12 text-center">
        <p className="font-medium">Paper not found</p>
        <p className="text-sm text-muted-foreground">
          We couldn&rsquo;t find a paper with id{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{id}</code>.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/search">Back to search</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
