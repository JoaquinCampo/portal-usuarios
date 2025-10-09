import { Suspense } from "react";
import { SearchBar } from "@/app/_components/search-bar";
import { EntityList } from "@/app/_components/entity-list";
import { SkeletonGrid } from "@/app/_components/skeleton-grid";
import { ActiveUsersCounter } from "@/app/_components/active-users-counter";
import { searchParamsCache } from "@/lib/search-params";
import type { SearchParams } from "nuqs/server";

interface HomeProps {
  searchParams: Promise<SearchParams>;
}

export default async function Home(props: HomeProps) {
  const { searchParams } = props;
  const { entity, q } = await searchParamsCache.parse(searchParams);

  return (
    <div className="min-h-screen bg-background dark">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Entity Search
            </h1>
            <p className="text-sm text-muted-foreground">
              Search and explore entities via REST API
            </p>
          </div>
          <ActiveUsersCounter />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <section>
            <SearchBar isLoading={false} />
          </section>

          <section>
            <Suspense fallback={<SkeletonGrid />}>
              <EntityList entity={entity} query={q} />
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  );
}
