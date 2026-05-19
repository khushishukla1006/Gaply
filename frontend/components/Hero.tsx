import { Sparkles } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";

const SAMPLES = ["transformers", "protein folding", "diffusion models", "RAG"];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="pointer-events-none absolute inset-0 -z-10 mesh-bg" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container flex flex-col items-center gap-7 py-24 text-center md:py-32">
        <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-primary" />
          AI-powered research workspace
        </div>

        <h1 className="animate-slide-up max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
          Discover, understand, and{" "}
          <span className="gradient-text animate-gradient-pan">
            converse with research
          </span>
        </h1>

        <p
          className="animate-slide-up max-w-2xl text-pretty text-base text-muted-foreground md:text-lg"
          style={{ animationDelay: "60ms" }}
        >
          Search millions of papers, surface research gaps, and chat with any
          paper to deepen your understanding — grounded in the source.
        </p>

        <div
          className="animate-slide-up mt-2 w-full max-w-2xl"
          style={{ animationDelay: "120ms" }}
        >
          <SearchBar size="lg" />
        </div>

        <div
          className="animate-fade-in mt-1 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground"
          style={{ animationDelay: "200ms" }}
        >
          <span className="text-muted-foreground/70">Try:</span>
          {SAMPLES.map((q) => (
            <a
              key={q}
              href={`/search?q=${encodeURIComponent(q)}`}
              className="rounded-full border border-border/70 bg-background/40 px-3 py-1 transition-all hover:border-primary/40 hover:bg-accent hover:text-foreground"
            >
              {q}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
