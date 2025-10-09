import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import type { EntityType } from "./types";

export const searchParamsParsers = {
  entity: parseAsStringEnum<EntityType>([
    "health-users",
    "health-workers",
    "clinics",
    "clinical-documents",
  ]).withDefault("health-users"),
  q: parseAsString.withDefault(""),
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);
