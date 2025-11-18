// src/contexts/auth.types.ts
import type { Session, User } from '@supabase/supabase-js'
import type { UserProfile } from '../lib/supabase'

export interface AuthContextType {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, role: 'user' | 'proveedor') => Promise<void>
  signOut: () => Promise<void>
}