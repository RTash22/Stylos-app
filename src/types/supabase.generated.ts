export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointment_proposals: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          previous_end_time: string
          previous_start_time: string
          proposed_by: string | null
          proposed_end_time: string
          proposed_start_time: string
          responded_at: string | null
          response_channel: string | null
          status: Database["public"]["Enums"]["proposal_status"]
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          previous_end_time: string
          previous_start_time: string
          proposed_by?: string | null
          proposed_end_time: string
          proposed_start_time: string
          responded_at?: string | null
          response_channel?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          previous_end_time?: string
          previous_start_time?: string
          proposed_by?: string | null
          proposed_end_time?: string
          proposed_start_time?: string
          responded_at?: string | null
          response_channel?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
        }
        Relationships: [
          {
            foreignKeyName: "appointment_proposals_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_proposals_proposed_by_fkey"
            columns: ["proposed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          accepted_at: string | null
          barber_id: string
          cancellation_reason: string | null
          client_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          customer_notes: string | null
          deposit_amount_snapshot: number
          deposit_paid_at: string | null
          end_time: string
          history_notes: string | null
          id: string
          no_show_at: string | null
          payment_deadline: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          products_used: string | null
          recommendations: string | null
          rejection_reason: string | null
          requires_deposit: boolean
          service_id: string
          service_name_snapshot: string
          service_price_snapshot: number
          source: Database["public"]["Enums"]["appointment_source"]
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
          version: number
        }
        Insert: {
          accepted_at?: string | null
          barber_id: string
          cancellation_reason?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_notes?: string | null
          deposit_amount_snapshot?: number
          deposit_paid_at?: string | null
          end_time: string
          history_notes?: string | null
          id?: string
          no_show_at?: string | null
          payment_deadline?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          products_used?: string | null
          recommendations?: string | null
          rejection_reason?: string | null
          requires_deposit?: boolean
          service_id: string
          service_name_snapshot?: string
          service_price_snapshot?: number
          source?: Database["public"]["Enums"]["appointment_source"]
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          version?: number
        }
        Update: {
          accepted_at?: string | null
          barber_id?: string
          cancellation_reason?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_notes?: string | null
          deposit_amount_snapshot?: number
          deposit_paid_at?: string | null
          end_time?: string
          history_notes?: string | null
          id?: string
          no_show_at?: string | null
          payment_deadline?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          products_used?: string | null
          recommendations?: string | null
          rejection_reason?: string | null
          requires_deposit?: boolean
          service_id?: string
          service_name_snapshot?: string
          service_price_snapshot?: number
          source?: Database["public"]["Enums"]["appointment_source"]
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "appointments_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      barber_availability: {
        Row: {
          barber_id: string
          created_at: string
          day_of_week: number
          end_local_time: string
          end_minute: number | null
          id: string
          is_active: boolean
          start_local_time: string
          start_minute: number | null
          updated_at: string
        }
        Insert: {
          barber_id: string
          created_at?: string
          day_of_week: number
          end_local_time: string
          end_minute?: number | null
          id?: string
          is_active?: boolean
          start_local_time: string
          start_minute?: number | null
          updated_at?: string
        }
        Update: {
          barber_id?: string
          created_at?: string
          day_of_week?: number
          end_local_time?: string
          end_minute?: number | null
          id?: string
          is_active?: boolean
          start_local_time?: string
          start_minute?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "barber_availability_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      barber_services: {
        Row: {
          barber_id: string
          created_at: string
          duration_override_minutes: number | null
          is_active: boolean
          price_override: number | null
          service_id: string
          updated_at: string
        }
        Insert: {
          barber_id: string
          created_at?: string
          duration_override_minutes?: number | null
          is_active?: boolean
          price_override?: number | null
          service_id: string
          updated_at?: string
        }
        Update: {
          barber_id?: string
          created_at?: string
          duration_override_minutes?: number | null
          is_active?: boolean
          price_override?: number | null
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "barber_services_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "barber_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      barber_time_off: {
        Row: {
          barber_id: string
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          reason: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          barber_id: string
          created_at?: string
          end_time: string
          id?: string
          is_active?: boolean
          reason?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          barber_id?: string
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          reason?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "barber_time_off_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_tokens: {
        Row: {
          appointment_id: string
          created_at: string
          expires_at: string
          id: string
          purpose: string
          token_hash: string
          used_at: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string
          expires_at: string
          id?: string
          purpose: string
          token_hash: string
          used_at?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          purpose?: string
          token_hash?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_tokens_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          created_at: string
          currency: string
          default_deposit_amount: number
          id: number
          max_booking_days: number
          min_booking_notice_minutes: number
          payment_hold_minutes: number
          salon_name: string
          slot_interval_minutes: number
          strike_limit: number
          timezone: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          default_deposit_amount?: number
          id?: number
          max_booking_days?: number
          min_booking_notice_minutes?: number
          payment_hold_minutes?: number
          salon_name?: string
          slot_interval_minutes?: number
          strike_limit?: number
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          default_deposit_amount?: number
          id?: number
          max_booking_days?: number
          min_booking_notice_minutes?: number
          payment_hold_minutes?: number
          salon_name?: string
          slot_interval_minutes?: number
          strike_limit?: number
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      client_strike_events: {
        Row: {
          appointment_id: string | null
          balance_after: number
          client_id: string
          created_at: string
          created_by: string | null
          delta: number
          id: string
          reason: string
        }
        Insert: {
          appointment_id?: string | null
          balance_after?: number
          client_id: string
          created_at?: string
          created_by?: string | null
          delta: number
          id?: string
          reason: string
        }
        Update: {
          appointment_id?: string | null
          balance_after?: number
          client_id?: string
          created_at?: string
          created_by?: string | null
          delta?: number
          id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_strike_events_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_strike_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_strike_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          internal_notes: string | null
          phone_e164: string
          strikes: number
          updated_at: string
          whatsapp_opt_in: boolean
          whatsapp_opt_in_at: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          internal_notes?: string | null
          phone_e164: string
          strikes?: number
          updated_at?: string
          whatsapp_opt_in?: boolean
          whatsapp_opt_in_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          internal_notes?: string | null
          phone_e164?: string
          strikes?: number
          updated_at?: string
          whatsapp_opt_in?: boolean
          whatsapp_opt_in_at?: string | null
        }
        Relationships: []
      }
      expo_push_tokens: {
        Row: {
          created_at: string
          device_name: string | null
          expo_push_token: string
          id: string
          is_active: boolean
          last_seen_at: string
          platform: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          expo_push_token: string
          id?: string
          is_active?: boolean
          last_seen_at?: string
          platform?: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          expo_push_token?: string
          id?: string
          is_active?: boolean
          last_seen_at?: string
          platform?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expo_push_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_outbox: {
        Row: {
          aggregate_id: string | null
          aggregate_type: string
          attempts: number
          available_at: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          deduplication_key: string
          event_type: string
          id: number
          last_error: string | null
          locked_at: string | null
          payload: Json
          processed_at: string | null
          recipient_client_id: string | null
          recipient_profile_id: string | null
          status: Database["public"]["Enums"]["notification_status"]
          updated_at: string
        }
        Insert: {
          aggregate_id?: string | null
          aggregate_type: string
          attempts?: number
          available_at?: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          deduplication_key: string
          event_type: string
          id?: never
          last_error?: string | null
          locked_at?: string | null
          payload?: Json
          processed_at?: string | null
          recipient_client_id?: string | null
          recipient_profile_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          updated_at?: string
        }
        Update: {
          aggregate_id?: string | null
          aggregate_type?: string
          attempts?: number
          available_at?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          deduplication_key?: string
          event_type?: string
          id?: never
          last_error?: string | null
          locked_at?: string | null
          payload?: Json
          processed_at?: string | null
          recipient_client_id?: string | null
          recipient_profile_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_outbox_recipient_client_id_fkey"
            columns: ["recipient_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_outbox_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_attempts: {
        Row: {
          amount: number
          appointment_id: string
          checkout_url: string | null
          created_at: string
          currency: string
          expires_at: string
          id: string
          idempotency_key: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_checkout_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          appointment_id: string
          checkout_url?: string | null
          created_at?: string
          currency?: string
          expires_at: string
          id?: string
          idempotency_key?: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_checkout_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          appointment_id?: string
          checkout_url?: string | null
          created_at?: string
          currency?: string
          expires_at?: string
          id?: string
          idempotency_key?: string
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_checkout_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_attempts_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string
          approved_at: string | null
          created_at: string
          currency: string
          id: string
          payment_attempt_id: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id: string
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          appointment_id: string
          approved_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          payment_attempt_id?: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id: string
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          appointment_id?: string
          approved_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          payment_attempt_id?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id?: string
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_attempt_id_fkey"
            columns: ["payment_attempt_id"]
            isOneToOne: false
            referencedRelation: "payment_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          phone_e164: string | null
          role: Database["public"]["Enums"]["profile_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          is_active?: boolean
          phone_e164?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone_e164?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          deposit_amount: number
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deposit_amount?: number
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deposit_amount?: number
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          error_message: string | null
          external_event_id: string
          id: string
          payload: Json
          processed_at: string | null
          provider: Database["public"]["Enums"]["webhook_provider"]
          received_at: string
          status: Database["public"]["Enums"]["webhook_status"]
        }
        Insert: {
          error_message?: string | null
          external_event_id: string
          id?: string
          payload: Json
          processed_at?: string | null
          provider: Database["public"]["Enums"]["webhook_provider"]
          received_at?: string
          status?: Database["public"]["Enums"]["webhook_status"]
        }
        Update: {
          error_message?: string | null
          external_event_id?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: Database["public"]["Enums"]["webhook_provider"]
          received_at?: string
          status?: Database["public"]["Enums"]["webhook_status"]
        }
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          client_id: string
          context: Json
          created_at: string
          expires_at: string | null
          id: string
          last_message_at: string | null
          state: string
          updated_at: string
        }
        Insert: {
          client_id: string
          context?: Json
          created_at?: string
          expires_at?: string | null
          id?: string
          last_message_at?: string | null
          state?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          context?: Json
          created_at?: string
          expires_at?: string | null
          id?: string
          last_message_at?: string | null
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          appointment_id: string | null
          client_id: string | null
          created_at: string
          delivered_at: string | null
          delivery_status: string | null
          direction: Database["public"]["Enums"]["message_direction"]
          failed_at: string | null
          id: string
          message_type: string
          payload: Json
          provider_message_id: string | null
          read_at: string | null
          sent_at: string | null
          template_name: string | null
        }
        Insert: {
          appointment_id?: string | null
          client_id?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string | null
          direction: Database["public"]["Enums"]["message_direction"]
          failed_at?: string | null
          id?: string
          message_type: string
          payload?: Json
          provider_message_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          template_name?: string | null
        }
        Update: {
          appointment_id?: string | null
          client_id?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string | null
          direction?: Database["public"]["Enums"]["message_direction"]
          failed_at?: string | null
          id?: string
          message_type?: string
          payload?: Json
          provider_message_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          template_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_available_slots: {
        Args: { p_barber_id?: string; p_date: string; p_service_id: string }
        Returns: {
          barber_id: string
          barber_name: string
          end_time: string
          start_time: string
        }[]
      }
    }
    Enums: {
      appointment_source: "web" | "whatsapp" | "app" | "admin"
      appointment_status:
        | "pendiente"
        | "confirmada"
        | "reprogramacion_propuesta"
        | "rechazada"
        | "cancelada"
        | "completada"
        | "no_asistio"
        | "expirada"
      message_direction: "entrante" | "saliente"
      notification_channel: "push" | "whatsapp" | "interno"
      notification_status:
        | "pendiente"
        | "procesando"
        | "enviada"
        | "fallida"
        | "cancelada"
      payment_provider: "mercado_pago" | "stripe"
      payment_status:
        | "no_requerido"
        | "pendiente"
        | "aprobado"
        | "rechazado"
        | "cancelado"
        | "reembolsado"
        | "contracargo"
      profile_role: "pendiente" | "peluquero" | "admin"
      proposal_status: "pendiente" | "aceptada" | "rechazada" | "reemplazada"
      webhook_provider: "whatsapp" | "mercado_pago" | "stripe" | "expo"
      webhook_status:
        | "recibido"
        | "procesando"
        | "procesado"
        | "fallido"
        | "ignorado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_source: ["web", "whatsapp", "app", "admin"],
      appointment_status: [
        "pendiente",
        "confirmada",
        "reprogramacion_propuesta",
        "rechazada",
        "cancelada",
        "completada",
        "no_asistio",
        "expirada",
      ],
      message_direction: ["entrante", "saliente"],
      notification_channel: ["push", "whatsapp", "interno"],
      notification_status: [
        "pendiente",
        "procesando",
        "enviada",
        "fallida",
        "cancelada",
      ],
      payment_provider: ["mercado_pago", "stripe"],
      payment_status: [
        "no_requerido",
        "pendiente",
        "aprobado",
        "rechazado",
        "cancelado",
        "reembolsado",
        "contracargo",
      ],
      profile_role: ["pendiente", "peluquero", "admin"],
      proposal_status: ["pendiente", "aceptada", "rechazada", "reemplazada"],
      webhook_provider: ["whatsapp", "mercado_pago", "stripe", "expo"],
      webhook_status: [
        "recibido",
        "procesando",
        "procesado",
        "fallido",
        "ignorado",
      ],
    },
  },
} as const
