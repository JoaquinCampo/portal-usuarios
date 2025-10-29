import { Suspense } from "react";
import { SearchBar } from "./_components/search-bar";
import { EntityList } from "./_components/entity-list";
import { SkeletonGrid } from "./_components/skeleton-grid";
import { AppHeader } from "@/app/_components/app-header";
import { searchParamsCache } from "@/lib/search-params";
import type { SearchParams } from "nuqs/server";

interface SearchPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SearchPage(props: SearchPageProps) {
  const { searchParams } = props;
  const { entity, q } = await searchParamsCache.parse(searchParams);

  return (
    <div className="min-h-screen bg-background dark">
      <AppHeader subtitle="Search and explore entities via REST API" />

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
