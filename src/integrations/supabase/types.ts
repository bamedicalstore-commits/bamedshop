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
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string
          governorate: string
          id: string
          is_default: boolean
          label: string | null
          phone: string
          postal_code: string | null
          recipient_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string
          governorate: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone: string
          postal_code?: string | null
          recipient_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string
          governorate?: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone?: string
          postal_code?: string | null
          recipient_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          ce_certified: boolean
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          ce_certified?: boolean
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          ce_certified?: boolean
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          applied_coupon_code: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_coupon_code?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_coupon_code?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_applied_coupon_code_fkey"
            columns: ["applied_coupon_code"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["code"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          created_at: string
          id: string
          label: string
          type: Database["public"]["Enums"]["client_document_type"]
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          type: Database["public"]["Enums"]["client_document_type"]
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          type?: Database["public"]["Enums"]["client_document_type"]
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          type: Database["public"]["Enums"]["coupon_type"]
          valid_until: string | null
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          type: Database["public"]["Enums"]["coupon_type"]
          valid_until?: string | null
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          type?: Database["public"]["Enums"]["coupon_type"]
          valid_until?: string | null
          value?: number
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          email_orders: boolean
          email_promotions: boolean
          sms_orders: boolean
          user_id: string
        }
        Insert: {
          email_orders?: boolean
          email_promotions?: boolean
          sms_orders?: boolean
          user_id: string
        }
        Update: {
          email_orders?: boolean
          email_promotions?: boolean
          sms_orders?: boolean
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
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
      order_picking_items: {
        Row: {
          id: string
          order_id: string
          packed: boolean
          picked: boolean
          product_id: string
          quantity: number
          warehouse_location: string | null
        }
        Insert: {
          id?: string
          order_id: string
          packed?: boolean
          picked?: boolean
          product_id: string
          quantity: number
          warehouse_location?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          packed?: boolean
          picked?: boolean
          product_id?: string
          quantity?: number
          warehouse_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_picking_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_picking_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          created_at: string
          currency: string
          discount_total: number
          id: string
          invoice_url: string | null
          notes: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          placed_by_sales_rep_id: string | null
          preparation_status: Database["public"]["Enums"]["preparation_status"]
          shipping_address_id: string
          shipping_cost: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          currency?: string
          discount_total?: number
          id?: string
          invoice_url?: string | null
          notes?: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          placed_by_sales_rep_id?: string | null
          preparation_status?: Database["public"]["Enums"]["preparation_status"]
          shipping_address_id: string
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          currency?: string
          discount_total?: number
          id?: string
          invoice_url?: string | null
          notes?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          placed_by_sales_rep_id?: string | null
          preparation_status?: Database["public"]["Enums"]["preparation_status"]
          shipping_address_id?: string
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_code_fkey"
            columns: ["coupon_code"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_products: {
        Row: {
          pack_id: string
          product_id: string
          quantity: number
        }
        Insert: {
          pack_id: string
          product_id: string
          quantity?: number
        }
        Update: {
          pack_id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "pack_products_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pack_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      packs: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          pack_price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          pack_price: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          pack_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          payment_intent_id: string | null
          provider: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          payment_intent_id?: string | null
          provider?: string
          status: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          payment_intent_id?: string | null
          provider?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_documents: {
        Row: {
          created_at: string
          id: string
          label: string
          product_id: string
          type: Database["public"]["Enums"]["product_document_type"]
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          product_id: string
          type: Database["public"]["Enums"]["product_document_type"]
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          product_id?: string
          type?: Database["public"]["Enums"]["product_document_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_documents_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          created_at: string
          id: string
          position: number
          product_id: string
          type: Database["public"]["Enums"]["product_media_type"]
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          product_id: string
          type: Database["public"]["Enums"]["product_media_type"]
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          type?: Database["public"]["Enums"]["product_media_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_relations: {
        Row: {
          product_id: string
          related_product_id: string
          relation_type: string
        }
        Insert: {
          product_id: string
          related_product_id: string
          relation_type: string
        }
        Update: {
          product_id?: string
          related_product_id?: string
          relation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_relations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_relations_related_product_id_fkey"
            columns: ["related_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          brand_id: string | null
          category_id: string | null
          ce_certified: boolean
          created_at: string
          currency: string
          description: string | null
          id: string
          name: string
          price: number
          professional_price: number | null
          sku: string
          slug: string
          supplier_id: string | null
          technical_specs: Json
          updated_at: string
          warranty_months: number | null
        }
        Insert: {
          active?: boolean
          brand_id?: string | null
          category_id?: string | null
          ce_certified?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name: string
          price: number
          professional_price?: number | null
          sku: string
          slug: string
          supplier_id?: string | null
          technical_specs?: Json
          updated_at?: string
          warranty_months?: number | null
        }
        Update: {
          active?: boolean
          brand_id?: string | null
          category_id?: string | null
          ce_certified?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          professional_price?: number | null
          sku?: string
          slug?: string
          supplier_id?: string | null
          technical_specs?: Json
          updated_at?: string
          warranty_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          blocked_reason: string | null
          company_name: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          is_ba_medical_plus: boolean
          last_name: string
          phone: string | null
          profession: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          blocked_reason?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          first_name?: string
          id: string
          is_ba_medical_plus?: boolean
          last_name?: string
          phone?: string | null
          profession?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          blocked_reason?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_ba_medical_plus?: boolean
          last_name?: string
          phone?: string | null
          profession?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotion_categories: {
        Row: {
          category_id: string
          promotion_id: string
        }
        Insert: {
          category_id: string
          promotion_id: string
        }
        Update: {
          category_id?: string
          promotion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_categories_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          active: boolean
          created_at: string
          ends_at: string
          id: string
          name: string
          starts_at: string
          type: Database["public"]["Enums"]["promotion_type"]
          value: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          ends_at: string
          id?: string
          name: string
          starts_at: string
          type: Database["public"]["Enums"]["promotion_type"]
          value: number
        }
        Update: {
          active?: boolean
          created_at?: string
          ends_at?: string
          id?: string
          name?: string
          starts_at?: string
          type?: Database["public"]["Enums"]["promotion_type"]
          value?: number
        }
        Relationships: []
      }
      shipments: {
        Row: {
          carrier: string
          created_at: string
          id: string
          order_id: string
          shipped_at: string
          tracking_number: string
        }
        Insert: {
          carrier: string
          created_at?: string
          id?: string
          order_id: string
          shipped_at?: string
          tracking_number: string
        }
        Update: {
          carrier?: string
          created_at?: string
          id?: string
          order_id?: string
          shipped_at?: string
          tracking_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          active: boolean
          benefits: Json
          created_at: string
          id: string
          name: string
          price_monthly: number
        }
        Insert: {
          active?: boolean
          benefits?: Json
          created_at?: string
          id?: string
          name: string
          price_monthly: number
        }
        Update: {
          active?: boolean
          benefits?: Json
          created_at?: string
          id?: string
          name?: string
          price_monthly?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          id: string
          plan_id: string
          renews_at: string | null
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          id?: string
          plan_id: string
          renews_at?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          id?: string
          plan_id?: string
          renews_at?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warranties: {
        Row: {
          created_at: string
          end_date: string
          id: string
          order_id: string | null
          product_id: string
          start_date: string
          status: Database["public"]["Enums"]["warranty_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          order_id?: string | null
          product_id: string
          start_date: string
          status?: Database["public"]["Enums"]["warranty_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          order_id?: string | null
          product_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["warranty_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranties_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranties_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          added_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "client"
        | "commercial"
        | "preparateur"
        | "admin"
        | "super_admin"
      client_document_type:
        | "invoice"
        | "certificate"
        | "warranty_card"
        | "other"
      coupon_type: "percentage" | "fixed"
      notification_type: "order" | "subscription" | "promotion" | "system"
      order_status:
        | "pending_payment"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_method: "card" | "bank_transfer" | "cash_on_delivery"
      preparation_status:
        | "to_prepare"
        | "in_preparation"
        | "ready_to_ship"
        | "shipped"
      product_document_type:
        | "notice"
        | "certificate_ce"
        | "certificate_iso"
        | "other"
      product_media_type: "image" | "video"
      promotion_type: "percentage" | "fixed" | "bundle"
      subscription_status: "active" | "suspended" | "cancelled" | "pending"
      warranty_status: "active" | "expired" | "claimed"
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
      app_role: ["client", "commercial", "preparateur", "admin", "super_admin"],
      client_document_type: [
        "invoice",
        "certificate",
        "warranty_card",
        "other",
      ],
      coupon_type: ["percentage", "fixed"],
      notification_type: ["order", "subscription", "promotion", "system"],
      order_status: [
        "pending_payment",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      payment_method: ["card", "bank_transfer", "cash_on_delivery"],
      preparation_status: [
        "to_prepare",
        "in_preparation",
        "ready_to_ship",
        "shipped",
      ],
      product_document_type: [
        "notice",
        "certificate_ce",
        "certificate_iso",
        "other",
      ],
      product_media_type: ["image", "video"],
      promotion_type: ["percentage", "fixed", "bundle"],
      subscription_status: ["active", "suspended", "cancelled", "pending"],
      warranty_status: ["active", "expired", "claimed"],
    },
  },
} as const
