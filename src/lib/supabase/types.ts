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
        must_change_password: boolean;
        password_changed_at: string | null;
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
    Functions: {
      create_internal_user_profile: {
        Args: {
          p_account_number?: string | null;
          p_create_account?: boolean | null;
          p_document_id?: string | null;
          p_email: string;
          p_full_name: string;
          p_initial_balance?: number | null;
          p_initial_balance_date?: string | null;
          p_phone?: string | null;
          p_role: string;
        };
        Returns: Json;
      };
      enable_savings_account: {
        Args: {
          p_account_number?: string | null;
          p_initial_balance?: number | null;
          p_initial_balance_date?: string | null;
          p_profile_id: string;
        };
        Returns: Json;
      };
      mark_password_changed: {
        Args: Record<string, never>;
        Returns: void;
      };
      update_internal_user_profile: {
        Args: {
          p_document_id: string | null;
          p_full_name: string;
          p_phone: string | null;
          p_profile_id: string;
          p_role: "ADMIN" | "AHORRADOR";
          p_status: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
