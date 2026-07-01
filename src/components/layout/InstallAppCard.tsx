import { MonitorDown, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function InstallAppCard() {
  return (
    <Card className="min-w-0 border-blue-100 bg-blue-50/60">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0057d9] shadow-sm ring-1 ring-blue-100">
          <Smartphone className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-extrabold text-slate-950">Instalar FONFAMPER</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Agrega FONFAMPER a tu pantalla de inicio para usarlo como app.
          </p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
              <p className="font-extrabold text-slate-950">iPhone</p>
              <p className="mt-1 leading-6 text-slate-600">Compartir → Agregar a pantalla de inicio.</p>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
              <p className="font-extrabold text-slate-950">Android</p>
              <p className="mt-1 leading-6 text-slate-600">Menú del navegador → Instalar app o Agregar a pantalla principal.</p>
            </div>
          </div>
        </div>
        <MonitorDown className="hidden h-6 w-6 shrink-0 text-[#0057d9] sm:block" />
      </div>
    </Card>
  );
}
