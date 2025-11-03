"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export function ActiveUsersCounter() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setActiveUsers(128);
      setIsLoading(false);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-xs text-muted-foreground">Usuarios activos (mock)</p>
        <p className="text-2xl font-semibold text-foreground">
          {isLoading ? "..." : activeUsers}
        </p>
      </div>
      <Badge
        variant="outline"
        className="flex h-12 w-12 items-center justify-center rounded-full border-success/20 bg-success/10"
      >
        <Users className="h-5 w-5 text-success" />
      </Badge>
    </div>
  );
}
