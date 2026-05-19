"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { getPaperById, papers } from "@/services/papers";
import type { ChatMessage } from "@/types";

const SUGGESTED = [
  "Summarize this paper in two sentences.",
  "What are the main contributions?",
  "Explain the methodology to a beginner.",
  "What are the limitations and open questions?",
];

function generateReply(question: string, paperTitle?: string): string {
  const subject = paperTitle ?? "the paper";
  const trimmed = question.trim().toLowerCase();
  if (trimmed.includes("summar")) {
    return `In short, ${subject} introduces a novel approach that achieves strong results on benchmark tasks. The key idea is to combine a clean architectural insight with scalable training, leading to improvements in both accuracy and efficiency.`;
  }
  if (trimmed.includes("contribut") || trimmed.includes("main")) {
    return `The main contributions of ${subject} are: (1) a new architecture or formulation that addresses a long-standing limitation, (2) empirical validation across multiple benchmarks, and (3) ablations that isolate which components matter most.`;
  }
  if (trimmed.includes("methodolog") || trimmed.includes("explain")) {
    return `At a high level, ${subject} starts from a known baseline and replaces a key component (often the bottleneck) with a more principled alternative. The training procedure is standard, but the architectural change unlocks significantly better scaling behavior.`;
  }
  if (trimmed.includes("limit") || trimmed.includes("gap") || trimmed.includes("open")) {
    return `Open questions include: how the method scales to much larger datasets, whether the gains transfer to out-of-distribution settings, and whether the assumptions hold in safety-critical applications. The authors flag these as future work.`;
  }
  return `Great question. Based on ${subject}, the relevant section discusses this in detail: the authors note tradeoffs between performance and complexity, and their experimental results suggest the proposed approach is competitive with prior work while being simpler to implement.`;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const paperId = searchParams.get("paperId") ?? undefined;
  const paper = useMemo(() => (paperId ? getPaperById(paperId) : undefined), [paperId]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const greeting = paper
      ? `Hi! I've read "${paper.title}". Ask me anything about it — I can summarize sections, explain methodology, surface limitations, or compare it to related work.`
      : "Hi! I'm your research assistant. Pick a paper from the search page to chat about it, or ask a general research question to get started.";
    setMessages([
      {
        id: "intro",
        role: "assistant",
        content: greeting,
        timestamp: Date.now(),
      },
    ]);
  }, [paper]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  function send(content: string) {
    if (!content.trim()) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: generateReply(content, paper?.title),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      setIsThinking(false);
    }, 700);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar — paper context */}
        <aside className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                Active paper
              </h2>
              {paper ? (
                <div className="mt-3">
                  <p className="text-sm font-medium leading-snug">
                    {paper.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {paper.authors.map((a) => a.name).join(", ")} ·{" "}
                    {paper.publishedYear}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {paper.tags.slice(0, 4).map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">
                  No paper loaded. Pick one below or visit a paper&apos;s detail
                  page.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold">Quick switch</h3>
              <ul className="mt-3 space-y-2">
                {papers.slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <a
                      href={`/chat?paperId=${p.id}`}
                      className={`block rounded-md border p-2 text-xs transition-colors hover:bg-accent ${
                        paper?.id === p.id ? "border-primary bg-accent" : ""
                      }`}
                    >
                      {p.title}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>

        {/* Chat */}
        <Card className="flex h-[78vh] flex-col">
          <div className="flex items-center gap-3 border-b p-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">Research Assistant</p>
              <p className="text-xs text-muted-foreground">
                Powered by AI · Always cite the source
              </p>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-5 p-5">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {isThinking && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-1 rounded-2xl bg-muted px-4 py-3">
                    <Dot delay="0ms" />
                    <Dot delay="150ms" />
                    <Dot delay="300ms" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 border-t px-5 py-3">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t p-4"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={
                paper
                  ? `Ask about "${paper.title}"...`
                  : "Ask a research question..."
              }
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 shrink-0"
              disabled={!input.trim() || isThinking}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {message.content}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
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
