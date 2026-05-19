# PaperMind — Research Paper Frontend

AI-powered research paper discovery, summarization, and conversation. Built with **Next.js 14**, **Tailwind CSS**, **shadcn/ui**, and **TypeScript**.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — hero, search bar, feature cards, trending papers |
| `/search?q=...` | Search results — papers with summaries, tags, authors sidebar |
| `/paper/[id]` | Paper detail — abstract, AI explanation, research gaps, citation generator (APA/MLA/Chicago/BibTeX) |
| `/chat?paperId=...` | AI chat — conversational interface for asking questions about a paper |

## Stack

- **Next.js 14** (App Router) — Frontend framework
- **Tailwind CSS** — Styling
- **shadcn/ui** — Components (Button, Card, Tabs, Badge, Avatar, ScrollArea, etc.)
- **TypeScript** — Type safety
- **Lucide React** — Icons

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout (Navbar + footer)
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Tailwind + CSS variables
│   ├── search/page.tsx     # Search results
│   ├── paper/[id]/page.tsx # Paper detail
│   └── chat/page.tsx       # AI chat
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── SearchBar.tsx
│   ├── FeatureCards.tsx
│   ├── PaperCard.tsx
│   └── CitationGenerator.tsx
├── services/
│   ├── papers.ts           # Mock paper data + search
│   └── citations.ts        # Citation formatter (APA/MLA/Chicago/BibTeX)
├── types/index.ts          # Paper, Author, ChatMessage types
└── lib/utils.ts            # cn() helper
```

The mock data in `services/papers.ts` is wired up so every flow works end-to-end. Replace it with real API calls to `../backend/` when ready.
