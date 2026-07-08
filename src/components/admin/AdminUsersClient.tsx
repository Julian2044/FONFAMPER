"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, ArrowLeft, FileText, Landmark, MoreHorizontal, Pencil, PlusCircle, Save, Search, ShieldOff, Trash2, X } from "lucide-react";
import {
  activateUserAccessAction,
  deleteTestUserAction,
  enableSavingsAccountAction,
  revokeUserAccessAction,
  updateInternalUserAction
} from "@/app/admin/usuarios/actions";
import { AdminCreateSaverForm, clearStoredCreateUserDraft, hasPendingCreateUserSubmit } from "@/components/admin/AdminCreateSaverForm";
import { MovementSupportModal } from "@/components/finance/MovementSupportModal";
import { AvatarPlaceholder } from "@/components/ui/AvatarPlaceholder";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { AdminUserData } from "@/lib/fonfamper/admin-data";
import { formatCurrencyCOP, formatDate } from "@/lib/fonfamper/format";
import { cn } from "@/lib/utils";

type AdminUsersClientProps = {
  users: AdminUserData[];
  createSucceeded?: boolean;
  createdProfileId?: string;
  pageError?: string | null;
};

type UserFilter =
  | "todos"
  | "activos"
  | "inactivos"
  | "bloqueados"
  | "administradores"
  | "ahorradores"
  | "acceso-pendiente"
  | "acceso-activo"
  | "ahorro-habilitado"
  | "sin-cuenta";

const userFilterOptions: Array<{ label: string; value: UserFilter }> = [
  { label: "Todos", value: "todos" },
  { label: "Activos", value: "activos" },
  { label: "Inactivos", value: "inactivos" },
  { label: "Bloqueados", value: "bloqueados" },
  { label: "Administradores", value: "administradores" },
  { label: "Ahorradores", value: "ahorradores" },
  { label: "Acceso pendiente", value: "acceso-pendiente" },
  { label: "Acceso activo", value: "acceso-activo" },
  { label: "Ahorro habilitado", value: "ahorro-habilitado" },
  { label: "Sin cuenta de ahorro", value: "sin-cuenta" }
];

const protectedBaseUserEmails = new Set(["camilo.perez@email.com", "sonia.perez@email.com"]);

function roleLabel(role: AdminUserData["role"]) {
  return role === "ADMIN" ? "Administrador" : "Ahorrador";
}

function roleTone(role: AdminUserData["role"]) {
  return role === "ADMIN" ? "blue" : "green";
}

function movementLabel(type: AdminUserData["recentMovements"][number]["movementType"]) {
  switch (type) {
    case "APORTE":
      return "Aporte";
    case "RETIRO":
      return "Retiro";
    case "AJUSTE":
      return "Ajuste";
    case "SALDO_INICIAL":
      return "Saldo inicial";
    default:
      return type;
  }
}

function accessLabel(user: AdminUserData) {
  return user.authUserId ? "Acceso activo" : "Acceso pendiente";
}

function isProtectedBaseUser(user: AdminUserData) {
  return protectedBaseUserEmails.has(user.email.trim().toLowerCase());
}

function hasOnlyAllowedTestMovements(user: AdminUserData) {
  if (user.movementCount === 0) {
    return true;
  }

  if (user.movementCount !== 1) {
    return false;
  }

  const movement = user.recentMovements[0];

  return Boolean(
    movement &&
      movement.movementType === "SALDO_INICIAL" &&
      movement.amount === 0 &&
      movement.balanceAfter === 0
  );
}

function canShowDeleteTestUser(user: AdminUserData) {
  if (isProtectedBaseUser(user)) {
    return false;
  }

  if (user.summary.currentBalance > 0) {
    return false;
  }

  if (
    user.summary.initialBalance > 0 ||
    user.summary.totalContributions > 0 ||
    user.summary.totalWithdrawals > 0 ||
    user.summary.totalUtilities > 0
  ) {
    return false;
  }

  return hasOnlyAllowedTestMovements(user);
}

