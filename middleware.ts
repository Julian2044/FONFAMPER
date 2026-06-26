import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";

function getSupabaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  return supabaseUrl;
}

function getSupabasePublishableKey() {
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabasePublishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  return supabasePublishableKey;
}

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

function applyCookies(response: NextResponse, cookiesToSet: CookieToSet[]) {
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
}

function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/supabase-test" ||
    pathname === "/supabase-data-test" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/assets")
  );
}

export async function middleware(request: NextRequest) {
  const cookiesToSet: CookieToSet[] = [];
  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies) {
        cookiesToSet.push(...cookies);
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (isPublicPath(pathname)) {
    if (pathname === "/login" && user) {
      const { data: profile } = await supabase
        .schema("public")
        .from("profiles")
        .select("role, status")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (profile?.status?.toUpperCase() === "ACTIVO") {
        const homePath = profile.role === "ADMIN" ? "/admin/dashboard" : "/ahorrador/inicio";
        const response = NextResponse.redirect(new URL(homePath, request.url));
        applyCookies(response, cookiesToSet);
        return response;
      }
    }

    const response = NextResponse.next();
    applyCookies(response, cookiesToSet);
    return response;
  }

  const isAdminPath = pathname.startsWith("/admin");
  const isSaverPath = pathname.startsWith("/ahorrador");

  if (!user && (isAdminPath || isSaverPath)) {
    const response = NextResponse.redirect(new URL("/login?error=auth", request.url));
    applyCookies(response, cookiesToSet);
    return response;
  }

  if (!user) {
    const response = NextResponse.next();
    applyCookies(response, cookiesToSet);
    return response;
  }

  const { data: profile } = await supabase
    .schema("public")
    .from("profiles")
    .select("role, status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile) {
    const response = NextResponse.redirect(new URL("/login?error=profile", request.url));
    applyCookies(response, cookiesToSet);
    return response;
  }

  if (profile.status?.toUpperCase() !== "ACTIVO") {
    const response = NextResponse.redirect(new URL("/login?error=inactive", request.url));
    applyCookies(response, cookiesToSet);
    return response;
  }

  if (isAdminPath && profile.role !== "ADMIN") {
    const response = NextResponse.redirect(new URL("/ahorrador/inicio", request.url));
    applyCookies(response, cookiesToSet);
    return response;
  }

  if (isSaverPath && profile.role !== "AHORRADOR") {
    const response = NextResponse.redirect(new URL("/admin/dashboard", request.url));
    applyCookies(response, cookiesToSet);
    return response;
  }

  const response = NextResponse.next();
  applyCookies(response, cookiesToSet);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
