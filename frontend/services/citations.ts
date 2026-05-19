import type { Paper, CitationStyle } from "@/types";

export function generateCitation(paper: Paper, style: CitationStyle): string {
  const authorList = paper.authors.map((a) => a.name);
  const journal = paper.journal ?? "Unknown Journal";
  const year = paper.publishedYear;
  const doi = paper.doi ? `https://doi.org/${paper.doi}` : "";

  switch (style) {
    case "APA": {
      const authors =
        authorList.length === 1
          ? authorList[0]
          : authorList.length === 2
          ? `${authorList[0]} & ${authorList[1]}`
          : `${authorList[0]} et al.`;
      return `${authors} (${year}). ${paper.title}. ${journal}. ${doi}`.trim();
    }
    case "MLA": {
      const authors =
        authorList.length === 1
          ? authorList[0]
          : `${authorList[0]}, et al.`;
      return `${authors}. "${paper.title}." ${journal}, ${year}. ${doi}`.trim();
    }
    case "Chicago": {
      const authors = authorList.join(", ");
      return `${authors}. "${paper.title}." ${journal} (${year}). ${doi}`.trim();
    }
    case "BibTeX": {
      const key = paper.authors[0]?.name.split(" ").pop()?.toLowerCase() ?? "paper";
      return `@article{${key}${year},
  title   = {${paper.title}},
  author  = {${authorList.join(" and ")}},
  journal = {${journal}},
  year    = {${year}},
  doi     = {${paper.doi ?? ""}}
}`;
    }
  }
}
