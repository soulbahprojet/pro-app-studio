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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_roles: {
        Row: {
          created_at: string
          id: string
          permissions: Json | null
          role_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_commissions: {
        Row: {
          affiliate_id: string
          commission_amount: number
          commission_rate: number
          commission_type: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"]
          id: string
          paid_at: string | null
          referral_id: string
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          commission_amount: number
          commission_rate?: number
          commission_type: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          paid_at?: string | null
          referral_id: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          commission_rate?: number
          commission_type?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          paid_at?: string | null
          referral_id?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          affiliate_id: string
          commission_rate: number | null
          created_at: string
          id: string
          is_active: boolean | null
          seller_id: string
          total_earnings: number | null
        }
        Insert: {
          affiliate_id: string
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          seller_id: string
          total_earnings?: number | null
        }
        Update: {
          affiliate_id?: string
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          seller_id?: string
          total_earnings?: number | null
        }
        Relationships: []
      }
      agent_users: {
        Row: {
          activated_at: string | null
          created_at: string | null
          creator_id: string
          creator_type: string
          device_type: string | null
          email: string | null
          id: string
          invite_token: string | null
          name: string
          phone: string | null
          status: string | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          creator_id: string
          creator_type: string
          device_type?: string | null
          email?: string | null
          id?: string
          invite_token?: string | null
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          creator_id?: string
          creator_type?: string
          device_type?: string | null
          email?: string | null
          id?: string
          invite_token?: string | null
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      agents: {
        Row: {
          can_create_sub_agent: boolean | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          pgd_id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          can_create_sub_agent?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          pgd_id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          can_create_sub_agent?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          pgd_id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      alertes: {
        Row: {
          date_created: string | null
          destinataire_id: string | null
          destinataire_type: Database["public"]["Enums"]["user_type"]
          id: string
          is_read: boolean | null
          message: string
          severity: Database["public"]["Enums"]["alert_severity"] | null
          titre: string
        }
        Insert: {
          date_created?: string | null
          destinataire_id?: string | null
          destinataire_type: Database["public"]["Enums"]["user_type"]
          id?: string
          is_read?: boolean | null
          message: string
          severity?: Database["public"]["Enums"]["alert_severity"] | null
          titre: string
        }
        Update: {
          date_created?: string | null
          destinataire_id?: string | null
          destinataire_type?: Database["public"]["Enums"]["user_type"]
          id?: string
          is_read?: boolean | null
          message?: string
          severity?: Database["public"]["Enums"]["alert_severity"] | null
          titre?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          session_id: string | null
          severity: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          session_id?: string | null
          severity?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          session_id?: string | null
          severity?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed: string | null
          name: string
          priority: number | null
          rule_type: string
          seller_id: string
          updated_at: string | null
        }
        Insert: {
          actions: Json
          conditions: Json
          created_at?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed?: string | null
          name: string
          priority?: number | null
          rule_type: string
          seller_id: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed?: string | null
          name?: string
          priority?: number | null
          rule_type?: string
          seller_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          color: string | null
          courier_id: string
          criteria_met: Json | null
          description: string | null
          earned_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          color?: string | null
          courier_id: string
          criteria_met?: Json | null
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          badge_type?: Database["public"]["Enums"]["badge_type"]
          color?: string | null
          courier_id?: string
          criteria_met?: Json | null
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "badges_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      boost_posts_log: {
        Row: {
          created_at: string | null
          error_message: string | null
          fb_post_id: string | null
          id: number
          payload: Json | null
          plan_tier: string
          product_id: string | null
          status: string
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          fb_post_id?: string | null
          id?: never
          payload?: Json | null
          plan_tier: string
          product_id?: string | null
          status: string
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          fb_post_id?: string | null
          id?: never
          payload?: Json | null
          plan_tier?: string
          product_id?: string | null
          status?: string
          vendor_id?: string
        }
        Relationships: []
      }
      bureaux_syndicaux: {
        Row: {
          country_code: string | null
          country_name: string | null
          date_created: string | null
          email_president: string
          geographic_area_id: string | null
          id: string
          interface_url: string
          is_active: boolean | null
          nom: string
          region: string | null
          token: string
          updated_at: string | null
          ville: string
        }
        Insert: {
          country_code?: string | null
          country_name?: string | null
          date_created?: string | null
          email_president: string
          geographic_area_id?: string | null
          id?: string
          interface_url: string
          is_active?: boolean | null
          nom: string
          region?: string | null
          token: string
          updated_at?: string | null
          ville: string
        }
        Update: {
          country_code?: string | null
          country_name?: string | null
          date_created?: string | null
          email_president?: string
          geographic_area_id?: string | null
          id?: string
          interface_url?: string
          is_active?: boolean | null
          nom?: string
          region?: string | null
          token?: string
          updated_at?: string | null
          ville?: string
        }
        Relationships: [
          {
            foreignKeyName: "bureaux_syndicaux_geographic_area_id_fkey"
            columns: ["geographic_area_id"]
            isOneToOne: false
            referencedRelation: "syndicat_geographic_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      card_daily_usage: {
        Row: {
          cards_created: number | null
          date: string
          id: string
          user_id: string
        }
        Insert: {
          cards_created?: number | null
          date?: string
          id?: string
          user_id: string
        }
        Update: {
          cards_created?: number | null
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      card_notifications: {
        Row: {
          card_id: string | null
          created_at: string
          email_sent: boolean | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          card_id?: string | null
          created_at?: string
          email_sent?: boolean | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          card_id?: string | null
          created_at?: string
          email_sent?: boolean | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_notifications_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "virtual_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_transactions: {
        Row: {
          amount: number | null
          card_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"] | null
          description: string | null
          id: string
          location: string | null
          merchant_name: string | null
          reference_id: string | null
          status: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type_card"]
        }
        Insert: {
          amount?: number | null
          card_id: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"] | null
          description?: string | null
          id?: string
          location?: string | null
          merchant_name?: string | null
          reference_id?: string | null
          status?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type_card"]
        }
        Update: {
          amount?: number | null
          card_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"] | null
          description?: string | null
          id?: string
          location?: string | null
          merchant_name?: string | null
          reference_id?: string | null
          status?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type_card"]
        }
        Relationships: [
          {
            foreignKeyName: "card_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "virtual_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      carrier_options: {
        Row: {
          api_endpoint: string | null
          api_key_hash: string | null
          cost_competitiveness: number | null
          country: string
          coverage_areas: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          performance_rating: number | null
          pricing_model: Json | null
          reliability_score: number | null
          service_types: string[] | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key_hash?: string | null
          cost_competitiveness?: number | null
          country: string
          coverage_areas?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          performance_rating?: number | null
          pricing_model?: Json | null
          reliability_score?: number | null
          service_types?: string[] | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key_hash?: string | null
          cost_competitiveness?: number | null
          country?: string
          coverage_areas?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          performance_rating?: number | null
          pricing_model?: Json | null
          reliability_score?: number | null
          service_types?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      carrier_performance: {
        Row: {
          average_cost: number | null
          average_delivery_time: unknown | null
          carrier_id: string
          created_at: string | null
          currency: string | null
          customer_rating: number | null
          failed_deliveries: number | null
          id: string
          last_updated: string | null
          on_time_percentage: number | null
          route_destination: string
          route_origin: string
          successful_deliveries: number | null
          total_shipments: number | null
        }
        Insert: {
          average_cost?: number | null
          average_delivery_time?: unknown | null
          carrier_id: string
          created_at?: string | null
          currency?: string | null
          customer_rating?: number | null
          failed_deliveries?: number | null
          id?: string
          last_updated?: string | null
          on_time_percentage?: number | null
          route_destination: string
          route_origin: string
          successful_deliveries?: number | null
          total_shipments?: number | null
        }
        Update: {
          average_cost?: number | null
          average_delivery_time?: unknown | null
          carrier_id?: string
          created_at?: string | null
          currency?: string | null
          customer_rating?: number | null
          failed_deliveries?: number | null
          id?: string
          last_updated?: string | null
          on_time_percentage?: number | null
          route_destination?: string
          route_origin?: string
          successful_deliveries?: number | null
          total_shipments?: number | null
        }
        Relationships: []
      }
      commission_settings: {
        Row: {
          base_user_commission: number | null
          id: string
          parent_share_ratio: number | null
          pgd_id: string
          updated_at: string | null
        }
        Insert: {
          base_user_commission?: number | null
          id?: string
          parent_share_ratio?: number | null
          pgd_id: string
          updated_at?: string | null
        }
        Update: {
          base_user_commission?: number | null
          id?: string
          parent_share_ratio?: number | null
          pgd_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      commissions: {
        Row: {
          amount: number
          commission_rate: number
          created_at: string | null
          id: string
          recipient_id: string
          recipient_type: string
          source_type: string
          source_user_id: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          commission_rate: number
          created_at?: string | null
          id?: string
          recipient_id: string
          recipient_type: string
          source_type: string
          source_user_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          commission_rate?: number
          created_at?: string | null
          id?: string
          recipient_id?: string
          recipient_type?: string
          source_type?: string
          source_user_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_source_user_id_fkey"
            columns: ["source_user_id"]
            isOneToOne: false
            referencedRelation: "agent_users"
            referencedColumns: ["id"]
          },
        ]
      }
      communications_technique: {
        Row: {
          contact_method: string
          date_created: string | null
          date_responded: string | null
          id: string
          message: string
          response: string | null
          sender_id: string
          sender_type: Database["public"]["Enums"]["user_type"]
          status: string | null
        }
        Insert: {
          contact_method: string
          date_created?: string | null
          date_responded?: string | null
          id?: string
          message: string
          response?: string | null
          sender_id: string
          sender_type: Database["public"]["Enums"]["user_type"]
          status?: string | null
        }
        Update: {
          contact_method?: string
          date_created?: string | null
          date_responded?: string | null
          id?: string
          message?: string
          response?: string | null
          sender_id?: string
          sender_type?: Database["public"]["Enums"]["user_type"]
          status?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          client_id: string
          created_at: string
          id: string
          seller_id: string | null
          status: string | null
          subject: string | null
          support_id: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          seller_id?: string | null
          status?: string | null
          subject?: string | null
          support_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          seller_id?: string | null
          status?: string | null
          subject?: string | null
          support_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      country_currencies: {
        Row: {
          country_code: string
          country_name: string
          created_at: string | null
          currency_name: string
          currency_symbol: string
          default_currency: string
          id: string
          updated_at: string | null
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string | null
          currency_name: string
          currency_symbol: string
          default_currency: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string | null
          currency_name?: string
          currency_symbol?: string
          default_currency?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          country_code: string | null
          country_name: string | null
          created_at: string | null
          decimal_places: number | null
          id: string
          is_crypto: boolean | null
          name: string
          status: Database["public"]["Enums"]["currency_status"] | null
          symbol: string
          updated_at: string | null
        }
        Insert: {
          code: string
          country_code?: string | null
          country_name?: string | null
          created_at?: string | null
          decimal_places?: number | null
          id?: string
          is_crypto?: boolean | null
          name: string
          status?: Database["public"]["Enums"]["currency_status"] | null
          symbol: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          country_code?: string | null
          country_name?: string | null
          created_at?: string | null
          decimal_places?: number | null
          id?: string
          is_crypto?: boolean | null
          name?: string
          status?: Database["public"]["Enums"]["currency_status"] | null
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_claims: {
        Row: {
          assigned_to: string | null
          claim_number: string
          claim_type: string
          compensation_currency:
            | Database["public"]["Enums"]["currency_type"]
            | null
          compensation_requested: number | null
          created_at: string
          customer_id: string
          description: string
          forwarder_id: string
          id: string
          priority: number | null
          resolution_notes: string | null
          resolved_at: string | null
          shipment_id: string
          status: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          claim_number?: string
          claim_type: string
          compensation_currency?:
            | Database["public"]["Enums"]["currency_type"]
            | null
          compensation_requested?: number | null
          created_at?: string
          customer_id: string
          description: string
          forwarder_id: string
          id?: string
          priority?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          shipment_id: string
          status?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          claim_number?: string
          claim_type?: string
          compensation_currency?:
            | Database["public"]["Enums"]["currency_type"]
            | null
          compensation_requested?: number | null
          created_at?: string
          customer_id?: string
          description?: string
          forwarder_id?: string
          id?: string
          priority?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          shipment_id?: string
          status?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_claims_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "freight_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_claims_forwarder_id_fkey"
            columns: ["forwarder_id"]
            isOneToOne: false
            referencedRelation: "freight_forwarders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_claims_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "international_shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_claims_extended: {
        Row: {
          assigned_to: string | null
          claim_number: string
          claim_type: string
          claimed_amount: number | null
          compensation_amount: number | null
          created_at: string | null
          currency: string | null
          customer_id: string
          description: string
          evidence_files: Json | null
          forwarder_id: string
          id: string
          priority: number | null
          resolution_notes: string | null
          resolved_at: string | null
          shipment_id: string
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          claim_number: string
          claim_type: string
          claimed_amount?: number | null
          compensation_amount?: number | null
          created_at?: string | null
          currency?: string | null
          customer_id: string
          description: string
          evidence_files?: Json | null
          forwarder_id: string
          id?: string
          priority?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          shipment_id: string
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          claim_number?: string
          claim_type?: string
          claimed_amount?: number | null
          compensation_amount?: number | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string
          description?: string
          evidence_files?: Json | null
          forwarder_id?: string
          id?: string
          priority?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          shipment_id?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_claims_extended_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "freight_employees_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_claims_extended_forwarder_id_fkey"
            columns: ["forwarder_id"]
            isOneToOne: false
            referencedRelation: "freight_forwarder_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_claims_extended_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_international_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      customs_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_size: number | null
          file_url: string
          id: string
          is_required: boolean | null
          is_verified: boolean | null
          notes: string | null
          shipment_id: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_size?: number | null
          file_url: string
          id?: string
          is_required?: boolean | null
          is_verified?: boolean | null
          notes?: string | null
          shipment_id: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_size?: number | null
          file_url?: string
          id?: string
          is_required?: boolean | null
          is_verified?: boolean | null
          notes?: string | null
          shipment_id?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customs_documents_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "international_shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customs_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "freight_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      customs_documents_complete: {
        Row: {
          created_at: string
          document_name: string
          document_number: string | null
          document_type: string
          expiry_date: string | null
          file_size: number | null
          file_url: string
          id: string
          is_verified: boolean | null
          issued_by: string | null
          mime_type: string | null
          rejection_reason: string | null
          shipment_id: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_name: string
          document_number?: string | null
          document_type: string
          expiry_date?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          is_verified?: boolean | null
          issued_by?: string | null
          mime_type?: string | null
          rejection_reason?: string | null
          shipment_id: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_name?: string
          document_number?: string | null
          document_type?: string
          expiry_date?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_verified?: boolean | null
          issued_by?: string | null
          mime_type?: string | null
          rejection_reason?: string | null
          shipment_id?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customs_documents_complete_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "international_shipments_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      customs_documents_extended: {
        Row: {
          created_at: string | null
          document_name: string
          document_type: string
          expiry_date: string | null
          file_size: number | null
          file_url: string
          id: string
          is_required: boolean | null
          is_verified: boolean | null
          mime_type: string | null
          notes: string | null
          shipment_id: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          is_required?: boolean | null
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          shipment_id: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_required?: boolean | null
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          shipment_id?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customs_documents_extended_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_international_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customs_documents_extended_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "freight_employees_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_payments: {
        Row: {
          amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"]
          debt_id: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          recorded_by: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          debt_id: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          recorded_by: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          debt_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          recorded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "user_debts"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_reminders: {
        Row: {
          created_at: string
          debt_id: string
          id: string
          reminder_type: string
          sent_at: string
          status: string
        }
        Insert: {
          created_at?: string
          debt_id: string
          id?: string
          reminder_type?: string
          sent_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          debt_id?: string
          id?: string
          reminder_type?: string
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_reminders_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "user_debts"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_tracking: {
        Row: {
          courier_id: string | null
          courier_notes: string | null
          created_at: string
          customer_notes: string | null
          delivered_at: string | null
          delivery_location: string | null
          id: string
          order_id: string
          pickup_location: string | null
          qr_code: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          courier_id?: string | null
          courier_notes?: string | null
          created_at?: string
          customer_notes?: string | null
          delivered_at?: string | null
          delivery_location?: string | null
          id?: string
          order_id: string
          pickup_location?: string | null
          qr_code?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          courier_id?: string | null
          courier_notes?: string | null
          created_at?: string
          customer_notes?: string | null
          delivered_at?: string | null
          delivery_location?: string | null
          id?: string
          order_id?: string
          pickup_location?: string | null
          qr_code?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      device_security: {
        Row: {
          blocked_at: string | null
          blocked_reason: string | null
          created_at: string | null
          data_wiped_at: string | null
          device_brand: string | null
          device_imei: string
          device_model: string | null
          device_os: string | null
          first_registered_at: string | null
          id: string
          is_active: boolean | null
          is_blocked: boolean | null
          is_primary_device: boolean | null
          last_seen_at: string | null
          security_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_reason?: string | null
          created_at?: string | null
          data_wiped_at?: string | null
          device_brand?: string | null
          device_imei: string
          device_model?: string | null
          device_os?: string | null
          first_registered_at?: string | null
          id?: string
          is_active?: boolean | null
          is_blocked?: boolean | null
          is_primary_device?: boolean | null
          last_seen_at?: string | null
          security_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          blocked_at?: string | null
          blocked_reason?: string | null
          created_at?: string | null
          data_wiped_at?: string | null
          device_brand?: string | null
          device_imei?: string
          device_model?: string | null
          device_os?: string | null
          first_registered_at?: string | null
          id?: string
          is_active?: boolean | null
          is_blocked?: boolean | null
          is_primary_device?: boolean | null
          last_seen_at?: string | null
          security_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      digital_access: {
        Row: {
          access_token: string | null
          created_at: string
          customer_id: string
          download_count: number | null
          download_limit: number
          expires_at: string | null
          id: string
          product_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          customer_id: string
          download_count?: number | null
          download_limit: number
          expires_at?: string | null
          id?: string
          product_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          customer_id?: string
          download_count?: number | null
          download_limit?: number
          expires_at?: string | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_access_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "digital_access_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "digital_access_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          shop_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          shop_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          shop_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_categories_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "digital_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_sales: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          customer_id: string
          delivered_at: string | null
          id: string
          payment_method: string | null
          payment_status: string | null
          product_id: string
          seller_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          customer_id: string
          delivered_at?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          product_id: string
          seller_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          customer_id?: string
          delivered_at?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          product_id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_shops: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      draft_orders: {
        Row: {
          buyer_email: string
          buyer_id: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"]
          delivery_terms: string | null
          escrow_created_at: string | null
          expires_at: string | null
          id: string
          items: Json
          notes: string | null
          paid_at: string | null
          payment_link_url: string | null
          payment_terms: string | null
          pi_number: string
          seller_id: string
          shipping_amount: number
          status: string
          stripe_invoice_id: string | null
          stripe_payment_link_id: string | null
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          buyer_email: string
          buyer_id?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          delivery_terms?: string | null
          escrow_created_at?: string | null
          expires_at?: string | null
          id?: string
          items?: Json
          notes?: string | null
          paid_at?: string | null
          payment_link_url?: string | null
          payment_terms?: string | null
          pi_number?: string
          seller_id: string
          shipping_amount?: number
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_link_id?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          buyer_email?: string
          buyer_id?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          delivery_terms?: string | null
          escrow_created_at?: string | null
          expires_at?: string | null
          id?: string
          items?: Json
          notes?: string | null
          paid_at?: string | null
          payment_link_url?: string | null
          payment_terms?: string | null
          pi_number?: string
          seller_id?: string
          shipping_amount?: number
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_link_id?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      driver_reviews: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string | null
          driver_id: string
          id: string
          is_verified: boolean | null
          rating: number
          ride_id: string | null
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string | null
          driver_id: string
          id?: string
          is_verified?: boolean | null
          rating: number
          ride_id?: string | null
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string | null
          driver_id?: string
          id?: string
          is_verified?: boolean | null
          rating?: number
          ride_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_reviews_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_reviews_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          reference_id: string | null
          ride_id: string | null
          status: string | null
          type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          ride_id?: string | null
          status?: string | null
          type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          ride_id?: string | null
          status?: string | null
          type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_transactions_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "driver_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_wallets: {
        Row: {
          balance_eur: number | null
          balance_gnf: number | null
          balance_usd: number | null
          created_at: string | null
          driver_id: string
          id: string
          is_active: boolean | null
          total_earned: number | null
          total_withdrawn: number | null
          updated_at: string | null
        }
        Insert: {
          balance_eur?: number | null
          balance_gnf?: number | null
          balance_usd?: number | null
          created_at?: string | null
          driver_id: string
          id?: string
          is_active?: boolean | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
        }
        Update: {
          balance_eur?: number | null
          balance_gnf?: number | null
          balance_usd?: number | null
          created_at?: string | null
          driver_id?: string
          id?: string
          is_active?: boolean | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_wallets_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_location_update: string | null
          license_number: string
          rating_average: number | null
          total_earnings: number | null
          total_rides: number | null
          updated_at: string | null
          user_id: string
          vehicle_color: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_type: string
          vehicle_year: number | null
        }
        Insert: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_location_update?: string | null
          license_number: string
          rating_average?: number | null
          total_earnings?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_color?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string
          vehicle_year?: number | null
        }
        Update: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_location_update?: string | null
          license_number?: string
          rating_average?: number | null
          total_earnings?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_color?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string
          vehicle_year?: number | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          employee_id: string
          hired_at: string | null
          id: string
          is_active: boolean | null
          permissions: string[] | null
          role: string
          seller_id: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          hired_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: string[] | null
          role: string
          seller_id: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          hired_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: string[] | null
          role?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employees_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "employees_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      escrow_transactions: {
        Row: {
          commission_amount: number
          commission_rate: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"]
          customer_id: string
          delivery_confirmed_at: string | null
          disputed_at: string | null
          id: string
          order_id: string | null
          released_at: string | null
          resolution: string | null
          seller_amount: number
          seller_id: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          commission_amount: number
          commission_rate?: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_type"]
          customer_id: string
          delivery_confirmed_at?: string | null
          disputed_at?: string | null
          id?: string
          order_id?: string | null
          released_at?: string | null
          resolution?: string | null
          seller_amount: number
          seller_id: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          customer_id?: string
          delivery_confirmed_at?: string | null
          disputed_at?: string | null
          id?: string
          order_id?: string | null
          released_at?: string | null
          resolution?: string | null
          seller_amount?: number
          seller_id?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          base_currency: string
          id: string
          last_updated: string | null
          rate: number
          source: string | null
          target_currency: string
        }
        Insert: {
          base_currency?: string
          id?: string
          last_updated?: string | null
          rate: number
          source?: string | null
          target_currency: string
        }
        Update: {
          base_currency?: string
          id?: string
          last_updated?: string | null
          rate?: number
          source?: string | null
          target_currency?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_versions: {
        Row: {
          changelog: string | null
          feature_id: string
          id: string
          is_current: boolean | null
          release_date: string | null
          version_number: string
        }
        Insert: {
          changelog?: string | null
          feature_id: string
          id?: string
          is_current?: boolean | null
          release_date?: string | null
          version_number: string
        }
        Update: {
          changelog?: string | null
          feature_id?: string
          id?: string
          is_current?: boolean | null
          release_date?: string | null
          version_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_versions_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "fonctionnalites"
            referencedColumns: ["id"]
          },
        ]
      }
      fonctionnalites: {
        Row: {
          date_created: string | null
          description: string | null
          id: string
          is_active: boolean | null
          nom: string
          type_utilisateur: Database["public"]["Enums"]["user_type"]
          version: string
        }
        Insert: {
          date_created?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          nom: string
          type_utilisateur: Database["public"]["Enums"]["user_type"]
          version: string
        }
        Update: {
          date_created?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          nom?: string
          type_utilisateur?: Database["public"]["Enums"]["user_type"]
          version?: string
        }
        Relationships: []
      }
      fraud_detection: {
        Row: {
          action_taken: string | null
          ai_analysis: Json | null
          created_at: string | null
          entity_id: string
          entity_type: string
          flags: Json | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string
          risk_score: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          action_taken?: string | null
          ai_analysis?: Json | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          flags?: Json | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string
          risk_score?: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          action_taken?: string | null
          ai_analysis?: Json | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          flags?: Json | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string
          risk_score?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      freight_employees: {
        Row: {
          assigned_warehouses: string[] | null
          created_at: string
          employee_role: Database["public"]["Enums"]["freight_forwarder_role"]
          forwarder_id: string
          hired_at: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_warehouses?: string[] | null
          created_at?: string
          employee_role: Database["public"]["Enums"]["freight_forwarder_role"]
          forwarder_id: string
          hired_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_warehouses?: string[] | null
          created_at?: string
          employee_role?: Database["public"]["Enums"]["freight_forwarder_role"]
          forwarder_id?: string
          hired_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freight_employees_forwarder_id_fkey"
            columns: ["forwarder_id"]
            isOneToOne: false
            referencedRelation: "freight_forwarders"
            referencedColumns: ["id"]
          },
        ]
      }
      freight_employees_extended: {
        Row: {
          access_level: number | null
          assigned_routes: string[] | null
          assigned_warehouses: string[] | null
          created_at: string | null
          email: string
          employee_code: string | null
          first_name: string
          forwarder_id: string
          hired_at: string | null
          id: string
          is_active: boolean | null
          last_activity: string | null
          last_name: string
          performance_metrics: Json | null
          permissions: Json | null
          phone: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_level?: number | null
          assigned_routes?: string[] | null
          assigned_warehouses?: string[] | null
          created_at?: string | null
          email: string
          employee_code?: string | null
          first_name: string
          forwarder_id: string
          hired_at?: string | null
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          last_name: string
          performance_metrics?: Json | null
          permissions?: Json | null
          phone?: string | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_level?: number | null
          assigned_routes?: string[] | null
          assigned_warehouses?: string[] | null
          created_at?: string | null
          email?: string
          employee_code?: string | null
          first_name?: string
          forwarder_id?: string
          hired_at?: string | null
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          last_name?: string
          performance_metrics?: Json | null
          permissions?: Json | null
          phone?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freight_employees_extended_forwarder_id_fkey"
            columns: ["forwarder_id"]
            isOneToOne: false
            referencedRelation: "freight_forwarder_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      freight_forwarder_profiles: {
        Row: {
          certifications: Json | null
          city: string
          company_address: string
          company_name: string
          country: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          licenses: Json | null
          operating_countries: string[] | null
          phone: string
          postal_code: string | null
          storage_capacity_m3: number | null
          subscription_expires_at: string | null
          subscription_plan: string | null
          transport_types: string[] | null
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          certifications?: Json | null
          city: string
          company_address: string
          company_name: string
          country: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          licenses?: Json | null
          operating_countries?: string[] | null
          phone: string
          postal_code?: string | null
          storage_capacity_m3?: number | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          transport_types?: string[] | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          certifications?: Json | null
          city?: string
          company_address?: string
          company_name?: string
          country?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          licenses?: Json | null
          operating_countries?: string[] | null
          phone?: string
          postal_code?: string | null
          storage_capacity_m3?: number | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          transport_types?: string[] | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      freight_forwarders: {
        Row: {
          company_name: string
          contact_email: string
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          license_number: string | null
          operating_countries: string[] | null
          rating: number | null
          registration_number: string | null
          services_offered: string[] | null
          subscription_expires_at: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          tax_id: string | null
          total_shipments: number | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          company_name: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          license_number?: string | null
          operating_countries?: string[] | null
          rating?: number | null
          registration_number?: string | null
          services_offered?: string[] | null
          subscription_expires_at?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          tax_id?: string | null
          total_shipments?: number | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          company_name?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          license_number?: string | null
          operating_countries?: string[] | null
          rating?: number | null
          registration_number?: string | null
          services_offered?: string[] | null
          subscription_expires_at?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          tax_id?: string | null
          total_shipments?: number | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      freight_rates: {
        Row: {
          base_rate_per_kg: number
          base_rate_per_m3: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"] | null
          customs_clearance_fee: number | null
          destination_country: string
          documentation_fee: number | null
          forwarder_id: string
          fuel_surcharge_rate: number | null
          handling_fee: number | null
          id: string
          is_active: boolean | null
          minimum_charge: number
          origin_country: string
          service_type: string
          transport_mode: Database["public"]["Enums"]["transport_mode"]
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          base_rate_per_kg: number
          base_rate_per_m3: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"] | null
          customs_clearance_fee?: number | null
          destination_country: string
          documentation_fee?: number | null
          forwarder_id: string
          fuel_surcharge_rate?: number | null
          handling_fee?: number | null
          id?: string
          is_active?: boolean | null
          minimum_charge: number
          origin_country: string
          service_type: string
          transport_mode: Database["public"]["Enums"]["transport_mode"]
          updated_at?: string
          valid_from: string
          valid_until?: string | null
        }
        Update: {
          base_rate_per_kg?: number
          base_rate_per_m3?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"] | null
          customs_clearance_fee?: number | null
          destination_country?: string
          documentation_fee?: number | null
          forwarder_id?: string
          fuel_surcharge_rate?: number | null
          handling_fee?: number | null
          id?: string
          is_active?: boolean | null
          minimum_charge?: number
          origin_country?: string
          service_type?: string
          transport_mode?: Database["public"]["Enums"]["transport_mode"]
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freight_rates_forwarder_id_fkey"
            columns: ["forwarder_id"]
            isOneToOne: false
            referencedRelation: "freight_forwarders"
            referencedColumns: ["id"]
          },
        ]
      }
      freight_rates_extended: {
        Row: {
          base_rate_per_kg: number
          base_rate_per_m3: number | null
          cargo_type: string | null
          created_at: string | null
          currency: string | null
          customs_clearance_fee: number | null
          destination_country: string
          forwarder_id: string
          fuel_surcharge_percentage: number | null
          handling_fee: number | null
          id: string
          insurance_rate_percentage: number | null
          is_active: boolean | null
          minimum_charge: number
          origin_country: string
          service_type: string
          transport_mode: string
          updated_at: string | null
          valid_from: string
          valid_until: string | null
          weight_from_kg: number | null
          weight_to_kg: number | null
        }
        Insert: {
          base_rate_per_kg: number
          base_rate_per_m3?: number | null
          cargo_type?: string | null
          created_at?: string | null
          currency?: string | null
          customs_clearance_fee?: number | null
          destination_country: string
          forwarder_id: string
          fuel_surcharge_percentage?: number | null
          handling_fee?: number | null
          id?: string
          insurance_rate_percentage?: number | null
          is_active?: boolean | null
          minimum_charge: number
          origin_country: string
          service_type: string
          transport_mode: string
          updated_at?: string | null
          valid_from: string
          valid_until?: string | null
          weight_from_kg?: number | null
          weight_to_kg?: number | null
        }
        Update: {
          base_rate_per_kg?: number
          base_rate_per_m3?: number | null
          cargo_type?: string | null
          created_at?: string | null
          currency?: string | null
          customs_clearance_fee?: number | null
          destination_country?: string
          forwarder_id?: string
          fuel_surcharge_percentage?: number | null
          handling_fee?: number | null
          id?: string
          insurance_rate_percentage?: number | null
          is_active?: boolean | null
          minimum_charge?: number
          origin_country?: string
          service_type?: string
          transport_mode?: string
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
          weight_from_kg?: number | null
          weight_to_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "freight_rates_extended_forwarder_id_fkey"
            columns: ["forwarder_id"]
            isOneToOne: false
            referencedRelation: "freight_forwarder_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      freight_warehouses: {
        Row: {
          address: string
          capacity_m3: number | null
          city: string
          contact_person: string | null
          contact_phone: string | null
          country: string
          created_at: string
          forwarder_id: string
          has_cold_storage: boolean | null
          has_dangerous_goods: boolean | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          operating_hours: Json | null
          postal_code: string | null
          specializations: Database["public"]["Enums"]["cargo_type"][] | null
          updated_at: string
        }
        Insert: {
          address: string
          capacity_m3?: number | null
          city: string
          contact_person?: string | null
          contact_phone?: string | null
          country: string
          created_at?: string
          forwarder_id: string
          has_cold_storage?: boolean | null
          has_dangerous_goods?: boolean | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          operating_hours?: Json | null
          postal_code?: string | null
          specializations?: Database["public"]["Enums"]["cargo_type"][] | null
          updated_at?: string
        }
        Update: {
          address?: string
          capacity_m3?: number | null
          city?: string
          contact_person?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          forwarder_id?: string
          has_cold_storage?: boolean | null
          has_dangerous_goods?: boolean | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          operating_hours?: Json | null
          postal_code?: string | null
          specializations?: Database["public"]["Enums"]["cargo_type"][] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "freight_warehouses_forwarder_id_fkey"
            columns: ["forwarder_id"]
            isOneToOne: false
            referencedRelation: "freight_forwarders"
            referencedColumns: ["id"]
          },
        ]
      }
      freight_warehouses_extended: {
        Row: {
          address: string
          allowed_cargo_types: string[] | null
          capacity_m3: number | null
          city: string
          contact_person: string | null
          contact_phone: string | null
          country: string
          created_at: string | null
          current_occupancy_m3: number | null
          customs_clearance: boolean | null
          forwarder_id: string
          humidity_controlled: boolean | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          operating_hours: Json | null
          postal_code: string | null
          security_level: number | null
          special_equipment: Json | null
          temperature_controlled: boolean | null
          updated_at: string | null
        }
        Insert: {
          address: string
          allowed_cargo_types?: string[] | null
          capacity_m3?: number | null
          city: string
          contact_person?: string | null
          contact_phone?: string | null
          country: string
          created_at?: string | null
          current_occupancy_m3?: number | null
          customs_clearance?: boolean | null
          forwarder_id: string
          humidity_controlled?: boolean | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          operating_hours?: Json | null
          postal_code?: string | null
          security_level?: number | null
          special_equipment?: Json | null
          temperature_controlled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          allowed_cargo_types?: string[] | null
          capacity_m3?: number | null
          city?: string
          contact_person?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string | null
          current_occupancy_m3?: number | null
          customs_clearance?: boolean | null
          forwarder_id?: string
          humidity_controlled?: boolean | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          operating_hours?: Json | null
          postal_code?: string | null
          security_level?: number | null
          special_equipment?: Json | null
          temperature_controlled?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freight_warehouses_extended_forwarder_id_fkey"
            columns: ["forwarder_id"]
            isOneToOne: false
            referencedRelation: "freight_forwarder_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gps_tracking: {
        Row: {
          accuracy: number | null
          altitude: number | null
          created_at: string | null
          heading: number | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          order_id: string | null
          speed: number | null
          timestamp: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          created_at?: string | null
          heading?: number | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          order_id?: string | null
          speed?: number | null
          timestamp?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          created_at?: string | null
          heading?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          order_id?: string | null
          speed?: number | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gps_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      id_transfers: {
        Row: {
          approved_at: string | null
          completed_at: string | null
          courier_id: string
          from_city: string
          from_union_id: string | null
          id: string
          notes: string | null
          reason: string | null
          requested_at: string | null
          status: string | null
          to_city: string
          to_union_id: string | null
        }
        Insert: {
          approved_at?: string | null
          completed_at?: string | null
          courier_id: string
          from_city: string
          from_union_id?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          requested_at?: string | null
          status?: string | null
          to_city: string
          to_union_id?: string | null
        }
        Update: {
          approved_at?: string | null
          completed_at?: string | null
          courier_id?: string
          from_city?: string
          from_union_id?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          requested_at?: string | null
          status?: string | null
          to_city?: string
          to_union_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "id_transfers_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "id_transfers_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "id_transfers_from_union_id_fkey"
            columns: ["from_union_id"]
            isOneToOne: false
            referencedRelation: "unions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "id_transfers_to_union_id_fkey"
            columns: ["to_union_id"]
            isOneToOne: false
            referencedRelation: "unions"
            referencedColumns: ["id"]
          },
        ]
      }
      imei_reports: {
        Row: {
          created_at: string | null
          device_imei: string
          id: string
          last_known_location: Json | null
          official_report_number: string | null
          report_date: string
          report_type: string
          status: string | null
          updated_at: string | null
          user_declaration: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_imei: string
          id?: string
          last_known_location?: Json | null
          official_report_number?: string | null
          report_date?: string
          report_type?: string
          status?: string | null
          updated_at?: string | null
          user_declaration: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_imei?: string
          id?: string
          last_known_location?: Json | null
          official_report_number?: string | null
          report_date?: string
          report_type?: string
          status?: string | null
          updated_at?: string | null
          user_declaration?: string
          user_id?: string
        }
        Relationships: []
      }
      intelligent_notifications: {
        Row: {
          action_taken: string | null
          channels: string[] | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          priority: string | null
          read_at: string | null
          recipient_id: string
          sent_at: string | null
          title: string
        }
        Insert: {
          action_taken?: string | null
          channels?: string[] | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          priority?: string | null
          read_at?: string | null
          recipient_id: string
          sent_at?: string | null
          title: string
        }
        Update: {
          action_taken?: string | null
          channels?: string[] | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          recipient_id?: string
          sent_at?: string | null
          title?: string
        }
        Relationships: []
      }
      international_shipments: {
        Row: {
          actual_delivery_date: string | null
          assigned_warehouse_id: string | null
          base_price: number
          cargo_type: Database["public"]["Enums"]["cargo_type"]
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"] | null
          customer_id: string
          customs_fee: number | null
          description: string
          dimensions_cm: Json | null
          estimated_delivery: string | null
          forwarder_id: string
          handling_fee: number | null
          has_insurance: boolean | null
          id: string
          incoterm: Database["public"]["Enums"]["incoterm"]
          insurance_amount: number | null
          insurance_fee: number | null
          pickup_date: string | null
          priority: number | null
          recipient_address: string
          recipient_city: string
          recipient_country: string
          recipient_email: string | null
          recipient_name: string
          recipient_phone: string | null
          sender_address: string
          sender_city: string
          sender_country: string
          sender_email: string | null
          sender_name: string
          sender_phone: string | null
          service_type: string
          special_instructions: string | null
          status: string
          total_price: number
          tracking_code: string
          transport_mode: Database["public"]["Enums"]["transport_mode"]
          updated_at: string
          value_usd: number | null
          volume_m3: number | null
          weight_kg: number
        }
        Insert: {
          actual_delivery_date?: string | null
          assigned_warehouse_id?: string | null
          base_price: number
          cargo_type?: Database["public"]["Enums"]["cargo_type"]
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"] | null
          customer_id: string
          customs_fee?: number | null
          description: string
          dimensions_cm?: Json | null
          estimated_delivery?: string | null
          forwarder_id: string
          handling_fee?: number | null
          has_insurance?: boolean | null
          id?: string
          incoterm?: Database["public"]["Enums"]["incoterm"]
          insurance_amount?: number | null
          insurance_fee?: number | null
          pickup_date?: string | null
          priority?: number | null
          recipient_address: string
          recipient_city: string
          recipient_country: string
          recipient_email?: string | null
          recipient_name: string
          recipient_phone?: string | null
          sender_address: string
          sender_city: string
          sender_country: string
          sender_email?: string | null
          sender_name: string
          sender_phone?: string | null
          service_type: string
          special_instructions?: string | null
          status?: string
          total_price: number
          tracking_code?: string
          transport_mode: Database["public"]["Enums"]["transport_mode"]
          updated_at?: string
          value_usd?: number | null
          volume_m3?: number | null
          weight_kg: number
        }
        Update: {
          actual_delivery_date?: string | null
          assigned_warehouse_id?: string | null
          base_price?: number
          cargo_type?: Database["public"]["Enums"]["cargo_type"]
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"] | null
          customer_id?: string
          customs_fee?: number | null
          description?: string
          dimensions_cm?: Json | null
          estimated_delivery?: string | null
          forwarder_id?: string
          handling_fee?: number | null
          has_insurance?: boolean | null
          id?: string
          incoterm?: Database["public"]["Enums"]["incoterm"]
          insurance_amount?: number | null
          insurance_fee?: number | null
          pickup_date?: string | null
          priority?: number | null
          recipient_address?: string
          recipient_city?: string
          recipient_country?: string
          recipient_email?: string | null
          recipient_name?: string
          recipient_phone?: string | null
          sender_address?: string
          sender_city?: string
          sender_country?: string
          sender_email?: string | null
          sender_name?: string
          sender_phone?: string | null
          service_type?: string
          special_instructions?: string | null
          status?: string
          total_price?: number
          tracking_code?: string
          transport_mode?: Database["public"]["Enums"]["transport_mode"]
          updated_at?: string
          value_usd?: number | null
          volume_m3?: number | null
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "international_shipments_assigned_warehouse_id_fkey"
            columns: ["assigned_warehouse_id"]
            isOneToOne: false
            referencedRelation: "freight_warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "international_shipments_forwarder_id_fkey"
            columns: ["forwarder_id"]
            isOneToOne: false
            referencedRelation: "freight_forwarders"
            referencedColumns: ["id"]
          },
        ]
      }
      international_shipments_complete: {
        Row: {
          actual_delivery_date: string | null
          awb_number: string | null
          bl_number: string | null
          carrier_name: string | null
          carrier_service: string | null
          commodity_currency: string | null
          commodity_description: string | null
          commodity_type: string
          commodity_value: number | null
          created_at: string
          currency: string | null
          current_location: Json | null
          customer_id: string
          customs_declaration_number: string | null
          customs_duties: number | null
          estimated_delivery_date: string | null
          forwarder_id: string | null
          height_cm: number
          id: string
          insurance_cost: number | null
          insurance_required: boolean | null
          insurance_value: number | null
          internal_notes: string | null
          is_dangerous_goods: boolean | null
          is_fragile: boolean | null
          length_cm: number
          pickup_date: string | null
          recipient_address: string
          recipient_city: string
          recipient_country: string
          recipient_email: string | null
          recipient_name: string
          recipient_phone: string | null
          recipient_postal_code: string | null
          route_history: Json | null
          sender_address: string
          sender_city: string
          sender_country: string
          sender_email: string | null
          sender_name: string
          sender_phone: string | null
          sender_postal_code: string | null
          service_type: string
          shipping_cost: number | null
          special_instructions: string | null
          status: string
          total_cost: number | null
          tracking_code: string
          transport_mode: string
          updated_at: string
          volume_m3: number | null
          weight_kg: number
          width_cm: number
        }
        Insert: {
          actual_delivery_date?: string | null
          awb_number?: string | null
          bl_number?: string | null
          carrier_name?: string | null
          carrier_service?: string | null
          commodity_currency?: string | null
          commodity_description?: string | null
          commodity_type: string
          commodity_value?: number | null
          created_at?: string
          currency?: string | null
          current_location?: Json | null
          customer_id: string
          customs_declaration_number?: string | null
          customs_duties?: number | null
          estimated_delivery_date?: string | null
          forwarder_id?: string | null
          height_cm: number
          id?: string
          insurance_cost?: number | null
          insurance_required?: boolean | null
          insurance_value?: number | null
          internal_notes?: string | null
          is_dangerous_goods?: boolean | null
          is_fragile?: boolean | null
          length_cm: number
          pickup_date?: string | null
          recipient_address: string
          recipient_city: string
          recipient_country: string
          recipient_email?: string | null
          recipient_name: string
          recipient_phone?: string | null
          recipient_postal_code?: string | null
          route_history?: Json | null
          sender_address: string
          sender_city: string
          sender_country: string
          sender_email?: string | null
          sender_name: string
          sender_phone?: string | null
          sender_postal_code?: string | null
          service_type?: string
          shipping_cost?: number | null
          special_instructions?: string | null
          status?: string
          total_cost?: number | null
          tracking_code?: string
          transport_mode?: string
          updated_at?: string
          volume_m3?: number | null
          weight_kg: number
          width_cm: number
        }
        Update: {
          actual_delivery_date?: string | null
          awb_number?: string | null
          bl_number?: string | null
          carrier_name?: string | null
          carrier_service?: string | null
          commodity_currency?: string | null
          commodity_description?: string | null
          commodity_type?: string
          commodity_value?: number | null
          created_at?: string
          currency?: string | null
          current_location?: Json | null
          customer_id?: string
          customs_declaration_number?: string | null
          customs_duties?: number | null
          estimated_delivery_date?: string | null
          forwarder_id?: string | null
          height_cm?: number
          id?: string
          insurance_cost?: number | null
          insurance_required?: boolean | null
          insurance_value?: number | null
          internal_notes?: string | null
          is_dangerous_goods?: boolean | null
          is_fragile?: boolean | null
          length_cm?: number
          pickup_date?: string | null
          recipient_address?: string
          recipient_city?: string
          recipient_country?: string
          recipient_email?: string | null
          recipient_name?: string
          recipient_phone?: string | null
          recipient_postal_code?: string | null
          route_history?: Json | null
          sender_address?: string
          sender_city?: string
          sender_country?: string
          sender_email?: string | null
          sender_name?: string
          sender_phone?: string | null
          sender_postal_code?: string | null
          service_type?: string
          shipping_cost?: number | null
          special_instructions?: string | null
          status?: string
          total_cost?: number | null
          tracking_code?: string
          transport_mode?: string
          updated_at?: string
          volume_m3?: number | null
          weight_kg?: number
          width_cm?: number
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: string
          last_updated: string
          product_id: string | null
          quantity_available: number | null
          quantity_reserved: number | null
          quantity_sold: number | null
          reorder_threshold: number | null
          vendor_id: string | null
        }
        Insert: {
          id?: string
          last_updated?: string
          product_id?: string | null
          quantity_available?: number | null
          quantity_reserved?: number | null
          quantity_sold?: number | null
          reorder_threshold?: number | null
          vendor_id?: string | null
        }
        Update: {
          id?: string
          last_updated?: string
          product_id?: string | null
          quantity_available?: number | null
          quantity_reserved?: number | null
          quantity_sold?: number | null
          reorder_threshold?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string
          id: string
          is_active: boolean | null
          permissions: Json
          role: string
          seller_id: string
          user_id: string
          warehouses: string[] | null
        }
        Insert: {
          granted_at?: string | null
          granted_by: string
          id?: string
          is_active?: boolean | null
          permissions?: Json
          role: string
          seller_id: string
          user_id: string
          warehouses?: string[] | null
        }
        Update: {
          granted_at?: string | null
          granted_by?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json
          role?: string
          seller_id?: string
          user_id?: string
          warehouses?: string[] | null
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          document_name: string | null
          document_type: string
          document_url: string
          file_size: number | null
          id: string
          mime_type: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          document_name?: string | null
          document_type: string
          document_url: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          document_name?: string | null
          document_type?: string
          document_url?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      manual_invoices: {
        Row: {
          amount: number
          client_email: string
          client_name: string
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_type"] | null
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string
          pdf_url: string | null
          seller_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_email: string
          client_name: string
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_type"] | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          pdf_url?: string | null
          seller_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_email?: string
          client_name?: string
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_type"] | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          pdf_url?: string | null
          seller_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      member_votes: {
        Row: {
          id: string
          member_id: string | null
          otp_verified: boolean | null
          selected_option: string
          vote_id: string | null
          voted_at: string | null
        }
        Insert: {
          id?: string
          member_id?: string | null
          otp_verified?: boolean | null
          selected_option: string
          vote_id?: string | null
          voted_at?: string | null
        }
        Update: {
          id?: string
          member_id?: string | null
          otp_verified?: boolean | null
          selected_option?: string
          vote_id?: string | null
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_votes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "syndicat_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_votes_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "syndicat_votes"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          sender_id: string
        }
        Insert: {
          attachments?: Json | null
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          sender_id: string
        }
        Update: {
          attachments?: Json | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      motos: {
        Row: {
          annee: number | null
          date_enregistrement: string | null
          id: string
          marque: string | null
          modele: string | null
          numero_serie: string
          statut: string | null
          travailleur_id: string
        }
        Insert: {
          annee?: number | null
          date_enregistrement?: string | null
          id?: string
          marque?: string | null
          modele?: string | null
          numero_serie: string
          statut?: string | null
          travailleur_id: string
        }
        Update: {
          annee?: number | null
          date_enregistrement?: string | null
          id?: string
          marque?: string | null
          modele?: string | null
          numero_serie?: string
          statut?: string | null
          travailleur_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "motos_travailleur_id_fkey"
            columns: ["travailleur_id"]
            isOneToOne: false
            referencedRelation: "travailleurs"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_sales: {
        Row: {
          created_at: string
          id: string
          is_synced: boolean | null
          sale_data: Json
          seller_id: string
          synced_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_synced?: boolean | null
          sale_data: Json
          seller_id: string
          synced_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_synced?: boolean | null
          sale_data?: Json
          seller_id?: string
          synced_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          courier_id: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"]
          customer_id: string
          delivered_at: string | null
          delivery_address: string | null
          expires_at: string | null
          id: string
          notes: string | null
          qr_code: string | null
          readable_id: string | null
          seller_id: string
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          transaction_code: string | null
          updated_at: string
        }
        Insert: {
          courier_id?: string | null
          created_at?: string
          currency: Database["public"]["Enums"]["currency_type"]
          customer_id: string
          delivered_at?: string | null
          delivery_address?: string | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          qr_code?: string | null
          readable_id?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          transaction_code?: string | null
          updated_at?: string
        }
        Update: {
          courier_id?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          customer_id?: string
          delivered_at?: string | null
          delivery_address?: string | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          qr_code?: string | null
          readable_id?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          transaction_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "orders_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payment_escrows: {
        Row: {
          auto_release_after_days: number | null
          auto_release_at: string | null
          commission_amount: number
          commission_rate: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"]
          dispute_opened_at: string | null
          draft_order_id: string
          held_since: string
          id: string
          release_date: string | null
          resolution: string | null
          seller_amount: number
          status: string
          stripe_charge_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          auto_release_after_days?: number | null
          auto_release_at?: string | null
          commission_amount: number
          commission_rate?: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_type"]
          dispute_opened_at?: string | null
          draft_order_id: string
          held_since?: string
          id?: string
          release_date?: string | null
          resolution?: string | null
          seller_amount: number
          status?: string
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          auto_release_after_days?: number | null
          auto_release_at?: string | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          dispute_opened_at?: string | null
          draft_order_id?: string
          held_since?: string
          id?: string
          release_date?: string | null
          resolution?: string | null
          seller_amount?: number
          status?: string
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_escrows_draft_order_id_fkey"
            columns: ["draft_order_id"]
            isOneToOne: false
            referencedRelation: "draft_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          created_at: string
          draft_order_id: string | null
          escrow_id: string | null
          event_type: string
          id: string
          message: string
          metadata: Json | null
          read_at: string | null
          severity: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          draft_order_id?: string | null
          escrow_id?: string | null
          event_type: string
          id?: string
          message: string
          metadata?: Json | null
          read_at?: string | null
          severity?: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          draft_order_id?: string | null
          escrow_id?: string | null
          event_type?: string
          id?: string
          message?: string
          metadata?: Json | null
          read_at?: string | null
          severity?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_draft_order_id_fkey"
            columns: ["draft_order_id"]
            isOneToOne: false
            referencedRelation: "draft_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "payment_escrows"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_ledger: {
        Row: {
          amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"]
          description: string
          draft_order_id: string | null
          escrow_id: string | null
          id: string
          metadata: Json | null
          reference_type: string | null
          stripe_reference_id: string | null
          transaction_type: string
          user_from: string | null
          user_to: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_type"]
          description: string
          draft_order_id?: string | null
          escrow_id?: string | null
          id?: string
          metadata?: Json | null
          reference_type?: string | null
          stripe_reference_id?: string | null
          transaction_type: string
          user_from?: string | null
          user_to?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          description?: string
          draft_order_id?: string | null
          escrow_id?: string | null
          id?: string
          metadata?: Json | null
          reference_type?: string | null
          stripe_reference_id?: string | null
          transaction_type?: string
          user_from?: string | null
          user_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_ledger_draft_order_id_fkey"
            columns: ["draft_order_id"]
            isOneToOne: false
            referencedRelation: "draft_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_ledger_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "payment_escrows"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_webhooks: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payload: Json
          processed_at: string
          provider: string
          reference: string
          status: string
          transaction_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          id?: string
          payload: Json
          processed_at?: string
          provider: string
          reference: string
          status: string
          transaction_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payload?: Json
          processed_at?: string
          provider?: string
          reference?: string
          status?: string
          transaction_id?: string
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          amount: number
          bank_details: Json
          created_at: string
          fees: number
          id: string
          net_amount: number
          processed_at: string | null
          status: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          bank_details: Json
          created_at?: string
          fees: number
          id?: string
          net_amount: number
          processed_at?: string | null
          status?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          bank_details?: Json
          created_at?: string
          fees?: number
          id?: string
          net_amount?: number
          processed_at?: string | null
          status?: string | null
          vendor_id?: string | null
        }
        Relationships: []
      }
      pdg_subscriptions: {
        Row: {
          created_at: string
          duration_days: number | null
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_days?: number | null
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          subscription_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_days?: number | null
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          subscription_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      permissions_travailleurs: {
        Row: {
          date_granted: string | null
          granted_by: string | null
          id: string
          is_granted: boolean | null
          permission_name: string
          travailleur_id: string
        }
        Insert: {
          date_granted?: string | null
          granted_by?: string | null
          id?: string
          is_granted?: boolean | null
          permission_name: string
          travailleur_id: string
        }
        Update: {
          date_granted?: string | null
          granted_by?: string | null
          id?: string
          is_granted?: boolean | null
          permission_name?: string
          travailleur_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissions_travailleurs_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "bureaux_syndicaux"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_travailleurs_travailleur_id_fkey"
            columns: ["travailleur_id"]
            isOneToOne: false
            referencedRelation: "travailleurs"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_promotions: {
        Row: {
          applicable_products: string[] | null
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean | null
          max_discount: number | null
          max_usage: number | null
          min_amount: number | null
          name: string
          seller_id: string
          start_date: string
          type: string
          updated_at: string
          usage_count: number | null
          value: number
        }
        Insert: {
          applicable_products?: string[] | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          max_usage?: number | null
          min_amount?: number | null
          name: string
          seller_id: string
          start_date?: string
          type?: string
          updated_at?: string
          usage_count?: number | null
          value: number
        }
        Update: {
          applicable_products?: string[] | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          max_usage?: number | null
          min_amount?: number | null
          name?: string
          seller_id?: string
          start_date?: string
          type?: string
          updated_at?: string
          usage_count?: number | null
          value?: number
        }
        Relationships: []
      }
      pos_sessions: {
        Row: {
          closed_at: string | null
          closing_cash: number | null
          id: string
          is_active: boolean | null
          notes: string | null
          opened_at: string
          opening_cash: number | null
          seller_id: string
          total_sales: number | null
          total_transactions: number | null
        }
        Insert: {
          closed_at?: string | null
          closing_cash?: number | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          opened_at?: string
          opening_cash?: number | null
          seller_id: string
          total_sales?: number | null
          total_transactions?: number | null
        }
        Update: {
          closed_at?: string | null
          closing_cash?: number | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          opened_at?: string
          opening_cash?: number | null
          seller_id?: string
          total_sales?: number | null
          total_transactions?: number | null
        }
        Relationships: []
      }
      product_batches: {
        Row: {
          batch_number: string
          cost_per_unit: number | null
          created_at: string | null
          expiry_date: string | null
          id: string
          manufacturing_date: string | null
          notes: string | null
          product_id: string
          quality_status: string | null
          quantity: number
          serial_numbers: string[] | null
          supplier_id: string | null
          warehouse_id: string
        }
        Insert: {
          batch_number: string
          cost_per_unit?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          manufacturing_date?: string | null
          notes?: string | null
          product_id: string
          quality_status?: string | null
          quantity?: number
          serial_numbers?: string[] | null
          supplier_id?: string | null
          warehouse_id: string
        }
        Update: {
          batch_number?: string
          cost_per_unit?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          manufacturing_date?: string | null
          notes?: string | null
          product_id?: string
          quality_status?: string | null
          quantity?: number
          serial_numbers?: string[] | null
          supplier_id?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          ai_generated_content: Json | null
          auto_delivery_enabled: boolean | null
          category: string | null
          category_id: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"]
          delivery_instructions: string | null
          description: string | null
          digital_file_url: string | null
          download_limit: number | null
          featured_until: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          marketing_tags: string[] | null
          name: string
          price: number
          promotion_active: boolean | null
          promotion_discount: number | null
          promotion_expires_at: string | null
          seller_id: string
          seo_keywords: string[] | null
          shop_id: string | null
          sort_order: number | null
          stock_quantity: number | null
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string
          variants: Json | null
          video_url: string | null
          warehouse_id: string | null
        }
        Insert: {
          ai_generated_content?: Json | null
          auto_delivery_enabled?: boolean | null
          category?: string | null
          category_id?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          delivery_instructions?: string | null
          description?: string | null
          digital_file_url?: string | null
          download_limit?: number | null
          featured_until?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          marketing_tags?: string[] | null
          name: string
          price: number
          promotion_active?: boolean | null
          promotion_discount?: number | null
          promotion_expires_at?: string | null
          seller_id: string
          seo_keywords?: string[] | null
          shop_id?: string | null
          sort_order?: number | null
          stock_quantity?: number | null
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
          variants?: Json | null
          video_url?: string | null
          warehouse_id?: string | null
        }
        Update: {
          ai_generated_content?: Json | null
          auto_delivery_enabled?: boolean | null
          category?: string | null
          category_id?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          delivery_instructions?: string | null
          description?: string | null
          digital_file_url?: string | null
          download_limit?: number | null
          featured_until?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          marketing_tags?: string[] | null
          name?: string
          price?: number
          promotion_active?: boolean | null
          promotion_discount?: number | null
          promotion_expires_at?: string | null
          seller_id?: string
          seo_keywords?: string[] | null
          shop_id?: string | null
          sort_order?: number | null
          stock_quantity?: number | null
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
          variants?: Json | null
          video_url?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "digital_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "seller_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          average_rating: number | null
          city: string | null
          completed_missions: number | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          gps_country: string | null
          gps_verified: boolean | null
          id: string
          is_verified: boolean | null
          kyc_address_proof_url: string | null
          kyc_bank_document_url: string | null
          kyc_document_type: string | null
          kyc_document_url: string | null
          kyc_rejection_reason: string | null
          kyc_status: string | null
          kyc_submitted_at: string | null
          kyc_verified_at: string | null
          language: string | null
          last_gps_check: string | null
          phone: string | null
          pos_settings: Json | null
          preferred_currency: string | null
          readable_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          storage_quota_gb: number | null
          storage_used_gb: number | null
          subscription_expires_at: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          success_rate: number | null
          total_missions: number | null
          union_type: Database["public"]["Enums"]["union_type"] | null
          updated_at: string
          user_id: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"] | null
          vest_number: number | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          city?: string | null
          completed_missions?: number | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          gps_country?: string | null
          gps_verified?: boolean | null
          id?: string
          is_verified?: boolean | null
          kyc_address_proof_url?: string | null
          kyc_bank_document_url?: string | null
          kyc_document_type?: string | null
          kyc_document_url?: string | null
          kyc_rejection_reason?: string | null
          kyc_status?: string | null
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          language?: string | null
          last_gps_check?: string | null
          phone?: string | null
          pos_settings?: Json | null
          preferred_currency?: string | null
          readable_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          storage_quota_gb?: number | null
          storage_used_gb?: number | null
          subscription_expires_at?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          success_rate?: number | null
          total_missions?: number | null
          union_type?: Database["public"]["Enums"]["union_type"] | null
          updated_at?: string
          user_id: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
          vest_number?: number | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          city?: string | null
          completed_missions?: number | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          gps_country?: string | null
          gps_verified?: boolean | null
          id?: string
          is_verified?: boolean | null
          kyc_address_proof_url?: string | null
          kyc_bank_document_url?: string | null
          kyc_document_type?: string | null
          kyc_document_url?: string | null
          kyc_rejection_reason?: string | null
          kyc_status?: string | null
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          language?: string | null
          last_gps_check?: string | null
          phone?: string | null
          pos_settings?: Json | null
          preferred_currency?: string | null
          readable_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          storage_quota_gb?: number | null
          storage_used_gb?: number | null
          subscription_expires_at?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          success_rate?: number | null
          total_missions?: number | null
          union_type?: Database["public"]["Enums"]["union_type"] | null
          updated_at?: string
          user_id?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
          vest_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_preferred_currency_fkey"
            columns: ["preferred_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          discount_type: string | null
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_amount: number | null
          shop_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string | null
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_amount?: number | null
          shop_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string | null
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_amount?: number | null
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "digital_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          code: string
          created_at: string
          discount_type: string | null
          discount_value: number
          end_date: string | null
          id: string
          shop_id: string
          start_date: string | null
          status: string | null
          updated_at: string
          usage_limit: number | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string | null
          discount_value: number
          end_date?: string | null
          id?: string
          shop_id: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string | null
          discount_value?: number
          end_date?: string | null
          id?: string
          shop_id?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "seller_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          id: string
          notes: string | null
          po_id: string
          product_id: string
          quality_status: string | null
          quantity_ordered: number
          quantity_received: number
          total_cost: number | null
          unit_cost: number
        }
        Insert: {
          id?: string
          notes?: string | null
          po_id: string
          product_id: string
          quality_status?: string | null
          quantity_ordered: number
          quantity_received?: number
          total_cost?: number | null
          unit_cost: number
        }
        Update: {
          id?: string
          notes?: string | null
          po_id?: string
          product_id?: string
          quality_status?: string | null
          quantity_ordered?: number
          quantity_received?: number
          total_cost?: number | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          actual_delivery: string | null
          created_at: string | null
          created_by: string
          currency: string
          expected_delivery: string | null
          id: string
          notes: string | null
          order_date: string | null
          po_number: string
          seller_id: string
          status: string
          supplier_id: string
          terms: string | null
          total_amount: number
          updated_at: string | null
          warehouse_id: string
        }
        Insert: {
          actual_delivery?: string | null
          created_at?: string | null
          created_by: string
          currency?: string
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          po_number?: string
          seller_id: string
          status?: string
          supplier_id: string
          terms?: string | null
          total_amount?: number
          updated_at?: string | null
          warehouse_id: string
        }
        Update: {
          actual_delivery?: string | null
          created_at?: string | null
          created_by?: string
          currency?: string
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          po_number?: string
          seller_id?: string
          status?: string
          supplier_id?: string
          terms?: string | null
          total_amount?: number
          updated_at?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notifications: {
        Row: {
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          order_id: string | null
          read_at: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          order_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          order_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_inspections: {
        Row: {
          batch_id: string | null
          created_at: string | null
          defects_found: Json | null
          id: string
          inspected_at: string | null
          inspection_number: string
          inspection_type: string
          inspector_id: string
          notes: string | null
          photos: string[] | null
          po_item_id: string | null
          product_id: string
          quantity_failed: number
          quantity_inspected: number
          quantity_passed: number
          status: string
          warehouse_id: string
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          defects_found?: Json | null
          id?: string
          inspected_at?: string | null
          inspection_number?: string
          inspection_type: string
          inspector_id: string
          notes?: string | null
          photos?: string[] | null
          po_item_id?: string | null
          product_id: string
          quantity_failed?: number
          quantity_inspected: number
          quantity_passed?: number
          status?: string
          warehouse_id: string
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          defects_found?: Json | null
          id?: string
          inspected_at?: string | null
          inspection_number?: string
          inspection_type?: string
          inspector_id?: string
          notes?: string | null
          photos?: string[] | null
          po_item_id?: string | null
          product_id?: string
          quantity_failed?: number
          quantity_inspected?: number
          quantity_passed?: number
          status?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_inspections_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_inspections_po_item_id_fkey"
            columns: ["po_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_inspections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_inspections_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      remote_security_commands: {
        Row: {
          command_type: string
          created_at: string | null
          executed_at: string | null
          execution_data: Json | null
          execution_result: Json | null
          expires_at: string | null
          id: string
          status: string | null
          target_device_imei: string
          user_id: string
        }
        Insert: {
          command_type: string
          created_at?: string | null
          executed_at?: string | null
          execution_data?: Json | null
          execution_result?: Json | null
          expires_at?: string | null
          id?: string
          status?: string | null
          target_device_imei: string
          user_id: string
        }
        Update: {
          command_type?: string
          created_at?: string | null
          executed_at?: string | null
          execution_data?: Json | null
          execution_result?: Json | null
          expires_at?: string | null
          id?: string
          status?: string | null
          target_device_imei?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          is_verified: boolean | null
          order_id: string
          product_id: string | null
          rating: number
          seller_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_verified?: boolean | null
          order_id: string
          product_id?: string | null
          rating: number
          seller_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_verified?: boolean | null
          order_id?: string
          product_id?: string | null
          rating?: number
          seller_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ride_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          new_status: string | null
          old_status: string | null
          ride_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          new_status?: string | null
          old_status?: string | null
          ride_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          new_status?: string | null
          old_status?: string | null
          ride_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_logs_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          accepted_at: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          client_id: string
          commission_amount: number | null
          commission_rate: number | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          distance_km: number | null
          driver_earnings: number | null
          driver_id: string | null
          dropoff_address: string | null
          dropoff_lat: number
          dropoff_lng: number
          estimated_fare: number | null
          fare: number | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          pickup_address: string | null
          pickup_lat: number
          pickup_lng: number
          requested_at: string | null
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_id: string
          commission_amount?: number | null
          commission_rate?: number | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          distance_km?: number | null
          driver_earnings?: number | null
          driver_id?: string | null
          dropoff_address?: string | null
          dropoff_lat: number
          dropoff_lng: number
          estimated_fare?: number | null
          fare?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_address?: string | null
          pickup_lat: number
          pickup_lng: number
          requested_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_id?: string
          commission_amount?: number | null
          commission_rate?: number | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          distance_km?: number | null
          driver_earnings?: number | null
          driver_id?: string | null
          dropoff_address?: string | null
          dropoff_lat?: number
          dropoff_lng?: number
          estimated_fare?: number | null
          fare?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_address?: string | null
          pickup_lat?: number
          pickup_lng?: number
          requested_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      road_tax_tickets: {
        Row: {
          bureau_name: string
          courier_id: string
          created_at: string
          currency: string
          id: string
          price: number
          status: string
          ticket_number: string
          updated_at: string
          vehicle_number: string
        }
        Insert: {
          bureau_name: string
          courier_id: string
          created_at?: string
          currency?: string
          id?: string
          price: number
          status?: string
          ticket_number: string
          updated_at?: string
          vehicle_number: string
        }
        Update: {
          bureau_name?: string
          courier_id?: string
          created_at?: string
          currency?: string
          id?: string
          price?: number
          status?: string
          ticket_number?: string
          updated_at?: string
          vehicle_number?: string
        }
        Relationships: []
      }
      road_tickets: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          issued_by: string | null
          member_id: string | null
          payment_method: string | null
          qr_code: string | null
          status: string | null
          ticket_number: string
          validity_end: string
          validity_start: string
          vehicle_number: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          issued_by?: string | null
          member_id?: string | null
          payment_method?: string | null
          qr_code?: string | null
          status?: string | null
          ticket_number: string
          validity_end: string
          validity_start: string
          vehicle_number: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          issued_by?: string | null
          member_id?: string | null
          payment_method?: string | null
          qr_code?: string | null
          status?: string | null
          ticket_number?: string
          validity_end?: string
          validity_start?: string
          vehicle_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "road_tickets_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "syndicat_members"
            referencedColumns: ["id"]
          },
        ]
      }
      role_features: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          feature: string
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          feature: string
          id?: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          feature?: string
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      route_optimization: {
        Row: {
          ai_confidence_score: number | null
          created_at: string | null
          currency: string | null
          destination_address: string
          estimated_cost: number | null
          estimated_time: unknown | null
          id: string
          optimization_type: string
          origin_address: string
          recommended_carrier: string | null
          route_polyline: string | null
          traffic_data: Json | null
          waypoints: Json | null
          weather_data: Json | null
        }
        Insert: {
          ai_confidence_score?: number | null
          created_at?: string | null
          currency?: string | null
          destination_address: string
          estimated_cost?: number | null
          estimated_time?: unknown | null
          id?: string
          optimization_type: string
          origin_address: string
          recommended_carrier?: string | null
          route_polyline?: string | null
          traffic_data?: Json | null
          waypoints?: Json | null
          weather_data?: Json | null
        }
        Update: {
          ai_confidence_score?: number | null
          created_at?: string | null
          currency?: string | null
          destination_address?: string
          estimated_cost?: number | null
          estimated_time?: unknown | null
          id?: string
          optimization_type?: string
          origin_address?: string
          recommended_carrier?: string | null
          route_polyline?: string | null
          traffic_data?: Json | null
          waypoints?: Json | null
          weather_data?: Json | null
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          device_imei: string | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          location_data: Json | null
          message: string
          resolved_at: string | null
          severity: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          device_imei?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          location_data?: Json | null
          message: string
          resolved_at?: string | null
          severity?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          device_imei?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          location_data?: Json | null
          message?: string
          resolved_at?: string | null
          severity?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_config: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          coordinates: Json | null
          created_at: string
          description: string
          estimated_loss_usd: number | null
          evidence_files: Json | null
          forwarder_id: string
          id: string
          incident_number: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          insurance_claim_number: string | null
          is_emergency: boolean | null
          location: string | null
          reported_by: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: number
          shipment_id: string | null
          status: Database["public"]["Enums"]["incident_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string
          description: string
          estimated_loss_usd?: number | null
          evidence_files?: Json | null
          forwarder_id: string
          id?: string
          incident_number?: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          insurance_claim_number?: string | null
          is_emergency?: boolean | null
          location?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: number
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          coordinates?: Json | null
          created_at?: string
          description?: string
          estimated_loss_usd?: number | null
          evidence_files?: Json | null
          forwarder_id?: string
          id?: string
          incident_number?: string
          incident_type?: Database["public"]["Enums"]["incident_type"]
          insurance_claim_number?: string | null
          is_emergency?: boolean | null
          location?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: number
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_incidents_forwarder_id_fkey"
            columns: ["forwarder_id"]
            isOneToOne: false
            referencedRelation: "freight_forwarders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "freight_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_incidents_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "freight_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_incidents_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "international_shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      security_tracking: {
        Row: {
          accuracy: number | null
          address_text: string | null
          battery_level: number | null
          created_at: string | null
          device_imei: string
          id: string
          is_emergency: boolean | null
          latitude: number
          longitude: number
          network_type: string | null
          speed: number | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          address_text?: string | null
          battery_level?: number | null
          created_at?: string | null
          device_imei: string
          id?: string
          is_emergency?: boolean | null
          latitude: number
          longitude: number
          network_type?: string | null
          speed?: number | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          accuracy?: number | null
          address_text?: string | null
          battery_level?: number | null
          created_at?: string | null
          device_imei?: string
          id?: string
          is_emergency?: boolean | null
          latitude?: number
          longitude?: number
          network_type?: string | null
          speed?: number | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seller_shops: {
        Row: {
          banner_url: string | null
          business_address: string | null
          business_hours: Json | null
          business_type: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          custom_domain: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          product_count: number | null
          seller_id: string
          shop_category: string | null
          shop_images: string[] | null
          shop_name: string
          slug: string | null
          social_links: Json | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          theme_color: string | null
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          business_address?: string | null
          business_hours?: Json | null
          business_type?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          product_count?: number | null
          seller_id: string
          shop_category?: string | null
          shop_images?: string[] | null
          shop_name: string
          slug?: string | null
          social_links?: Json | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          theme_color?: string | null
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          business_address?: string | null
          business_hours?: Json | null
          business_type?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          product_count?: number | null
          seller_id?: string
          shop_category?: string | null
          shop_images?: string[] | null
          shop_name?: string
          slug?: string | null
          social_links?: Json | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          theme_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          country: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          type: string
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipment_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          ai_analysis: Json | null
          alert_type: string
          confidence_score: number | null
          created_at: string
          description: string
          id: string
          metadata: Json | null
          resolved_at: string | null
          severity: string
          shipment_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          ai_analysis?: Json | null
          alert_type: string
          confidence_score?: number | null
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
          shipment_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          ai_analysis?: Json | null
          alert_type?: string
          confidence_score?: number | null
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
          shipment_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_alerts_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "international_shipments_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_analytics: {
        Row: {
          additional_data: Json | null
          carrier_id: string | null
          created_at: string | null
          date: string
          id: string
          metric_type: string
          route: string | null
          shipment_type: string | null
          value: number
        }
        Insert: {
          additional_data?: Json | null
          carrier_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          metric_type: string
          route?: string | null
          shipment_type?: string | null
          value: number
        }
        Update: {
          additional_data?: Json | null
          carrier_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          metric_type?: string
          route?: string | null
          shipment_type?: string | null
          value?: number
        }
        Relationships: []
      }
      shipment_events: {
        Row: {
          coordinates: Json | null
          created_at: string
          description: string | null
          employee_id: string | null
          event_type: string
          id: string
          location: string
          scanned_at: string | null
          shipment_id: string
          status: string
          warehouse_id: string | null
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string
          description?: string | null
          employee_id?: string | null
          event_type: string
          id?: string
          location: string
          scanned_at?: string | null
          shipment_id: string
          status: string
          warehouse_id?: string | null
        }
        Update: {
          coordinates?: Json | null
          created_at?: string
          description?: string | null
          employee_id?: string | null
          event_type?: string
          id?: string
          location?: string
          scanned_at?: string | null
          shipment_id?: string
          status?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_events_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "freight_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "international_shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_events_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "freight_warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_insurance: {
        Row: {
          claim_amount: number | null
          claim_status: string | null
          coverage_amount: number
          created_at: string | null
          currency: string | null
          end_date: string | null
          id: string
          insurance_type: string
          policy_number: string | null
          premium_amount: number
          provider: string
          shipment_id: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          claim_amount?: number | null
          claim_status?: string | null
          coverage_amount: number
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          insurance_type: string
          policy_number?: string | null
          premium_amount: number
          provider: string
          shipment_id: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          claim_amount?: number | null
          claim_status?: string | null
          coverage_amount?: number
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          insurance_type?: string
          policy_number?: string | null
          premium_amount?: number
          provider?: string
          shipment_id?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shipment_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          invoice_number: string | null
          invoice_url: string | null
          payment_date: string | null
          payment_intent_id: string | null
          payment_method: string
          payment_status: string
          shipment_id: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          payment_date?: string | null
          payment_intent_id?: string | null
          payment_method: string
          payment_status?: string
          shipment_id: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          payment_date?: string | null
          payment_intent_id?: string | null
          payment_method?: string
          payment_status?: string
          shipment_id?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_payments_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "international_shipments_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_sla: {
        Row: {
          actual_delivery: string | null
          breach_reason: string | null
          compensation_amount: number | null
          compensation_currency: string | null
          created_at: string | null
          escalation_level: number | null
          id: string
          promised_delivery: string
          shipment_id: string
          sla_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery?: string | null
          breach_reason?: string | null
          compensation_amount?: number | null
          compensation_currency?: string | null
          created_at?: string | null
          escalation_level?: number | null
          id?: string
          promised_delivery: string
          shipment_id: string
          sla_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery?: string | null
          breach_reason?: string | null
          compensation_amount?: number | null
          compensation_currency?: string | null
          created_at?: string | null
          escalation_level?: number | null
          id?: string
          promised_delivery?: string
          shipment_id?: string
          sla_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shipment_status_history: {
        Row: {
          automatic: boolean | null
          id: string
          location: string | null
          notes: string | null
          shipment_id: string
          status: string
          timestamp: string
          updated_by: string | null
        }
        Insert: {
          automatic?: boolean | null
          id?: string
          location?: string | null
          notes?: string | null
          shipment_id: string
          status: string
          timestamp?: string
          updated_by?: string | null
        }
        Update: {
          automatic?: boolean | null
          id?: string
          location?: string | null
          notes?: string | null
          shipment_id?: string
          status?: string
          timestamp?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_status_history_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "international_shipments_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_tracking: {
        Row: {
          created_at: string
          id: string
          location: string
          notes: string | null
          shipment_id: string
          status: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          location: string
          notes?: string | null
          shipment_id: string
          status: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          notes?: string | null
          shipment_id?: string
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_shipment_tracking_shipment"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_tracking_events: {
        Row: {
          created_at: string | null
          employee_id: string | null
          event_description: string
          event_timestamp: string | null
          event_type: string
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          metadata: Json | null
          shipment_id: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          event_description: string
          event_timestamp?: string | null
          event_type: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          metadata?: Json | null
          shipment_id: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          event_description?: string
          event_timestamp?: string | null
          event_type?: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          metadata?: Json | null
          shipment_id?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_tracking_events_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "freight_employees_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_tracking_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_international_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_tracking_events_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "freight_warehouses_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          created_at: string
          currency: string
          destination: string
          dimensions: Json
          id: string
          origin: string
          price: number
          service_type: string
          status: string
          tracking_code: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          currency?: string
          destination: string
          dimensions?: Json
          id?: string
          origin: string
          price: number
          service_type: string
          status?: string
          tracking_code: string
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          currency?: string
          destination?: string
          dimensions?: Json
          id?: string
          origin?: string
          price?: number
          service_type?: string
          status?: string
          tracking_code?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      shipments_international_extended: {
        Row: {
          actual_delivery_date: string | null
          actual_pickup_date: string | null
          barcode: string | null
          base_price: number | null
          cargo_type: string
          created_at: string | null
          currency: string | null
          current_location: string | null
          current_warehouse_id: string | null
          customer_id: string
          customer_notifications_enabled: boolean | null
          customer_reference: string | null
          customs_fee: number | null
          customs_instructions: string | null
          declared_value_usd: number | null
          delivery_instructions: string | null
          description: string
          dimensions: Json | null
          email_notifications: boolean | null
          estimated_delivery: string | null
          forwarder_id: string
          fuel_surcharge: number | null
          handling_fee: number | null
          id: string
          incoterm: string | null
          insurance_amount: number | null
          insurance_fee: number | null
          insurance_type: string | null
          is_dangerous: boolean | null
          is_perishable: boolean | null
          is_valuable: boolean | null
          pickup_date: string | null
          priority: number | null
          qr_code: string | null
          recipient_address: string
          recipient_city: string
          recipient_company: string | null
          recipient_country: string
          recipient_email: string | null
          recipient_name: string
          recipient_phone: string
          reference_number: string | null
          security_level: number | null
          sender_address: string
          sender_city: string
          sender_company: string | null
          sender_country: string
          sender_email: string | null
          sender_name: string
          sender_phone: string
          service_type: string
          sms_notifications: boolean | null
          special_instructions: string | null
          status: string | null
          total_price: number | null
          tracking_code: string
          tracking_notifications: Json | null
          transport_mode: string | null
          updated_at: string | null
          volume_m3: number | null
          weight_kg: number
        }
        Insert: {
          actual_delivery_date?: string | null
          actual_pickup_date?: string | null
          barcode?: string | null
          base_price?: number | null
          cargo_type?: string
          created_at?: string | null
          currency?: string | null
          current_location?: string | null
          current_warehouse_id?: string | null
          customer_id: string
          customer_notifications_enabled?: boolean | null
          customer_reference?: string | null
          customs_fee?: number | null
          customs_instructions?: string | null
          declared_value_usd?: number | null
          delivery_instructions?: string | null
          description: string
          dimensions?: Json | null
          email_notifications?: boolean | null
          estimated_delivery?: string | null
          forwarder_id: string
          fuel_surcharge?: number | null
          handling_fee?: number | null
          id?: string
          incoterm?: string | null
          insurance_amount?: number | null
          insurance_fee?: number | null
          insurance_type?: string | null
          is_dangerous?: boolean | null
          is_perishable?: boolean | null
          is_valuable?: boolean | null
          pickup_date?: string | null
          priority?: number | null
          qr_code?: string | null
          recipient_address: string
          recipient_city: string
          recipient_company?: string | null
          recipient_country: string
          recipient_email?: string | null
          recipient_name: string
          recipient_phone: string
          reference_number?: string | null
          security_level?: number | null
          sender_address: string
          sender_city: string
          sender_company?: string | null
          sender_country: string
          sender_email?: string | null
          sender_name: string
          sender_phone: string
          service_type?: string
          sms_notifications?: boolean | null
          special_instructions?: string | null
          status?: string | null
          total_price?: number | null
          tracking_code: string
          tracking_notifications?: Json | null
          transport_mode?: string | null
          updated_at?: string | null
          volume_m3?: number | null
          weight_kg: number
        }
        Update: {
          actual_delivery_date?: string | null
          actual_pickup_date?: string | null
          barcode?: string | null
          base_price?: number | null
          cargo_type?: string
          created_at?: string | null
          currency?: string | null
          current_location?: string | null
          current_warehouse_id?: string | null
          customer_id?: string
          customer_notifications_enabled?: boolean | null
          customer_reference?: string | null
          customs_fee?: number | null
          customs_instructions?: string | null
          declared_value_usd?: number | null
          delivery_instructions?: string | null
          description?: string
          dimensions?: Json | null
          email_notifications?: boolean | null
          estimated_delivery?: string | null
          forwarder_id?: string
          fuel_surcharge?: number | null
          handling_fee?: number | null
          id?: string
          incoterm?: string | null
          insurance_amount?: number | null
          insurance_fee?: number | null
          insurance_type?: string | null
          is_dangerous?: boolean | null
          is_perishable?: boolean | null
          is_valuable?: boolean | null
          pickup_date?: string | null
          priority?: number | null
          qr_code?: string | null
          recipient_address?: string
          recipient_city?: string
          recipient_company?: string | null
          recipient_country?: string
          recipient_email?: string | null
          recipient_name?: string
          recipient_phone?: string
          reference_number?: string | null
          security_level?: number | null
          sender_address?: string
          sender_city?: string
          sender_company?: string | null
          sender_country?: string
          sender_email?: string | null
          sender_name?: string
          sender_phone?: string
          service_type?: string
          sms_notifications?: boolean | null
          special_instructions?: string | null
          status?: string | null
          total_price?: number | null
          tracking_code?: string
          tracking_notifications?: Json | null
          transport_mode?: string | null
          updated_at?: string | null
          volume_m3?: number | null
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "shipments_international_extended_current_warehouse_id_fkey"
            columns: ["current_warehouse_id"]
            isOneToOne: false
            referencedRelation: "freight_warehouses_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_international_extended_forwarder_id_fkey"
            columns: ["forwarder_id"]
            isOneToOne: false
            referencedRelation: "freight_forwarder_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_rates_matrix: {
        Row: {
          base_rate_per_kg: number
          carrier_name: string | null
          created_at: string
          currency: string | null
          customs_clearance_fee: number | null
          destination_country: string
          fuel_surcharge_percentage: number | null
          handling_fee: number | null
          id: string
          insurance_rate_percentage: number | null
          is_active: boolean | null
          origin_country: string
          security_fee: number | null
          service_type: string
          transport_mode: string
          updated_at: string
          valid_from: string
          valid_until: string | null
          volumetric_divisor: number | null
          weight_from_kg: number
          weight_to_kg: number
        }
        Insert: {
          base_rate_per_kg: number
          carrier_name?: string | null
          created_at?: string
          currency?: string | null
          customs_clearance_fee?: number | null
          destination_country: string
          fuel_surcharge_percentage?: number | null
          handling_fee?: number | null
          id?: string
          insurance_rate_percentage?: number | null
          is_active?: boolean | null
          origin_country: string
          security_fee?: number | null
          service_type: string
          transport_mode: string
          updated_at?: string
          valid_from: string
          valid_until?: string | null
          volumetric_divisor?: number | null
          weight_from_kg?: number
          weight_to_kg?: number
        }
        Update: {
          base_rate_per_kg?: number
          carrier_name?: string | null
          created_at?: string
          currency?: string | null
          customs_clearance_fee?: number | null
          destination_country?: string
          fuel_surcharge_percentage?: number | null
          handling_fee?: number | null
          id?: string
          insurance_rate_percentage?: number | null
          is_active?: boolean | null
          origin_country?: string
          security_fee?: number | null
          service_type?: string
          transport_mode?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          volumetric_divisor?: number | null
          weight_from_kg?: number
          weight_to_kg?: number
        }
        Relationships: []
      }
      shop_analytics: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"] | null
          date: string
          id: string
          orders: number | null
          revenue: number | null
          shop_id: string
          updated_at: string
          views: number | null
        }
        Insert: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"] | null
          date?: string
          id?: string
          orders?: number | null
          revenue?: number | null
          shop_id: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"] | null
          date?: string
          id?: string
          orders?: number | null
          revenue?: number | null
          shop_id?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_analytics_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "seller_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_analytics_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      sos_alerts: {
        Row: {
          alert_type: string | null
          city: string | null
          created_at: string | null
          description: string | null
          id: string
          latitude: number
          longitude: number
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          alert_type?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stock_alerts: {
        Row: {
          alert_type: string
          created_at: string
          current_stock: number
          id: string
          is_active: boolean | null
          product_id: string
          resolved_at: string | null
          seller_id: string
          threshold: number
        }
        Insert: {
          alert_type?: string
          created_at?: string
          current_stock: number
          id?: string
          is_active?: boolean | null
          product_id: string
          resolved_at?: string | null
          seller_id: string
          threshold?: number
        }
        Update: {
          alert_type?: string
          created_at?: string
          current_stock?: number
          id?: string
          is_active?: boolean | null
          product_id?: string
          resolved_at?: string | null
          seller_id?: string
          threshold?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_logs: {
        Row: {
          change_type: string
          created_at: string
          id: string
          new_qty: number
          order_id: string | null
          previous_qty: number
          product_id: string | null
          quantity_change: number
          reason: string | null
          user_id: string | null
        }
        Insert: {
          change_type: string
          created_at?: string
          id?: string
          new_qty: number
          order_id?: string | null
          previous_qty: number
          product_id?: string | null
          quantity_change: number
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          change_type?: string
          created_at?: string
          id?: string
          new_qty?: number
          order_id?: string | null
          previous_qty?: number
          product_id?: string | null
          quantity_change?: number
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          created_at: string | null
          from_warehouse_id: string
          id: string
          initiated_by: string
          notes: string | null
          product_id: string
          quantity: number
          reason: string | null
          received_at: string | null
          shipped_at: string | null
          status: string
          to_warehouse_id: string
          transfer_number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_warehouse_id: string
          id?: string
          initiated_by: string
          notes?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          received_at?: string | null
          shipped_at?: string | null
          status?: string
          to_warehouse_id: string
          transfer_number?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_warehouse_id?: string
          id?: string
          initiated_by?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          received_at?: string | null
          shipped_at?: string | null
          status?: string
          to_warehouse_id?: string
          transfer_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_from_warehouse_id_fkey"
            columns: ["from_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_warehouse_id_fkey"
            columns: ["to_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_cardholders: {
        Row: {
          billing: Json
          created_at: string | null
          id: string
          individual: Json
          status: string
          stripe_cardholder_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing: Json
          created_at?: string | null
          id?: string
          individual: Json
          status?: string
          stripe_cardholder_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing?: Json
          created_at?: string | null
          id?: string
          individual?: Json
          status?: string
          stripe_cardholder_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sub_agents: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          parent_agent_id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          parent_agent_id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          parent_agent_id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_agents_parent_agent_id_fkey"
            columns: ["parent_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean | null
          plan: string
          starts_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          plan: string
          starts_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          plan?: string
          starts_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          lead_time_days: number | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          rating: number | null
          seller_id: string
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          lead_time_days?: number | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          seller_id: string
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          lead_time_days?: number | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          seller_id?: string
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      syndicat_contributions: {
        Row: {
          amount: number
          contribution_type: string
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          member_id: string | null
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          receipt_url: string | null
          status: string | null
        }
        Insert: {
          amount: number
          contribution_type: string
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          member_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          receipt_url?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          contribution_type?: string
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          member_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          receipt_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "syndicat_contributions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "syndicat_members"
            referencedColumns: ["id"]
          },
        ]
      }
      syndicat_finances: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string
          id: string
          reference_id: string | null
          syndicat_id: string
          transaction_date: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description: string
          id?: string
          reference_id?: string | null
          syndicat_id: string
          transaction_date?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string
          id?: string
          reference_id?: string | null
          syndicat_id?: string
          transaction_date?: string | null
          transaction_type?: string
        }
        Relationships: []
      }
      syndicat_geographic_areas: {
        Row: {
          city: string
          country_code: string
          country_name: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          region: string | null
          updated_at: string | null
        }
        Insert: {
          city: string
          country_code: string
          country_name: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          region?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string
          country_code?: string
          country_name?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          region?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      syndicat_meetings: {
        Row: {
          agora_channel: string | null
          attendees: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_virtual: boolean | null
          location: string | null
          meeting_date: string
          meeting_notes: string | null
          organizer_id: string | null
          status: string | null
          syndicat_id: string
          title: string
        }
        Insert: {
          agora_channel?: string | null
          attendees?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          meeting_date: string
          meeting_notes?: string | null
          organizer_id?: string | null
          status?: string | null
          syndicat_id: string
          title: string
        }
        Update: {
          agora_channel?: string | null
          attendees?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          meeting_date?: string
          meeting_notes?: string | null
          organizer_id?: string | null
          status?: string | null
          syndicat_id?: string
          title?: string
        }
        Relationships: []
      }
      syndicat_members: {
        Row: {
          badge_number: string
          city: string
          created_at: string | null
          id: string
          joined_at: string | null
          license_plate: string | null
          photo_url: string | null
          status: string | null
          syndicat_id: string
          updated_at: string | null
          user_id: string | null
          vehicle_number: string | null
          vest_number: string
        }
        Insert: {
          badge_number: string
          city: string
          created_at?: string | null
          id?: string
          joined_at?: string | null
          license_plate?: string | null
          photo_url?: string | null
          status?: string | null
          syndicat_id: string
          updated_at?: string | null
          user_id?: string | null
          vehicle_number?: string | null
          vest_number: string
        }
        Update: {
          badge_number?: string
          city?: string
          created_at?: string | null
          id?: string
          joined_at?: string | null
          license_plate?: string | null
          photo_url?: string | null
          status?: string | null
          syndicat_id?: string
          updated_at?: string | null
          user_id?: string | null
          vehicle_number?: string | null
          vest_number?: string
        }
        Relationships: []
      }
      syndicat_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          from_syndicat_id: string
          id: string
          is_read: boolean | null
          message: string
          message_type: string | null
          sender_id: string | null
          subject: string | null
          to_syndicat_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          from_syndicat_id: string
          id?: string
          is_read?: boolean | null
          message: string
          message_type?: string | null
          sender_id?: string | null
          subject?: string | null
          to_syndicat_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          from_syndicat_id?: string
          id?: string
          is_read?: boolean | null
          message?: string
          message_type?: string | null
          sender_id?: string | null
          subject?: string | null
          to_syndicat_id?: string
        }
        Relationships: []
      }
      syndicat_votes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          meeting_id: string | null
          options: Json
          requires_otp: boolean | null
          status: string | null
          title: string
          voting_deadline: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          meeting_id?: string | null
          options: Json
          requires_otp?: boolean | null
          status?: string | null
          title: string
          voting_deadline: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          meeting_id?: string | null
          options?: Json
          requires_otp?: boolean | null
          status?: string | null
          title?: string
          voting_deadline?: string
        }
        Relationships: [
          {
            foreignKeyName: "syndicat_votes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "syndicat_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      system_anomalies: {
        Row: {
          anomalies: Json
          created_at: string
          detected_at: string
          id: string
          metrics_snapshot: Json
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          anomalies?: Json
          created_at?: string
          detected_at?: string
          id?: string
          metrics_snapshot?: Json
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          anomalies?: Json
          created_at?: string
          detected_at?: string
          id?: string
          metrics_snapshot?: Json
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_configurations: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      taxi_moto_country_access: {
        Row: {
          country_code: string
          country_name: string
          created_at: string | null
          enabled_at: string | null
          enabled_by: string | null
          id: string
          is_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string | null
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string | null
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assigned_to: string | null
          courier_id: string
          created_at: string | null
          description: string
          gps_latitude: number | null
          gps_location: string | null
          gps_longitude: number | null
          id: string
          photo_url: string | null
          priority: number | null
          resolution_notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          ticket_number: string
          title: string
          type: Database["public"]["Enums"]["ticket_type"]
          union_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          courier_id: string
          created_at?: string | null
          description: string
          gps_latitude?: number | null
          gps_location?: string | null
          gps_longitude?: number | null
          id?: string
          photo_url?: string | null
          priority?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          ticket_number: string
          title: string
          type: Database["public"]["Enums"]["ticket_type"]
          union_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          courier_id?: string
          created_at?: string | null
          description?: string
          gps_latitude?: number | null
          gps_location?: string | null
          gps_longitude?: number | null
          id?: string
          photo_url?: string | null
          priority?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          ticket_number?: string
          title?: string
          type?: Database["public"]["Enums"]["ticket_type"]
          union_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tickets_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "tickets_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tickets_union_id_fkey"
            columns: ["union_id"]
            isOneToOne: false
            referencedRelation: "unions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"]
          description: string | null
          escrow_id: string | null
          id: string
          reference_id: string | null
          status: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_type"]
          description?: string | null
          escrow_id?: string | null
          id?: string
          reference_id?: string | null
          status?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          description?: string | null
          escrow_id?: string | null
          id?: string
          reference_id?: string | null
          status?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "escrow_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      travailleurs: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"] | null
          bureau_id: string
          date_created: string | null
          email: string
          id: string
          interface_url: string
          is_active: boolean | null
          nom: string
          telephone: string | null
          token: string
          updated_at: string | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"] | null
          bureau_id: string
          date_created?: string | null
          email: string
          id?: string
          interface_url: string
          is_active?: boolean | null
          nom: string
          telephone?: string | null
          token: string
          updated_at?: string | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"] | null
          bureau_id?: string
          date_created?: string | null
          email?: string
          id?: string
          interface_url?: string
          is_active?: boolean | null
          nom?: string
          telephone?: string | null
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "travailleurs_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "bureaux_syndicaux"
            referencedColumns: ["id"]
          },
        ]
      }
      union_badges: {
        Row: {
          badge_number: string
          bureau_name: string
          courier_id: string
          created_at: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          photo_url: string | null
          updated_at: string
          vest_number: string
        }
        Insert: {
          badge_number: string
          bureau_name: string
          courier_id: string
          created_at?: string
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          vest_number: string
        }
        Update: {
          badge_number?: string
          bureau_name?: string
          courier_id?: string
          created_at?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          vest_number?: string
        }
        Relationships: []
      }
      union_members: {
        Row: {
          courier_id: string
          id: string
          is_active: boolean | null
          joined_at: string | null
          union_id: string
        }
        Insert: {
          courier_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          union_id: string
        }
        Update: {
          courier_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          union_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "union_members_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: true
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "union_members_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "union_members_union_id_fkey"
            columns: ["union_id"]
            isOneToOne: false
            referencedRelation: "unions"
            referencedColumns: ["id"]
          },
        ]
      }
      unions: {
        Row: {
          country: string
          created_at: string | null
          gps_verified: boolean | null
          id: string
          is_active: boolean | null
          leader_id: string
          member_count: number | null
          name: string
          union_type: Database["public"]["Enums"]["union_type"]
          updated_at: string | null
        }
        Insert: {
          country: string
          created_at?: string | null
          gps_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          leader_id: string
          member_count?: number | null
          name: string
          union_type: Database["public"]["Enums"]["union_type"]
          updated_at?: string | null
        }
        Update: {
          country?: string
          created_at?: string | null
          gps_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          leader_id?: string
          member_count?: number | null
          name?: string
          union_type?: Database["public"]["Enums"]["union_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unions_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "unions_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_currency_settings: {
        Row: {
          auto_convert: boolean | null
          created_at: string | null
          id: string
          preferred_currency: string
          show_original_price: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_convert?: boolean | null
          created_at?: string | null
          id?: string
          preferred_currency: string
          show_original_price?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_convert?: boolean | null
          created_at?: string | null
          id?: string
          preferred_currency?: string
          show_original_price?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_currency_settings_preferred_currency_fkey"
            columns: ["preferred_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      user_debts: {
        Row: {
          amount: number
          created_at: string
          creditor_id: string
          currency: Database["public"]["Enums"]["currency_type"]
          debtor_id: string
          description: string | null
          due_date: string | null
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          creditor_id: string
          currency?: Database["public"]["Enums"]["currency_type"]
          debtor_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          creditor_id?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          debtor_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_features: {
        Row: {
          created_at: string
          enabled: boolean
          feature: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          feature: string
          id?: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          feature?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string
          network_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string
          network_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string
          network_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vendor_profiles: {
        Row: {
          address: Json | null
          business_name: string
          business_type: string
          created_at: string
          description: string | null
          email: string
          id: string
          is_active: boolean | null
          kyc_documents: Json | null
          kyc_status: string | null
          logo: string | null
          phone: string
          rating: number | null
          registration_number: string | null
          tax_id: string | null
          total_sales: number | null
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          address?: Json | null
          business_name: string
          business_type: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          kyc_documents?: Json | null
          kyc_status?: string | null
          logo?: string | null
          phone: string
          rating?: number | null
          registration_number?: string | null
          tax_id?: string | null
          total_sales?: number | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          address?: Json | null
          business_name?: string
          business_type?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          kyc_documents?: Json | null
          kyc_status?: string | null
          logo?: string | null
          phone?: string
          rating?: number | null
          registration_number?: string | null
          tax_id?: string | null
          total_sales?: number | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      vendor_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          order_id: string | null
          payout_request_id: string | null
          status: string | null
          type: string
          vendor_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          order_id?: string | null
          payout_request_id?: string | null
          status?: string | null
          type: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          order_id?: string | null
          payout_request_id?: string | null
          status?: string | null
          type?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_wallets: {
        Row: {
          balance: number | null
          id: string
          last_updated: string
          pending_amount: number | null
          total_earnings: number | null
          vendor_id: string | null
        }
        Insert: {
          balance?: number | null
          id?: string
          last_updated?: string
          pending_amount?: number | null
          total_earnings?: number | null
          vendor_id?: string | null
        }
        Update: {
          balance?: number | null
          id?: string
          last_updated?: string
          pending_amount?: number | null
          total_earnings?: number | null
          vendor_id?: string | null
        }
        Relationships: []
      }
      virtual_cards: {
        Row: {
          balance: number | null
          card_name: string
          card_number: string | null
          card_type: Database["public"]["Enums"]["card_type"]
          card_type_stripe: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"] | null
          cvv: string | null
          daily_limit: number | null
          expiry_date: string | null
          id: string
          is_employee_card: boolean | null
          last_four: string | null
          manager_id: string | null
          pin_hash: string | null
          shipping_address: Json | null
          spending_controls: Json | null
          status: Database["public"]["Enums"]["card_status"]
          stripe_card_id: string | null
          stripe_cardholder_id: string | null
          transaction_limit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          card_name: string
          card_number?: string | null
          card_type?: Database["public"]["Enums"]["card_type"]
          card_type_stripe?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"] | null
          cvv?: string | null
          daily_limit?: number | null
          expiry_date?: string | null
          id?: string
          is_employee_card?: boolean | null
          last_four?: string | null
          manager_id?: string | null
          pin_hash?: string | null
          shipping_address?: Json | null
          spending_controls?: Json | null
          status?: Database["public"]["Enums"]["card_status"]
          stripe_card_id?: string | null
          stripe_cardholder_id?: string | null
          transaction_limit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          card_name?: string
          card_number?: string | null
          card_type?: Database["public"]["Enums"]["card_type"]
          card_type_stripe?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"] | null
          cvv?: string | null
          daily_limit?: number | null
          expiry_date?: string | null
          id?: string
          is_employee_card?: boolean | null
          last_four?: string | null
          manager_id?: string | null
          pin_hash?: string | null
          shipping_address?: Json | null
          spending_controls?: Json | null
          status?: Database["public"]["Enums"]["card_status"]
          stripe_card_id?: string | null
          stripe_cardholder_id?: string | null
          transaction_limit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance_cny: number | null
          balance_eur: number | null
          balance_gnf: number | null
          balance_usd: number | null
          balance_xof: number | null
          created_at: string
          id: string
          is_frozen: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_cny?: number | null
          balance_eur?: number | null
          balance_gnf?: number | null
          balance_usd?: number | null
          balance_xof?: number | null
          created_at?: string
          id?: string
          is_frozen?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_cny?: number | null
          balance_eur?: number | null
          balance_gnf?: number | null
          balance_usd?: number | null
          balance_xof?: number | null
          created_at?: string
          id?: string
          is_frozen?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      warehouse_inventory: {
        Row: {
          id: string
          last_updated: string | null
          max_stock: number
          product_id: string
          quantity_available: number
          quantity_damaged: number
          quantity_reserved: number
          reorder_point: number
          safety_stock: number
          warehouse_id: string
          zone_location: string | null
        }
        Insert: {
          id?: string
          last_updated?: string | null
          max_stock?: number
          product_id: string
          quantity_available?: number
          quantity_damaged?: number
          quantity_reserved?: number
          reorder_point?: number
          safety_stock?: number
          warehouse_id: string
          zone_location?: string | null
        }
        Update: {
          id?: string
          last_updated?: string | null
          max_stock?: number
          product_id?: string
          quantity_available?: number
          quantity_damaged?: number
          quantity_reserved?: number
          reorder_point?: number
          safety_stock?: number
          warehouse_id?: string
          zone_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string
          country: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          seller_id: string
        }
        Insert: {
          address: string
          country: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          seller_id: string
        }
        Update: {
          address?: string
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "eligible_boost_vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "warehouses_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      eligible_boost_vendors: {
        Row: {
          end_date: string | null
          plan_tier: string | null
          vendor_id: string | null
        }
        Insert: {
          end_date?: string | null
          plan_tier?: never
          vendor_id?: string | null
        }
        Update: {
          end_date?: string | null
          plan_tier?: never
          vendor_id?: string | null
        }
        Relationships: []
      }
      shops_public_view: {
        Row: {
          banner_url: string | null
          business_hours: Json | null
          business_type: string | null
          created_at: string | null
          description: string | null
          id: string | null
          logo_url: string | null
          product_count: number | null
          seller_id: string | null
          shop_category: string | null
          shop_images: string[] | null
          shop_name: string | null
          slug: string | null
          social_links: Json | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          theme_color: string | null
        }
        Insert: {
          banner_url?: string | null
          business_hours?: Json | null
          business_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          logo_url?: string | null
          product_count?: number | null
          seller_id?: string | null
          shop_category?: string | null
          shop_images?: string[] | null
          shop_name?: string | null
          slug?: string | null
          social_links?: Json | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          theme_color?: string | null
        }
        Update: {
          banner_url?: string | null
          business_hours?: Json | null
          business_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          logo_url?: string | null
          product_count?: number | null
          seller_id?: string | null
          shop_category?: string | null
          shop_images?: string[] | null
          shop_name?: string | null
          slug?: string | null
          social_links?: Json | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          theme_color?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_commission: {
        Args: { p_transaction_amount: number; p_user_id: string }
        Returns: Json
      }
      calculate_remaining_debt: {
        Args: { debt_id: string }
        Returns: number
      }
      calculate_storage_usage: {
        Args: { user_id: string }
        Returns: number
      }
      check_and_assign_badges: {
        Args: { p_courier_id: string }
        Returns: undefined
      }
      check_stock_alerts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_security_tracking: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      confirm_delivery_escrow: {
        Args: { p_order_id: string }
        Returns: undefined
      }
      confirm_sale: {
        Args: { p_order_id: string; p_product_id: string; p_quantity: number }
        Returns: boolean
      }
      convert_currency: {
        Args: { amount: number; from_currency: string; to_currency: string }
        Returns: number
      }
      create_user_wallet: {
        Args: { user_id: string }
        Returns: undefined
      }
      detect_suspicious_activity: {
        Args: Record<PropertyKey, never>
        Returns: {
          last_violation: string
          suspicious_events: number
          user_id: string
        }[]
      }
      generate_badge_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_card_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_claim_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_client_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_cvv: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_employee_code: {
        Args: { forwarder_id: string }
        Returns: string
      }
      generate_invite_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_new_client_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_qr_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_readable_id: {
        Args: { id_column?: string; prefix: string; table_name: string }
        Returns: string
      }
      generate_report_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_tracking_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_tracking_code_international: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_transaction_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_country_default_currency: {
        Args: { country_code: string }
        Returns: string
      }
      get_my_shop_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          banner_url: string
          business_address: string
          business_hours: Json
          business_type: string
          contact_email: string
          contact_phone: string
          created_at: string
          custom_domain: string
          description: string
          id: string
          is_active: boolean
          logo_url: string
          product_count: number
          seller_id: string
          shop_category: string
          shop_images: string[]
          shop_name: string
          slug: string
          social_links: Json
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          theme_color: string
          updated_at: string
        }[]
      }
      get_shop_contact_for_order: {
        Args: { order_id: string; shop_id: string }
        Returns: {
          business_address: string
          contact_email: string
          contact_phone: string
        }[]
      }
      get_warehouse_public_info: {
        Args: { warehouse_id: string }
        Returns: {
          country: string
          id: string
          is_active: boolean
          name: string
        }[]
      }
      handle_escrow_dispute: {
        Args: { p_action: string; p_escrow_id: string; p_resolution?: string }
        Returns: undefined
      }
      is_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_feature_enabled: {
        Args: { feature_name: string; user_role: string }
        Returns: boolean
      }
      is_pdg_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_subscription_system_enabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_action_type: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
          p_record_id?: string
          p_severity?: string
          p_table_name?: string
        }
        Returns: string
      }
      make_user_pdg: {
        Args: { user_email: string }
        Returns: undefined
      }
      process_escrow_payment: {
        Args: {
          p_commission_rate?: number
          p_currency?: string
          p_customer_id: string
          p_order_id: string
          p_seller_id: string
          p_total_amount: number
        }
        Returns: string
      }
      process_wallet_transfer: {
        Args: {
          p_amount: number
          p_currency: string
          p_description?: string
          p_fee: number
          p_purpose?: string
          p_recipient_id: string
          p_reference: string
          p_sender_id: string
        }
        Returns: undefined
      }
      release_escrow_funds: {
        Args: { order_id: string }
        Returns: undefined
      }
      release_escrow_payment: {
        Args: { p_escrow_id: string }
        Returns: undefined
      }
      release_reservation: {
        Args: { p_order_id: string; p_product_id: string; p_quantity: number }
        Returns: boolean
      }
      require_authenticated_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      reserve_stock: {
        Args: { p_order_id: string; p_product_id: string; p_quantity: number }
        Returns: boolean
      }
      update_wallet_balance: {
        Args: { amount: number; currency_col: string; user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      access_level: "complet" | "limite" | "lecture_seule"
      alert_severity: "info" | "warning" | "critique"
      badge_type:
        | "speed"
        | "reliability"
        | "missions"
        | "excellence"
        | "veteran"
      card_status: "active" | "frozen" | "deleted"
      card_type: "basic" | "standard" | "premium"
      cargo_type:
        | "general"
        | "dangerous"
        | "perishable"
        | "fragile"
        | "valuable"
        | "oversized"
      currency_status: "active" | "inactive" | "deprecated"
      currency_type: "GNF" | "USD" | "EUR" | "XOF" | "CNY"
      document_type:
        | "commercial_invoice"
        | "packing_list"
        | "bill_of_lading"
        | "customs_declaration"
        | "certificate_origin"
        | "insurance_certificate"
        | "special_license"
      freight_forwarder_role:
        | "owner"
        | "manager"
        | "scanner"
        | "tracking"
        | "client_manager"
        | "reporter"
      incident_status: "pending" | "investigating" | "resolved" | "closed"
      incident_type: "loss" | "damage" | "theft" | "delay" | "other"
      incoterm:
        | "EXW"
        | "FCA"
        | "CPT"
        | "CIP"
        | "DAP"
        | "DPU"
        | "DDP"
        | "FAS"
        | "FOB"
        | "CFR"
        | "CIF"
      order_status:
        | "pending"
        | "confirmed"
        | "shipped"
        | "delivered"
        | "cancelled"
      product_type: "physical" | "digital"
      subscription_plan: "basic" | "standard" | "premium"
      ticket_status: "pending" | "in_progress" | "resolved"
      ticket_type: "incident" | "delay" | "breakdown" | "dispute" | "other"
      transaction_type: "payment" | "withdrawal" | "transfer" | "commission"
      transaction_type_card:
        | "credit"
        | "debit"
        | "freeze"
        | "unfreeze"
        | "create"
        | "delete"
        | "rename"
      transport_mode: "air" | "sea" | "road" | "rail" | "multimodal"
      union_type: "syndicat_moto" | "syndicat_voiture"
      user_role:
        | "client"
        | "seller"
        | "courier"
        | "transitaire"
        | "admin"
        | "taxi_moto"
      user_type: "pdg" | "bureau_syndical" | "travailleur"
      vehicle_type: "moto" | "voiture"
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
      access_level: ["complet", "limite", "lecture_seule"],
      alert_severity: ["info", "warning", "critique"],
      badge_type: ["speed", "reliability", "missions", "excellence", "veteran"],
      card_status: ["active", "frozen", "deleted"],
      card_type: ["basic", "standard", "premium"],
      cargo_type: [
        "general",
        "dangerous",
        "perishable",
        "fragile",
        "valuable",
        "oversized",
      ],
      currency_status: ["active", "inactive", "deprecated"],
      currency_type: ["GNF", "USD", "EUR", "XOF", "CNY"],
      document_type: [
        "commercial_invoice",
        "packing_list",
        "bill_of_lading",
        "customs_declaration",
        "certificate_origin",
        "insurance_certificate",
        "special_license",
      ],
      freight_forwarder_role: [
        "owner",
        "manager",
        "scanner",
        "tracking",
        "client_manager",
        "reporter",
      ],
      incident_status: ["pending", "investigating", "resolved", "closed"],
      incident_type: ["loss", "damage", "theft", "delay", "other"],
      incoterm: [
        "EXW",
        "FCA",
        "CPT",
        "CIP",
        "DAP",
        "DPU",
        "DDP",
        "FAS",
        "FOB",
        "CFR",
        "CIF",
      ],
      order_status: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      product_type: ["physical", "digital"],
      subscription_plan: ["basic", "standard", "premium"],
      ticket_status: ["pending", "in_progress", "resolved"],
      ticket_type: ["incident", "delay", "breakdown", "dispute", "other"],
      transaction_type: ["payment", "withdrawal", "transfer", "commission"],
      transaction_type_card: [
        "credit",
        "debit",
        "freeze",
        "unfreeze",
        "create",
        "delete",
        "rename",
      ],
      transport_mode: ["air", "sea", "road", "rail", "multimodal"],
      union_type: ["syndicat_moto", "syndicat_voiture"],
      user_role: [
        "client",
        "seller",
        "courier",
        "transitaire",
        "admin",
        "taxi_moto",
      ],
      user_type: ["pdg", "bureau_syndical", "travailleur"],
      vehicle_type: ["moto", "voiture"],
    },
  },
} as const
