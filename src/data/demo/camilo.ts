import type { SaverAccount } from "@/types/finance";
import type { DemoUser } from "@/types/user";

export const camilo: DemoUser = {
  name: "Camilo Perez",
  role: "Ahorrador",
  fund: "FONFAMPER",
  description: "Fondo de Ahorro Familiar",
  email: "camilo.perez@email.com",
  phone: "+57 300 *** ** 45"
};

export const camiloAccount: SaverAccount = {
  summary: {
    previousBalance: 900000,
    januaryContribution: 50000,
    utilities: 0,
    withdrawals: 0,
    adjustments: 0,
    currentBalance: 950000
  },
  movements: [
    {
      date: "2022-12-31",
      concept: "Saldo acumulado anterior",
      type: "Saldo inicial",
      value: 900000,
      balance: 900000
    },
    {
      date: "2023-01-15",
      concept: "Aporte de enero",
      type: "Aporte",
      value: 50000,
      balance: 950000
    }
  ]
};

export const camiloBalanceHistory = [
  { period: "Dic 2022", balance: 900000 },
  { period: "Ene 2023", balance: 950000 }
];
