import { PrintableStatement, PrintableStatementError } from "@/components/finance/PrintableStatement";
import { getAdminStatementForProfile } from "@/lib/fonfamper/statement-data";

export const dynamic = "force-dynamic";

type AdminPrintStatementPageProps = {
  searchParams?: {
    profileId?: string | string[];
    from?: string | string[];
    to?: string | string[];
    startDate?: string | string[];
    endDate?: string | string[];
  };
};

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminPrintStatementPage({ searchParams }: AdminPrintStatementPageProps) {
  const profileId = getSearchValue(searchParams?.profileId);
  const startDate = getSearchValue(searchParams?.from) || getSearchValue(searchParams?.startDate);
  const endDate = getSearchValue(searchParams?.to) || getSearchValue(searchParams?.endDate);
  const result = await getAdminStatementForProfile(profileId || undefined, { startDate, endDate });

  if (!result.statement) {
    return <PrintableStatementError errors={result.errors} />;
  }

  return <PrintableStatement statement={result.statement} generatedAt={new Date().toISOString()} />;
}
