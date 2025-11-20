// src/components/Splash/SplashScreen.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Zap, ArrowRight, Sparkles, Shield, Globe, Star, Atom, Database } from 'lucide-react'

interface SplashScreenProps {
  onContinue: () => void
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  // Partículas flotantes predefinidas para evitar Math.random en render
  const floatingParticles = [
    { id: 0, x: 10, y: 20, size: 4, duration: 8, delay: 0 },
    { id: 1, x: 25, y: 60, size: 3, duration: 12, delay: 1 },
    { id: 2, x: 40, y: 15, size: 5, duration: 10, delay: 2 },
    { id: 3, x: 60, y: 80, size: 2, duration: 15, delay: 0.5 },
    { id: 4, x: 75, y: 40, size: 4, duration: 9, delay: 1.5 },
    { id: 5, x: 90, y: 70, size: 3, duration: 11, delay: 2.5 },
    { id: 6, x: 15, y: 85, size: 5, duration: 7, delay: 3 },
    { id: 7, x: 35, y: 35, size: 2, duration: 14, delay: 0.8 },
    { id: 8, x: 55, y: 25, size: 4, duration: 8, delay: 1.8 },
    { id: 9, x: 80, y: 55, size: 3, duration: 13, delay: 2.2 },
    { id: 10, x: 20, y: 45, size: 5, duration: 9, delay: 0.3 },
    { id: 11, x: 45, y: 75, size: 2, duration: 12, delay: 1.2 },
    { id: 12, x: 65, y: 15, size: 4, duration: 10, delay: 2.8 },
    { id: 13, x: 85, y: 30, size: 3, duration: 11, delay: 0.7 },
    { id: 14, x: 30, y: 90, size: 5, duration: 8, delay: 1.9 },
    { id: 15, x: 50, y: 50, size: 2, duration: 15, delay: 0.4 },
    { id: 16, x: 70, y: 65, size: 4, duration: 9, delay: 2.1 },
    { id: 17, x: 95, y: 10, size: 3, duration: 13, delay: 0.9 },
    { id: 18, x: 5, y: 35, size: 5, duration: 7, delay: 1.4 },
    { id: 19, x: 25, y: 85, size: 2, duration: 14, delay: 2.6 },
    { id: 20, x: 40, y: 5, size: 4, duration: 10, delay: 0.6 },
    { id: 21, x: 60, y: 95, size: 3, duration: 12, delay: 1.7 },
    { id: 22, x: 75, y: 20, size: 5, duration: 8, delay: 2.3 },
    { id: 23, x: 90, y: 45, size: 2, duration: 15, delay: 0.2 },
    { id: 24, x: 10, y: 70, size: 4, duration: 11, delay: 1.1 },
    { id: 25, x: 35, y: 25, size: 3, duration: 9, delay: 2.7 },
    { id: 26, x: 55, y: 85, size: 5, duration: 7, delay: 0.8 },
    { id: 27, x: 80, y: 5, size: 2, duration: 13, delay: 1.6 },
    { id: 28, x: 15, y: 55, size: 4, duration: 10, delay: 2.4 },
    { id: 29, x: 45, y: 40, size: 3, duration: 14, delay: 0.5 }
  ]

