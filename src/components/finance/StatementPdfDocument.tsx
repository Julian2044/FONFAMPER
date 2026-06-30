import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatCurrencyCOP, formatDate, formatDateTime, formatDocumentId } from "@/lib/fonfamper/format";
import type { AccountStatement, AccountStatementMovement } from "@/lib/fonfamper/statement-data";

type StatementPdfDocumentProps = {
  statement: AccountStatement;
  generatedAt: string;
};

const movementLabels: Record<AccountStatementMovement["movementType"], string> = {
  SALDO_INICIAL: "Saldo inicial",
  APORTE: "Aporte",
  RETIRO: "Retiro",
  AJUSTE: "Ajuste"
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#111827",
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingBottom: 34,
    paddingHorizontal: 34,
    paddingTop: 34
  },
  header: {
    borderBottomColor: "#dbe3ef",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 16
  },
  brand: {
    color: "#062B5F",
    fontSize: 22,
    fontWeight: 700
  },
  brandSub: {
    color: "#64748b",
    fontSize: 9,
    marginTop: 4
  },
  titleBlock: {
    alignItems: "flex-end"
  },
  title: {
    color: "#0f172a",
    fontSize: 19,
    fontWeight: 700
  },
  subtitle: {
    color: "#64748b",
    fontSize: 9,
    marginTop: 4
  },
  section: {
    marginTop: 18
  },
  sectionTitle: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 9
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4
  },
  infoBox: {
    backgroundColor: "#f8fafc",
    borderColor: "#dbe3ef",
    borderRadius: 5,
    borderWidth: 1,
    margin: 4,
    padding: 9,
    width: "47.9%"
  },
  label: {
    color: "#64748b",
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase"
  },
  value: {
    color: "#0f172a",
    fontSize: 9,
    fontWeight: 700,
    marginTop: 5
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4
  },
  summaryBox: {
    borderColor: "#dbe3ef",
    borderRadius: 5,
    borderWidth: 1,
    margin: 4,
    padding: 9,
    width: "31.5%"
  },
  summaryFinal: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe"
  },
  summaryValue: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: 700,
    marginTop: 5
  },
  table: {
    borderColor: "#dbe3ef",
    borderRadius: 5,
    borderWidth: 1,
    overflow: "hidden"
  },
  tableHeader: {
    backgroundColor: "#f1f5f9",
    flexDirection: "row"
  },
  tableRow: {
    borderTopColor: "#e2e8f0",
    borderTopWidth: 1,
    flexDirection: "row"
  },
  th: {
    color: "#475569",
    fontSize: 7,
    fontWeight: 700,
    paddingHorizontal: 5,
    paddingVertical: 7,
    textTransform: "uppercase"
  },
  td: {
    color: "#334155",
    fontSize: 8,
    lineHeight: 1.3,
    paddingHorizontal: 5,
    paddingVertical: 7
  },
  wDate: {
    width: "12%"
  },
  wType: {
    width: "13%"
  },
  wConcept: {
    width: "19%"
  },
  wDescription: {
    width: "26%"
  },
  wMoney: {
    textAlign: "right",
    width: "15%"
  },
  money: {
    color: "#0f172a",
    fontWeight: 700
  },
  positive: {
    color: "#047857"
  },
  negative: {
    color: "#b91c1c"
  },
  empty: {
    backgroundColor: "#f8fafc",
    borderColor: "#dbe3ef",
    borderRadius: 5,
    borderWidth: 1,
    color: "#475569",
    fontSize: 9,
    fontWeight: 700,
    padding: 12
  },
  footer: {
    borderTopColor: "#dbe3ef",
    borderTopWidth: 1,
    color: "#64748b",
    fontSize: 8,
    lineHeight: 1.4,
    marginTop: 22,
    paddingTop: 10
  },
  pageNumber: {
    bottom: 18,
    color: "#94a3b8",
    fontSize: 7,
    position: "absolute",
    right: 34
  }
});

function formatMovementAmount(movement: AccountStatementMovement) {
  const value = formatCurrencyCOP(Math.abs(movement.amount));

  if (movement.movementType === "RETIRO") {
    return `-${value}`;
  }

  if (movement.movementType === "APORTE" || movement.movementType === "AJUSTE") {
    return `+${value}`;
  }

  return value;
}

