// src/App.tsx
import React, { useState } from 'react'
import { useAuth } from './contexts/useAuth'
import LoginForm from './components/Auth/LoginForm'
import RegisterForm from './components/Auth/RegisterForm'
import UserDashboard from './components/User/UserDashboard'
import ProveedorDashboard from './components/Proveedor/ProveedorDashboard'
import AdminDashboard from './components/Admin/AdminDashboard'
import { LogOut, ShoppingBag, User, Shield, Menu, X, Star, Zap, Globe } from 'lucide-react'
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

// Componente mejorado para manejar la autenticación
const AuthHandler = ({ mode, onSwitchMode }: { mode: 'login' | 'register', onSwitchMode: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Encabezado principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            MarketHub
          </h1>
          <p className="text-xl text-white/80 font-light">
            Tu plataforma de comercio confiable
          </p>
        </motion.div>

        {/* Contenedor del formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl"
        >
          {/* Título del formulario */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white text-center mb-8"
          >
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </motion.h2>

          {/* Renderizar formulario correspondiente */}
          <div className="mb-8">
            {mode === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>

          {/* Separador */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-transparent px-4 text-white/60 text-sm">o</span>
            </div>
          </div>

          {/* Botón para cambiar entre modos - Diseño minimalista */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
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

        {/* Footer de autenticación */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8"
        >
          <p className="text-white/40 text-sm">
            © 2024 MarketHub. Todos los derechos reservados.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function App() {
  const { user, profile, loading, signOut } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Función para obtener el icono según el rol
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-6 w-6 text-purple-300" />
      case 'proveedor':
        return <ShoppingBag className="h-6 w-6 text-emerald-300" />
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
      default:
        return 'Cliente'
    }
  }

  // Renderizar el dashboard según el rol
  const renderDashboard = () => {
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

  // Pantalla de carga
  if (loading) {
    return <LoadingScreen />
  }

  // Pantalla de autenticación
  if (!user) {
    return (
      <AuthHandler 
        mode={authMode}
        onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
      />
    )
  }

  // Aplicación principal con header y footer
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 flex flex-col"
    >
      {/* Header */}
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
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r ${getRoleColor(profile?.role || 'user')} shadow-lg`}>
                  {getRoleIcon(profile?.role || 'user')}
                  <span className="text-sm font-bold capitalize">
                    {getRoleDisplayName(profile?.role || 'user')}
                  </span>
                </div>
                <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
                <div className="flex items-center space-x-3">
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
                  <div>
                    <p className="text-sm font-bold text-white">
                      {profile?.full_name || 'Usuario'}
                    </p>
                    <p className="text-xs text-white/70">Bienvenido de vuelta</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={signOut}
                className="flex items-center px-6 py-3 text-sm font-bold text-white hover:text-white/90 rounded-xl transition-all duration-300 hover:shadow-lg bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Cerrar Sesión
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
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${getRoleColor(profile?.role || 'user')} flex items-center justify-center shadow-lg`}>
                        {getRoleIcon(profile?.role || 'user')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {profile?.full_name || 'Usuario'}
                        </p>
                        <p className="text-xs text-white/70 font-semibold capitalize">
                          {getRoleDisplayName(profile?.role || 'user')}
                        </p>
                      </div>
                    </motion.div>

                    {/* Logout Button */}
                    <motion.button
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={signOut}
                      className="w-full flex items-center justify-center px-4 py-4 text-sm font-bold text-white hover:text-white/90 rounded-xl transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/20"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Cerrar Sesión
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Main Content - Los componentes manejan su propia personalización */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex-1 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 w-full"
      >
        {renderDashboard()}
      </motion.main>

      {/* Footer */}
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
                  <span className="font-bold">v2.0.0</span>
                </motion.div>
                <div className="text-white/70 text-xs">Ultima versión</div>
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
              <div className="text-white/70 text-sm mt-1">© 2025 MarketHub - Todos los derechos reservados</div>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  )
}

export default App