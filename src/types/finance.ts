export type MovementType = "Saldo inicial" | "Aporte" | "Utilidad" | "Retiro" | "Ajuste";

export type Movement = {
  date: string;
  concept: string;
  type: MovementType;
  value: number;
  balance: number;
};

export type AccountSummary = {
  previousBalance: number;
  januaryContribution: number;
  utilities: number;
  withdrawals: number;
  adjustments: number;
  currentBalance: number;
};

export type SaverAccount = {
  summary: AccountSummary;
  movements: Movement[];
};
