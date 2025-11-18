// src/contexts/AuthProvider.tsx
import React, { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { supabase } from '../lib/supabase'
import type { UserProfile, UserRole } from '../lib/supabase'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import type { AuthContextType } from './auth.types'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('Auth event:', event)
      setSession(session)
      setUser(session?.user ?? null)
      setProfileError(null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string, isRetry: boolean = false): Promise<void> => {
    try {
      console.log('Fetching profile for user:', userId, isRetry ? '(retry)' : '')
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No encontrado
          console.log('Profile not found')
          
          if (!isRetry) {
            // Primera vez que no se encuentra, esperar y reintentar
            console.log('Waiting for trigger and retrying...')
            await new Promise(resolve => setTimeout(resolve, 2000));
            return fetchProfile(userId, true)
          } else {
            // Segunda vez que no se encuentra, crear manualmente
            console.log('Trigger failed, creating profile manually...')
            await createUserProfile(userId)
            return
          }
        }
        
        console.error('Error fetching profile:', error)
        setProfileError(`Error al cargar perfil: ${error.message}`)
      } else if (data) {
        console.log('Profile loaded successfully:', data)
        setProfile(data)
        setProfileError(null)
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      setProfileError('Error inesperado al cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const createUserProfile = async (userId: string): Promise<void> => {
    try {
      console.log('Creating profile for user:', userId)
      
      // Obtener información del usuario de auth
      const { data: userData } = await supabase.auth.getUser()
      const userMetadata = userData?.user?.user_metadata
      
      const profileData = {
        id: userId,
        role: 'user' as UserRole,
        full_name: userMetadata?.full_name || 'Usuario',
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert(profileData)

      if (insertError) {
        console.error('Error creating profile:', insertError)
        
        // Si es error de duplicado, significa que ya existe (trigger funcionó)
        if (insertError.code === '23505') {
          console.log('Profile already exists (trigger worked), fetching...')
          await fetchProfile(userId, true)
          return
        }
        
        throw insertError
      }

      console.log('Profile created successfully')
      await fetchProfile(userId)
      
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      // Crear perfil temporal como último recurso
      const tempProfile: UserProfile = {
        id: userId,
        role: 'user',
        full_name: session?.user?.user_metadata?.full_name || 'Usuario',
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setProfile(tempProfile)
      setProfileError('Perfil temporal - Problemas con la base de datos')
    }
  }

  const signIn = async (email: string, password: string) => {
    setProfileError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const handleSignUp = async (email: string, password: string, fullName: string, userRole: 'user' | 'proveedor') => {
    setProfileError(null)
    
    try {
      console.log('🚀 INICIANDO REGISTRO para:', email, 'con rol:', userRole)
      
      // 1. Crear usuario en auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) {
        console.error('❌ Error en Auth:', authError)
        throw authError
      }

      if (!data.user) {
        throw new Error('No se pudo crear el usuario en Auth')
      }

      console.log('✅ Usuario creado en Auth, ID:', data.user.id)

      // 2. ESTRATEGIA AGGRESIVA: Crear/actualizar perfil INMEDIATAMENTE con el rol correcto
      console.log('🔄 Intentando crear/actualizar perfil con rol:', userRole)
      
      const profileData = {
        id: data.user.id,
        role: userRole, // Rol SELECCIONADO en el formulario
        full_name: fullName,
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Primero intentar INSERT
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert(profileData)

      if (insertError) {
        // Si falla por duplicado, hacer UPDATE
        if (insertError.code === '23505') {
          console.log('📝 Perfil ya existe, actualizando rol a:', userRole)
          
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ 
              role: userRole, // FORZAR el rol seleccionado
              full_name: fullName,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.user.id)

          if (updateError) {
            console.error('❌ Error actualizando rol:', updateError)
            throw new Error(`No se pudo asignar el rol de ${userRole}`)
          }
          
          console.log('✅ Rol actualizado exitosamente a:', userRole)
        } else {
          throw insertError
        }
      } else {
        console.log('✅ Perfil creado exitosamente con rol:', userRole)
      }

      // 3. VERIFICACIÓN FINAL - Asegurarse que el perfil tiene el rol correcto
      console.log('🔍 Verificando rol final...')
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data: finalProfile, error: finalError } = await supabase
        .from('user_profiles')
        .select('id, role, full_name')
        .eq('id', data.user.id)
        .single()

      if (finalError) {
        console.error('❌ Error verificando perfil final:', finalError)
      } else if (finalProfile) {
        console.log('✅ Perfil final verificado:', finalProfile)
        
        if (finalProfile.role !== userRole) {
          console.warn('⚠️  El rol no coincide, forzando actualización...')
          // Último intento para corregir el rol
          await supabase
            .from('user_profiles')
            .update({ role: userRole })
            .eq('id', data.user.id)
        }
      }

      // 4. CARGAR EL PERFIL ACTUALIZADO EN EL ESTADO
      await fetchProfile(data.user.id)
      
      console.log('🎉 REGISTRO COMPLETADO para rol:', userRole)
      
    } catch (error: unknown) {
      console.error('💥 ERROR en el proceso de registro:', error)
      if (error instanceof Error) {
        throw new Error(error.message || 'Error al crear la cuenta')
      } else {
        throw new Error('Error desconocido al crear la cuenta')
      }
    }
  }

  const signOut = async () => {
    setProfileError(null)
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    signIn,
    signUp: handleSignUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {profileError && (
        <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded max-w-md z-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{profileError}</p>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}