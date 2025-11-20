// src/App.tsx
import React, { useState, useEffect } from 'react'
import { useAuth } from './contexts/useAuth'
import LoginForm from './components/Auth/LoginForm'
import RegisterForm from './components/Auth/RegisterForm'
import UserDashboard from './components/User/UserDashboard'
import ProveedorDashboard from './components/Proveedor/ProveedorDashboard'
import AdminDashboard from './components/Admin/AdminDashboard'
import { GuestDashboard } from './components/Guest/GuestDashboard'
import { SplashScreen } from './components/Splash/SplashScreen'
import { LogOut, ShoppingBag, User, Shield, Menu, X, Star, Zap, Globe, Eye, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Estilos glassmorphism para header y footer
const glassStyles = {
  header: {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(236, 72, 153, 0.1) 100%)',
    backdropFilter: 'blur(25px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
  },
  footer: {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 50%, rgba(236, 72, 153, 0.08) 100%)',
    backdropFilter: 'blur(25px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 -8px 32px 0 rgba(31, 38, 135, 0.15)'
  }
}

// Componente para la pantalla de carga
const LoadingScreen = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-20 w-20 border-4 border-white border-t-transparent mx-auto mb-6"
        />
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white font-semibold text-lg"
        >
          Cargando MarketHub...
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

