// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno de Supabase')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Tipos
export type UserRole = 'user' | 'proveedor' | 'admin'

export interface UserProfile {
  id: string
  role: UserRole
  full_name: string | null
  phone?: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  proveedor_id: string
  title: string
  description?: string | null
  price: number
  photo_url?: string | null
  status: 'pending' | 'approved' | 'rejected' | 'disabled'
  is_enabled: boolean
  admin_notes?: string | null
  approved_by?: string | null
  approved_at?: string | null
  created_at: string
  updated_at: string
  user_profiles?: UserProfile
}

// Exportación por defecto para compatibilidad
export default supabase