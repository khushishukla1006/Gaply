"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { AlertCircle, Bot, Info, MessageSquare, Send, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, chatWithPaperApi, type ChatTurn } from "@/lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  fallback?: boolean;
}

interface PaperChatProps {
  title: string;
  abstract: string;
}

const SUGGESTED_QUESTIONS = [
  "Summarize this paper in two sentences.",
  "What are the main contributions?",
  "Explain the methodology to a beginner.",
  "What are the limitations and open questions?",
];

const HISTORY_TURNS = 10;

function newId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function PaperChat({ title, abstract }: PaperChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollAnchor = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMessages([]);
    setError(null);
    setInput("");
    abortRef.current?.abort();
  }, [title, abstract]);

  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isThinking) return;

    const userMessage: ChatMessage = {
      id: newId(),
      role: "user",
      content: trimmed,
    };

    const history: ChatTurn[] = messages
      .slice(-HISTORY_TURNS)
      .map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    setError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await chatWithPaperApi(
        title,
        abstract,
        trimmed,
        history,
        controller.signal
      );
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          content: result.answer,
          fallback: result.fallback,
        },
      ]);
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return;
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      if (!controller.signal.aborted) setIsThinking(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function retryLast() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMessages((prev) => {
      const lastIdx = prev.map((m) => m.id).lastIndexOf(lastUser.id);
      return lastIdx >= 0 ? prev.slice(0, lastIdx) : prev;
    });
    send(lastUser.content);
  }

  const isEmpty = messages.length === 0 && !isThinking && !error;

  return (
    <Card className="flex h-[640px] flex-col overflow-hidden border-border/70 bg-card/60">
      <CardHeader className="border-b border-border/60 bg-background/30">
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
            <MessageSquare className="h-3.5 w-3.5" />
          </span>
          Chat with this paper
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-0 p-0">
        <ScrollArea className="flex-1">
          <div className="space-y-5 p-5">
            {isEmpty && <EmptyState onPick={(q) => send(q)} />}

            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} />
            ))}

            {isThinking && <ThinkingBubble />}

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">
                    Couldn&rsquo;t get a response
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-7"
                    onClick={retryLast}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            <div ref={scrollAnchor} />
          </div>
        </ScrollArea>

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t bg-background/50 p-3"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this paper…"
            className="max-h-32 min-h-[44px] resize-none"
            rows={1}
            disabled={isThinking}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 shrink-0"
            disabled={!input.trim() || isThinking}
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`animate-fade-in flex gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={`flex max-w-[78%] flex-col gap-1 ${isUser ? "items-end" : ""}`}>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-primary text-primary-foreground shadow-glow-sm"
              : "border border-border/60 bg-muted/70 text-foreground"
          }`}
        >
          {message.content}
        </div>
        {message.fallback && !isUser && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/[0.06] px-2 py-0.5 text-[10px] font-medium text-amber-200/90">
            <Info className="h-2.5 w-2.5" />
            Demo response — AI service unavailable
          </span>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="animate-fade-in flex items-center gap-3">
      <Avatar className="h-8 w-8 ring-1 ring-primary/20">
        <AvatarFallback className="bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex gap-1 rounded-2xl border border-border/60 bg-muted/70 px-4 py-3">
        <Dot delay="0ms" />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
      style={{ animationDelay: delay }}
    />
  );
}

function EmptyState({ onPick }: { onPick: (question: string) => void }) {
  return (
    <div className="animate-fade-in space-y-4 py-4 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
        <Bot className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold">Ask anything about this paper</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Answers are grounded in the title and abstract.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 pt-1">
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="animate-fade-in rounded-full border border-border/70 bg-background/50 px-3 py-1 text-xs transition-all hover:border-primary/40 hover:bg-accent hover:text-foreground"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