function statusTone(status: string) {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === "ACTIVO") {
    return "green" as const;
  }

  if (normalizedStatus === "BLOQUEADO") {
    return "red" as const;
  }

  return "gray" as const;
}

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

function normalizeSearchValue(value: string | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function userSearchText(user: AdminUserData) {
  return normalizeSearchValue(
    [
      user.fullName,
      user.email,
      user.documentId,
      user.phone,
      user.role,
      user.roleSistema,
      roleLabel(user.role),
      roleLabel(user.roleSistema),
      user.status,
      accessLabel(user),
      user.esAhorrador ? "Ahorro habilitado cuenta ahorro habilitada con cuenta" : "Sin cuenta de ahorro",
      user.account?.account_number
    ].join(" ")
  );
}

function matchesSearch(user: AdminUserData, normalizedSearch: string) {
  if (!normalizedSearch) {
    return true;
  }

  const searchTokens = normalizedSearch.split(" ").filter(Boolean);
  const haystack = userSearchText(user);

  return searchTokens.every((token) => haystack.includes(token));
}

function matchesFilter(user: AdminUserData, filter: UserFilter) {
  const status = user.status.toUpperCase();

  switch (filter) {
    case "activos":
      return status === "ACTIVO";
    case "inactivos":
      return status === "INACTIVO";
    case "bloqueados":
      return status === "BLOQUEADO";
    case "administradores":
      return user.role === "ADMIN";
    case "ahorradores":
      return user.role === "AHORRADOR";
    case "acceso-pendiente":
      return !user.authUserId;
    case "acceso-activo":
      return Boolean(user.authUserId);
    case "ahorro-habilitado":
      return Boolean(user.account);
    case "sin-cuenta":
      return !user.account;
    default:
      return true;
  }
}

function ActivateAccessButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <PlusCircle className="h-4 w-4" />
      {pending ? "Activando..." : "Activar acceso"}
    </Button>
  );
}

function UpdateUserButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Guardando..." : "Guardar cambios"}
    </Button>
  );
}

function EnableSavingsButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <Landmark className="h-4 w-4" />
      {pending ? "Habilitando..." : "Habilitar cuenta"}
    </Button>
  );
}

function RevokeAccessButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
      <ShieldOff className="h-4 w-4" />
      {pending ? "Revocando..." : "Revocar acceso"}
    </Button>
  );
}

function DeleteTestUserButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="danger" className="w-full" disabled={pending}>
      <Trash2 className="h-4 w-4" />
      {pending ? "Eliminando..." : "Eliminar usuario de prueba"}
    </Button>
  );
}

function MovementSupportButton({ attachment }: { attachment: AdminUserData["recentMovements"][number]["attachment"] }) {
  if (!attachment) {
    return <span className="text-sm font-semibold text-slate-400">Sin soporte</span>;
  }

  return <MovementSupportModal attachmentId={attachment.id} filename={attachment.originalFilename} />;
}

