import Link from "next/link";
import { Eye, Headphones, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f8fafc] lg:flex">
      <aside className="relative hidden min-h-screen w-[38%] shrink-0 overflow-hidden bg-gradient-to-b from-[#003b95] to-[#00275f] text-white lg:flex">
        <div className="absolute -left-40 top-[28%] h-[420px] w-[420px] rounded-full bg-[#1479ea]/10 blur-3xl" />
        <div className="absolute -right-32 -top-32 h-[360px] w-[360px] rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex min-h-screen w-full flex-col px-10 py-14 xl:px-16 xl:py-16 2xl:px-20 2xl:py-20">
          <header>
            <p className="text-4xl font-extrabold leading-none tracking-[-0.04em] xl:text-5xl">
              FONFAMPER
            </p>
            <p className="mt-3 text-lg font-medium text-blue-100 xl:text-xl">
              Fondo de Ahorro Familiar
            </p>
          </header>

          <div className="mt-14 xl:mt-20">
            <div className="mx-auto flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#1479ea] shadow-[0_22px_50px_rgba(0,20,65,0.35)]">
              <ShieldCheck className="h-16 w-16 text-white" strokeWidth={2.15} />
            </div>

            <h1 className="mt-12 text-5xl font-extrabold leading-[1.04] tracking-[-0.045em] xl:text-6xl">
              Tu fondo,
              <br />
              tu tranquilidad
            </h1>
            <p className="mt-7 max-w-[480px] text-xl leading-9 text-blue-50 xl:text-2xl xl:leading-10">
              Consulta tu saldo, aportes y utilidades
              <br className="hidden 2xl:block" /> de forma fácil, segura y transparente.
            </p>
          </div>

          <div className="mt-auto flex max-w-[470px] items-start gap-4 pt-14">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
              <LockKeyhole className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-lg font-bold">Tu información está segura</p>
              <p className="mt-2 text-base leading-7 text-blue-100">
                Usamos los más altos estándares de seguridad para proteger tus datos.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <section className="flex min-h-screen flex-1 items-center justify-center bg-[#f8fafc] px-5 py-10 sm:px-10 lg:px-10 lg:py-12 xl:px-14">
        <div className="w-full max-w-[640px]">
          <div className="mb-8 text-center lg:hidden">
            <p className="text-3xl font-extrabold tracking-[-0.04em] text-[#003b95]">FONFAMPER</p>
            <p className="mt-1 text-sm font-medium text-slate-500">Fondo de Ahorro Familiar</p>
          </div>

          <div className="w-full rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] sm:p-10 xl:p-12 2xl:p-14">
            <div className="flex flex-col items-center text-center">
              <div
                aria-label="Avatar de usuario"
                className="flex h-24 w-24 items-center justify-center rounded-full bg-[#e9edf2] text-[#8792a2] sm:h-28 sm:w-28"
              >
                <UserRound className="h-12 w-12 sm:h-14 sm:w-14" strokeWidth={1.7} />
              </div>
              <h2 className="mt-7 text-3xl font-bold leading-tight tracking-[-0.035em] text-[#0f172a] sm:text-4xl">
                Inicia sesión en tu cuenta
              </h2>
              <p className="mt-3 text-base text-[#64748b] sm:text-xl">
                Accede a tu fondo de ahorro familiar
              </p>
            </div>

            <form className="mt-10 space-y-6">
              <label className="block">
                <span className="mb-2.5 block text-base font-semibold text-[#334155] sm:text-lg">
                  Correo o documento
                </span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#94a3b8]" />
                  <input
                    autoComplete="username"
                    className="h-16 w-full rounded-xl border border-[#dbe2ea] bg-white pl-14 pr-5 text-base text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#0057d9] focus:ring-4 focus:ring-blue-100 sm:text-lg"
                    placeholder="Ingresa tu correo o número de documento"
                    type="text"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2.5 block text-base font-semibold text-[#334155] sm:text-lg">
                  Contraseña
                </span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#94a3b8]" />
                  <input
                    autoComplete="current-password"
                    className="h-16 w-full rounded-xl border border-[#dbe2ea] bg-white pl-14 pr-14 text-base text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#0057d9] focus:ring-4 focus:ring-blue-100 sm:text-lg"
                    placeholder="Ingresa tu contraseña"
                    type="password"
                  />
                  <Eye className="pointer-events-none absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#94a3b8]" />
                </span>
              </label>

              <div className="flex items-center justify-between gap-4 text-sm sm:text-base">
                <label className="flex cursor-pointer items-center gap-2.5 text-[#475569]">
                  <input
                    className="h-5 w-5 rounded border-[#cbd5e1] accent-[#0057d9]"
                    type="checkbox"
                  />
                  <span>Recordarme</span>
                </label>
                <Link className="font-semibold text-[#0057d9] transition hover:text-[#0046b0]" href="#">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <div className="space-y-4 pt-2">
                <button
                  className="h-16 w-full rounded-xl bg-[#0057d9] text-lg font-semibold text-white shadow-[0_10px_24px_rgba(0,87,217,0.22)] transition hover:bg-[#0049b8] focus:outline-none focus:ring-4 focus:ring-blue-200"
                  type="button"
                >
                  Iniciar sesión
                </button>
                <button
                  className="h-16 w-full rounded-xl border-2 border-[#0057d9] bg-white text-lg font-semibold text-[#0057d9] transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  type="button"
                >
                  Primer ingreso / activar cuenta
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="flex items-center justify-center gap-2.5 text-base text-[#64748b]">
              <Headphones className="h-5 w-5" strokeWidth={1.8} />
              <span>
                ¿Necesitas ayuda?{" "}
                <span className="font-semibold text-[#0057d9]">Contáctanos</span>
              </span>
            </p>

            <div className="mt-5 flex items-center justify-center gap-3 text-xs text-slate-400">
              <span>Accesos demo</span>
              <span aria-hidden="true" className="h-3 w-px bg-slate-300" />
              <Link className="font-medium transition hover:text-[#0057d9]" href="/ahorrador/inicio">
                Camilo
              </Link>
              <Link className="font-medium transition hover:text-[#0057d9]" href="/admin/dashboard">
                Sonia
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
