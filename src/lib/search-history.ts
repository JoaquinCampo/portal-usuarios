import type { SearchHistory, EntityType } from "./types";

const STORAGE_KEY = "search-history";
const MAX_HISTORY_ITEMS = 50;

export function getSearchHistory(): SearchHistory[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as SearchHistory[];

    return parsed.map((item) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch {
    return [];
  }
}

export function addToSearchHistory(entity: EntityType, term: string): void {
  if (typeof window === "undefined") return;

  try {
    const history = getSearchHistory();

    const newItem: SearchHistory = {
      id: `${entity}-${term}-${Date.now()}`,
      entity,
      term,
      timestamp: new Date(),
    };

    const filteredHistory = history.filter(
      (item) => !(item.entity === entity && item.term === term)
    );

    const updatedHistory = [newItem, ...filteredHistory];

    const limitedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error("Failed to save search history:", error);
  }
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear search history:", error);
  }
}
