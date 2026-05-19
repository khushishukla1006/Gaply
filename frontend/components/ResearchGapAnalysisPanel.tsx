"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Compass,
  Info,
  Loader2,
  Lightbulb,
  Sparkles,
  Telescope,
} from "lucide-react";
import type { ResearchGapAnalysis } from "@/types";
import { analyzeResearchGapApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResearchGapAnalysisPanelProps {
  title: string;
  abstract: string;
}

export function ResearchGapAnalysisPanel({
  title,
  abstract,
}: ResearchGapAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<ResearchGapAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeResearchGapApi(title, abstract);
      setAnalysis(result);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not generate AI insights. Please try again.";
      setError(message);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="relative overflow-hidden border-primary/25 bg-gradient-to-br from-primary/[0.06] via-card to-card">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
      />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          AI Research Gap Analysis
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!analysis && !isLoading && !error && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              Generate a plain-language summary, surface the paper&rsquo;s
              limitations, and identify unexplored areas and future research
              opportunities.
            </p>
            <Button onClick={handleAnalyze} size="sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate insights
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing the abstract with AI…
            </div>
            <div className="space-y-2">
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-5/6" />
              <div className="skeleton h-3 w-4/6" />
              <div className="skeleton h-3 w-3/5" />
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="space-y-3 rounded-md border border-destructive/40 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertCircle className="h-4 w-4" />
              Couldn&rsquo;t generate AI insights
            </div>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={handleAnalyze}>
              Try again
            </Button>
          </div>
        )}

        {analysis && !isLoading && (
          <div className="animate-fade-in space-y-5">
            {analysis.fallback && <DemoBanner />}

            <Section
              icon={<Lightbulb className="h-4 w-4 text-primary" />}
              title="Simplified summary"
            >
              <p className="text-pretty text-sm leading-relaxed">
                {analysis.simplifiedSummary}
              </p>
            </Section>

            <Section
              icon={<AlertTriangle className="h-4 w-4 text-primary" />}
              title="Limitations"
            >
              <BulletList items={analysis.limitations} />
            </Section>

            <Section
              icon={<Telescope className="h-4 w-4 text-primary" />}
              title="Unexplored areas"
            >
              <BulletList items={analysis.unexploredAreas} />
            </Section>

            <Section
              icon={<Compass className="h-4 w-4 text-primary" />}
              title="Future research opportunities"
            >
              <BulletList items={analysis.futureOpportunities} />
            </Section>

            <div className="pt-1">
              <Button variant="ghost" size="sm" onClick={handleAnalyze}>
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h3>
      <div className="pl-6">{children}</div>
    </div>
  );
}

function DemoBanner() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/[0.06] px-3 py-2 text-xs text-amber-200/90">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        <span className="font-medium text-amber-100">Demo mode</span> — AI
        service unavailable, showing a representative example. Configure
        <code className="mx-1 rounded bg-amber-500/10 px-1 py-0.5 text-[10px]">
          OPENAI_API_KEY
        </code>
        for live insights.
      </span>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-xs italic text-muted-foreground">
        Nothing identified.
      </p>
    );
  }
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="relative pl-4 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/60"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
