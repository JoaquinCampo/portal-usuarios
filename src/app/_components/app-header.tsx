"use client";

import type { ReactNode } from "react";
import Link from "next/link";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  homeHref?: string;
  contactInfo?: {
    document?: string | null;
    email?: string | null;
  };
}

export function AppHeader({
  title = "Portal de Usuarios",
  subtitle,
  rightSlot,
  homeHref = "/home",
  contactInfo,
}: AppHeaderProps) {
  const documentValue = contactInfo?.document?.trim();
  const emailValue = contactInfo?.email?.trim();

  return (
    <header className="border-b border-primary/20 bg-gradient-to-r from-primary/10 via-card/80 to-card">
      <div className="container mx-auto flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">
            <Link
              href={homeHref}
              className="rounded-md transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {title}
            </Link>
          </h1>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          {(documentValue || emailValue) && (
            <div className="flex flex-col gap-3 text-left text-sm sm:flex-row sm:items-center sm:gap-4">
              {documentValue ? (
                <div className="min-w-[160px] rounded-xl border border-primary/30 bg-card/90 px-4 py-2 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Documento
                  </p>
                  <p className="mt-1 font-semibold text-foreground">{documentValue}</p>
                </div>
              ) : null}
              {emailValue ? (
                <div className="min-w-[200px] rounded-xl border border-primary/30 bg-card/90 px-4 py-2 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Correo
                  </p>
                  <p className="mt-1 font-semibold text-foreground break-all">{emailValue}</p>
                </div>
              ) : null}
            </div>
          )}

          {rightSlot ? <div className="shrink-0 self-start md:self-auto">{rightSlot}</div> : null}
        </div>
      </div>
    </header>
  );
}
