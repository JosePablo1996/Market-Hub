// src/lib/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          role: 'user' | 'proveedor' | 'admin'
          full_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'user' | 'proveedor' | 'admin'
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'user' | 'proveedor' | 'admin'
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          proveedor_id: string
          title: string
          description: string | null
          price: number
          photo_url: string | null
          status: 'pending' | 'approved' | 'rejected' | 'disabled'
          is_enabled: boolean
          admin_notes: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          proveedor_id: string
          title: string
          description?: string | null
          price: number
          photo_url?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'disabled'
          is_enabled?: boolean
          admin_notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          proveedor_id?: string
          title?: string
          description?: string | null
          price?: number
          photo_url?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'disabled'
          is_enabled?: boolean
          admin_notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_proveedor_id_fkey"
            columns: ["proveedor_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_approved_by_fkey"
            columns: ["approved_by"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}