import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { FeatureCards } from "@/components/FeatureCards";
import { PaperCard } from "@/components/PaperCard";
import { Button } from "@/components/ui/button";
import { getAllPapers } from "@/services/papers";

export default function HomePage() {
  const trending = getAllPapers().slice(0, 3);

  return (
    <>
      <Hero />
      <FeatureCards />

      <section className="container pb-24">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Trending papers
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
              Hand-picked highlights across machine learning and science.
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link href="/search">
              Browse all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {trending.map((p, i) => (
            <div
              key={p.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <PaperCard paper={p} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
