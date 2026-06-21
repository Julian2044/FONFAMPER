"use client";

import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Circle,
  ClipboardList,
  FileText,
  Home,
  LineChart,
  Settings,
  ShieldCheck,
  Upload,
  User,
  Users,
  Wallet
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  home: Home,
  movements: ArrowLeftRight,
  chart: BarChart3,
  file: FileText,
  user: User,
  users: Users,
  upload: Upload,
  shield: ShieldCheck,
  settings: Settings,
  bell: Bell,
  wallet: Wallet,
  audit: ClipboardList,
  report: LineChart
};

type AppIconProps = {
  iconKey: string;
  className?: string;
};

export function AppIcon({ iconKey, className }: AppIconProps) {
  const Icon = icons[iconKey] ?? Circle;

  return <Icon className={className} />;
}
