// src/components/Auth/RegisterForm.tsx
import React, { useState, useMemo } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { Eye, EyeOff, Lock, Mail, User, Phone, Shield, CheckCircle, ChevronDown, X, Eye as EyeIcon, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const RegisterForm: React.FC = () => {
  const { signUp, loading: authLoading, enableGuestMode } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'user' as 'user' | 'proveedor' | 'guest'
  })
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)

  const isLoading = formLoading || authLoading

  // Evaluador de fortaleza de contraseña mejorado
  const passwordStrength = useMemo(() => {
    if (!formData.password) return { strength: 0, label: 'Vacía', color: 'bg-gray-500', percentage: 0 }
    
    let score = 0
    
    const hasMinLength = formData.password.length >= 8
    const hasUpperCase = /[A-Z]/.test(formData.password)
    const hasLowerCase = /[a-z]/.test(formData.password)
    const hasNumbers = /[0-9]/.test(formData.password)
    const hasSpecialChars = /[^A-Za-z0-9]/.test(formData.password)
    const hasGoodLength = formData.password.length >= 12
    
    if (hasMinLength) score += 1
    if (hasUpperCase) score += 1
    if (hasLowerCase) score += 1
    if (hasNumbers) score += 1
    if (hasSpecialChars) score += 2
    if (hasGoodLength) score += 1
    
    const maxScore = 7
    const percentage = (score / maxScore) * 100
    
    if (percentage < 40) {
      return { strength: score, label: 'Débil', color: 'bg-red-500', percentage }
    } else if (percentage < 70) {
      return { strength: score, label: 'Media', color: 'bg-yellow-500', percentage }
    } else if (percentage < 90) {
      return { strength: score, label: 'Fuerte', color: 'bg-green-500', percentage }
    } else {
      return { strength: score, label: 'Muy Fuerte', color: 'bg-blue-500', percentage }
    }
  }, [formData.password])

  const passwordsMatch = useMemo(() => {
    return formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
  }, [formData.password, formData.confirmPassword])

  const isFormValid = useMemo(() => {
    if (formData.role === 'guest') {
      return true // Para invitado, no necesita validación de formulario
    }
    return (
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.fullName &&
      passwordsMatch &&
      passwordStrength.percentage >= 40
    )
  }, [formData, passwordsMatch, passwordStrength])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRoleSelect = (role: 'user' | 'proveedor' | 'guest') => {
    setFormData(prev => ({ ...prev, role }))
    setShowRoleModal(false)
    
    // Si selecciona invitado, activar modo invitado inmediatamente
    if (role === 'guest') {
      enableGuestMode()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Si es invitado, no procesar el formulario normal
    if (formData.role === 'guest') {
      enableGuestMode()
      return
    }
    
    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (passwordStrength.percentage < 40) {
      setError('La contraseña es demasiado débil. Por favor, elige una contraseña más segura.')
      return
    }

    setFormLoading(true)
    setError(null)

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role as 'user' | 'proveedor' // Excluir 'guest' ya que se maneja diferente
      )
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else if (typeof err === 'string') {
        setError(err)
      } else {
        setError('Error desconocido al registrar usuario')
      }
    } finally {
      setFormLoading(false)
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'user':
        return 'Compra productos y disfruta de ofertas exclusivas'
      case 'proveedor':
        return 'Publica y gestiona tus productos en nuestra plataforma'
      case 'guest':
        return 'Explora el catálogo sin crear una cuenta permanente'
      default:
        return ''
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user':
        return '👤'
      case 'proveedor':
        return '🏢'
      case 'guest':
        return '👁️'
      default:
        return '👤'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'user':
        return 'Usuario Comprador'
      case 'proveedor':
        return 'Proveedor'
      case 'guest':
        return 'Invitado'
      default:
        return role
    }
  }

  const passwordCriteria = [
    { label: 'Mínimo 8 caracteres', met: formData.password.length >= 8 },
    { label: 'Al menos una mayúscula', met: /[A-Z]/.test(formData.password) },
    { label: 'Al menos una minúscula', met: /[a-z]/.test(formData.password) },
    { label: 'Al menos un número', met: /[0-9]/.test(formData.password) },
    { label: 'Al menos un carácter especial', met: /[^A-Za-z0-9]/.test(formData.password) },
    { label: '12+ caracteres (recomendado)', met: formData.password.length >= 12 }
  ]

  // Si el rol es invitado, mostrar vista simplificada
  if (formData.role === 'guest') {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <motion.div 
          className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Efecto de fondo decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10 rounded-3xl"></div>
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-orange-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 text-center">
            {/* Header del Formulario */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl mx-auto mb-4 shadow-2xl">
                <EyeIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent mb-3">
                Modo Invitado
              </h2>
              <p className="text-amber-200 text-lg">
                Explora nuestro catálogo sin registrarte
              </p>
            </div>

            {/* Información del modo invitado */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm mb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-white font-semibold">Acceso inmediato al catálogo</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-white font-semibold">Sin necesidad de registro</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-white font-semibold">Navegación libre y segura</span>
                </div>
              </div>
            </div>

            {/* Botón para continuar como invitado */}
            <motion.button
              onClick={enableGuestMode}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-3 relative overflow-hidden group"
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
                  <span className="text-base font-semibold relative z-10">Iniciando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 relative z-10" />
                  <span className="text-base font-semibold relative z-10">Comenzar a Explorar</span>
                </>
              )}
            </motion.button>

            {/* Botón para cambiar tipo de cuenta */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowRoleModal(true)}
                className="text-amber-200 hover:text-white underline transition duration-200 font-semibold"
              >
                Quiero crear una cuenta permanente
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
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
          {/* Header del Formulario */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto mb-4 shadow-2xl">
              <User className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3">
              Crear Cuenta
            </h2>
            <p className="text-purple-200 text-lg">
              Únete a nuestra comunidad de compras
            </p>
          </div>
          
          {/* Mensaje de Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/25 border border-red-400/40 text-red-100 px-6 py-4 rounded-2xl mb-8 backdrop-blur-sm"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
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

          {/* Botón para abrir modal de Tipo de Cuenta */}
          <div className="mb-8 text-center">
            <motion.button
              type="button"
              onClick={() => setShowRoleModal(true)}
              disabled={isLoading}
              className="bg-white/10 border border-white/40 text-white rounded-2xl px-8 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/15 text-left flex items-center justify-center space-x-4 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Seleccionar tipo de cuenta. Actualmente seleccionado: ${getRoleDisplayName(formData.role)}`}
            >
              <Shield className="text-purple-300 h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold text-lg">
                  {getRoleDisplayName(formData.role)}
                </div>
                <div className="text-purple-200 text-sm">
                  Haz clic para cambiar el tipo de cuenta
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-purple-300" />
            </motion.button>
          </div>
          
          {/* Campos del Formulario - 2 columnas del mismo tamaño */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            
            {/* Columna 1: Información Personal */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </h3>
              
              <div className="space-y-4">
                <div className="relative group">
                  <label className="block text-white text-sm font-semibold mb-2" htmlFor="fullName">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 h-4 w-4 transition-colors duration-200 group-focus-within:text-white z-10" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-full bg-transparent border border-white/40 text-white placeholder-purple-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 relative z-10 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-white text-sm font-semibold mb-2" htmlFor="email">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 h-4 w-4 transition-colors duration-200 group-focus-within:text-white z-10" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-full bg-transparent border border-white/40 text-white placeholder-purple-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 relative z-10 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-white text-sm font-semibold mb-2" htmlFor="phone">
                    Teléfono <span className="text-purple-300 font-normal">(opcional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 h-4 w-4 transition-colors duration-200 group-focus-within:text-white z-10" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-full bg-transparent border border-white/40 text-white placeholder-purple-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 relative z-10 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 2: Seguridad - Mismo tamaño que Información Personal */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Seguridad
              </h3>
              
              <div className="space-y-4">
                <div className="relative group">
                  <label className="block text-white text-sm font-semibold mb-2" htmlFor="password">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 h-4 w-4 transition-colors duration-200 group-focus-within:text-white z-10" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-full bg-transparent border border-white/40 text-white placeholder-purple-300 rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 relative z-10 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors duration-200 z-10 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-white text-sm font-semibold mb-2" htmlFor="confirmPassword">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 h-4 w-4 transition-colors duration-200 group-focus-within:text-white z-10" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full bg-transparent border ${
                        formData.confirmPassword 
                          ? passwordsMatch 
                            ? 'border-green-400/50' 
                            : 'border-red-400/50'
                          : 'border-white/40'
                      } text-white placeholder-purple-300 rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 relative z-10 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors duration-200 z-10 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Indicador de coincidencia de contraseñas */}
                  {formData.confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-2"
                    >
                      {passwordsMatch ? (
                        <div className="flex items-center space-x-2 text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs font-semibold">Las contraseñas coinciden</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-red-400">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-semibold">Las contraseñas no coinciden</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Barra de Fortaleza de Contraseña - Solo se muestra cuando hay contraseña */}
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-4 border-t border-white/20 mt-4 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-purple-200 font-semibold">NIVEL DE SEGURIDAD:</span>
                      <span className={`text-xs font-bold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm overflow-hidden">
                      <motion.div 
                        className={`h-2 rounded-full transition-all duration-700 ease-out ${passwordStrength.color} shadow-lg`}
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength.percentage}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                    
                    {/* Criterios de Contraseña */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {passwordCriteria.map((criterion, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          {criterion.met ? (
                            <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border-2 border-purple-300 flex-shrink-0"></div>
                          )}
                          <span className={`text-xs ${criterion.met ? 'text-green-300' : 'text-purple-300'}`}>
                            {criterion.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Estado del Formulario - Horizontal y abajo */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm mb-6">
            <h4 className="text-white font-semibold text-lg mb-4 text-center">Estado del Formulario</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2 justify-center">
                {formData.fullName ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-purple-300"></div>
                )}
                <span className={`text-sm ${formData.fullName ? 'text-green-300' : 'text-purple-300'}`}>
                  Nombre
                </span>
              </div>
              <div className="flex items-center space-x-2 justify-center">
                {formData.email ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-purple-300"></div>
                )}
                <span className={`text-sm ${formData.email ? 'text-green-300' : 'text-purple-300'}`}>
                  Email
                </span>
              </div>
              <div className="flex items-center space-x-2 justify-center">
                {passwordStrength.percentage >= 40 ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-purple-300"></div>
                )}
                <span className={`text-sm ${passwordStrength.percentage >= 40 ? 'text-green-300' : 'text-purple-300'}`}>
                  Contraseña
                </span>
              </div>
              <div className="flex items-center space-x-2 justify-center">
                {passwordsMatch ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-purple-300"></div>
                )}
                <span className={`text-sm ${passwordsMatch ? 'text-green-300' : 'text-purple-300'}`}>
                  Coinciden
                </span>
              </div>
            </div>
          </div>
          
          {/* Botón de Registro */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <motion.button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-3 relative overflow-hidden group"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              aria-label={isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300"></div>
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="rounded-full h-5 w-5 border-b-2 border-white relative z-10"
                  />
                  <span className="text-base font-semibold relative z-10">Creando Cuenta...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 relative z-10" />
                  <span className="text-base font-semibold relative z-10">Crear Cuenta</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Información Adicional */}
          <div className="mt-6 text-center">
            <p className="text-purple-200 text-sm">
              Al registrarte, aceptas nuestros{' '}
              <button 
                type="button"
                className="text-white hover:text-purple-300 underline transition duration-200 font-semibold"
                aria-label="Leer términos de servicio"
              >
                Términos de Servicio
              </button>{' '}
              y{' '}
              <button 
                type="button"
                className="text-white hover:text-purple-300 underline transition duration-200 font-semibold"
                aria-label="Leer política de privacidad"
              >
                Política de Privacidad
              </button>
            </p>
          </div>
        </div>
      </motion.form>

      {/* Modal de Selección de Rol */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRoleModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-800/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Selecciona tu Tipo de Cuenta</h3>
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="text-purple-300 hover:text-white transition-colors duration-200 p-2"
                  aria-label="Cerrar modal de selección de rol"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {(['user', 'proveedor', 'guest'] as const).map((role) => (
                  <motion.button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    disabled={isLoading}
                    className={`w-full p-4 text-left rounded-2xl transition-all duration-300 border-2 ${
                      formData.role === role 
                        ? role === 'guest' 
                          ? 'bg-amber-600/20 border-amber-500 shadow-lg' 
                          : 'bg-purple-600/20 border-purple-500 shadow-lg'
                        : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-purple-400/50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label={`Seleccionar tipo de cuenta: ${getRoleDisplayName(role)}`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{getRoleIcon(role)}</span>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-white text-lg">
                          {getRoleDisplayName(role)}
                        </div>
                        <div className={`text-sm mt-1 ${role === 'guest' ? 'text-amber-200' : 'text-purple-200'}`}>
                          {getRoleDescription(role)}
                        </div>
                      </div>
                      {formData.role === role && (
                        <CheckCircle className={`h-6 w-6 flex-shrink-0 ${
                          role === 'guest' ? 'text-amber-400' : 'text-green-400'
                        }`} />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 border border-white/20"
                  aria-label="Cerrar modal"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RegisterForm