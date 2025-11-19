// src/components/Proveedor/ProveedorDashboard.tsx
import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import type { Product } from '../../lib/supabase'
import { useAuth } from '../../contexts/useAuth'
import { 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Plus, 
  Search, 
  X, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  Filter, 
  Grid, 
  List,
  Calendar,
  ShoppingBag,
  ChevronDown,
  DollarSign
} from 'lucide-react'
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

        if (error) throw error
      } else {
        // Crear nuevo producto
        const { error } = await supabase
          .from('products')
          .insert([{
            ...productData,
            created_at: new Date().toISOString()
          }])

        if (error) throw error
      }

      onClose()
    } catch (error: unknown) {
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-3xl shadow-2xl w-full max-w-md mx-auto my-auto relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {product ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200"
              aria-label="Cerrar formulario"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                Título *
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/30 text-white placeholder-blue-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                required
                placeholder="Ingresa el título del producto"
                aria-required="true"
                disabled={loading}
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-white/10 border border-white/30 text-white placeholder-blue-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-all duration-300 backdrop-blur-sm"
                placeholder="Describe tu producto en detalle..."
                aria-describedby="description-help"
                disabled={loading}
                maxLength={2000}
              />
              <div id="description-help" className="flex justify-between text-sm text-blue-300 mt-2">
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
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300">$</span>
                <input
                  id="price"
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 text-white placeholder-blue-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  required
                  placeholder="0.00"
                  aria-required="true"
                  disabled={loading}
                />
              </div>
              <div className="text-sm text-blue-300 mt-2">
                Usa punto para decimales (ej: 19.99)
              </div>
            </div>

            <div>
              <label htmlFor="photo_url" className="block text-sm font-medium text-white mb-2">
                URL de Imagen
              </label>
              <input
                id="photo_url"
                type="url"
                name="photo_url"
                value={formData.photo_url}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/30 text-white placeholder-blue-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                placeholder="https://ejemplo.com/imagen.jpg"
                aria-describedby="image-help"
                disabled={loading}
              />
              <div id="image-help" className="text-sm text-blue-300 mt-2">
                Opcional - URL de la imagen del producto
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl transition-all duration-200 backdrop-blur-sm font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-200 backdrop-blur-sm border border-purple-400/30 font-medium flex items-center justify-center min-w-24 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  product ? 'Actualizar' : 'Crear'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

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

  useEffect(() => {
    if (user && !isFetchingRef.current) {
      fetchProducts()
    }
  }, [user])

  const fetchProducts = async (): Promise<void> => {
    if (isFetchingRef.current) return

    try {
      isFetchingRef.current = true
      setLoading(true)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('proveedor_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setProducts(data || [])
    } catch (error: unknown) {
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

      if (error) throw error
      
      setProducts(prev => prev.filter(p => p.id !== productId))
    } catch (error: unknown) {
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

      if (error) throw error
      
      setProducts(prev => prev.map(p => 
        p.id === product.id 
          ? { ...p, is_enabled: !p.is_enabled, updated_at: new Date().toISOString() }
          : p
      ))
    } catch (error: unknown) {
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
      onClick={() => setShowFilters(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-3xl shadow-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <Filter className="h-12 w-12 text-blue-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-1">Filtrar Productos</h3>
          <p className="text-blue-200 text-sm">Selecciona un estado</p>
        </div>
        
        <div className="space-y-3 mb-6">
          {[
            { value: 'all', label: 'Todos los estados' },
            { value: 'pending', label: 'Pendientes' },
            { value: 'approved', label: 'Aprobados' },
            { value: 'rejected', label: 'Rechazados' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setStatusFilter(option.value)
                setShowFilters(false)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                statusFilter === option.value 
                  ? 'bg-blue-500/30 border-2 border-blue-400' 
                  : 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30'
              } text-blue-300`}
            >
              <span className="flex-1 text-left font-medium text-white text-sm">
                {option.label}
              </span>
              {statusFilter === option.value && (
                <CheckCircle className="h-5 w-5 text-green-400" />
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-between space-x-3">
          <button
            onClick={() => {
              setStatusFilter('all')
              setShowFilters(false)
            }}
            className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm"
          >
            Limpiar
          </button>
          <button
            onClick={() => setShowFilters(false)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Aplicar
          </button>
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
        onClick={() => setSelectedProduct(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-3xl shadow-2xl w-full max-w-4xl mx-auto my-auto max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Eye className="h-6 w-6 text-blue-400" />
                <h3 className="text-2xl font-bold text-white">Detalles del Producto</h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200"
                aria-label="Cerrar detalles del producto"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-3">Información General</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-blue-200 text-sm">Título:</span>
                      <p className="text-white font-medium text-lg">{selectedProduct.title}</p>
                    </div>
                    <div>
                      <span className="text-blue-200 text-sm">Descripción:</span>
                      <p className="text-white mt-1 leading-relaxed">
                        {selectedProduct.description || 'Sin descripción'}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-200 text-sm">Precio:</span>
                      <p className="text-emerald-300 font-bold text-2xl">${selectedProduct.price}</p>
                    </div>
                  </div>
                </div>

                {selectedProduct.photo_url && (
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-3">Imagen del Producto</h4>
                    <div className="w-full h-48 overflow-hidden rounded-xl">
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
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-3">Estado del Producto</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200 text-sm">Estado:</span>
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
                      <span className="text-blue-200 text-sm">Habilitado:</span>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        selectedProduct.is_enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                      }`}>
                        {selectedProduct.is_enabled ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-200 text-sm">Creado:</span>
                      <p className="text-white">{new Date(selectedProduct.created_at).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                    <div>
                      <span className="text-blue-200 text-sm">Actualizado:</span>
                      <p className="text-white">{new Date(selectedProduct.updated_at).toLocaleDateString('es-ES', { 
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
                    <h4 className="text-amber-300 font-semibold mb-2">Notas del Administrador</h4>
                    <p className="text-amber-200 text-sm leading-relaxed">{selectedProduct.admin_notes}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => {
                      handleEdit(selectedProduct)
                      setSelectedProduct(null)
                    }}
                    className="flex-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-xl py-3 px-4 transition-all duration-200 backdrop-blur-sm hover:bg-blue-500/30 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => toggleEnabled(selectedProduct)}
                    className={`flex-1 rounded-xl py-3 px-4 transition-all duration-200 backdrop-blur-sm border font-medium ${
                      selectedProduct.is_enabled 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/30 hover:bg-amber-500/30' 
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/30'
                    }`}
                  >
                    {selectedProduct.is_enabled ? 'Deshabilitar' : 'Habilitar'}
                  </button>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto mb-6 shadow-2xl">
            <ShoppingBag className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4">
            Panel de Proveedor
          </h1>
          <p className="text-blue-200 text-xl">
            Gestiona tu catálogo de productos
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 text-center hover:scale-105 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <dt className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Total</dt>
            <dd className="mt-2 text-4xl font-bold text-white">{stats.total}</dd>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 text-center hover:scale-105 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <dt className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Pendientes</dt>
            <dd className="mt-2 text-4xl font-bold text-white">{stats.pending}</dd>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 text-center hover:scale-105 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <dt className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Aprobados</dt>
            <dd className="mt-2 text-4xl font-bold text-white">{stats.approved}</dd>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 text-center hover:scale-105 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <dt className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Rechazados</dt>
            <dd className="mt-2 text-4xl font-bold text-white">{stats.rejected}</dd>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 text-center hover:scale-105 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
            <dt className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Habilitados</dt>
            <dd className="mt-2 text-4xl font-bold text-white">{stats.enabled}</dd>
          </div>
        </div>

        {/* Controles de Productos */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Búsqueda */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5 transition-colors duration-200 group-focus-within:text-white" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/30 text-white placeholder-blue-300 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/15 focus:bg-white/15"
                aria-label="Buscar productos"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Botón de Filtros */}
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center space-x-3 bg-white/10 border border-white/30 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 backdrop-blur-sm hover:bg-white/15 min-w-40 justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-blue-300" />
                  <span>Filtros</span>
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
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Botón Nuevo Producto */}
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl px-6 py-4 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
              >
                <Plus className="h-5 w-5" />
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl">
            <Package className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <p className="text-blue-200 text-xl mb-2">
              {products.length === 0 ? 'No tienes productos' : 'No se encontraron productos'}
            </p>
            <p className="text-blue-300 mb-6">
              {products.length === 0 
                ? 'Comienza creando tu primer producto'
                : 'Intenta con otros términos de búsqueda'
              }
            </p>
            {products.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
              >
                <Plus className="h-5 w-5" />
                <span>Crear primer producto</span>
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden hover:scale-105 transition-all duration-300 group"
              >
                {/* Imagen del producto */}
                {product.photo_url ? (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={product.photo_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white line-clamp-2 flex-1 mr-2 group-hover:text-blue-200 transition-colors duration-300">
                      {product.title}
                    </h3>
                    <span className="text-xl font-bold text-emerald-300 whitespace-nowrap">
                      ${product.price}
                    </span>
                  </div>

                  <p className="text-blue-200 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {product.description || 'Sin descripción'}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm ${
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
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-400/20 rounded-lg text-sm text-amber-300 backdrop-blur-sm">
                      <strong className="text-amber-200 text-xs">Notas del administrador:</strong>
                      <p className="text-amber-300 mt-1 text-xs line-clamp-2">{product.admin_notes}</p>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        disabled={actionLoading !== null}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-xl transition duration-200 disabled:opacity-50 border border-blue-400/30 backdrop-blur-sm"
                        title="Ver detalles del producto"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEdit(product)}
                        disabled={actionLoading !== null}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-xl transition duration-200 disabled:opacity-50 border border-blue-400/30 backdrop-blur-sm"
                        title="Editar producto"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={actionLoading !== null}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition duration-200 disabled:opacity-50 border border-rose-400/30 backdrop-blur-sm"
                        title="Eliminar producto"
                      >
                        {actionLoading === product.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-400"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    
                    <button
                      onClick={() => toggleEnabled(product)}
                      disabled={actionLoading !== null}
                      className={`p-2 rounded-xl transition duration-200 border backdrop-blur-sm disabled:opacity-50 ${
                        product.is_enabled 
                          ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border-emerald-400/30' 
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-500/20 border-slate-400/30'
                      }`}
                      title={product.is_enabled ? 'Deshabilitar producto' : 'Habilitar producto'}
                    >
                      {actionLoading === `toggle-${product.id}` ? (
                        <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${product.is_enabled ? 'border-emerald-400' : 'border-slate-400'}`}></div>
                      ) : product.is_enabled ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Vista Lista */
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Producto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Precio</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Creado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredProducts.map((product) => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-white/5 transition-colors duration-200 group"
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
                        <div className="flex flex-col space-y-1">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm ${
                            product.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                            product.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                            'bg-rose-500/20 text-rose-300 border-rose-400/30'
                          }`}>
                            {product.status === 'approved' ? 'Aprobado' : 
                             product.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                          </span>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm ${
                            product.is_enabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                            'bg-rose-500/20 text-rose-300 border-rose-400/30'
                          }`}>
                            {product.is_enabled ? 'Habilitado' : 'Deshabilitado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-300" />
                          <span className="text-blue-300 text-sm">{new Date(product.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-200 border border-blue-400/30 backdrop-blur-sm"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-200 border border-blue-400/30 backdrop-blur-sm"
                            title="Editar producto"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all duration-200 border border-rose-400/30 backdrop-blur-sm"
                            title="Eliminar producto"
                          >
                            {actionLoading === product.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-400"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
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
      </div>

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
  )
}

export default ProveedorDashboard