  // Partículas de fondo estáticas predefinidas
  const backgroundParticles = [
    { id: 0, x: 10, y: 15, size: 12 },
    { id: 1, x: 25, y: 70, size: 18 },
    { id: 2, x: 40, y: 30, size: 14 },
    { id: 3, x: 60, y: 85, size: 16 },
    { id: 4, x: 75, y: 45, size: 10 },
    { id: 5, x: 90, y: 20, size: 20 },
    { id: 6, x: 15, y: 90, size: 12 },
    { id: 7, x: 35, y: 10, size: 18 },
    { id: 8, x: 55, y: 65, size: 14 },
    { id: 9, x: 80, y: 35, size: 16 },
    { id: 10, x: 5, y: 50, size: 10 },
    { id: 11, x: 30, y: 25, size: 20 },
    { id: 12, x: 50, y: 80, size: 12 },
    { id: 13, x: 70, y: 15, size: 18 },
    { id: 14, x: 85, y: 60, size: 14 }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 flex flex-col items-center justify-between p-4 overflow-hidden relative"
    >
      {/* Partículas de fondo estáticas */}
      <div className="absolute inset-0 overflow-hidden">
        {backgroundParticles.map((particle) => (
          <motion.div
            key={`bg-${particle.id}`}
            className="absolute rounded-full bg-white/5"
            initial={{
              x: `${particle.x}vw`,
              y: `${particle.y}vh`,
              scale: 0,
            }}
            animate={{
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 8 + (particle.id % 4),
              repeat: Infinity,
              delay: particle.id * 0.3,
            }}
            style={{
              width: particle.size,
              height: particle.size,
            }}
          />
        ))}
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingParticles.map((particle) => (
          <motion.div
            key={`float-${particle.id}`}
            className="absolute rounded-full bg-white/20"
            initial={{
              x: `${particle.x}vw`,
              y: `${particle.y}vh`,
              opacity: 0,
            }}
            animate={{
              x: `${particle.x + (Math.sin(particle.id) * 20)}vw`,
              y: `${particle.y + (Math.cos(particle.id) * 20)}vh`,
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
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
              {/* Logo MarketHub central mejorado */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative">
                  {/* Fondo del logo con gradiente animado */}
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      background: [
                        "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)",
                        "linear-gradient(135deg, #f472b6, #60a5fa, #a78bfa)",
                        "linear-gradient(135deg, #a78bfa, #f472b6, #60a5fa)",
                      ]
                    }}
                    transition={{ 
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      background: { duration: 6, repeat: Infinity }
                    }}
                    className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden"
                  >
                    {/* Efecto de brillo interno */}
                    <motion.div
                      animate={{ 
                        x: ["-100%", "200%", "-100%"],
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"
                    />
                  </motion.div>
                  
                  {/* Icono ShoppingBag mejorado */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                      y: [0, -5, 0]
                    }}
                    transition={{ 
                      scale: { duration: 3, repeat: Infinity },
                      rotate: { duration: 4, repeat: Infinity },
                      y: { duration: 2, repeat: Infinity }
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <ShoppingBag className="h-16 w-16 text-white drop-shadow-lg" />
                  </motion.div>

                  {/* Estrellas alrededor del logo */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={`star-${i}`}
                      className="absolute"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `rotate(${i * 60}deg) translateX(70px) rotate(-${i * 60}deg)`
                      }}
                      animate={{ 
                        scale: [0, 1, 0],
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5
                      }}
                    >
                      <Star className="h-4 w-4 text-yellow-300 fill-current" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Partículas brillantes orbitando */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`orbit-${i}`}
                    className="absolute w-3 h-3 bg-cyan-300 rounded-full shadow-lg"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${i * 30}deg) translateX(100px) rotate(-${i * 30}deg)`
                    }}
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Título principal mejorado */}
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
                className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent drop-shadow-lg"
              >
                Hub
              </motion.span>
            </motion.h1>

            {/* Subtítulo con iconos mejorado */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="flex items-center justify-center space-x-4 text-xl md:text-2xl text-white/80 font-light"
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-7 w-7 text-yellow-300 drop-shadow-lg" />
              </motion.div>
              <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                Plataforma de Comercio en Linea
              </span>
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="h-7 w-7 text-green-300 drop-shadow-lg" />
              </motion.div>
            </motion.div>
          </div>

          {/* Características mejoradas con tecnologías */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto"
          >
            {[
              { icon: Atom, color: "text-cyan-300", bg: "bg-cyan-500/20", title: "React", desc: "Frontend moderno" },
              { icon: Database, color: "text-green-300", bg: "bg-green-500/20", title: "Supabase", desc: "Backend seguro" },
              { icon: Shield, color: "text-purple-300", bg: "bg-purple-500/20", title: "Seguro", desc: "Protegido y confiable" },
              { icon: Zap, color: "text-amber-300", bg: "bg-amber-500/20", title: "Rápido", desc: "Experiencia fluida" }
            ].map((item, index) => (
              <motion.div 
                key={item.title}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.8 + index * 0.2, type: "spring" }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  transition: { type: "spring", stiffness: 400 }
                }}
                className={`${item.bg} backdrop-blur-lg border border-white/20 rounded-2xl p-5 text-white group cursor-pointer relative overflow-hidden`}
              >
                {/* Efecto de fondo animado */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className={`${item.color} mb-3 relative z-10`}
                >
                  <item.icon className="h-10 w-10 mx-auto drop-shadow-lg" />
                </motion.div>
                <h3 className="font-semibold mb-2 text-lg relative z-10">{item.title}</h3>
                <p className="text-white/70 text-sm relative z-10">{item.desc}</p>
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
                y: -3,
                boxShadow: "0 20px 40px rgba(255, 255, 255, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="group relative bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold text-lg px-16 py-5 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-4 mx-auto shadow-2xl border-2 border-amber-300/30 overflow-hidden"
            >
              {/* Efecto de brillo animado */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
                animate={{ x: ["-100%", "200%", "-100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Texto e icono */}
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative z-10"
              >
                Explorar MarketHub
              </motion.span>
              
              <motion.div
                animate={{ 
                  x: [0, 5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative z-10"
              >
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Footer mejorado */}
      <motion.footer 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.6, duration: 0.8, type: "spring" }}
        className="w-full max-w-7xl mx-auto py-8 mt-auto relative z-10"
      >
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
          
          {/* Logo y Info mejorado */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-4"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-14 h-14 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <ShoppingBag className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h3 className="font-bold text-white text-xl">MarketHub</h3>
              <p className="text-white/70 text-sm">Tu plataforma de confianza</p>
            </div>
          </motion.div>

          {/* Stats mejorados */}
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
                <Globe className="h-6 w-6 text-blue-300" />
                <span className="font-bold text-lg">Activo</span>
              </motion.div>
              <div className="text-white/70 text-sm">Sistema en línea</div>
            </div>
            
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
            
            <div className="text-center">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="flex items-center space-x-2 text-white mb-2"
              >
                <Sparkles className="h-6 w-6 text-yellow-300" />
                <span className="font-bold text-lg">v2.2.0</span>
              </motion.div>
              <div className="text-white/70 text-sm">Última versión</div>
            </div>
          </motion.div>

          {/* Developer Info mejorado */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center lg:text-right"
          >
            <div className="flex items-center justify-center lg:justify-end space-x-2 text-white mb-2">
              <span>Desarrollado con</span>
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-red-300"
              >
                ❤️
              </motion.span>
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