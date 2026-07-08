"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { UserPlus } from "lucide-react";
import { createInternalUserProfileAction } from "@/app/admin/usuarios/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export const CREATE_USER_DRAFT_STORAGE_KEY = "fonfamper.admin.create-user.draft";
export const CREATE_USER_SUBMIT_STORAGE_KEY = "fonfamper.admin.create-user.submitted";

type CreateUserDraft = {
  fullName: string;
  email: string;
  documentId: string;
  phone: string;
  role: "ADMIN" | "AHORRADOR";
  savingsEnabled: boolean;
  accountNumber: string;
  initialBalance: string;
  initialBalanceDate: string;
};

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

function getTodayInputDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Bogota",
    year: "numeric"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function createEmptyDraft(): CreateUserDraft {
  return {
    fullName: "",
    email: "",
    documentId: "",
    phone: "",
    role: "AHORRADOR",
    savingsEnabled: false,
    accountNumber: "",
    initialBalance: "",
    initialBalanceDate: getTodayInputDate()
  };
}

function draftTextValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readStoredCreateUserDraft(): CreateUserDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawDraft = window.sessionStorage.getItem(CREATE_USER_DRAFT_STORAGE_KEY);
    const parsedDraft = rawDraft ? JSON.parse(rawDraft) as Partial<CreateUserDraft> : null;

    if (!parsedDraft) {
      return null;
    }

    const emptyDraft = createEmptyDraft();

    return {
      fullName: draftTextValue(parsedDraft.fullName),
      email: draftTextValue(parsedDraft.email),
      documentId: draftTextValue(parsedDraft.documentId),
      phone: draftTextValue(parsedDraft.phone),
      role: parsedDraft.role === "ADMIN" ? "ADMIN" : "AHORRADOR",
      savingsEnabled: Boolean(parsedDraft.savingsEnabled),
      accountNumber: draftTextValue(parsedDraft.accountNumber),
      initialBalance: draftTextValue(parsedDraft.initialBalance),
      initialBalanceDate: draftTextValue(parsedDraft.initialBalanceDate) || emptyDraft.initialBalanceDate
    };
  } catch {
    return null;
  }
}

function storeCreateUserDraft(draft: CreateUserDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(CREATE_USER_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  window.sessionStorage.setItem(CREATE_USER_SUBMIT_STORAGE_KEY, "true");
}

export function hasPendingCreateUserSubmit() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(CREATE_USER_SUBMIT_STORAGE_KEY) === "true";
}

export function clearStoredCreateUserDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(CREATE_USER_DRAFT_STORAGE_KEY);
  window.sessionStorage.removeItem(CREATE_USER_SUBMIT_STORAGE_KEY);
}

function SubmitButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  const submitting = pending || disabled;

  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
      <UserPlus className="h-4 w-4" />
      {submitting ? "Creando..." : "Crear usuario"}
    </Button>
  );
}

export function AdminCreateSaverForm() {
  const [draft, setDraft] = useState<CreateUserDraft>(createEmptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const cleanInitialBalance = cleanMoneyInput(draft.initialBalance);

  useEffect(() => {
    const storedDraft = readStoredCreateUserDraft();

    if (storedDraft) {
      setDraft(storedDraft);
    }
  }, []);

  return (
    <Card>
      <div className="mb-5">
        <h3 className="text-lg font-extrabold text-slate-950">Nuevo usuario interno</h3>
        <p className="mt-1 text-sm text-slate-500">Crea el perfil interno. El acceso queda pendiente hasta enlazar Auth.</p>
      </div>

      <form
        action={createInternalUserProfileAction}
        className="grid gap-4 lg:grid-cols-4"
        onSubmit={() => {
          storeCreateUserDraft(draft);
          setSubmitting(true);
        }}
      >
        <label className="min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Nombre completo</span>
          <Input
            name="full_name"
            required
            placeholder="Nombre del usuario"
            autoComplete="name"
            value={draft.fullName}
            onChange={(event) => setDraft((current) => ({ ...current, fullName: event.target.value }))}
          />
        </label>

        <label className="min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Correo electronico</span>
          <Input
            name="email"
            type="email"
            required
            placeholder="correo@email.com"
            autoComplete="email"
            value={draft.email}
            onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
          />
        </label>

        <label className="min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Documento</span>
          <Input
            name="document_id"
            placeholder="C.C. 0000000000"
            autoComplete="off"
            value={draft.documentId}
            onChange={(event) => setDraft((current) => ({ ...current, documentId: event.target.value }))}
          />
        </label>

        <label className="min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Telefono</span>
          <Input
            name="phone"
            type="tel"
            placeholder="+57 300 000 0000"
            autoComplete="tel"
            value={draft.phone}
            onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
          />
        </label>

        <label className="min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Rol</span>
          <Select
            name="role"
            value={draft.role}
            onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value === "ADMIN" ? "ADMIN" : "AHORRADOR" }))}
          >
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
            checked={draft.savingsEnabled}
            onChange={(event) => setDraft((current) => ({ ...current, savingsEnabled: event.target.checked }))}
          />
        </label>

        {draft.savingsEnabled ? (
          <label className="min-w-0 lg:col-span-2">
            <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Numero de cuenta</span>
            <Input
              name="account_number"
              placeholder="Automatico si se deja vacio"
              autoComplete="off"
              value={draft.accountNumber}
              onChange={(event) => setDraft((current) => ({ ...current, accountNumber: event.target.value }))}
            />
          </label>
        ) : null}

        {draft.savingsEnabled ? (
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Saldo inicial</span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="$ 0"
              value={draft.initialBalance}
              onChange={(event) => setDraft((current) => ({ ...current, initialBalance: formatMoneyInput(event.target.value) }))}
            />
          </label>
        ) : null}

        {draft.savingsEnabled ? (
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase text-slate-400">Fecha saldo inicial</span>
            <Input
              name="initial_balance_date"
              type="date"
              value={draft.initialBalanceDate}
              onChange={(event) => setDraft((current) => ({ ...current, initialBalanceDate: event.target.value }))}
              required
            />
          </label>
        ) : null}

        <input type="hidden" name="initial_balance" value={draft.savingsEnabled ? cleanInitialBalance || "0" : "0"} />

        <div className="flex items-end">
          <SubmitButton disabled={submitting} />
        </div>
      </form>
    </Card>
  );
}
