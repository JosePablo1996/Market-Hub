// src/components/Proveedor/ProveedorDashboard.tsx
import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import type { Product } from '../../lib/supabase'
import { useAuth } from '../../contexts/useAuth'
import { Edit, Trash2, ToggleLeft, ToggleRight, Plus, Search, X, Package, CheckCircle, Clock, AlertCircle, Eye, Filter, TrendingUp, Grid, List } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Componente ProductForm incluido en el mismo archivo
interface ProductFormProps {
  product?: Product | null
  onClose: () => void
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    photo_url: ''
  })

  React.useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description || '',
        price: product.price.toString(),
        photo_url: product.photo_url || ''
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // PREPARAR DATOS CORRECTAMENTE para Supabase
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        photo_url: formData.photo_url.trim() || null,
        proveedor_id: user!.id,
        status: product ? product.status : 'pending',
        is_enabled: product ? product.is_enabled : true,
        updated_at: new Date().toISOString()
      }

      console.log('📤 Enviando datos del producto:', productData)

      // Validaciones adicionales
      if (!productData.title.trim()) {
        alert('El título es requerido')
        setLoading(false)
        return
      }

      if (isNaN(productData.price) || productData.price <= 0) {
        alert('El precio debe ser un número mayor a 0')
        setLoading(false)
        return
      }

      if (productData.description && productData.description.length > 2000) {
        alert('La descripción no puede tener más de 2000 caracteres')
        setLoading(false)
        return
      }

      if (product) {
        // Actualizar producto existente
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)

        if (error) {
          console.error('❌ Error actualizando producto:', error)
          throw error
        }
        
        console.log('✅ Producto actualizado exitosamente')
      } else {
        // Crear nuevo producto
        const { error } = await supabase
          .from('products')
          .insert([{
            ...productData,
            created_at: new Date().toISOString()
          }])

        if (error) {
          console.error('❌ Error creando producto:', error)
          throw error
        }
        
        console.log('✅ Producto creado exitosamente')
      }

      onClose()
    } catch (error: unknown) {
      console.error('💥 Error saving product:', error)
      
      // Mensajes de error más específicos
      let errorMessage = 'Error al guardar el producto'
      
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as { code: string; message: string }
        if (supabaseError.code === '23505') {
          errorMessage = 'Error: Ya existe un producto con estos datos.'
        } else if (supabaseError.code === '23514') {
          errorMessage = 'Error: Datos inválidos. Verifica el precio y otros campos.'
        } else if (supabaseError.message.includes('value too long')) {
          errorMessage = 'Error: La descripción es demasiado larga.'
        } else if (supabaseError.message.includes('network') || supabaseError.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.'
        } else {
          errorMessage = `Error: ${supabaseError.message}`
        }
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Validación en tiempo real para precio
    if (name === 'price') {
      // Permitir solo números y punto decimal
      const decimalRegex = /^\d*\.?\d*$/
      if (value === '' || decimalRegex.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl w-full max-w-md mx-auto my-auto shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Efecto de fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-white transition-colors duration-200 p-1 sm:p-2"
              aria-label="Cerrar formulario"
              disabled={loading}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                  Título *
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-transparent border border-white/40 text-white placeholder-purple-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300 relative z-10 text-sm sm:text-base"
                    required
                    placeholder="Ingresa el título del producto"
                    aria-required="true"
                    disabled={loading}
                    maxLength={100}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Descripción
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-transparent border border-white/40 text-white placeholder-purple-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical transition duration-300 relative z-10 text-sm sm:text-base"
                    placeholder="Describe tu producto en detalle..."
                    aria-describedby="description-help"
                    disabled={loading}
                    maxLength={2000}
                  />
                </div>
                <div id="description-help" className="flex justify-between text-xs sm:text-sm text-purple-200 mt-2">
                  <span>Opcional</span>
                  <span className={formData.description.length > 1800 ? 'text-orange-300' : ''}>
                    {formData.description.length}/2000
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-white mb-2">
                  Precio *
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 z-10">$</span>
                  <input
                    id="price"
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-transparent border border-white/40 text-white placeholder-purple-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300 relative z-10 text-sm sm:text-base"
                    required
                    placeholder="0.00"
                    aria-required="true"
                    disabled={loading}
                  />
                </div>
                <div className="text-xs text-purple-200 mt-2">
                  Usa punto para decimales (ej: 19.99)
                </div>
              </div>

              <div>
                <label htmlFor="photo_url" className="block text-sm font-medium text-white mb-2">
                  URL de Imagen
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                  <input
                    id="photo_url"
                    type="url"
                    name="photo_url"
                    value={formData.photo_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-transparent border border-white/40 text-white placeholder-purple-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300 relative z-10 text-sm sm:text-base"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    aria-describedby="image-help"
                    disabled={loading}
                  />
                </div>
                <div id="image-help" className="text-xs sm:text-sm text-purple-200 mt-2">
                  Opcional - URL de la imagen del producto
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6 sm:mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 sm:px-6 py-2.5 sm:py-3 text-white/70 border border-white/40 rounded-2xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 backdrop-blur-sm border border-purple-400/30 font-medium flex items-center justify-center min-w-24 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  product ? 'Actualizar' : 'Crear'
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Componente StatCard reutilizable
const StatCard = ({ title, value, icon: Icon, color, bgColor, trend }: { 
  title: string; 
  value: number; 
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  trend?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${bgColor} rounded-2xl p-4 sm:p-6 shadow-lg border border-white/10 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden`}
  >
    {/* Efecto de fondo decorativo */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
    <div className="absolute -top-12 -right-12 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full blur-2xl"></div>
    
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{value}</div>
          <div className="text-white/80 text-xs sm:text-sm font-medium">{title}</div>
          {trend && (
            <div className="flex items-center mt-1 sm:mt-2 text-xs font-medium">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span className={trend.includes('+') ? 'text-green-300' : 'text-red-300'}>
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-xl ${color} bg-white/10 backdrop-blur-sm shadow-inner border border-white/10`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
    </div>
  </motion.div>
)

// Componente principal ProveedorDashboard
const ProveedorDashboard: React.FC = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  
  // Referencias para prevenir bucles
  const isFetchingRef = useRef(false)
  const fetchAttemptsRef = useRef(0)

  useEffect(() => {
    if (user && !isFetchingRef.current) {
      fetchProducts()
    }
  }, [user])

  const fetchProducts = async (): Promise<void> => {
    if (isFetchingRef.current) {
      console.log('🔄 Ya se está cargando productos, evitando duplicado...')
      return
    }

    if (fetchAttemptsRef.current >= 3) {
      console.warn('⚠️ Demasiados intentos de carga, deteniendo...')
      setLoading(false)
      return
    }

    try {
      isFetchingRef.current = true
      fetchAttemptsRef.current++
      setLoading(true)

      console.log(`📦 Cargando productos (intento ${fetchAttemptsRef.current})...`)
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('proveedor_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error cargando productos:', error)
        throw error
      }

      console.log(`✅ ${data?.length || 0} productos cargados exitosamente`)
      setProducts(data || [])
      fetchAttemptsRef.current = 0
      
    } catch (error: unknown) {
      console.error('💥 Error en fetchProducts:', error)
      
      let errorMessage = 'Error al cargar los productos'
      if (error && typeof error === 'object' && 'message' in error) {
        const err = error as { message: string }
        errorMessage = `Error: ${err.message}`
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }

  const handleDelete = async (productId: string): Promise<void> => {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) return

    try {
      setActionLoading(productId)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('❌ Error eliminando producto:', error)
        throw error
      }
      
      setProducts(prev => prev.filter(p => p.id !== productId))
      console.log('✅ Producto eliminado exitosamente')
      
    } catch (error: unknown) {
      console.error('💥 Error en handleDelete:', error)
      
      let errorMessage = 'Error al eliminar el producto'
      if (error && typeof error === 'object' && 'message' in error) {
        const err = error as { message: string }
        errorMessage = `Error: ${err.message}`
      }
      
      alert(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const toggleEnabled = async (product: Product): Promise<void> => {
    try {
      setActionLoading(`toggle-${product.id}`)
      const { error } = await supabase
        .from('products')
        .update({ 
          is_enabled: !product.is_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)

      if (error) {
        console.error('❌ Error cambiando estado del producto:', error)
        throw error
      }
      
      setProducts(prev => prev.map(p => 
        p.id === product.id 
          ? { ...p, is_enabled: !p.is_enabled, updated_at: new Date().toISOString() }
          : p
      ))
      console.log('✅ Estado del producto actualizado exitosamente')
      
    } catch (error: unknown) {
      console.error('💥 Error en toggleEnabled:', error)
      
      let errorMessage = 'Error al cambiar el estado del producto'
      if (error && typeof error === 'object' && 'message' in error) {
        const err = error as { message: string }
        errorMessage = `Error: ${err.message}`
      }
      
      alert(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handleEdit = (product: Product): void => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleFormClose = (): void => {
    setShowForm(false)
    setEditingProduct(null)
    fetchProducts()
  }

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Estadísticas
  const stats = {
    total: products.length,
    pending: products.filter(p => p.status === 'pending').length,
    approved: products.filter(p => p.status === 'approved').length,
    rejected: products.filter(p => p.status === 'rejected').length,
    enabled: products.filter(p => p.is_enabled).length
  }

  // Modal de Filtros
  const FiltersModal = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-md overflow-y-auto"
      onClick={() => setShowFilters(false)}
    >
      <motion.div
        className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl w-full max-w-md mx-auto my-auto p-4 sm:p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white">Filtrar Productos</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-purple-300 hover:text-white transition-colors duration-200 p-1 sm:p-2"
              aria-label="Cerrar modal de filtros"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Estado del Producto
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'all', label: 'Todos los estados' },
                  { value: 'pending', label: 'Pendientes' },
                  { value: 'approved', label: 'Aprobados' },
                  { value: 'rejected', label: 'Rechazados' }
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setStatusFilter(option.value)
                      setShowFilters(false)
                    }}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border backdrop-blur-sm text-left ${
                      statusFilter === option.value
                        ? 'bg-blue-500/20 text-blue-300 border-blue-400/30 shadow-lg'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-label={`Filtrar por ${option.label}`}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  // Modal de Detalles del Producto
  const ProductDetailModal = () => {
    if (!selectedProduct) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-md overflow-y-auto"
        onClick={() => setSelectedProduct(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl w-full max-w-4xl mx-auto my-auto max-h-[90vh] overflow-y-auto shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
          
          <div className="relative z-10 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white">Detalles del Producto</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-purple-300 hover:text-white transition-colors duration-200 p-1 sm:p-2"
                aria-label="Cerrar detalles del producto"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                  <h4 className="text-white font-semibold mb-3 text-sm sm:text-base">Información General</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-purple-200 text-xs sm:text-sm">Título:</span>
                      <p className="text-white font-medium text-base sm:text-lg">{selectedProduct.title}</p>
                    </div>
                    <div>
                      <span className="text-purple-200 text-xs sm:text-sm">Descripción:</span>
                      <p className="text-white mt-1 leading-relaxed text-sm sm:text-base">
                        {selectedProduct.description || 'Sin descripción'}
                      </p>
                    </div>
                    <div>
                      <span className="text-purple-200 text-xs sm:text-sm">Precio:</span>
                      <p className="text-emerald-300 font-bold text-xl sm:text-2xl">${selectedProduct.price}</p>
                    </div>
                  </div>
                </div>

                {selectedProduct.photo_url && (
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                    <h4 className="text-white font-semibold mb-3 text-sm sm:text-base">Imagen del Producto</h4>
                    <div className="w-full h-48 sm:h-64 overflow-hidden rounded-xl">
                      <img
                        src={selectedProduct.photo_url}
                        alt={selectedProduct.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFmMjkzMyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iPk5vIEltYWdlbjwvdGV4dD48L3N2Zz4='
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                  <h4 className="text-white font-semibold mb-3 text-sm sm:text-base">Estado del Producto</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200 text-xs sm:text-sm">Estado:</span>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        selectedProduct.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                        selectedProduct.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                      }`}>
                        {selectedProduct.status === 'approved' ? 'Aprobado' : 
                         selectedProduct.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200 text-xs sm:text-sm">Habilitado:</span>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        selectedProduct.is_enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                      }`}>
                        {selectedProduct.is_enabled ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-200 text-xs sm:text-sm">Creado:</span>
                      <p className="text-white text-sm sm:text-base">{new Date(selectedProduct.created_at).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                    <div>
                      <span className="text-purple-200 text-xs sm:text-sm">Actualizado:</span>
                      <p className="text-white text-sm sm:text-base">{new Date(selectedProduct.updated_at).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>
                </div>

                {selectedProduct.admin_notes && (
                  <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-400/20">
                    <h4 className="text-amber-300 font-semibold mb-2 text-sm sm:text-base">Notas del Administrador</h4>
                    <p className="text-amber-200 text-xs sm:text-sm leading-relaxed">{selectedProduct.admin_notes}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleEdit(selectedProduct)
                      setSelectedProduct(null)
                    }}
                    className="flex-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-xl py-2.5 sm:py-3 px-4 transition-all duration-200 backdrop-blur-sm hover:bg-blue-500/30 font-medium text-sm sm:text-base"
                    aria-label="Editar producto"
                  >
                    Editar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleEnabled(selectedProduct)}
                    className={`flex-1 rounded-xl py-2.5 sm:py-3 px-4 transition-all duration-200 backdrop-blur-sm border font-medium text-sm sm:text-base ${
                      selectedProduct.is_enabled 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/30 hover:bg-amber-500/30' 
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/30'
                    }`}
                    aria-label={selectedProduct.is_enabled ? 'Deshabilitar producto' : 'Habilitar producto'}
                  >
                    {selectedProduct.is_enabled ? 'Deshabilitar' : 'Habilitar'}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex justify-center items-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-500 border-t-transparent shadow-2xl"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative"
        >
          {/* Efecto de fondo decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 sm:-top-32 sm:-right-32 sm:w-64 sm:h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-32 sm:-left-32 sm:w-64 sm:h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 py-4 sm:py-6">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto mb-3 sm:mb-4 shadow-2xl">
              <Package className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2 sm:mb-3">
              Panel de Proveedor
            </h1>
            <p className="text-purple-200 text-sm sm:text-lg">
              Gestiona tu catálogo de productos
            </p>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
          <StatCard 
            title="Total" 
            value={stats.total} 
            icon={Package} 
            color="bg-blue-500/20"
            bgColor="bg-gradient-to-br from-blue-600/90 to-blue-700/90"
            trend="+12%"
          />
          <StatCard 
            title="Pendientes" 
            value={stats.pending} 
            icon={Clock} 
            color="bg-amber-500/20"
            bgColor="bg-gradient-to-br from-amber-600/90 to-amber-700/90"
            trend={stats.pending > 0 ? "Revisión" : "Al día"}
          />
          <StatCard 
            title="Aprobados" 
            value={stats.approved} 
            icon={CheckCircle} 
            color="bg-emerald-500/20"
            bgColor="bg-gradient-to-br from-emerald-600/90 to-emerald-700/90"
            trend="+8%"
          />
          <StatCard 
            title="Rechazados" 
            value={stats.rejected} 
            icon={AlertCircle} 
            color="bg-rose-500/20"
            bgColor="bg-gradient-to-br from-rose-600/90 to-rose-700/90"
            trend={stats.rejected > 0 ? "Revisar" : "Bien"}
          />
          <StatCard 
            title="Habilitados" 
            value={stats.enabled} 
            icon={Eye} 
            color="bg-violet-500/20"
            bgColor="bg-gradient-to-br from-violet-600/90 to-violet-700/90"
            trend="+5%"
          />
        </div>

        {/* Controles de Productos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Efecto de fondo decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 sm:-top-32 sm:-right-32 sm:w-64 sm:h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-32 sm:-left-32 sm:w-64 sm:h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            {/* Header de Productos */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8">
              <div className="mb-4 lg:mb-0">
                <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                  Gestión de Productos
                </h2>
                <p className="text-purple-200 text-sm sm:text-base">
                  Mostrando {filteredProducts.length} de {products.length} productos
                </p>
              </div>

              {/* Controles: Búsqueda, Filtros, Vista y Nuevo Producto */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Búsqueda */}
                <div className="relative flex-1 min-w-0">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 h-4 w-4 z-10" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-transparent border border-white/40 text-white placeholder-purple-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 relative z-10 text-sm sm:text-base"
                    aria-label="Buscar productos"
                  />
                </div>
                
                {/* Botón Filtros */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(true)}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-white/40 rounded-2xl text-white flex items-center justify-center gap-2 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 text-sm sm:text-base"
                  aria-label="Abrir filtros de productos"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtros</span>
                </motion.button>

                {/* Selector de Vista */}
                <div className="flex bg-white/10 border border-white/40 rounded-2xl backdrop-blur-sm overflow-hidden">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 sm:p-3 transition-all duration-300 ${viewMode === 'grid' ? 'bg-purple-500/20 text-purple-300' : 'text-white/70 hover:text-white'}`}
                    title="Vista de cuadrícula"
                    aria-label="Cambiar a vista de cuadrícula"
                  >
                    <Grid className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewMode('list')}
                    className={`p-2 sm:p-3 transition-all duration-300 ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-300' : 'text-white/70 hover:text-white'}`}
                    title="Vista de lista"
                    aria-label="Cambiar a vista de lista"
                  >
                    <List className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Botón Nuevo Producto */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowForm(true)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 backdrop-blur-sm border border-purple-400/30 font-medium flex items-center justify-center shadow-lg hover:shadow-xl text-sm sm:text-base"
                  aria-label="Crear nuevo producto"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Nuevo Producto</span>
                  <span className="sm:hidden">Nuevo</span>
                </motion.button>
              </div>
            </div>

            {/* Grid de Productos - Vista de Cuadrícula */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <AnimatePresence>
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-white/10 hover:border-white/20 group"
                    >
                      {/* Imagen del producto */}
                      {product.photo_url ? (
                        <div className="w-full h-40 sm:h-48 overflow-hidden">
                          <img
                            src={product.photo_url}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFmMjkzMyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iPk5vIEltYWdlbjwvdGV4dD48L3N2Zz4='
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-40 sm:h-48 bg-white/5 flex items-center justify-center">
                          <Package className="h-12 w-12 sm:h-16 sm:w-16 text-white/30" aria-hidden="true" />
                        </div>
                      )}

                      <div className="p-4 sm:p-6">
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                          <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2 flex-1 mr-2 group-hover:text-purple-200 transition-colors duration-300">
                            {product.title}
                          </h3>
                          <span className="text-lg sm:text-xl font-bold text-emerald-300 whitespace-nowrap">
                            ${product.price}
                          </span>
                        </div>

                        <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                          {product.description || 'Sin descripción'}
                        </p>

                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm ${
                            product.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                            product.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                            product.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-400/30' :
                            'bg-slate-500/20 text-slate-300 border-slate-400/30'
                          }`}>
                            {product.status === 'approved' ? 'Aprobado' :
                             product.status === 'pending' ? 'Pendiente' :
                             product.status === 'rejected' ? 'Rechazado' : 'Deshabilitado'}
                          </span>

                          <span className="text-xs text-white/50 whitespace-nowrap">
                            {new Date(product.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>

                        {/* Notas del admin si el producto fue rechazado */}
                        {product.admin_notes && (
                          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-amber-500/10 border border-amber-400/20 rounded-lg text-xs sm:text-sm text-amber-300 backdrop-blur-sm">
                            <strong className="text-amber-200 text-xs">Notas del administrador:</strong>
                            <p className="text-amber-300 mt-1 text-xs line-clamp-2">{product.admin_notes}</p>
                          </div>
                        )}

                        {/* Acciones */}
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-1 sm:space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setSelectedProduct(product)}
                              disabled={actionLoading !== null}
                              className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/30 backdrop-blur-sm"
                              title="Ver detalles del producto"
                              aria-label={`Ver detalles del producto ${product.title}`}
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(product)}
                              disabled={actionLoading !== null}
                              className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/30 backdrop-blur-sm"
                              title="Editar producto"
                              aria-label={`Editar producto ${product.title}`}
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(product.id)}
                              disabled={actionLoading !== null}
                              className="p-1.5 sm:p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-rose-400/30 backdrop-blur-sm"
                              title="Eliminar producto"
                              aria-label={`Eliminar producto ${product.title}`}
                            >
                              {actionLoading === product.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-rose-400"></div>
                              ) : (
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                              )}
                            </motion.button>
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleEnabled(product)}
                            disabled={actionLoading !== null}
                            className={`p-1.5 sm:p-2 rounded-xl transition duration-200 border backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                              product.is_enabled 
                                ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border-emerald-400/30' 
                                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-500/20 border-slate-400/30'
                            }`}
                            title={product.is_enabled ? 'Deshabilitar producto' : 'Habilitar producto'}
                            aria-label={product.is_enabled ? `Deshabilitar producto ${product.title}` : `Habilitar producto ${product.title}`}
                          >
                            {actionLoading === `toggle-${product.id}` ? (
                              <div className={`animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 ${product.is_enabled ? 'border-emerald-400' : 'border-slate-400'}`}></div>
                            ) : product.is_enabled ? (
                              <ToggleRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Lista de Productos - Vista de Lista */}
            {viewMode === 'list' && (
              <div className="space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15 group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <h3 className="font-bold text-white text-lg sm:text-xl group-hover:text-purple-200 transition-colors duration-300">
                            {product.title}
                          </h3>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm ${
                              product.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                              product.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                              product.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-400/30' :
                              'bg-slate-500/20 text-slate-300 border-slate-400/30'
                            }`}>
                              {product.status === 'approved' ? 'Aprobado' : 
                               product.status === 'pending' ? 'Pendiente' : 
                               product.status === 'rejected' ? 'Rechazado' : 'Desconocido'}
                            </span>
                            {!product.is_enabled && (
                              <span className="px-2 sm:px-3 py-1 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/30 rounded-full backdrop-blur-sm">
                                Deshabilitado
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                          {product.description || 'Sin descripción'}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="font-semibold text-white/80">Precio:</span>
                            <span className="text-emerald-300 font-bold text-base sm:text-lg">${product.price}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="font-semibold text-white/80">Estado:</span>
                            <span className="text-white/70">
                              {product.status === 'approved' ? 'Aprobado' :
                               product.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="font-semibold text-white/80">Creado:</span>
                            <span className="text-white/70">{new Date(product.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {product.admin_notes && (
                          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-amber-500/10 border border-amber-400/20 rounded-lg text-xs sm:text-sm text-amber-300 backdrop-blur-sm">
                            <strong className="font-semibold">Notas del administrador:</strong> {product.admin_notes}
                          </div>
                        )}
                      </div>

                      <div className="flex lg:flex-col items-center lg:items-end gap-2 sm:gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedProduct(product)}
                          disabled={actionLoading !== null}
                          className="p-2 sm:p-3 text-blue-400 hover:bg-blue-500/20 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 border border-blue-400/30 backdrop-blur-sm shadow-lg hover:shadow-xl"
                          title="Ver detalles del producto"
                          aria-label={`Ver detalles del producto ${product.title}`}
                        >
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(product)}
                          disabled={actionLoading !== null}
                          className="p-2 sm:p-3 text-blue-400 hover:bg-blue-500/20 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 border border-blue-400/30 backdrop-blur-sm shadow-lg hover:shadow-xl"
                          title="Editar producto"
                          aria-label={`Editar producto ${product.title}`}
                        >
                          <Edit className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(product.id)}
                          disabled={actionLoading !== null}
                          className="p-2 sm:p-3 text-rose-400 hover:bg-rose-500/20 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 border border-rose-400/30 backdrop-blur-sm shadow-lg hover:shadow-xl"
                          title="Eliminar producto"
                          aria-label={`Eliminar producto ${product.title}`}
                        >
                          {actionLoading === product.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-rose-400"></div>
                          ) : (
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleEnabled(product)}
                          className={`p-2 sm:p-3 rounded-2xl transition-all duration-200 border backdrop-blur-sm shadow-lg hover:shadow-xl ${
                            product.is_enabled 
                              ? 'text-emerald-400 hover:bg-emerald-500/20 border-emerald-400/30' 
                              : 'text-slate-400 hover:bg-slate-500/20 border-slate-400/30'
                          }`}
                          title={product.is_enabled ? 'Deshabilitar producto' : 'Habilitar producto'}
                          aria-label={product.is_enabled ? `Deshabilitar producto ${product.title}` : `Habilitar producto ${product.title}`}
                        >
                          {actionLoading === `toggle-${product.id}` ? (
                            <div className={`animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 ${product.is_enabled ? 'border-emerald-400' : 'border-slate-400'}`}></div>
                          ) : product.is_enabled ? (
                            <ToggleRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Mensaje cuando no hay productos */}
            {filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 sm:py-16"
              >
                <div className="max-w-md mx-auto">
                  <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-white/5 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-white/10">
                    <Package className="h-8 w-8 sm:h-10 sm:w-10 text-white/40" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                    {products.length === 0 ? 'No tienes productos' : 'No se encontraron productos'}
                  </h3>
                  <p className="text-purple-200 mb-4 sm:mb-6 text-sm sm:text-lg">
                    {products.length === 0 
                      ? 'Comienza creando tu primer producto'
                      : 'Intenta con otros términos de búsqueda'
                    }
                  </p>
                  {products.length === 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 backdrop-blur-sm border border-purple-400/30 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base"
                      aria-label="Crear primer producto"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" aria-hidden="true" />
                      Crear primer producto
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
          {showForm && (
            <ProductForm
              product={editingProduct}
              onClose={handleFormClose}
            />
          )}
          {selectedProduct && <ProductDetailModal />}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  )
}

export default ProveedorDashboard