export function AdminUsersClient({ users, createSucceeded = false, createdProfileId = "", pageError = null }: AdminUsersClientProps) {
  const [selectedUserId, setSelectedUserId] = useState(users.find((user) => user.esAhorrador)?.id ?? users[0]?.id ?? "");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState<UserFilter>("todos");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [createPanelOpen, setCreatePanelOpen] = useState(false);
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [savingsPanelOpen, setSavingsPanelOpen] = useState(false);
  const [initialBalance, setInitialBalance] = useState("");
  const [initialBalanceDate, setInitialBalanceDate] = useState(getTodayInputDate);

  const normalizedSearch = useMemo(() => normalizeSearchValue(searchTerm), [searchTerm]);
  const visibleUsers = useMemo(
    () => users.filter((user) => matchesSearch(user, normalizedSearch) && matchesFilter(user, filterValue)),
    [filterValue, normalizedSearch, users]
  );
  const selectedUser = useMemo(
    () => visibleUsers.find((user) => user.id === selectedUserId) ?? visibleUsers[0] ?? null,
    [selectedUserId, visibleUsers]
  );

  function closeCreatePanel() {
    setCreatePanelOpen(false);
    clearStoredCreateUserDraft();
  }

  useEffect(() => {
    if (visibleUsers.length === 0) {
      if (selectedUserId) {
        setSelectedUserId("");
      }
      setEditPanelOpen(false);
      setSavingsPanelOpen(false);
      setMobileDetailOpen(false);
      return;
    }

    if (!visibleUsers.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(visibleUsers[0].id);
      setEditPanelOpen(false);
      setSavingsPanelOpen(false);
      setInitialBalance("");
      setInitialBalanceDate(getTodayInputDate());
      setMobileDetailOpen(false);
    }
  }, [selectedUserId, visibleUsers]);

  useEffect(() => {
    if (!createSucceeded) {
      return;
    }

    clearStoredCreateUserDraft();
    setCreatePanelOpen(false);
    setSearchTerm("");
    setFilterValue("todos");
    setEditPanelOpen(false);
    setSavingsPanelOpen(false);
    setInitialBalance("");
    setInitialBalanceDate(getTodayInputDate());

    if (createdProfileId && users.some((user) => user.id === createdProfileId)) {
      setSelectedUserId(createdProfileId);
      setMobileDetailOpen(true);
    }
  }, [createSucceeded, createdProfileId, users]);

  useEffect(() => {
    if (!pageError || createSucceeded || !hasPendingCreateUserSubmit()) {
      return;
    }

    setCreatePanelOpen(true);
  }, [createSucceeded, pageError]);

  if (users.length === 0) {
    return (
      <Card className="min-w-0 border-amber-200 bg-amber-50 text-amber-900">
        <p className="text-sm font-semibold">No se pudieron cargar los usuarios administrativos.</p>
      </Card>
    );
  }

  const showMobileList = !mobileDetailOpen;
  const selectedUserCanShowDeleteTestUser = selectedUser ? canShowDeleteTestUser(selectedUser) : false;

  return (
    <div className="space-y-8 min-w-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Usuarios</h2>
            <p className="mt-2 text-base text-slate-500">Administra usuarios, roles y cuentas de ahorro.</p>
          </div>
          <Button type="button" className="w-full sm:w-auto" onClick={() => setCreatePanelOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Nuevo usuario
          </Button>
        </div>
      </div>

      {createPanelOpen ? (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button type="button" variant="ghost" onClick={closeCreatePanel}>
              <X className="h-4 w-4" />
              Cerrar
            </Button>
          </div>
          <AdminCreateSaverForm />
        </div>
      ) : null}

      <div className="grid min-w-0 gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card className={cn("min-w-0", showMobileList ? "block" : "hidden lg:block")}>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                className="pl-10"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar usuario..."
                value={searchTerm}
              />
            </div>
            <Select value={filterValue} onChange={(event) => setFilterValue(event.target.value as UserFilter)} aria-label="Filtrar usuarios">
              {userFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase text-slate-500 sm:grid-cols-[minmax(0,1fr)_140px]">
              <span>Usuario</span>
              <span className="hidden sm:block">Estado</span>
            </div>
            <div className="divide-y divide-slate-100">
              {visibleUsers.length > 0 ? (
                visibleUsers.map((user) => {
                  const selected = user.id === selectedUserId;

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setMobileDetailOpen(true);
                        setEditPanelOpen(false);
                        setSavingsPanelOpen(false);
                        setInitialBalance("");
                        setInitialBalanceDate(getTodayInputDate());
                      }}
                      className={cn(
                        "grid w-full grid-cols-1 items-center gap-3 px-4 py-4 text-left transition sm:grid-cols-[minmax(0,1fr)_140px] sm:gap-0",
                        selected ? "bg-blue-50" : "bg-white hover:bg-slate-50"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <AvatarPlaceholder name={user.fullName} size="sm" />
                        <div className="min-w-0">
                          <span className="block break-words font-bold leading-5 text-slate-950">{user.fullName}</span>
                          <span className="block break-words text-xs leading-5 text-slate-500">{user.email}</span>
                        </div>
                      </div>
                      <div className="justify-self-start sm:justify-self-end">
                        <Badge tone={roleTone(user.role)}>{roleLabel(user.role)}</Badge>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-sm font-semibold text-slate-500">
                  No se encontraron usuarios con esos filtros.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 text-sm text-slate-500 sm:flex-row sm:items-center">
            <span>Mostrando {visibleUsers.length} de {users.length} usuarios</span>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0057d9] text-sm font-extrabold text-white">1</span>
            </div>
          </div>
        </Card>

        <Card className={cn("min-w-0 max-w-full", mobileDetailOpen ? "block" : "hidden lg:block")}>
          {selectedUser ? (
            <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {mobileDetailOpen ? (
                <Button variant="secondary" className="w-full sm:hidden" onClick={() => setMobileDetailOpen(false)}>
                  <ArrowLeft className="h-4 w-4" />
                  Volver a usuarios
                </Button>
              ) : null}
              <AvatarPlaceholder name={selectedUser.fullName} size="lg" />
              <div className="min-w-0">
                <h3 className="text-3xl font-extrabold text-slate-950">{selectedUser.fullName}</h3>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold">
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[#004aad] ring-1 ring-blue-100">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#004aad]" />
                    {roleLabel(selectedUser.roleSistema)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1",
                      selectedUser.esAhorrador
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                        : "bg-slate-100 text-slate-600 ring-slate-200"
                    )}
                  >
                    <span className={cn("h-2.5 w-2.5 rounded-full", selectedUser.esAhorrador ? "bg-emerald-600" : "bg-slate-400")} />
                    {selectedUser.esAhorrador ? "Ahorro habilitado" : "Sin cuenta de ahorro"}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1",
                      selectedUser.authUserId
                        ? "bg-blue-50 text-[#004aad] ring-blue-100"
                        : "bg-amber-50 text-amber-700 ring-amber-100"
                    )}
                  >
                    <span className={cn("h-2.5 w-2.5 rounded-full", selectedUser.authUserId ? "bg-[#004aad]" : "bg-amber-500")} />
                    {accessLabel(selectedUser)}
                  </span>
                  <Badge tone={statusTone(selectedUser.status)}>{selectedUser.status}</Badge>
                </div>
              </div>
            </div>
            <button type="button" aria-label={`Opciones de ${selectedUser.fullName}`} className="self-start rounded-full p-2 text-slate-400 hover:bg-slate-100">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Saldo actual", selectedUser.summary.currentBalance],
              ["Saldo inicial", selectedUser.summary.initialBalance],
              ["Aportes", selectedUser.summary.totalContributions],
              ["Utilidades", selectedUser.summary.totalUtilities],
              ["Retiros", selectedUser.summary.totalWithdrawals]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                <p className="mt-2 whitespace-nowrap font-extrabold text-slate-950">{formatCurrencyCOP(Number(value))}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Nombre completo</p>
              <p className="mt-1 break-words font-bold text-slate-950">{selectedUser.fullName}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Correo electrónico</p>
              <p className="mt-1 break-words font-bold text-slate-950">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Documento</p>
              <p className="mt-1 break-words font-bold text-slate-950">{selectedUser.documentId ?? "No registrado"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Teléfono</p>
              <p className="mt-1 break-words font-bold text-slate-950">{selectedUser.phone ?? "No registrado"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Fecha de registro</p>
              <p className="mt-1 whitespace-nowrap font-bold text-slate-950">{formatDate(selectedUser.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Estado</p>
              <p className="mt-1 font-bold text-slate-950">{selectedUser.status}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Acceso</p>
              <p className="mt-1 font-bold text-slate-950">{accessLabel(selectedUser)}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {selectedUser.account ? (
              <>
                <Link href={`/admin/movimientos?profileId=${encodeURIComponent(selectedUser.id)}`} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0057d9] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004aad]">
                  <PlusCircle className="h-4 w-4" />
                  Registrar movimiento
                </Link>
                <Link href={`/admin/estados-cuenta?profileId=${encodeURIComponent(selectedUser.id)}`} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#004aad] ring-1 ring-[#0057d9]/25 transition hover:bg-blue-50">
                  <FileText className="h-4 w-4" />
                  Generar estado de cuenta
                </Link>
              </>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                setEditPanelOpen((current) => !current);
                setSavingsPanelOpen(false);
              }}
            >
              <Pencil className="h-4 w-4" />
              {editPanelOpen ? "Cerrar edición" : "Editar usuario"}
            </Button>
            {!selectedUser.account ? (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setSavingsPanelOpen((current) => !current);
                  setEditPanelOpen(false);
                  setInitialBalance("");
                  setInitialBalanceDate(getTodayInputDate());
                }}
              >
                <Landmark className="h-4 w-4" />
                {savingsPanelOpen ? "Cerrar cuenta" : "Habilitar cuenta de ahorro"}
              </Button>
            ) : null}
            {!selectedUser.authUserId ? (
              <form action={activateUserAccessAction}>
                <input type="hidden" name="profile_id" value={selectedUser.id} />
                <ActivateAccessButton />
              </form>
            ) : null}
            {selectedUser.authUserId ? (
              <form
                action={revokeUserAccessAction}
                onSubmit={(event) => {
                  if (!window.confirm(`¿Revocar el acceso de ${selectedUser.fullName}? El perfil, la cuenta y los movimientos se conservarán.`)) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="profile_id" value={selectedUser.id} />
                <RevokeAccessButton />
              </form>
            ) : null}
          </div>

          {selectedUserCanShowDeleteTestUser ? (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-900">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-extrabold">Eliminación protegida</p>
                  <p className="mt-1">
                    Esta acción solo debe usarse para usuarios de prueba. No se recomienda eliminar usuarios con historial financiero.
                  </p>
                  <form
                    action={deleteTestUserAction}
                    className="mt-3"
                    onSubmit={(event) => {
                      const confirmed = window.confirm(
                        `¿Eliminar definitivamente el usuario de prueba ${selectedUser.fullName}? Esta acción eliminará el perfil, la cuenta sin saldo, movimientos permitidos, notificaciones y el usuario Auth si existe.`
                      );

                      if (!confirmed) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="profile_id" value={selectedUser.id} />
                    <DeleteTestUserButton />
                  </form>
                </div>
              </div>
            </div>
          ) : null}

          {editPanelOpen ? (
            <div key={`edit-${selectedUser.id}`} className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-950">Editar usuario</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-500">El correo se conserva sin cambios. Los saldos se modifican únicamente desde movimientos.</p>
                </div>
                <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => setEditPanelOpen(false)}>
                  <X className="h-4 w-4" />
                  Cerrar
                </Button>
              </div>
              <form action={updateInternalUserAction} className="mt-5 grid gap-4 md:grid-cols-2">
                <input type="hidden" name="profile_id" value={selectedUser.id} />
                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Correo electrónico</span>
                  <Input value={selectedUser.email} readOnly className="bg-slate-100 text-slate-500" />
                </label>
                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Nombre completo</span>
                  <Input name="full_name" defaultValue={selectedUser.fullName} required />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Documento</span>
                  <Input name="document_id" defaultValue={selectedUser.documentId ?? ""} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Teléfono</span>
                  <Input name="phone" defaultValue={selectedUser.phone ?? ""} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Rol</span>
                  <Select name="role" defaultValue={selectedUser.roleSistema}>
                    <option value="ADMIN">ADMIN</option>
                    <option value="AHORRADOR">AHORRADOR</option>
                  </Select>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Estado</span>
                  <Select name="status" defaultValue={selectedUser.status}>
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                    <option value="BLOQUEADO">BLOQUEADO</option>
                  </Select>
                  <span className="mt-2 block text-xs font-semibold leading-5 text-slate-500">
                    INACTIVO o BLOQUEADO impiden el ingreso al portal sin eliminar datos financieros.
                  </span>
                </label>
                <div className="grid gap-3 md:col-span-2 sm:grid-cols-2">
                  <Button type="button" variant="secondary" className="w-full" onClick={() => setEditPanelOpen(false)}>
                    Cancelar
                  </Button>
                  <UpdateUserButton />
                </div>
              </form>
            </div>
          ) : null}

          {savingsPanelOpen && !selectedUser.account ? (
            <div key={`savings-${selectedUser.id}`} className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-950">Habilitar cuenta de ahorro</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-500">Crea la cuenta sin alterar usuarios, movimientos previos ni datos de acceso.</p>
                </div>
                <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => setSavingsPanelOpen(false)}>
                  <X className="h-4 w-4" />
                  Cerrar
                </Button>
              </div>
              <form action={enableSavingsAccountAction} className="mt-5 grid gap-4 md:grid-cols-2">
                <input type="hidden" name="profile_id" value={selectedUser.id} />
                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Número de cuenta opcional</span>
                  <Input name="account_number" placeholder="FON-000001" />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Saldo inicial</span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="$ 0"
                    value={initialBalance}
                    onChange={(event) => setInitialBalance(formatMoneyInput(event.target.value))}
                  />
                  <input type="hidden" name="initial_balance" value={cleanMoneyInput(initialBalance)} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Fecha saldo inicial</span>
                  <Input
                    name="initial_balance_date"
                    type="date"
                    value={initialBalanceDate}
                    onChange={(event) => setInitialBalanceDate(event.target.value)}
                    required
                  />
                </label>
                <div className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-slate-600 md:col-span-2">
                  Si registras un saldo inicial mayor a cero, se creará automáticamente un movimiento de tipo Saldo inicial.
                </div>
                <div className="grid gap-3 md:col-span-2 sm:grid-cols-2">
                  <Button type="button" variant="secondary" className="w-full" onClick={() => setSavingsPanelOpen(false)}>
                    Cancelar
                  </Button>
                  <EnableSavingsButton />
                </div>
              </form>
            </div>
          ) : null}

          <div className="mt-8">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h3 className="text-lg font-extrabold text-slate-950">Movimientos recientes</h3>
              <span className="text-sm font-extrabold text-[#0057d7]">Ver todos los movimientos</span>
            </div>

            <div className="space-y-3 lg:hidden">
              {selectedUser.recentMovements.map((movement) => (
                <div key={movement.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-extrabold text-slate-950">{movement.concept}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(movement.movementDate)}</p>
                    </div>
                    <Badge tone={movement.movementType === "RETIRO" ? "red" : "green"}>{movementLabel(movement.movementType)}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Monto</span>
                      <span className="whitespace-nowrap font-bold text-slate-950">{formatCurrencyCOP(movement.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Saldo resultante</span>
                      <span className="whitespace-nowrap font-bold text-slate-950">{formatCurrencyCOP(movement.balanceAfter)}</span>
                    </div>
                    {movement.attachment ? (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-500">Soporte</span>
                        <MovementSupportButton attachment={movement.attachment} />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block">
              <DataTable
                columns={["Fecha", "Descripción", "Tipo", "Monto", "Saldo resultante", "Soporte"]}
                rows={selectedUser.recentMovements.map((movement) => [
                  formatDate(movement.movementDate),
                  movement.concept,
              movementLabel(movement.movementType),
                  <span key="amount" className="whitespace-nowrap font-bold text-slate-950">
                    {formatCurrencyCOP(movement.amount)}
                  </span>,
                  <span key="balance" className="whitespace-nowrap font-bold text-slate-950">
                    {formatCurrencyCOP(movement.balanceAfter)}
                  </span>,
                  <MovementSupportButton key="support" attachment={movement.attachment} />
                ])}
              />
            </div>
          </div>
            </>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-slate-50 p-6 text-center">
              <div className="max-w-md">
                <h3 className="text-xl font-extrabold text-slate-950">No hay usuarios visibles</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">No se encontraron usuarios con esos filtros.</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
