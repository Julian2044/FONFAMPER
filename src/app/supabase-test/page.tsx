import { createClientServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SupabaseTestPage() {
  const supabase = createClientServer();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-xl rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-[#0057D9]">FONFAMPER</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Conexión Supabase</h1>
        <p className="mt-3 text-base text-slate-600">Cliente configurado correctamente</p>
        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-950">{user ? `Sesión activa: ${user.email ?? user.id}` : "Sin sesión activa"}</p>
          {error ? <p className="mt-2 text-sm text-slate-500">Auth respondió sin sesión disponible para esta prueba.</p> : null}
        </div>
      </section>
    </main>
  );
}
