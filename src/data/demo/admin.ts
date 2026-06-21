export const adminStats = {
  activeSavers: 17,
  registeredSavers: 22,
  totalManagedBalance: 35900975,
  monthlyContributions: 1650000,
  distributedUtilities: 0,
  pendingMovements: 2
};

export const demoSavers = [
  "Nelly Súa Estepa",
  "Felipe Aguilar Sua",
  "Esteban Aguilar Sua",
  "Alejandro Pérez",
  "Edilsa Estepa",
  "Eleuterio Estepa",
  "Luciana Gaitán",
  "Juan José Gaitán",
  "Camilo Perez",
  "Carlos Gaitán",
  "Arelis Sua"
].map((name) => ({
  name,
  status: "Activo"
}));

export const recentOperations = [
  ["14 may 2024 10:35", "Aporte", "Camilo Perez", "Aporte mensual de mayo 2024", 50000, "Completado"],
  ["14 may 2024 09:18", "Aporte", "Nelly Súa Estepa", "Aporte mensual de mayo 2024", 100000, "Completado"],
  ["13 may 2024 16:42", "Retiro", "Felipe Aguilar Sua", "Retiro autorizado", 200000, "Completado"],
  ["13 may 2024 11:07", "Aporte", "Esteban Aguilar Sua", "Aporte mensual de mayo 2024", 120000, "Completado"],
  ["12 may 2024 18:21", "Aporte", "Alejandro Pérez", "Aporte mensual de mayo 2024", 150000, "Completado"]
] as const;

export const importPreviewRows = [
  ["Camilo Perez", 900000, 50000, 0, 0, 950000, "Válido"],
  ["Nelly Súa Estepa", 1100000, 100000, 0, 0, 1200000, "Válido"],
  ["Felipe Aguilar Sua", 1200000, 200000, 0, 0, 1400000, "Válido"],
  ["Esteban Aguilar Sua", 800000, 120000, 0, 0, 920000, "Válido"],
  ["Edilsa Estepa", 600000, 80000, 0, 0, 680000, "Válido"],
  ["Eleuterio Estepa", 500000, 90000, 0, 0, 590000, "Válido"],
  ["Carlos Gaitán", 700000, 110000, 0, 0, 810000, "Válido"],
  ["Arelis Sua", 1000000, 100000, 0, 0, 1100000, "Válido"]
] as const;

export const utilityBaseRows = [
  [1, "Camilo Perez", 2850000, "7,93%", 0, "Pendiente"],
  [2, "Nelly Súa Estepa", 2400000, "6,68%", 0, "Pendiente"],
  [3, "Felipe Aguilar Sua", 2100000, "5,85%", 0, "Pendiente"],
  [4, "Esteban Aguilar Sua", 2000000, "5,57%", 0, "Pendiente"],
  [5, "Luciana Gaitán", 1900000, "5,29%", 0, "Pendiente"],
  [6, "Carlos Gaitán", 1750000, "4,87%", 0, "Pendiente"]
] as const;

export const auditEvents = [
  ["14 may 2024 10:35", "Sonia Perez", "Usuarios", "Editar", "Editó el usuario Camilo Perez. Campos modificados: Rol, Estado.", "Completado"],
  ["14 may 2024 09:18", "Sonia Perez", "Movimientos", "Crear", "Creó un movimiento de aporte para Camilo Perez por $150.000.", "Completado"],
  ["13 may 2024 16:42", "Sonia Perez", "Utilidades", "Importar Excel", "Importó archivo aportes_mayo.xlsx (12 registros).", "Completado"],
  ["13 may 2024 11:07", "Sonia Perez", "Estados de cuenta", "Generar", "Generó estado de cuenta de mayo 2024 para 15 usuarios.", "Completado"],
  ["12 may 2024 18:21", "Sistema", "Seguridad", "Inicio de sesión", "Inicio de sesión exitoso desde 192.168.1.45 (Chrome - Windows).", "Completado"],
  ["12 may 2024 16:05", "Sistema", "Seguridad", "Intento fallido", "Intento de inicio de sesión fallido para usuario desconocido.", "Fallido"]
] as const;
