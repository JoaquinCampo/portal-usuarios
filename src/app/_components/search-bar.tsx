"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useQueryStates } from "nuqs";
import { searchParamsParsers } from "@/lib/search-params";
import { addToSearchHistory } from "@/lib/search-history";

interface SearchBarProps {
  isLoading: boolean;
}

export function SearchBar({ isLoading }: SearchBarProps) {
  const [{ entity, q }, setParams] = useQueryStates(searchParamsParsers, {
    shallow: false,
  });

  const [localValue, setLocalValue] = useState<string>(q);

  // Sync local value with query param
  useEffect(() => {
    setLocalValue(q);
  }, [q]);

  // Store search history when search parameters change
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (q.trim() !== "" || entity !== "health-users") {
      addToSearchHistory(entity, q.trim());
    }
  }, [entity, q]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void setParams({ q: localValue });
  };

  return (
    <Card className="border-border bg-card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-56">
            <Select
              value={entity}
              onValueChange={(value) =>
                setParams({ entity: value as typeof entity })
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="health-users">Health Users</SelectItem>
                <SelectItem value="health-workers">Health Workers</SelectItem>
                <SelectItem value="clinics">Clinics</SelectItem>
                <SelectItem value="clinical-documents">
                  Clinical Documents
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-1 gap-2">
            <Input
              type="text"
              placeholder="Search..."
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              className="flex-1 bg-background"
            />
            <Button type="submit" disabled={isLoading}>
              <Search className="mr-2 h-4 w-4" />
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
