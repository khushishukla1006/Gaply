"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Paper, CitationStyle } from "@/types";
import { generateCitation } from "@/services/citations";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const STYLES: CitationStyle[] = ["APA", "MLA", "Chicago", "BibTeX"];

interface CitationGeneratorProps {
  paper: Paper;
}

export function CitationGenerator({ paper }: CitationGeneratorProps) {
  const [copied, setCopied] = useState<CitationStyle | null>(null);

  function copy(style: CitationStyle, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(style);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <Tabs defaultValue="APA" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        {STYLES.map((s) => (
          <TabsTrigger key={s} value={s}>
            {s}
          </TabsTrigger>
        ))}
      </TabsList>

      {STYLES.map((style) => {
        const citation = generateCitation(paper, style);
        return (
          <TabsContent key={style} value={style}>
            <div className="relative rounded-md border bg-muted/40 p-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                {citation}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute right-2 top-2 h-7 gap-1.5 px-2 text-xs"
                onClick={() => copy(style, citation)}
              >
                {copied === style ? (
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
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
