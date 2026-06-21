import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";

type SecurityCardProps = {
  title: string;
  description: string;
  linkLabel: string;
};

export function SecurityCard({ title, description, linkLabel }: SecurityCardProps) {
  return (
    <Card className="border-white/10 bg-white/10 p-5 text-white shadow-none backdrop-blur">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-extrabold">{title}</p>
      <p className="mt-2 text-xs leading-5 text-blue-100">{description}</p>
      <p className="mt-4 text-xs font-bold text-white">{linkLabel}</p>
    </Card>
  );
}