// Modal de éxito de inicio de sesión similar a la imagen
const SuccessModal = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 w-full max-w-md border border-white/10 shadow-2xl"
          >
            {/* Header del modal */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <CheckCircle className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">
                ¡Sesión Iniciada Exitosamente!
              </h3>
              <p className="text-white/70">
                Bienvenido de nuevo a <strong>MarketHub</strong>.
              </p>
            </div>

            {/* Contenido del modal */}
            <div className="space-y-4 mb-6">
              <p className="text-white/80 text-sm text-center">
                Tu sesión ha sido iniciada correctamente. Ahora puedes acceder a todas las funcionalidades de la plataforma.
              </p>

              <div className="bg-blue-500/10 rounded-2xl p-4 border border-blue-400/20">
                <p className="text-blue-300 font-semibold text-sm mb-2 text-center">
                  Continuar al Sistema
                </p>
                <p className="text-blue-200 text-xs text-center">
                  Ahora puedes explorar todas las funciones disponibles en tu dashboard personalizado.
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg"
            >
              Continuar al Dashboard
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Modal de confirmación para cerrar sesión
const LogoutConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  userName,
  userRole,
  userAvatar,
  isGuestMode 
}: { 
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName: string
  userRole: string
  userAvatar: React.ReactNode
  isGuestMode: boolean
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
          >
            {/* Encabezado del modal */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center shadow-lg"
              >
                <LogOut className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {isGuestMode ? 'Salir del modo invitado' : 'Cerrar Sesión'}
              </h3>
              <p className="text-white/70">
                {isGuestMode 
                  ? '¿Estás seguro de que quieres salir del modo invitado?' 
                  : '¿Estás seguro de que quieres cerrar tu sesión?'}
              </p>
            </div>

            {/* Información del usuario */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10"
            >
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {userAvatar}
                </div>
                
                {/* Información del usuario */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{userName}</p>
                  <p className="text-white/60 text-sm capitalize">{userRole}</p>
                </div>
              </div>
            </motion.div>

            {/* Botones de acción */}
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-white/20"
              >
                No, Cancelar
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg"
              >
                Sí, {isGuestMode ? 'Salir' : 'Cerrar Sesión'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Componente mejorado para manejar la autenticación con modo invitado
const AuthHandler = ({ 
  mode, 
  onSwitchMode,
  onEnableGuestMode 
}: { 
  mode: 'login' | 'register'
  onSwitchMode: () => void
  onEnableGuestMode: () => void
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Encabezado principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            MarketHub
          </h1>
          <p className="text-xl text-white/80 font-light mb-8">
            Tu plataforma de comercio confiable
          </p>

          {/* Botón para modo invitado - POSICIONADO ARRIBA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-8"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                y: -2,
                boxShadow: "0 20px 40px rgba(245, 158, 11, 0.3)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onEnableGuestMode}
              className="group relative bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold px-12 py-5 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-4 shadow-2xl border-2 border-amber-300/30 overflow-hidden"
            >
              {/* Efecto de brillo */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"
                animate={{ x: ["0%", "200%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Icono con animación */}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Eye className="h-7 w-7" />
              </motion.div>
              
              {/* Texto */}
              <div className="text-center">
                <div className="text-lg font-bold tracking-wide">
                  Explorar como Invitado
                </div>
                <div className="text-amber-100 text-sm font-medium mt-1">
                  Accede al catálogo sin registro
                </div>
              </div>

              {/* Efecto de borde brillante */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-200/0 via-amber-200/20 to-amber-200/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Separador elegante */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-white/30"></div>
            <span className="text-white/50 text-sm font-medium">O ingresa con tu cuenta</span>
            <div className="h-px w-20 bg-gradient-to-r from-white/30 to-transparent"></div>
          </div>
        </motion.div>

        {/* Contenedor del formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl"
        >
          {/* Título del formulario */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-3xl font-bold text-white text-center mb-8"
          >
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </motion.h2>

          {/* Renderizar formulario correspondiente */}
          <div className="mb-8">
            {mode === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>

          {/* Botón para cambiar entre modos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <p className="text-white/70 mb-4">
              {mode === 'login' ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSwitchMode}
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:bg-white/30 hover:shadow-lg"
            >
              {mode === 'login' ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

function App() {
  const { user, profile, loading, signOut, guestMode, enableGuestMode, disableGuestMode } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [hasShownSuccess, setHasShownSuccess] = useState(false)

  // Corregir el error del useEffect usando un flag
  useEffect(() => {
    // Solo mostrar el modal de éxito si el usuario se acaba de autenticar
    // y no hemos mostrado el modal antes
    if (user && !guestMode && !loading && !hasShownSuccess) {
      // Usar setTimeout para evitar el setState síncrono dentro del efecto
      const timer = setTimeout(() => {
        setShowSuccessModal(true)
        setHasShownSuccess(true)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [user, guestMode, loading, hasShownSuccess])

  // Función para obtener el icono según el rol
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-6 w-6 text-purple-300" />
      case 'proveedor':
        return <ShoppingBag className="h-6 w-6 text-emerald-300" />
      case 'guest':
        return <Eye className="h-6 w-6 text-amber-300" />
      default:
        return <User className="h-6 w-6 text-blue-300" />
    }
  }

  // Función para obtener el color según el rol
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-purple-500 to-purple-700 text-white shadow-purple-500/25'
      case 'proveedor':
        return 'from-emerald-500 to-green-700 text-white shadow-emerald-500/25'
      case 'guest':
        return 'from-amber-500 to-orange-600 text-white shadow-amber-500/25'
      default:
        return 'from-blue-500 to-cyan-600 text-white shadow-blue-500/25'
    }
  }

  // Función para obtener el nombre del rol
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'proveedor':
        return 'Proveedor'
      case 'guest':
        return 'Invitado'
      default:
        return 'Cliente'
    }
  }

  // Renderizar el dashboard según el rol o modo
  const renderDashboard = () => {
    // Si está en modo invitado
    if (guestMode) {
      return <GuestDashboard />
    }

    // Si está autenticado con un rol específico
    switch (profile?.role) {
      case 'admin':
        return <AdminDashboard />
      case 'proveedor':
        return <ProveedorDashboard />
      case 'user':
        return <UserDashboard />
      default:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <p className="text-white">No se pudo determinar tu rol. Contacta al administrador.</p>
          </motion.div>
        )
    }
  }

  // Función para manejar el cierre de sesión con confirmación
  const handleSignOutWithConfirmation = () => {
    setShowLogoutModal(true)
  }

  // Función para confirmar el cierre de sesión
  const confirmSignOut = async () => {
    setShowLogoutModal(false)
    // Resetear el flag de éxito al cerrar sesión
    setHasShownSuccess(false)
    await signOut()
    // Asegurarse de que el modo invitado se desactive al cerrar sesión
    if (guestMode) {
      disableGuestMode()
    }
  }

  // Función para activar modo invitado
  const handleEnableGuestMode = () => {
    enableGuestMode()
  }

  // Avatar del usuario
  const userAvatar = (
    <motion.div 
      whileHover={{ scale: 1.1 }}
      className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
      <User className="h-6 w-6 text-white relative z-10" />
    </motion.div>
  )

  // Mostrar Splash Screen primero
  if (showSplash) {
    return <SplashScreen onContinue={() => setShowSplash(false)} />
  }

  // Pantalla de carga
  if (loading) {
    return <LoadingScreen />
  }

  // Pantalla de autenticación (no hay usuario y no es modo invitado)
  if (!user && !guestMode) {
    return (
      <AuthHandler 
        mode={authMode}
        onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        onEnableGuestMode={handleEnableGuestMode}
      />
    )
  }

  // Aplicación principal con header y footer para usuarios autenticados Y modo invitado
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 flex flex-col"
    >
      {/* Header - Diseño original glassmorphism */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        style={glassStyles.header}
        className="sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-4"
            >
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl shadow-2xl relative overflow-hidden">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                  <ShoppingBag className="h-7 w-7 text-white relative z-10" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-1 bg-white/20 rounded-2xl blur-sm"
                  />
                </div>
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
                >
                  MarketHub
                </motion.h1>
              </div>
            </motion.div>

            {/* Desktop User Info */}
            <div className="hidden md:flex items-center space-x-6">
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="flex items-center space-x-4 rounded-2xl px-6 py-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20"
              >
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r ${getRoleColor(guestMode ? 'guest' : profile?.role || 'user')} shadow-lg`}>
                  {getRoleIcon(guestMode ? 'guest' : profile?.role || 'user')}
                  <span className="text-sm font-bold capitalize">
                    {getRoleDisplayName(guestMode ? 'guest' : profile?.role || 'user')}
                  </span>
                </div>
                <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
                <div className="flex items-center space-x-3">
                  {userAvatar}
                  <div>
                    <p className="text-sm font-bold text-white">
                      {guestMode ? 'Invitado' : profile?.full_name || 'Usuario'}
                    </p>
                    <p className="text-xs text-white/70">
                      {guestMode ? 'Modo de exploración' : 'Bienvenido de vuelta'}
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOutWithConfirmation}
                className="flex items-center px-6 py-3 text-sm font-bold text-white hover:text-white/90 rounded-xl transition-all duration-300 hover:shadow-lg bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <LogOut className="h-5 w-5 mr-2" />
                {guestMode ? 'Salir del modo invitado' : 'Cerrar Sesión'}
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.div 
              whileTap={{ scale: 0.9 }}
              className="flex md:hidden"
            >
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-3 rounded-xl text-white hover:text-white/90 transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="md:hidden overflow-hidden"
              >
                <div className="rounded-2xl my-4 p-6 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20">
                  <div className="space-y-4">
                    {/* User Info */}
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${getRoleColor(guestMode ? 'guest' : profile?.role || 'user')} flex items-center justify-center shadow-lg`}>
                        {getRoleIcon(guestMode ? 'guest' : profile?.role || 'user')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {guestMode ? 'Invitado' : profile?.full_name || 'Usuario'}
                        </p>
                        <p className="text-xs text-white/70 font-semibold capitalize">
                          {getRoleDisplayName(guestMode ? 'guest' : profile?.role || 'user')}
                        </p>
                      </div>
                    </motion.div>

                    {/* Logout Button */}
                    <motion.button
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSignOutWithConfirmation}
                      className="w-full flex items-center justify-center px-4 py-4 text-sm font-bold text-white hover:text-white/90 rounded-xl transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/20"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      {guestMode ? 'Salir del modo invitado' : 'Cerrar Sesión'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex-1 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 w-full"
      >
        {renderDashboard()}
      </motion.main>

      {/* Footer - Glassmorphism */}
      <motion.footer 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        style={glassStyles.footer}
        className="py-10 mt-auto"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-8 lg:space-y-0">
            
            {/* Logo y Info */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Zap className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-white text-lg">MarketHub</h3>
                <p className="text-white/70 text-sm">
                  {guestMode ? 'Modo Invitado Activo' : 'Plataforma de Comercio'}
                </p>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center space-x-12"
            >
              <div className="text-center">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center space-x-2 text-white mb-2"
                >
                  <Globe className="h-5 w-5 text-blue-300" />
                  <span className="font-bold">En línea</span>
                </motion.div>
                <div className="text-white/70 text-xs">Sistema activo</div>
              </div>
              
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
              
              <div className="text-center">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center space-x-2 text-white mb-2"
                >
                  <Star className="h-5 w-5 text-yellow-300" />
                  <span className="font-bold">v2.2.0</span>
                </motion.div>
                <div className="text-white/70 text-xs">Versión estable</div>
              </div>
            </motion.div>

            {/* Developer Info */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center lg:text-right"
            >
              <div className="flex items-center justify-center lg:justify-end space-x-2 text-white mb-2">
                <span>Desarrollado con</span>
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-red-300"
                >
                  ❤️
                </motion.span>
                <span>por</span>
              </div>
              <div className="font-bold text-white bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent text-lg">
                Jose Pablo Miranda Quintanilla
              </div>
            </motion.div>
          </div>
        </div>
      </motion.footer>

      {/* Modal de éxito de inicio de sesión */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Modal de confirmación para cerrar sesión */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmSignOut}
        userName={guestMode ? 'Invitado' : profile?.full_name || 'Usuario'}
        userRole={getRoleDisplayName(guestMode ? 'guest' : profile?.role || 'user')}
        userAvatar={userAvatar}
        isGuestMode={guestMode}
      />
    </motion.div>
  )
}

export default App