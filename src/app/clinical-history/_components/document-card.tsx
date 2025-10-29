import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface DocumentCardProps {
  title: string;
  description?: string;
  rightIcon?: ReactNode;
}

export function DocumentCard({ title, description, rightIcon }: DocumentCardProps) {
  return (
    <Card className="border-border bg-card p-6 transition-colors hover:bg-accent/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium text-foreground">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {rightIcon ? <div className="text-muted-foreground">{rightIcon}</div> : null}
      </div>
      <div className="mt-4">
        <Button type="button">Ver documento</Button>
      </div>
    </Card>
  );
}
