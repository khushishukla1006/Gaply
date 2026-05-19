import {
  BookOpenCheck,
  Brain,
  MessageSquareText,
  Quote,
  Search,
  Telescope,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Search,
    title: "Semantic Search",
    description:
      "Find papers by meaning, not just keywords. Search across millions of articles instantly.",
  },
  {
    icon: BookOpenCheck,
    title: "AI Summaries",
    description:
      "Skip the abstract jargon. Get plain-English summaries of any paper in seconds.",
  },
  {
    icon: Brain,
    title: "AI Explanations",
    description:
      "Don't understand a paper? Have it explained at any level — from undergrad to expert.",
  },
  {
    icon: Telescope,
    title: "Research Gaps",
    description:
      "Surface unanswered questions and open problems to find your next research direction.",
  },
  {
    icon: Quote,
    title: "Citation Generator",
    description:
      "Export citations in APA, MLA, and Chicago with one click.",
  },
  {
    icon: MessageSquareText,
    title: "Chat with Papers",
    description:
      "Ask questions, request clarifications, and explore ideas with an AI that has read the paper.",
  },
];

export function FeatureCards() {
  return (
    <section className="container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Everything you need to{" "}
          <span className="gradient-text">read smarter</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          A complete research workspace, powered by state-of-the-art AI.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Card
            key={f.title}
            className="hover-card animate-fade-in group relative overflow-hidden border-border/70 bg-card/60"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Soft gradient corner glow on hover */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
            />
            <CardHeader>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">{f.title}</CardTitle>
              <CardDescription className="leading-relaxed">
                {f.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
