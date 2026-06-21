export type UserRole = "Ahorrador" | "Administradora";

export type DemoUser = {
  name: string;
  role: UserRole;
  fund: string;
  description: string;
  email?: string;
  phone?: string;
};
