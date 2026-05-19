import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "@/components/SearchResults";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q ?? "";

  return (
    <div className="container py-10 md:py-14">
      <div className="mx-auto mb-8 max-w-3xl">
        <SearchBar initialValue={query} />
      </div>

      <div className="mx-auto mb-6 max-w-3xl">
        <h1 className="text-balance text-2xl font-bold tracking-tight md:text-3xl">
          {query ? (
            <>
              Results for{" "}
              <span className="gradient-text">
                &ldquo;{query}&rdquo;
              </span>
            </>
          ) : (
            "Search papers"
          )}
        </h1>
        {query && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            Live results from arXiv.
          </p>
        )}
      </div>

      <div className="mx-auto max-w-3xl">
        <SearchResults query={query} />
      </div>
    </div>
  );
}
