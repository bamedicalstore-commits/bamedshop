import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="flex flex-col gap-3 rounded-none border-0 bg-background p-5 shadow-none first:rounded-t-xl last:rounded-b-xl sm:first:rounded-l-xl sm:first:rounded-tr-none sm:last:rounded-r-xl sm:last:rounded-bl-none sm:p-6">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="size-[17px]" aria-hidden="true" />
      </span>
      <div>
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}
