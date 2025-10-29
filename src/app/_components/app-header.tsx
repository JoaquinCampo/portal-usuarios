import type { ReactNode } from "react";
import Link from "next/link";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  homeHref?: string;
}

export function AppHeader({
  title = "Portal de Usuarios",
  subtitle,
  rightSlot,
  homeHref = "/home",
}: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            <Link
              href={homeHref}
              className="hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {title}
            </Link>
          </h1>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
    </header>
  );
}
