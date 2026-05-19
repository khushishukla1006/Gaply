import Link from "next/link";
import { ArrowUpRight, Calendar, Quote, Users } from "lucide-react";
import type { Paper } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PaperCardProps {
  paper: Paper;
}

export function PaperCard({ paper }: PaperCardProps) {
  return (
    <Card className="hover-card group flex h-full flex-col border-border/70 bg-card/60">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap gap-1.5">
          {paper.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-secondary/70 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <CardTitle className="mt-3 text-lg leading-snug">
          <Link
            href={`/paper/${paper.id}`}
            className="transition-colors hover:text-primary"
          >
            {paper.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {paper.summary}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            {paper.authors
              .slice(0, 2)
              .map((a) => a.name)
              .join(", ")}
            {paper.authors.length > 2 && ` +${paper.authors.length - 2}`}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {paper.publishedYear}
          </span>
          {paper.citations !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Quote className="h-3 w-3" />
              {paper.citations.toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Link
          href={`/paper/${paper.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-transform group-hover:translate-x-0.5"
        >
          Read more
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
