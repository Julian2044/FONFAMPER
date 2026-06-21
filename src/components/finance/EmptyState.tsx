import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-500">
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </Card>
  );
}
