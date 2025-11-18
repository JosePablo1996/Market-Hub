// src/components/Auth/LoginForm.tsx
import React, { useState } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { Eye, EyeOff, Lock, Mail, LogIn, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { signIn, loading: authLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      await signIn(email, password)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(errorMessage)
    } finally {
      setFormLoading(false)
    }
  }

  // Función para calcular la fortaleza de la contraseña
  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25
    return Math.min(strength, 100)
  }

  // Función para obtener el color de la barra de progreso
  const getStrengthColor = (strength: number) => {
    if (strength < 40) return 'bg-red-500'
    if (strength < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  // Función para obtener el texto de fortaleza
  const getStrengthText = (strength: number) => {
    if (strength === 0) return ''
    if (strength < 40) return 'Débil'
    if (strength < 70) return 'Media'
    return 'Fuerte'
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthColor = getStrengthColor(passwordStrength)
  const strengthText = getStrengthText(passwordStrength)

  const isLoading = formLoading || authLoading

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.form 
        onSubmit={handleSubmit} 
        className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Efecto de fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Sección izquierda - Logo y título */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-8">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl shadow-2xl relative">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm"></div>
                  <LogIn className="h-10 w-10 text-white relative z-10" />
                </div>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-4 tracking-tight">
                Bienvenido de vuelta
              </h2>
              <p className="text-blue-100 text-lg font-light max-w-md">
                Ingresa tus credenciales para acceder a tu cuenta
              </p>
              
              {/* Información adicional */}
              <div className="mt-8">
                <p className="text-blue-200 text-sm font-light">
                  Al iniciar sesión, aceptas nuestros{' '}
                  <button className="text-white hover:text-blue-100 font-semibold transition-colors duration-200 hover:underline">
                    Términos de Servicio
                  </button>{' '}
                  y{' '}
                  <button className="text-white hover:text-blue-100 font-semibold transition-colors duration-200 hover:underline">
                    Política de Privacidad
                  </button>
                </p>
              </div>
            </div>

            {/* Sección derecha - Formulario */}
            <div className="flex-1 w-full">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/25 border border-red-400/40 text-red-100 px-6 py-4 rounded-2xl mb-6 backdrop-blur-sm"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Campos del Formulario */}
              <div className="space-y-6">
                {/* Email */}
                <div className="relative group">
                  <label className="block text-white text-sm font-semibold mb-3 tracking-wide" htmlFor="email">
                    CORREO ELECTRÓNICO
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200 h-5 w-5 transition-colors duration-200 group-focus-within:text-white z-10" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-transparent border border-white/40 text-white placeholder-blue-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>
                
                {/* Contraseña */}
                <div className="relative group">
                  <label className="block text-white text-sm font-semibold mb-3 tracking-wide" htmlFor="password">
                    CONTRASEÑA
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200 h-5 w-5 transition-colors duration-200 group-focus-within:text-white z-10" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-transparent border border-white/40 text-white placeholder-blue-200 rounded-2xl pl-12 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors duration-200 z-10 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Barra de progreso de fortaleza de contraseña */}
                  {password.length > 0 && (
                    <motion.div 
                      className="mt-4 space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Shield className={`h-4 w-4 ${
                            passwordStrength < 40 ? 'text-red-400' : 
                            passwordStrength < 70 ? 'text-yellow-400' : 'text-green-400'
                          }`} />
                          <span className="text-xs text-blue-100 font-medium">SEGURIDAD</span>
                        </div>
                        <span className={`text-sm font-bold ${
                          passwordStrength < 40 ? 'text-red-300' : 
                          passwordStrength < 70 ? 'text-yellow-300' : 'text-green-300'
                        }`}>
                          {strengthText}
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm overflow-hidden">
                        <motion.div 
                          className={`h-2 rounded-full transition-all duration-700 ease-out ${strengthColor} shadow-lg`}
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        ></motion.div>
                      </div>
                      <div className="text-xs text-blue-200 font-light">
                        {passwordStrength < 70 ? 
                          'Usa mayúsculas, números y símbolos' : 
                          '¡Contraseña segura!'
                        }
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Enlace de recuperación de contraseña */}
                  <div className="mt-4 text-right">
                    <button 
                      type="button"
                      className="text-blue-200 hover:text-white text-xs font-semibold transition-all duration-200 hover:underline tracking-wide disabled:opacity-50"
                      disabled={isLoading}
                    >
                      ¿OLVIDASTE TU CONTRASEÑA?
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Botón de Inicio de Sesión */}
              <div className="mt-8">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-3 relative overflow-hidden group"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300"></div>
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="rounded-full h-5 w-5 border-b-2 border-white relative z-10"
                      />
                      <span className="text-base font-semibold relative z-10">INICIANDO SESIÓN...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 relative z-10" />
                      <span className="text-base font-semibold relative z-10">INICIAR SESIÓN</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Footer del formulario */}
              <div className="text-center mt-8 pt-6 border-t border-white/10">
                <p className="text-blue-200/60 text-sm">
                  © 2025 MarketHub. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  )
}

export default LoginForm