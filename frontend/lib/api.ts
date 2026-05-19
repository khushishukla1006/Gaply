import type {
  ChatAnswer,
  Citations,
  PaperSearchResult,
  ResearchGapAnalysis,
} from "@/types";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function searchPapersApi(
  query: string,
  signal?: AbortSignal
): Promise<PaperSearchResult[]> {
  const url = new URL("/api/papers/search", API_BASE_URL);
  url.searchParams.set("q", query);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    let message = `Search request failed (${response.status} ${response.statusText})`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      /* response wasn't JSON — fall back to generic message */
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as PaperSearchResult[];
}

export async function getPaperByIdApi(
  id: string,
  signal?: AbortSignal
): Promise<PaperSearchResult> {
  const url = new URL(
    `/api/papers/external/${encodeURIComponent(id)}`,
    API_BASE_URL
  );

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError("Paper not found.", 404);
    }
    let message = `Failed to load paper (${response.status} ${response.statusText})`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      /* response wasn't JSON — fall back to generic message */
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as PaperSearchResult;
}

export async function analyzeResearchGapApi(
  title: string,
  paperAbstract: string,
  signal?: AbortSignal
): Promise<ResearchGapAnalysis> {
  const url = new URL("/api/ai/research-gap", API_BASE_URL);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ title, abstract: paperAbstract }),
    signal,
  });

  if (!response.ok) {
    let message = `Analysis failed (${response.status} ${response.statusText})`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      /* response body wasn't JSON — keep generic message */
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as ResearchGapAnalysis;
}

export async function chatWithPaperApi(
  title: string,
  paperAbstract: string,
  question: string,
  history?: ChatTurn[],
  signal?: AbortSignal
): Promise<ChatAnswer> {
  const url = new URL("/api/ai/chat", API_BASE_URL);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      title,
      abstract: paperAbstract,
      question,
      history,
    }),
    signal,
  });

  if (!response.ok) {
    let message = `Chat request failed (${response.status} ${response.statusText})`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      /* response body wasn't JSON — keep generic message */
    }
    throw new ApiError(message, response.status);
  }

  const data = (await response.json()) as ChatAnswer;
  return { answer: data.answer, fallback: data.fallback ?? false };
}

export interface CitationGenerateInput {
  title: string;
  authors: string[];
  year: number;
  journal?: string | null;
  doi?: string | null;
}

export async function generateCitationsApi(
  input: CitationGenerateInput,
  signal?: AbortSignal
): Promise<Citations> {
  const url = new URL("/api/citations/generate", API_BASE_URL);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
    signal,
  });

  if (!response.ok) {
    let message = `Citation generation failed (${response.status} ${response.statusText})`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      /* response body wasn't JSON — keep generic message */
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as Citations;
}
