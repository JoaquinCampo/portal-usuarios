import { SearchX } from "lucide-react";
import { getAllEntities, searchEntities } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { ClinicCard } from "./clinic-card";
import { HealthUserCard } from "./health-user-card";
import { HealthWorkerCard } from "./health-worker-card";
import { ClinicalDocumentCard } from "./clinical-document-card";
import { SearchHistoryComponent } from "./search-history";
import type {
  Clinic,
  ClinicalDocument,
  EntityType,
  HealthWorker,
  HealthUser,
} from "@/lib/types";

interface EntityListProps {
  entity: EntityType;
  query: string;
}

export async function EntityList({ entity, query }: EntityListProps) {
  let results: (Clinic | HealthUser | HealthWorker | ClinicalDocument)[] = [];

  try {
    if (query.trim() !== "") {
      results = await searchEntities(entity, query);
    } else {
      results = await getAllEntities(entity);
    }
  } catch {
    results = [];
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Search Results
        </h2>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {results.length} {results.length === 1 ? "result" : "results"}
        </Badge>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-16">
          <SearchX className="h-16 w-16 text-white" />
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-white">
              No Results Found
            </h3>
            <p className="text-white/80 max-w-md">
              {`We couldn't find any matches for your search.`}
              {query && (
                <span className="block mt-1">
                  Try adjusting your search term or selecting a different entity
                  type.
                </span>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => {
            if (entity === "clinics") {
              return <ClinicCard key={result.id} clinic={result as Clinic} />;
            }
            if (entity === "health-users") {
              return (
                <HealthUserCard key={result.id} user={result as HealthUser} />
              );
            }
            if (entity === "health-workers") {
              return (
                <HealthWorkerCard
                  key={result.id}
                  worker={result as HealthWorker}
                />
              );
            }
            if (entity === "clinical-documents") {
              return (
                <ClinicalDocumentCard
                  key={result.id}
                  document={result as ClinicalDocument}
                />
              );
            }
            return null;
          })}
        </div>
      )}

      <SearchHistoryComponent entity={entity} query={query} />
    </div>
  );
}
