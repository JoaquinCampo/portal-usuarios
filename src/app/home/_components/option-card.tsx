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
    <Card className="group relative h-full w-full overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-border hover:shadow-lg">
      <div className="flex h-full flex-col items-center justify-between gap-7 text-center">
        <div className="space-y-5">
          {icon ? (
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {icon}
            </span>
          ) : null}
          <div>
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <p className="mt-3 text-base text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button
          asChild
          className="w-full rounded-2xl px-8 py-3 text-base font-semibold shadow-sm transition group-hover:bg-primary/90"
        >
          <Link href={href} className="inline-flex items-center justify-center gap-3">
            {ctaLabel}
          </Link>
        </Button>
      </div>
    </Card>
  );
}