function movementAmountStyle(movement: AccountStatementMovement) {
  if (movement.movementType === "RETIRO") {
    return [styles.td, styles.wMoney, styles.money, styles.negative];
  }

  if (movement.movementType === "APORTE" || movement.movementType === "AJUSTE") {
    return [styles.td, styles.wMoney, styles.money, styles.positive];
  }

  return [styles.td, styles.wMoney, styles.money];
}

export function StatementPdfDocument({ statement, generatedAt }: StatementPdfDocumentProps) {
  const identityItems = [
    ["Nombre del usuario", statement.profile.full_name],
    ["Documento", statement.profile.document_id ? formatDocumentId(statement.profile.document_id) : "No registrado"],
    ["Número de cuenta", statement.account.account_number ?? "No registrado"],
    ["Periodo", statement.period.label],
    ["Fecha de generación", formatDateTime(generatedAt)]
  ] as const;

  const summaryItems = [
    ["Saldo anterior", formatCurrencyCOP(statement.previousBalance), false],
    ["Total aportes", formatCurrencyCOP(statement.totalContributions), false],
    ["Total retiros", formatCurrencyCOP(statement.totalWithdrawals), false],
    ["Total ajustes", formatCurrencyCOP(statement.totalAdjustments), false],
    ["Saldo final", formatCurrencyCOP(statement.finalBalance), true],
    ["Movimientos", String(statement.movementCount), false]
  ] as const;

  return (
    <Document
      author="FONFAMPER"
      creator="FONFAMPER"
      producer="FONFAMPER"
      subject={`Estado de cuenta ${statement.period.label}`}
      title={`Estado de cuenta - ${statement.profile.full_name}`}
    >
      <Page size="LETTER" style={styles.page} wrap>
        <View style={styles.header} wrap={false}>
          <View>
            <Text style={styles.brand}>FONFAMPER</Text>
            <Text style={styles.brandSub}>Fondo de Ahorro Familiar</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Estado de cuenta</Text>
            <Text style={styles.subtitle}>{statement.period.label}</Text>
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <View style={styles.infoGrid}>
            {identityItems.map(([label, value]) => (
              <View key={label} style={styles.infoBox}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Resumen financiero</Text>
          <View style={styles.summaryGrid}>
            {summaryItems.map(([label, value, isFinal]) => (
              <View key={label} style={isFinal ? [styles.summaryBox, styles.summaryFinal] : styles.summaryBox}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.summaryValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Movimientos del periodo</Text>

          {statement.movements.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader} fixed>
                <Text style={[styles.th, styles.wDate]}>Fecha</Text>
                <Text style={[styles.th, styles.wType]}>Tipo</Text>
                <Text style={[styles.th, styles.wConcept]}>Concepto</Text>
                <Text style={[styles.th, styles.wDescription]}>Descripción</Text>
                <Text style={[styles.th, styles.wMoney]}>Valor</Text>
                <Text style={[styles.th, styles.wMoney]}>Saldo después</Text>
              </View>
              {statement.movements.map((movement) => (
                <View key={movement.id} style={styles.tableRow} wrap={false}>
                  <Text style={[styles.td, styles.wDate]}>{formatDate(movement.movementDate)}</Text>
                  <Text style={[styles.td, styles.wType]}>{movementLabels[movement.movementType]}</Text>
                  <Text style={[styles.td, styles.wConcept]}>{movement.concept}</Text>
                  <Text style={[styles.td, styles.wDescription]}>{movement.description || "Sin descripción"}</Text>
                  <Text style={movementAmountStyle(movement)}>{formatMovementAmount(movement)}</Text>
                  <Text style={[styles.td, styles.wMoney, styles.money]}>{formatCurrencyCOP(movement.balanceAfter)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.empty}>No hay movimientos en este periodo.</Text>
          )}
        </View>

        <Text style={styles.footer}>Este estado de cuenta fue generado desde la información registrada en FONFAMPER.</Text>
        <Text
          fixed
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          style={styles.pageNumber}
        />
      </Page>
    </Document>
  );
}
