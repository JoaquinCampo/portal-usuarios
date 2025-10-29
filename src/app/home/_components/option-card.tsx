import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OptionCardProps {
  title: string;
  description: string;
  href: string;
  ctaLabel?: string;
  icon?: ReactNode;
}

export function OptionCard({
  title,
  description,
  href,
  ctaLabel = "Abrir",
  icon,
}: OptionCardProps) {
  return (
    <Card className="border-border bg-card p-8">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-medium text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button asChild>
          <Link href={href} className="inline-flex items-center">
            {icon ? <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">{icon}</span> : null}
            {ctaLabel}
          </Link>
        </Button>
      </div>
    </Card>
  );
}
