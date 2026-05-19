"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Check,
  Copy,
  Loader2,
  Quote,
} from "lucide-react";
import type { Citations } from "@/types";
import {
  ApiError,
  generateCitationsApi,
  type CitationGenerateInput,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type CitationStyleKey = keyof Citations;

interface StyleMeta {
  key: CitationStyleKey;
  label: string;
  fullName: string;
  description: string;
}

const STYLES: StyleMeta[] = [
  {
    key: "apa",
    label: "APA",
    fullName: "American Psychological Association",
    description:
      "Standard in psychology, education, and the social sciences. Uses author–date in-text citations and a “References” list.",
  },
  {
    key: "mla",
    label: "MLA",
    fullName: "Modern Language Association",
    description:
      "Standard in literature, languages, and the humanities. Uses author–page in-text citations and a “Works Cited” list.",
  },
  {
    key: "chicago",
    label: "Chicago",
    fullName: "Chicago Manual of Style",
    description:
      "Common in history, the arts, and other humanities. Uses footnotes or endnotes alongside a full bibliography.",
  },
];

interface CitationsPanelProps {
  title: string;
  authors: string[];
  year: number | null | undefined;
  journal?: string | null;
  doi?: string | null;
}

export function CitationsPanel({
  title,
  authors,
  year,
  journal,
  doi,
}: CitationsPanelProps) {
  const [citations, setCitations] = useState<Citations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const canGenerate = useMemo(() => {
    return (
      title.trim().length > 0 &&
      authors.length > 0 &&
      year !== null &&
      year !== undefined
    );
  }, [title, authors, year]);

  useEffect(() => {
    if (!canGenerate) {
      setCitations(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const input: CitationGenerateInput = {
          title,
          authors,
          year: year as number,
          journal: journal ?? undefined,
          doi: doi ?? undefined,
        };
        const result = await generateCitationsApi(input, controller.signal);
        setCitations(result);
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not generate citations.";
        setError(message);
        setCitations(null);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [title, authors, year, journal, doi, canGenerate, reloadKey]);

  return (
    <Card className="border-border/70 bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
            <Quote className="h-3.5 w-3.5" />
          </span>
          Citation
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!canGenerate && (
          <p className="text-sm text-muted-foreground">
            Citations require a title, at least one author, and a year. Some
            of these are missing for this paper.
          </p>
        )}

        {canGenerate && isLoading && <CitationsSkeleton />}

        {canGenerate && error && !isLoading && (
          <CitationsError
            message={error}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        )}

        {canGenerate && citations && !isLoading && !error && (
          <div className="animate-fade-in space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pick a style and copy the formatted reference. Each one has its
              own conventions for author order, dates, and punctuation —
              choose the one your field expects.
            </p>

            <Tabs defaultValue="apa" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {STYLES.map((s) => (
                  <TabsTrigger
                    key={s.key}
                    value={s.key}
                    className="data-[state=active]:bg-background data-[state=active]:shadow-glow-sm"
                  >
                    {s.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {STYLES.map((s) => (
                <TabsContent key={s.key} value={s.key} className="space-y-3">
                  <StyleExplainer
                    fullName={s.fullName}
                    description={s.description}
                  />
                  <CitationBlock text={citations[s.key]} label={s.label} />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StyleExplainer({
  fullName,
  description,
}: {
  fullName: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
      <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
      <p>
        <span className="font-medium text-foreground">{fullName}</span>{" "}
        <span className="text-muted-foreground/80">· </span>
        {description}
      </p>
    </div>
  );
}

function CitationBlock({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  }

  return (
    <div className="relative rounded-md border bg-muted/40 p-4">
      <pre className="whitespace-pre-wrap break-words pr-20 font-mono text-xs leading-relaxed">
        {text}
      </pre>
      <Button
        size="sm"
        variant="outline"
        className="absolute right-2 top-2 h-7 gap-1.5 px-2 text-xs"
        onClick={handleCopy}
        aria-label={`Copy ${label} citation`}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" /> Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" /> Copy
          </>
        )}
      </Button>
    </div>
  );
}

function CitationsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-9 w-full" />
      <div className="space-y-2 rounded-md border border-border/60 bg-muted/40 p-4">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-4/5" />
        <div className="skeleton h-3 w-2/3" />
      </div>
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Generating citations…
      </p>
    </div>
  );
}

function CitationsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      <div className="flex-1">
        <p className="font-medium text-destructive">
          Couldn&rsquo;t generate citations
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{message}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 h-7"
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    </div>
  );
}
