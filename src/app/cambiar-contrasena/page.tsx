import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { getRoleHomePath, requireProfile } from "@/lib/fonfamper/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cambiar contraseña - FONFAMPER"
};

export default async function ChangePasswordPage() {
  const profile = await requireProfile();
  const homeHref = getRoleHomePath(profile.role);
  const mustChangePassword = profile.must_change_password;

  const brandContent = (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0057d9] text-white">
        <ShieldCheck className="h-6 w-6" />
      </span>
      <span>
        <span className="block text-xl font-extrabold leading-none text-[#003b95]">FONFAMPER</span>
        <span className="mt-1 block text-xs font-semibold text-slate-500">Fondo de Ahorro Familiar</span>
      </span>
    </>
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f8fafc] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {mustChangePassword ? (
            <div className="inline-flex items-center gap-3 self-start">{brandContent}</div>
          ) : (
            <Link href={homeHref} className="inline-flex items-center gap-3 self-start">
              {brandContent}
            </Link>
          )}
          {!mustChangePassword ? (
            <Link
              href={homeHref}
              className="inline-flex h-11 items-center justify-center self-start rounded-xl bg-white px-4 text-sm font-semibold text-[#004aad] ring-1 ring-[#0057d9]/25 transition hover:bg-blue-50 sm:self-auto"
            >
              Volver al portal
            </Link>
          ) : null}
        </header>

        <section className="flex flex-1 items-center justify-center py-10 sm:py-12">
          <ChangePasswordForm homeHref={homeHref} email={profile.email} mustChangePassword={mustChangePassword} />
        </section>
      </div>
    </main>
  );
}
