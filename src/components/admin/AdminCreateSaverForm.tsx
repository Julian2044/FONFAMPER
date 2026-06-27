"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { UserPlus } from "lucide-react";
import { createInternalUserProfileAction } from "@/app/admin/usuarios/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

function cleanMoneyInput(value: string) {
  return value.replace(/\D/g, "");
}

function formatMoneyInput(value: string) {
  const cleaned = cleanMoneyInput(value);

  if (!cleaned) {
    return "";
  }

  return `$ ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Number(cleaned))}`;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      <UserPlus className="h-4 w-4" />
      {pending ? "Creando..." : "Crear usuario"}
    </Button>
  );
}

export function AdminCreateSaverForm() {
  const [savingsEnabled, setSavingsEnabled] = useState(false);
  const [initialBalance, setInitialBalance] = useState("");
  const cleanInitialBalance = cleanMoneyInput(initialBalance);

  return (
    <Card>
      <div className="mb-5">
        <h3 className="text-lg font-extrabold text-slate-950">Nuevo usuario interno</h3>
        <p className="mt-1 text-sm text-slate-500">Crea el perfil interno. El acceso queda pendiente hasta enlazar Auth.</p>
      </div>

      <form action={createInternalUserProfileAction} className="grid gap-4 lg:grid-cols-4">
        <label className="min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Nombre completo</span>
          <Input name="full_name" required placeholder="Nombre del usuario" autoComplete="name" />
        </label>

        <label className="min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Correo electronico</span>
          <Input name="email" type="email" required placeholder="correo@email.com" autoComplete="email" />
        </label>

        <label className="min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Documento</span>
          <Input name="document_id" placeholder="C.C. 0000000000" autoComplete="off" />
        </label>

        <label className="min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Telefono</span>
          <Input name="phone" type="tel" placeholder="+57 300 000 0000" autoComplete="tel" />
        </label>

        <label className="min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Rol</span>
          <Select name="role" defaultValue="AHORRADOR">
            <option value="AHORRADOR">AHORRADOR</option>
            <option value="ADMIN">ADMIN</option>
          </Select>
        </label>

        <label className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:col-span-3">
          <span>
            <span className="block text-sm font-bold text-slate-950">Habilitar cuenta de ahorro</span>
            <span className="mt-1 block text-xs text-slate-500">Crea un registro en accounts y permite movimientos.</span>
          </span>
          <input
            name="create_account"
            type="checkbox"
            className="h-5 w-5 rounded border-slate-300 text-[#0057d9] focus:ring-[#0057d9]"
            checked={savingsEnabled}
            onChange={(event) => setSavingsEnabled(event.target.checked)}
          />
        </label>

        {savingsEnabled ? (
          <label className="min-w-0 lg:col-span-2">
            <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Numero de cuenta</span>
            <Input name="account_number" placeholder="Automatico si se deja vacio" autoComplete="off" />
          </label>
        ) : null}

        {savingsEnabled ? (
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Saldo inicial</span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="$ 0"
              value={initialBalance}
              onChange={(event) => setInitialBalance(formatMoneyInput(event.target.value))}
            />
          </label>
        ) : null}

        <input type="hidden" name="initial_balance" value={savingsEnabled ? cleanInitialBalance || "0" : "0"} />

        <div className="flex items-end">
          <SubmitButton />
        </div>
      </form>
    </Card>
  );
}
