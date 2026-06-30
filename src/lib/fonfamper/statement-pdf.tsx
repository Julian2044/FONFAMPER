import { pdf } from "@react-pdf/renderer";
import { StatementPdfDocument } from "@/components/finance/StatementPdfDocument";
import type { AccountStatement } from "@/lib/fonfamper/statement-data";

export function buildStatementPdfFilename(statement: AccountStatement, generatedAt: string) {
  const holder = statement.profile.full_name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const date = generatedAt.slice(0, 10);

  return `estado-cuenta-${holder || "usuario"}-${date}.pdf`;
}

export function getPdfErrorStatus(errors: string[]) {
  const message = errors.join(" ").toLowerCase();

  if (message.includes("autenticado") || message.includes("sesión")) {
    return 401;
  }

  if (message.includes("administrador") || message.includes("permiso")) {
    return 403;
  }

  if (message.includes("fecha") || message.includes("selecciona") || message.includes("no tiene cuenta")) {
    return 400;
  }

  return 500;
}

async function streamToUint8Array(stream: NodeJS.ReadableStream) {
  const chunks: Buffer[] = [];

  for await (const chunk of stream as AsyncIterable<Buffer | Uint8Array | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return new Uint8Array(Buffer.concat(chunks));
}

export async function renderStatementPdf(statement: AccountStatement, generatedAt: string) {
  const stream = await pdf(<StatementPdfDocument statement={statement} generatedAt={generatedAt} />).toBuffer();

  return streamToUint8Array(stream);
}
