// src/components/Auth/ForgotPasswordForm.tsx
import React, { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export const ForgotPasswordForm: React.FC<{ 
  onBackToLogin: () => void 
}> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // Simulación del envío (solo frontend por ahora)
    setTimeout(() => {
      setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.')
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex items-center justify-center min-h-[600px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Efecto de fondo decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl relative">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm"></div>
                  <Mail className="h-10 w-10 text-white relative z-10" />
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-3 tracking-tight">
                Recuperar Contraseña
              </h2>
              <p className="text-blue-100 text-base font-light">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </div>

            {/* Mensajes de estado */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-green-500/25 border border-green-400/40 rounded-2xl backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-3 text-green-300">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{message}</p>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-500/25 border border-red-400/40 rounded-2xl backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-3 text-red-300">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Formulario */}
            <form onSubmit={handleResetPassword} className="space-y-6">
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
                    required
                    disabled={loading}
                    className="w-full bg-transparent border border-white/40 text-white placeholder-blue-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-3 relative overflow-hidden group"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300"></div>
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="rounded-full h-5 w-5 border-b-2 border-white relative z-10"
                    />
                    <span className="text-base font-semibold relative z-10">ENVIANDO...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5 relative z-10" />
                    <span className="text-base font-semibold relative z-10">ENVIAR ENLACE DE RECUPERACIÓN</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Volver al login */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <motion.button
                onClick={onBackToLogin}
                disabled={loading}
                className="flex items-center justify-center space-x-3 text-blue-200 hover:text-white transition-colors duration-200 w-full py-3 rounded-2xl hover:bg-white/5 border border-white/20 hover:border-white/30 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="text-sm font-semibold">Volver al Inicio de Sesión</span>
              </motion.button>
            </div>

            {/* Footer del formulario */}
            <div className="text-center mt-6 pt-4 border-t border-white/10">
              <p className="text-blue-200/60 text-xs">
                © 2025 MarketHub. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}