import { CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/Button";

type UploadBoxProps = {
  title: string;
  description: string;
  helper: string;
  primaryLabel: string;
  secondaryLabel?: string;
};

export function UploadBox({ title, description, helper, primaryLabel, secondaryLabel }: UploadBoxProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 px-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#0057d9] shadow-sm">
        <CloudUpload className="h-8 w-8" />
      </div>
      <h3 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button>{primaryLabel}</Button>
        {secondaryLabel ? <Button variant="secondary">{secondaryLabel}</Button> : null}
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500">{helper}</p>
    </div>
  );
}
