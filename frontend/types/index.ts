export interface Author {
  id: string;
  name: string;
  affiliation?: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: Author[];
  abstract: string;
  summary: string;
  tags: string[];
  publishedYear: number;
  journal?: string;
  citations?: number;
  doi?: string;
  aiExplanation?: string;
  researchGaps?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export type CitationStyle = "APA" | "MLA" | "Chicago" | "BibTeX";

export interface PaperSearchResult {
  id: string;
  title: string;
  abstract: string | null;
  authors: string[];
  year: number | null;
  url: string | null;
  journal: string | null;
  doi: string | null;
}

export interface Citations {
  apa: string;
  mla: string;
  chicago: string;
}

export interface ResearchGapAnalysis {
  simplifiedSummary: string;
  limitations: string[];
  unexploredAreas: string[];
  futureOpportunities: string[];
  fallback?: boolean;
}

export interface ChatAnswer {
  answer: string;
  fallback?: boolean;
}
