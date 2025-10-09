"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSearchHistory } from "@/lib/search-history";
import { formatEntityDisplayName, formatTimestamp } from "@/lib/utils";
import type { SearchHistory, EntityType } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

interface SearchHistoryComponentProps {
  entity: EntityType;
  query: string;
}

export function SearchHistoryComponent({
  entity,
  query,
}: SearchHistoryComponentProps) {
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    if (mounted) {
      setHistory(getSearchHistory());
      setCurrentPage(0); // Reset to first page on new search
    }
  }, [entity, query, mounted]);

  if (!mounted || history.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = history.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Search History
        </h2>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {history.length} {history.length === 1 ? "search" : "searches"}
        </Badge>
      </div>

      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity</TableHead>
              <TableHead>Search Term</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-white">
                  <Badge variant="outline" className="capitalize">
                    {formatEntityDisplayName(item.entity)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-white">
                  {item.term || "-"}
                </TableCell>
                <TableCell className="text-white">
                  {formatTimestamp(item.timestamp)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-white/70">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/40"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/40"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
