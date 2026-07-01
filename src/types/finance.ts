export type MovementType = "Saldo inicial" | "Aporte" | "Utilidad" | "Retiro" | "Ajuste";

export type Movement = {
  id?: string;
  date: string;
  concept: string;
  type: MovementType;
  value: number;
  balance: number;
  attachment?: {
    id: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
  } | null;
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
