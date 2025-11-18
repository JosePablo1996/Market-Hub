// src/components/Guest/GuestDashboard.tsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/useAuth'
import {
  Package,
  Search,
  ShoppingBag,
  User,
  Star,
  DollarSign,
  CheckCircle,
  Grid,
  List,
  Eye,
  Shield,
  Calendar,
  Zap,
  Info,
  Filter,
  ChevronDown,
  X,
  LogIn,
  UserPlus,
  ArrowLeft
} from 'lucide-react'

// Interface completamente independiente para evitar conflictos
interface GuestProduct {
  id: string
  proveedor_id: string
  title: string
  description: string | null
  price: number
  photo_url: string | null
  status: 'pending' | 'approved' | 'rejected' | 'disabled'
  is_enabled: boolean
  admin_notes: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  user_profiles?: {
    full_name: string
  }
}

export const GuestDashboard: React.FC = () => {
  const [products, setProducts] = useState<GuestProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<GuestProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<GuestProduct | null>(null)
  
  const { disableGuestMode } = useAuth()

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Consulta más específica para evitar conflictos de relaciones
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select(`
          id,
          proveedor_id,
          title,
          description,
          price,
          photo_url,
          status,
          is_enabled,
          admin_notes,
          approved_by,
          approved_at,
          created_at,
          updated_at,
          user_profiles:user_profiles!proveedor_id (
            full_name
          )
        `)
        .eq('status', 'approved')
        .eq('is_enabled', true)
        .order('created_at', { ascending: false })

      if (supabaseError) {
        setError(`Error al cargar los productos: ${supabaseError.message}`)
        return
      }
      
      // Procesar los datos de forma segura
      const processedProducts: GuestProduct[] = (data || []).map(item => {
        // Manejar el caso donde user_profiles podría ser un array o un objeto
        let userProfiles = null
        if (item.user_profiles) {
          if (Array.isArray(item.user_profiles) && item.user_profiles.length > 0) {
            userProfiles = item.user_profiles[0]
          } else if (typeof item.user_profiles === 'object' && !('error' in item.user_profiles)) {
            userProfiles = item.user_profiles
          }
        }

        return {
          id: item.id,
          proveedor_id: item.proveedor_id,
          title: item.title,
          description: item.description,
          price: item.price,
          photo_url: item.photo_url,
          status: item.status,
          is_enabled: item.is_enabled,
          admin_notes: item.admin_notes,
          approved_by: item.approved_by,
          approved_at: item.approved_at,
          created_at: item.created_at,
          updated_at: item.updated_at,
          user_profiles: userProfiles
        }
      })

      setProducts(processedProducts)
      setFilteredProducts(processedProducts)
      
    } catch {
      setError('Error inesperado al cargar los productos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    let filtered = products

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.user_profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro de precio
    if (priceFilter !== 'all') {
      switch (priceFilter) {
        case 'under-50':
          filtered = filtered.filter(product => product.price < 50)
          break
        case '50-100':
          filtered = filtered.filter(product => product.price >= 50 && product.price <= 100)
          break
        case '100-500':
          filtered = filtered.filter(product => product.price > 100 && product.price <= 500)
          break
        case 'over-500':
          filtered = filtered.filter(product => product.price > 500)
          break
      }
    }

    setFilteredProducts(filtered)
  }, [searchTerm, priceFilter, products])

  // Función para obtener nombre del proveedor de forma segura
  const getProviderName = (product: GuestProduct): string => {
    if (!product.user_profiles) return 'Proveedor no disponible'
    
    return product.user_profiles.full_name || 'Proveedor'
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const created = new Date(date)
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) return 'Nuevo hoy'
    return 'Producto establecido'
  }

  const priceRanges = [
    { value: 'all', label: 'Todos los precios' },
    { value: 'under-50', label: 'Menos de $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100-500', label: '$100 - $500' },
    { value: 'over-500', label: 'Más de $500' }
  ]

  const stats = {
    total: products.length,
    featured: products.filter(p => p.status === 'approved').length,
    new: products.filter(p => {
      const daysAgo = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)
      return daysAgo < 7
    }).length
  }

  const applyFilters = () => {
    setIsFilterModalOpen(false)
  }

  const clearFilters = () => {
    setPriceFilter('all')
    setSearchTerm('')
    setIsFilterModalOpen(false)
  }

  const getActiveFiltersCount = () => {
    return priceFilter !== 'all' ? 1 : 0
  }

  const handleQuickView = (product: GuestProduct) => {
    setSelectedProduct(product)
  }

  // Función para ir al login
  const handleGoToLogin = () => {
    disableGuestMode()
  }

  // Función para ir al registro
  const handleGoToRegister = () => {
    disableGuestMode()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex justify-center items-center">
        <div className="bg-red-500/25 border border-red-400/40 text-red-100 px-6 py-4 rounded-2xl backdrop-blur-sm animate-fade-in max-w-md text-center">
          <div className="flex items-center justify-center mb-2">
            <Info className="h-6 w-6 mr-2" />
            <p className="text-lg font-semibold">Error</p>
          </div>
          <p className="text-sm">{error}</p>
          <button
            onClick={loadProducts}
            className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Mejorado con Botones de Navegación */}
        <div className="text-center mb-12">
          {/* Botones de Navegación - Parte Superior */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={handleGoToLogin}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-2xl transition-all duration-300 backdrop-blur-sm hover:shadow-lg group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Volver al Inicio</span>
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoToLogin}
                className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-white px-6 py-3 rounded-2xl transition-all duration-300 backdrop-blur-sm hover:shadow-lg group"
              >
                <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Iniciar Sesión</span>
              </button>

              <button
                onClick={handleGoToRegister}
                className="flex items-center space-x-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 text-white px-6 py-3 rounded-2xl transition-all duration-300 backdrop-blur-sm hover:shadow-lg group"
              >
                <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Crear Cuenta</span>
              </button>
            </div>
          </div>

          {/* Logo y Título */}
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mx-auto mb-6 shadow-2xl">
            <ShoppingBag className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-4">
            Catálogo de Productos
          </h1>
          <p className="text-blue-200 text-xl mb-4">
            Vista de invitado - Solo lectura
          </p>
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-2xl p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-yellow-200">
              <Info className="h-5 w-5" />
              <p className="text-sm font-medium">
                Modo invitado: Solo puedes ver los productos. 
                <button onClick={handleGoToRegister} className="underline hover:text-white transition-colors ml-1">
                  Regístrate
                </button> 
                {' '}para interactuar con los productos y acceder a todas las funciones.
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas Mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 text-center hover:scale-105 transition-all duration-300 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <dt className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Total Productos</dt>
            <dd className="mt-2 text-4xl font-bold text-white">{stats.total}</dd>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 text-center hover:scale-105 transition-all duration-300 animate-fade-in delay-100">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
            <dt className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Aprobados</dt>
            <dd className="mt-2 text-4xl font-bold text-white">{stats.featured}</dd>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 text-center hover:scale-105 transition-all duration-300 animate-fade-in delay-200">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
            <dt className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Nuevos</dt>
            <dd className="mt-2 text-4xl font-bold text-white">{stats.new}</dd>
          </div>
        </div>

        {/* Barra de búsqueda y filtros Mejorada */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Búsqueda */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5 transition-colors duration-200 group-focus-within:text-white" />
              <input
                type="text"
                placeholder="Buscar productos, proveedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/30 text-white placeholder-blue-300 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/15 focus:bg-white/15"
                aria-label="Buscar productos"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Botón de Filtros */}
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="flex items-center space-x-3 bg-white/10 border border-white/30 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 backdrop-blur-sm hover:bg-white/15 min-w-40 justify-between relative"
                aria-label="Abrir filtros de productos"
              >
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-blue-300" />
                  <span>
                    {getActiveFiltersCount() > 0 
                      ? `Filtros (${getActiveFiltersCount()})` 
                      : 'Filtros'
                    }
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-blue-300" />
              </button>

              {/* Vista */}
              <div className="flex bg-white/10 rounded-2xl p-1 border border-white/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'text-blue-200 hover:text-white'
                  }`}
                  title="Vista de cuadrícula"
                  aria-label="Cambiar a vista de cuadrícula"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'text-blue-200 hover:text-white'
                  }`}
                  title="Vista de lista"
                  aria-label="Cambiar a vista de lista"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Filtros */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-2xl shadow-2xl p-5 w-full max-w-xs sm:max-w-sm animate-scale-in">
              <div className="text-center mb-4">
                <Filter className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                  Filtrar por Precio
                </h3>
                <p className="text-blue-200 text-xs sm:text-sm">
                  Selecciona un rango de precio
                </p>
              </div>
              
              <div className="space-y-3 mb-4">
                {priceRanges.map(range => (
                  <button
                    key={range.value}
                    onClick={() => setPriceFilter(range.value)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 ${
                      priceFilter === range.value 
                        ? 'bg-blue-500/30 border-2 border-blue-400' 
                        : 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30'
                    } text-blue-300`}
                  >
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="flex-1 text-left font-medium text-white text-sm">
                      {range.label}
                    </span>
                    {priceFilter === range.value && (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Estado de filtros activos */}
              {priceFilter !== 'all' && (
                <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-400/30 mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Filter className="h-3 w-3 text-blue-300" />
                    <p className="text-xs text-blue-200">
                      Filtro activo: <span className="text-white font-semibold">{priceRanges.find(r => r.value === priceFilter)?.label}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Botones del Modal */}
              <div className="flex justify-between space-x-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 backdrop-blur-sm"
                  aria-label="Limpiar filtros"
                >
                  Limpiar
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  aria-label="Aplicar filtros"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Información del Producto */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-3xl shadow-2xl w-full max-w-6xl mx-auto animate-scale-in overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header del Modal */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Detalles del Producto</h3>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200"
                  aria-label="Cerrar modal"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Contenido del Modal */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Imagen del producto */}
                  <div className="relative">
                    {selectedProduct.photo_url ? (
                      <img
                        src={selectedProduct.photo_url}
                        alt={selectedProduct.title}
                        className="w-full h-64 sm:h-80 object-cover rounded-2xl shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center">
                        <Package className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-2">
                      <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
                        <Zap className="h-3 w-3" />
                        <span>{getTimeAgo(selectedProduct.created_at)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* Título */}
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        {selectedProduct.title}
                      </h2>
                    </div>

                    {/* Precio */}
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl sm:text-4xl font-bold text-green-400 flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span>{selectedProduct.price}</span>
                      </span>
                    </div>

                    {/* Descripción */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                        <Info className="h-5 w-5 text-blue-300" />
                        <span>Descripción</span>
                      </h4>
                      <p className="text-blue-200 leading-relaxed text-sm sm:text-base max-h-32 overflow-y-auto">
                        {selectedProduct.description || 'Sin descripción disponible'}
                      </p>
                    </div>

                    {/* Información del proveedor */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                        <User className="h-5 w-5 text-blue-300" />
                        <span>Información del Proveedor</span>
                      </h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                          <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm sm:text-base">
                            {getProviderName(selectedProduct)}
                          </p>
                          <p className="text-blue-300 text-sm">Proveedor verificado</p>
                        </div>
                      </div>
                    </div>

                    {/* Estado y disponibilidad */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-white/5 rounded-2xl p-3 sm:p-4 border border-white/10 text-center">
                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-white font-semibold text-sm sm:text-base">Disponible</p>
                        <p className="text-blue-300 text-xs sm:text-sm">En stock</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-3 sm:p-4 border border-white/10 text-center">
                        <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400 mx-auto mb-2" />
                        <p className="text-white font-semibold text-sm sm:text-base">Estado</p>
                        <p className="text-blue-300 text-xs sm:text-sm">Aprobado</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer del Modal */}
              <div className="p-4 sm:p-6 border-t border-white/10 bg-white/5 flex-shrink-0">
                <div className="text-center">
                  <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-center space-x-2 text-yellow-200">
                      <Info className="h-5 w-5" />
                      <p className="text-sm font-medium">
                        <button onClick={handleGoToRegister} className="underline hover:text-white transition-colors">
                          Regístrate
                        </button> para interactuar con los productos
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleGoToLogin}
                      className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Iniciar Sesión</span>
                    </button>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resultados - Vista Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl animate-fade-in">
            <Package className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <p className="text-blue-200 text-xl mb-2">
              {searchTerm || priceFilter !== 'all' 
                ? 'No se encontraron productos con los filtros aplicados.' 
                : 'No hay productos disponibles en este momento.'}
            </p>
            {(searchTerm || priceFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300"
                aria-label="Limpiar filtros de búsqueda"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden hover:scale-105 transition-all duration-300 animate-fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header de la tarjeta con imagen */}
                <div className="relative overflow-hidden">
                  {product.photo_url ? (
                    <img
                      src={product.photo_url}
                      alt={product.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Badges superpuestos */}
                  <div className="absolute top-3 left-3 flex flex-col space-y-2">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
                      <Zap className="h-3 w-3" />
                      <span>{getTimeAgo(product.created_at)}</span>
                    </span>
                  </div>

                  {/* Acción de ver detalles */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleQuickView(product)}
                      className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-6">
                  {/* Título y descripción */}
                  <h3 className="text-xl font-bold text-white line-clamp-2 mb-2 group-hover:text-blue-200 transition-colors duration-200">
                    {product.title}
                  </h3>
                  <p className="text-blue-200 text-sm line-clamp-2 mb-4">
                    {product.description || 'Sin descripción'}
                  </p>
                  
                  {/* Precio */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-2xl font-bold text-green-400 flex items-center space-x-1">
                        <DollarSign className="h-5 w-5" />
                        <span>{product.price}</span>
                      </span>
                    </div>
                  </div>

                  {/* Información del proveedor y stock */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <User className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold">
                          {getProviderName(product)}
                        </p>
                        <p className="text-blue-300 text-xs">En stock</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-xs">Disponible</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Vista Lista */
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden mb-8 animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Producto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Precio</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Proveedor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredProducts.map((product, index) => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-white/5 transition-colors duration-200 animate-fade-in group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          {product.photo_url ? (
                            <img
                              className="h-16 w-16 object-cover rounded-2xl"
                              src={product.photo_url}
                              alt={product.title}
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-white font-semibold group-hover:text-blue-200 transition-colors duration-200">
                                {product.title}
                              </h3>
                            </div>
                            <p className="text-blue-200 text-sm line-clamp-1">{product.description || 'Sin descripción'}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Calendar className="h-3 w-3 text-blue-300" />
                              <span className="text-blue-300 text-xs">{getTimeAgo(product.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xl font-bold text-green-400 flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{product.price}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <User className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-white font-medium">{getProviderName(product)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1 text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-white text-sm">Aprobado</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleQuickView(product)}
                          className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contador de resultados */}
        {filteredProducts.length > 0 && (
          <div className="text-center">
            <p className="text-blue-200 text-sm">
              Mostrando <span className="text-white font-semibold">{filteredProducts.length}</span> de{' '}
              <span className="text-white font-semibold">{products.length}</span> productos
            </p>
          </div>
        )}

        {/* Footer con Botones de Navegación */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                ¿Listo para más funcionalidades?
              </h3>
              <p className="text-blue-200 text-lg mb-6">
                Regístrate o inicia sesión para acceder a todas las características
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGoToLogin}
                  className="flex items-center space-x-3 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-lg group"
                >
                  <LogIn className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-lg">Iniciar Sesión</span>
                </button>
                <button
                  onClick={handleGoToRegister}
                  className="flex items-center space-x-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-lg group"
                >
                  <UserPlus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-lg">Crear Cuenta</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos de Animación */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slide-in {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
          .animate-slide-in {
            animation: slide-in 0.5s ease-out;
          }
          .animate-scale-in {
            animation: scale-in 0.3s ease-out;
          }
          .delay-100 {
            animation-delay: 100ms;
          }
          .delay-200 {
            animation-delay: 200ms;
          }
        `}
      </style>
    </div>
  )
}