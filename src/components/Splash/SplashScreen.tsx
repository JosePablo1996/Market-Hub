// src/components/Splash/SplashScreen.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Zap, ArrowRight, Atom, Sparkles, Shield, Users, Globe, Database } from 'lucide-react'

interface SplashScreenProps {
  onContinue: () => void
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  // Partículas predefinidas para evitar Math.random en render
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (i * 50) % 1200,
    y: (i * 40) % 800,
    size: (i % 5) * 15 + 20
  }))

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 flex flex-col items-center justify-between p-4 overflow-hidden"
    >
      {/* Partículas de fondo animadas */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/10"
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 0,
            }}
            animate={{
              x: particle.x + (Math.sin(particle.id) * 100),
              y: particle.y + (Math.cos(particle.id) * 100),
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 4 + (particle.id % 3),
              repeat: Infinity,
              delay: particle.id * 0.1,
            }}
            style={{
              width: particle.size,
              height: particle.size,
            }}
          />
        ))}
      </div>

      {/* Contenido principal centrado */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto relative z-10">
          {/* Contenedor principal de animación */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              duration: 1.5 
            }}
            className="mb-12"
          >
            <div className="relative mx-auto w-64 h-64 mb-8">
              {/* Órbita exterior para Supabase */}
              <motion.div
                animate={{ 
                  rotate: 360,
                }}
                transition={{ 
                  duration: 15, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute -inset-16 border-2 border-green-400/30 rounded-full"
              />

              {/* Órbita media para React */}
              <motion.div
                animate={{ 
                  rotate: -360,
                }}
                transition={{ 
                  duration: 12, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute -inset-8 border-2 border-cyan-400/30 rounded-full"
              />

              {/* Logo MarketHub central */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative">
                  {/* Fondo del logo */}
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      background: [
                        "linear-gradient(45deg, #60a5fa, #a78bfa)",
                        "linear-gradient(45deg, #a78bfa, #f472b6)",
                        "linear-gradient(45deg, #f472b6, #60a5fa)",
                      ]
                    }}
                    transition={{ 
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      background: { duration: 4, repeat: Infinity }
                    }}
                    className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
                  />
                  
                  {/* Icono ShoppingBag */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      scale: { duration: 2, repeat: Infinity },
                      rotate: { duration: 3, repeat: Infinity }
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <ShoppingBag className="h-12 w-12 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Logos de React orbitando */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8"
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`react-${i}`}
                    className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      transform: `rotate(${i * 120}deg) translateX(80px) rotate(-${i * 120}deg)`
                    }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [0.8, 1.2, 0.8],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        delay: i * 0.5
                      }}
                      className="bg-cyan-500/20 backdrop-blur-sm rounded-xl p-2 border border-cyan-400/30"
                    >
                      <Atom className="h-6 w-6 text-cyan-300" />
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Logos de Supabase orbitando */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-16"
              >
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={`supabase-${i}`}
                    className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      transform: `rotate(${i * 90}deg) translateX(120px) rotate(-${i * 90}deg)`
                    }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [0.9, 1.1, 0.9],
                        y: [0, -10, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                      className="bg-green-500/20 backdrop-blur-sm rounded-xl p-2 border border-green-400/30"
                    >
                      <Database className="h-6 w-6 text-green-300" />
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Partículas alrededor del logo central */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${i * 45}deg) translateX(50px) rotate(-${i * 45}deg)`
                    }}
                    animate={{ scale: [0, 1, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Título principal */}
          <div className="mb-8">
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight"
            >
              Market
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring" }}
                className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent"
              >
                Hub
              </motion.span>
            </motion.h1>

            {/* Subtítulo con iconos */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="flex items-center justify-center space-x-4 text-xl md:text-2xl text-white/80 font-light"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-6 w-6 text-yellow-300" />
              </motion.div>
              <span>React + Supabase + TypeScript</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="h-6 w-6 text-green-300" />
              </motion.div>
            </motion.div>
          </div>

          {/* Características mejoradas */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
          >
            {[
              { icon: Atom, color: "text-cyan-300", title: "React 18", desc: "Frontend moderno" },
              { icon: Database, color: "text-green-300", title: "Supabase", desc: "Backend seguro" },
              { icon: Shield, color: "text-purple-300", title: "RLS", desc: "Seguridad integrada" },
              { icon: Users, color: "text-amber-300", title: "Multirol", desc: "3 tipos de usuario" }
            ].map((item, index) => (
              <motion.div 
                key={item.title}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.8 + index * 0.2, type: "spring" }}
                whileHover={{ 
                  scale: 1.1, 
                  y: -10,
                  transition: { type: "spring", stiffness: 400 }
                }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-white group cursor-pointer"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className={`${item.color} mb-2`}
                >
                  <item.icon className="h-8 w-8 mx-auto" />
                </motion.div>
                <h3 className="font-semibold mb-1 text-sm">{item.title}</h3>
                <p className="text-white/60 text-xs">{item.desc}</p>
                
                {/* Efecto de brillo al hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </motion.div>
            ))}
          </motion.div>

          {/* Botón de continuar mejorado */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2.2, type: "spring", stiffness: 200 }}
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                y: -2,
                boxShadow: "0 25px 50px rgba(255, 255, 255, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="group relative bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold text-lg px-16 py-5 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-4 mx-auto shadow-2xl border-2 border-amber-300/30 overflow-hidden"
            >
              {/* Efecto de brillo animado */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"
                animate={{ x: ["0%", "200%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Texto e icono */}
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Explorar MarketHub
              </motion.span>
              
              <motion.div
                animate={{ 
                  x: [0, 8, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Footer integrado del App.tsx */}
      <motion.footer 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.6, duration: 0.8, type: "spring" }}
        className="w-full max-w-7xl mx-auto py-8 mt-auto"
      >
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
          
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
              <p className="text-white/70 text-sm">Plataforma de Comercio</p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8 }}
            className="flex items-center space-x-8"
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
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span className="font-bold">v2.2.0</span>
              </motion.div>
              <div className="text-white/70 text-xs"></div>
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
      </motion.footer>
    </motion.div>
  )
}