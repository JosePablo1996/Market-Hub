// src/components/User/UserDashboard.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Product } from '../../lib/supabase'
import { Search, Filter, Package, User, Calendar, CheckCircle, DollarSign, SortAsc, X, Phone, Mail, Share, Eye, Grid, List, Heart, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductWithProfile extends Omit<Product, 'user_profiles'> {
  user_profiles: {
    full_name: string | null
    phone: string | null
    email?: string | null
  } | null
}

const ProductDetailModal: React.FC<{
  product: ProductWithProfile | null
  onClose: () => void
}> = ({ product, onClose }) => {
  if (!product) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl sm:rounded-3xl w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto max-h-[90vh] overflow-y-auto shadow-2xl relative glass-effect"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl sm:rounded-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start p-4 sm:p-6 border-b border-white/20">
            <div className="flex-1 pr-2">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 line-clamp-2">{product.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Disponible
                </span>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-300">
                  ${product.price}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-purple-300 hover:text-white transition-colors duration-200 p-1"
              aria-label="Cerrar detalles del producto"
              title="Cerrar"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Imagen */}
              <div className="rounded-xl overflow-hidden bg-white/10 border border-white/20">
                {product.photo_url ? (
                  <img
                    src={product.photo_url}
                    alt={product.title}
                    className="w-full h-48 sm:h-56 lg:h-64 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFmMjkzMyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iPk5vIEltYWdlbjwvdGV4dD48L3N2Zz4='
                    }}
                  />
                ) : (
                  <div className="w-full h-48 sm:h-56 lg:h-64 bg-white/10 flex items-center justify-center">
                    <Package className="h-12 w-12 sm:h-16 sm:w-16 text-white/30" />
                  </div>
                )}
              </div>

              {/* Información Rápida */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white/10 rounded-xl p-3 sm:p-4 border border-white/20 glass-effect">
                  <div className="text-purple-200 text-xs sm:text-sm mb-1">Estado</div>
                  <div className="flex items-center text-emerald-300 font-semibold text-sm sm:text-base">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    En Stock
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 sm:p-4 border border-white/20 glass-effect">
                  <div className="text-purple-200 text-xs sm:text-sm mb-1">Publicado</div>
                  <div className="flex items-center text-white font-semibold text-sm sm:text-base">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {new Date(product.created_at).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Descripción</h3>
                <div className="bg-white/10 rounded-xl p-3 sm:p-4 border border-white/20 glass-effect">
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                    {product.description || 'Este producto no tiene una descripción detallada.'}
                  </p>
                </div>
              </div>

              {/* Información del Vendedor */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Información del Vendedor</h3>
                <div className="bg-white/10 rounded-xl p-3 sm:p-4 border border-white/20 glass-effect space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm sm:text-base">
                        {product.user_profiles?.full_name || 'Vendedor no disponible'}
                      </div>
                      <div className="text-purple-200 text-xs sm:text-sm">Vendedor verificado</div>
                    </div>
                  </div>
                  
                  {product.user_profiles?.phone && (
                    <div className="flex items-center gap-2 text-purple-200 text-sm sm:text-base">
                      <Phone className="h-4 w-4" />
                      <span>{product.user_profiles.phone}</span>
                    </div>
                  )}
                  
                  {product.user_profiles?.email && (
                    <div className="flex items-center gap-2 text-purple-200 text-sm sm:text-base">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm truncate">{product.user_profiles.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 sm:gap-3 pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 border border-green-400/30 flex items-center justify-center gap-2 backdrop-blur-sm text-sm sm:text-base"
                  aria-label="Agregar al carrito"
                  title="Agregar al carrito"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Agregar al Carrito
                </motion.button>
                
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 backdrop-blur-sm glass-effect"
                  aria-label="Agregar a favoritos"
                  title="Agregar a favoritos"
                >
                  <Heart className="h-4 w-4" />
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 backdrop-blur-sm glass-effect"
                  aria-label="Compartir producto"
                  title="Compartir producto"
                >
                  <Share className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const StatCard = ({ title, value, icon: Icon, color, bgColor }: { 
  title: string; 
  value: number; 
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${bgColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/10 backdrop-blur-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden glass-effect`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl sm:rounded-2xl"></div>
    <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
    
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{value}</div>
          <div className="text-white/80 text-xs sm:text-sm font-medium">{title}</div>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${color} bg-white/10 backdrop-blur-sm shadow-inner border border-white/10 glass-effect`}>
          <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
    </div>
  </motion.div>
)

const UserDashboard: React.FC = () => {
  const [products, setProducts] = useState<ProductWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'name'>('date')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithProfile | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          user_profiles!products_proveedor_id_fkey (
            full_name,
            phone
          )
        `)
        .eq('status', 'approved')
        .eq('is_enabled', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data as ProductWithProfile[] || [])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error handling sin console.log
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  const filteredAndSortedProducts = products
    .filter(product => 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price
        case 'name':
          return a.title.localeCompare(b.title)
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  const FiltersModal = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-md"
      onClick={() => setShowFilters(false)}
    >
      <motion.div
        className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl w-full max-w-xs sm:max-w-sm mx-auto p-4 sm:p-6 shadow-2xl relative overflow-hidden glass-effect"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white">Filtrar y Ordenar</h3>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="text-purple-300 hover:text-white transition-colors duration-200 p-1"
              aria-label="Cerrar filtros"
              title="Cerrar"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Ordenar por</h4>
              <div className="space-y-2 sm:space-y-3">
                {[
                  { value: 'date', label: 'Más recientes', icon: Calendar },
                  { value: 'price', label: 'Precio: menor a mayor', icon: DollarSign },
                  { value: 'name', label: 'Nombre A-Z', icon: SortAsc }
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSortBy(option.value as 'price' | 'date' | 'name')
                      setShowFilters(false)
                    }}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 border backdrop-blur-sm flex items-center gap-2 glass-effect ${
                      sortBy === option.value
                        ? 'bg-blue-500/20 text-blue-300 border-blue-400/30 shadow-lg'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-label={`Ordenar por ${option.label}`}
                    title={`Ordenar por ${option.label}`}
                  >
                    <option.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Acciones Rápidas</h4>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSearchTerm('')}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-white/5 text-white/70 rounded-lg border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 text-xs sm:text-sm glass-effect"
                  aria-label="Limpiar búsqueda"
                  title="Limpiar búsqueda"
                >
                  Limpiar
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSearchTerm('')
                    setSortBy('date')
                    setShowFilters(false)
                  }}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-400/30 hover:bg-purple-500/30 transition-all duration-200 text-xs sm:text-sm glass-effect"
                  aria-label="Reiniciar filtros"
                  title="Reiniciar filtros"
                >
                  Reiniciar
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent shadow-2xl"
        />
      </div>
    )
  }

  const stats = {
    total: products.length,
    available: filteredAndSortedProducts.length,
    providers: new Set(products.map(p => p.user_profiles?.full_name)).size,
    favorites: favorites.size
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative glass-effect rounded-2xl sm:rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10"></div>
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-purple-400/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10 py-6 sm:py-8 lg:py-12">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl sm:rounded-3xl mx-auto mb-3 sm:mb-4 lg:mb-6 shadow-2xl">
              <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2 sm:mb-3 lg:mb-4">
              Marketplace
            </h1>
            <p className="text-purple-200 text-sm sm:text-base lg:text-lg">
              Descubre productos increíbles de vendedores verificados
            </p>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatCard 
            title="Productos" 
            value={stats.total} 
            icon={Package} 
            color="bg-blue-500/20"
            bgColor="bg-gradient-to-br from-blue-600/90 to-blue-700/90"
          />
          <StatCard 
            title="Disponibles" 
            value={stats.available} 
            icon={CheckCircle} 
            color="bg-emerald-500/20"
            bgColor="bg-gradient-to-br from-emerald-600/90 to-emerald-700/90"
          />
          <StatCard 
            title="Vendedores" 
            value={stats.providers} 
            icon={User} 
            color="bg-violet-500/20"
            bgColor="bg-gradient-to-br from-violet-600/90 to-violet-700/90"
          />
          <StatCard 
            title="Favoritos" 
            value={stats.favorites} 
            icon={Heart} 
            color="bg-pink-500/20"
            bgColor="bg-gradient-to-br from-pink-600/90 to-pink-700/90"
          />
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden glass-effect"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl sm:rounded-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6 lg:mb-8 gap-4 lg:gap-6">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">
                  Productos Destacados
                </h2>
                <p className="text-purple-200 text-sm sm:text-base lg:text-lg">
                  {filteredAndSortedProducts.length} productos encontrados
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
                {/* Búsqueda */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-purple-300 h-3 w-3 sm:h-4 sm:w-4 z-10" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 lg:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 lg:py-4 bg-white/10 border border-white/40 text-white placeholder-purple-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 text-sm sm:text-base lg:text-lg glass-effect"
                    aria-label="Buscar productos"
                  />
                </div>
                
                {/* Botones de Acción */}
                <div className="flex gap-2 sm:gap-3 lg:gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowFilters(true)}
                    className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-white/10 border border-white/40 rounded-xl sm:rounded-2xl text-white flex items-center justify-center gap-1 sm:gap-2 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 text-sm sm:text-base lg:text-lg flex-1 glass-effect"
                    aria-label="Abrir filtros y ordenamiento"
                    title="Filtrar y ordenar"
                  >
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                    <span className="hidden xs:inline">Filtrar</span>
                  </motion.button>

                  <div className="flex bg-white/10 border border-white/40 rounded-xl sm:rounded-2xl backdrop-blur-sm overflow-hidden glass-effect">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setViewMode('grid')}
                      className={`p-2 sm:p-3 lg:p-4 transition-all duration-300 ${viewMode === 'grid' ? 'bg-purple-500/20 text-purple-300' : 'text-white/70 hover:text-white'}`}
                      aria-label="Vista de cuadrícula"
                      title="Vista de cuadrícula"
                    >
                      <Grid className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setViewMode('list')}
                      className={`p-2 sm:p-3 lg:p-4 transition-all duration-300 ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-300' : 'text-white/70 hover:text-white'}`}
                      aria-label="Vista de lista"
                      title="Vista de lista"
                    >
                      <List className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de Productos */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <AnimatePresence>
                  {filteredAndSortedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-white/10 hover:border-white/20 group glass-effect"
                    >
                      {/* Imagen del producto */}
                      {product.photo_url ? (
                        <div className="w-full h-32 sm:h-40 lg:h-48 overflow-hidden relative">
                          <img
                            src={product.photo_url}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFmMjkzMyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iPk5vIEltYWdlbjwvdGV4dD48L3N2Zz4='
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => toggleFavorite(product.id)}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors duration-200 glass-effect"
                            aria-label={favorites.has(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                            title={favorites.has(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                          >
                            <Heart 
                              className={`h-3 w-3 sm:h-4 sm:w-4 ${favorites.has(product.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                            />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-32 sm:h-40 lg:h-48 bg-white/5 flex items-center justify-center relative">
                          <Package className="h-8 w-8 sm:h-12 sm:w-12 text-white/30" />
                          <button
                            type="button"
                            onClick={() => toggleFavorite(product.id)}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors duration-200 glass-effect"
                            aria-label={favorites.has(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                            title={favorites.has(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                          >
                            <Heart 
                              className={`h-3 w-3 sm:h-4 sm:w-4 ${favorites.has(product.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                            />
                          </button>
                        </div>
                      )}

                      {/* Información del producto */}
                      <div className="p-3 sm:p-4 lg:p-6">
                        <div className="flex justify-between items-start mb-2 lg:mb-3">
                          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white line-clamp-2 flex-1 mr-2 group-hover:text-purple-200 transition-colors duration-300">
                            {product.title}
                          </h3>
                          <span className="text-base sm:text-lg lg:text-xl font-bold text-emerald-300 whitespace-nowrap">
                            ${product.price}
                          </span>
                        </div>

                        <p className="text-white/70 text-xs sm:text-sm lg:text-base mb-3 lg:mb-4 line-clamp-2 leading-relaxed">
                          {product.description || 'Descripción no disponible'}
                        </p>

                        <div className="flex justify-between items-center text-xs sm:text-sm text-white/50 mb-3 lg:mb-4">
                          <span className="flex items-center gap-1 truncate">
                            <User className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">{product.user_profiles?.full_name || 'Vendedor'}</span>
                          </span>
                        </div>

                        {/* Acciones */}
                        <div className="flex justify-between items-center gap-2 sm:gap-3">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedProduct(product)}
                            className="flex-1 bg-blue-500/20 text-blue-300 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg border border-blue-400/30 backdrop-blur-sm hover:bg-blue-500/30 transition-all duration-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 glass-effect"
                            aria-label={`Ver detalles de ${product.title}`}
                            title={`Ver detalles de ${product.title}`}
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            Ver
                          </motion.button>
                          
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 bg-emerald-500/20 text-emerald-300 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg border border-emerald-400/30 backdrop-blur-sm hover:bg-emerald-500/30 transition-all duration-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 glass-effect"
                            aria-label={`Comprar ${product.title}`}
                            title={`Comprar ${product.title}`}
                          >
                            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                            Comprar
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Lista de Productos */}
            {viewMode === 'list' && (
              <div className="space-y-3 sm:space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                {filteredAndSortedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15 group glass-effect"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 lg:gap-6">
                      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-1 min-w-0">
                        {/* Imagen en lista */}
                        {product.photo_url ? (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={product.photo_url}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white/30" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1 sm:mb-2">
                            <h3 className="font-bold text-white text-base sm:text-lg lg:text-xl group-hover:text-purple-200 transition-colors duration-300 truncate pr-2">
                              {product.title}
                            </h3>
                            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-300 whitespace-nowrap">
                              ${product.price}
                            </span>
                          </div>
                          
                          <p className="text-white/80 text-xs sm:text-sm lg:text-base mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
                            {product.description || 'Descripción no disponible'}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs sm:text-sm text-white/60">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3 sm:h-4 sm:w-4" />
                              {product.user_profiles?.full_name || 'Vendedor'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              {new Date(product.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center gap-2 sm:gap-3 lg:gap-4">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleFavorite(product.id)}
                          className="p-2 sm:p-3 text-pink-400 hover:bg-pink-500/20 rounded-lg transition-all duration-200 border border-pink-400/30 backdrop-blur-sm glass-effect"
                          aria-label={favorites.has(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                          title={favorites.has(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                        >
                          <Heart 
                            className={`h-4 w-4 sm:h-5 sm:w-5 ${favorites.has(product.id) ? 'text-red-500 fill-red-500' : 'text-current'}`} 
                          />
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedProduct(product)}
                          className="p-2 sm:p-3 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200 border border-blue-400/30 backdrop-blur-sm glass-effect"
                          aria-label={`Ver detalles de ${product.title}`}
                          title={`Ver detalles de ${product.title}`}
                        >
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 sm:p-3 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all duration-200 border border-emerald-400/30 backdrop-blur-sm glass-effect"
                          aria-label={`Comprar ${product.title}`}
                          title={`Comprar ${product.title}`}
                        >
                          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Mensaje cuando no hay productos */}
            {filteredAndSortedProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 sm:py-12 lg:py-16"
              >
                <div className="max-w-md mx-auto">
                  <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/10 glass-effect">
                    <Package className="h-8 w-8 sm:h-10 sm:w-10 text-white/40" />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3">
                    {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
                  </h3>
                  <p className="text-purple-200 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg">
                    {searchTerm 
                      ? 'Intenta con otros términos de búsqueda'
                      : 'Vuelve más tarde para ver nuevos productos'
                    }
                  </p>
                  {searchTerm && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSearchTerm('')}
                      className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20 font-medium text-sm sm:text-base lg:text-lg glass-effect"
                      aria-label="Limpiar búsqueda"
                      title="Limpiar búsqueda"
                    >
                      Limpiar búsqueda
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Modales */}
        <AnimatePresence>
          {showFilters && <FiltersModal />}
          {selectedProduct && (
            <ProductDetailModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .glass-effect {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        
        @media (min-width: 475px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 640px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  )
}

export default UserDashboard