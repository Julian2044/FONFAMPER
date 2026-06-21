import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type AvatarPlaceholderProps = {
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-24 w-24"
};

export function AvatarPlaceholder({ name, size = "md" }: AvatarPlaceholderProps) {
  return (
    <div
      aria-label={`Avatar de ${name}`}
      className={cn("flex shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500", sizes[size])}
    >
      <UserRound className={cn(size === "lg" ? "h-12 w-12" : "h-5 w-5")} />
    </div>
  );
}
