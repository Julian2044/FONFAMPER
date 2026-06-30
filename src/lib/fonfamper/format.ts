const DEFAULT_FALLBACK = "No registrado";

function isValidDate(date: Date) {
  return Number.isFinite(date.getTime());
}

function parseDate(value: string | null | undefined) {
  if (!value) return null;

  const input = value.trim();
  if (!input) return null;

  const dateOnlyMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(input);

  return isValidDate(date) ? date : null;
}

export function formatCurrencyCOP(value: number | null | undefined, fallback = DEFAULT_FALLBACK) {
  if (!Number.isFinite(Number(value))) {
    return fallback;
  }

  const formatted = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0
  }).format(Number(value));

  return `$ ${formatted}`;
}

export function formatDate(value: string | null | undefined, fallback = DEFAULT_FALLBACK) {
  const date = parseDate(value);

  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

export function formatDateTime(value: string | null | undefined, fallback = DEFAULT_FALLBACK) {
  const date = parseDate(value);

  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function formatDocumentId(value: string | null | undefined, fallback = DEFAULT_FALLBACK) {
  if (!value) {
    return fallback;
  }

  const input = value.trim();
  if (!input) {
    return fallback;
  }

  return input.toUpperCase().startsWith("C.C.") ? input : `C.C. ${input}`;
}
