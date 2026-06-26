import { formatCurrencyCOP } from "@/lib/fonfamper/format";
import { Card } from "@/components/ui/Card";

type StatementSummaryProps = {
  items: Array<{
    label: string;
    value: number;
  }>;
};

export function StatementSummary({ items }: StatementSummaryProps) {
  return (
    <Card className="min-w-0">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
            <span className="text-sm text-slate-500">{item.label}</span>
            <span className="whitespace-nowrap text-base font-bold text-slate-950">{formatCurrencyCOP(item.value)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
