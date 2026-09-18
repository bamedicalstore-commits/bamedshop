import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string; title: string; description?: string; align?: "left" | "center";
  actionLabel?: string; actionTo?: string; className?: string; children?: ReactNode;
}

export function SectionHeader({ eyebrow,title,description,align="left",actionLabel,actionTo,className,children }: SectionHeaderProps) {
  return (
    <div className={cn("mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-8",align==="center"&&"flex-col items-center text-center",className)}>
      <div className={cn("max-w-2xl",align==="center"&&"mx-auto")}>
        {eyebrow ? <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p> : null}
        <h2 className="text-2xl font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-[30px]">{title}</h2>
        {description ? <p className="mt-2.5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">{description}</p> : null}
      </div>
      {actionLabel && actionTo ? <Link to={actionTo as "/"} className="group inline-flex items-center gap-1.5 pb-0.5 text-sm font-semibold text-foreground transition-colors hover:text-primary">{actionLabel}<ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" /></Link> : null}
      {children}
    </div>
  );
}
