export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableRow<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
};

export type Database = {
  public: {
    Tables: {
      profiles: TableRow<{
        id: string;
        auth_user_id: string | null;
        full_name: string;
        email: string;
        role: "ADMIN" | "AHORRADOR";
        status: string;
        phone: string | null;
        document_id: string | null;
        created_at: string;
        updated_at: string;
      }>;
      accounts: TableRow<{
        id: string;
        profile_id: string;
        account_number: string | null;
        initial_balance: number;
        current_balance: number;
        total_contributions: number;
        total_withdrawals: number;
        total_utilities: number;
        created_at: string;
        updated_at: string;
      }>;
      movements: TableRow<{
        id: string;
        profile_id: string;
        account_id: string;
        created_by: string | null;
        movement_type: "SALDO_INICIAL" | "APORTE" | "RETIRO" | "AJUSTE";
        concept: string;
        description: string | null;
        amount: number;
        balance_after: number;
        movement_date: string;
        created_at: string;
      }>;
      notifications: TableRow<{
        id: string;
        profile_id: string;
        notification_type: "MOVIMIENTO" | "ESTADO_CUENTA" | "SEGURIDAD" | "PERFIL";
        title: string;
        body: string;
        is_read: boolean;
        action_href: string | null;
        created_at: string;
      }>;
      audit_logs: TableRow<{
        id: string;
        actor_profile_id: string | null;
        module: string;
        action: string;
        description: string;
        status: string;
        metadata: Json;
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
