import { NextResponse } from "next/server";
import { getCurrentUserStatement } from "@/lib/fonfamper/statement-data";
import { buildStatementPdfFilename, getPdfErrorStatus, renderStatementPdf } from "@/lib/fonfamper/statement-pdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(errors: string[], status: number) {
  return NextResponse.json(
    {
      errors: errors.length > 0 ? errors : ["No fue posible generar el PDF."]
    },
    { status }
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const startDate = url.searchParams.get("from") ?? url.searchParams.get("startDate") ?? undefined;
  const endDate = url.searchParams.get("to") ?? url.searchParams.get("endDate") ?? undefined;
  const result = await getCurrentUserStatement({ startDate, endDate });

  if (!result.statement) {
    return jsonError(result.errors, getPdfErrorStatus(result.errors));
  }

  try {
    const generatedAt = new Date().toISOString();
    const bytes = await renderStatementPdf(result.statement, generatedAt);
    const filename = buildStatementPdfFilename(result.statement, generatedAt);

    return new Response(bytes, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(bytes.byteLength),
        "Content-Type": "application/pdf"
      }
    });
  } catch (error) {
    console.error("[statement-pdf] saver", error);
    return jsonError(["No fue posible generar el PDF del estado de cuenta."], 500);
  }
}
