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
    <Card className="group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-border hover:shadow-lg">
      <div className="flex h-full flex-col items-center justify-between gap-6 text-center">
        <div className="space-y-4">
          {icon ? (
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {icon}
            </span>
          ) : null}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Acceso
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button
          asChild
          className="w-full rounded-xl px-6 py-2 text-sm font-semibold shadow-sm transition group-hover:bg-primary/90 md:w-auto"
        >
          <Link href={href} className="inline-flex items-center justify-center gap-2">
            {ctaLabel}
          </Link>
        </Button>
      </div>
    </Card>
  );
}
