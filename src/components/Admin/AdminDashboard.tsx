// src/components/Admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Product, UserProfile } from '../../lib/supabase'
import { 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Search, 
  Users, 
  Package, 
  Filter, 
  Clock, 
  Grid, 
  List, 
  Shield,
  ChevronDown,
  User,
  DollarSign,
  CheckCircle,
  Zap,
  Info,
  Calendar,
  Phone,
  BadgeCheck
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Tipo para el producto con la relación de user_profiles
interface ProductWithProfile extends Omit<Product, 'user_profiles'> {
  user_profiles: {
    full_name: string | null
    phone: string | null
  } | null
}

// Extender el tipo UserProfile para incluir email
interface ExtendedUserProfile extends UserProfile {
  email?: string
}

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<ProductWithProfile[]>([])
  const [users, setUsers] = useState<ExtendedUserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<ProductWithProfile | null>(null)
  const [selectedUser, setSelectedUser] = useState<ExtendedUserProfile | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'products' | 'users'>('products')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductWithProfile | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Obtener todos los productos con información del proveedor
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          user_profiles!products_proveedor_id_fkey (
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError

      // Obtener todos los usuarios
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Convertir a ProductWithProfile de forma segura
      const convertedProducts: ProductWithProfile[] = (productsData || []).map(product => ({
        ...product,
        user_profiles: product.user_profiles ? {
          full_name: product.user_profiles.full_name,
          phone: product.user_profiles.phone
        } : null
      }))

      setProducts(convertedProducts)
      setUsers(usersData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProductStatus = async (productId: string, status: Product['status'], notes?: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          status,
          admin_notes: notes || null,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (error) throw error

      fetchData()
      setSelectedProduct(null)
      setAdminNotes('')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Error al actualizar el estado del producto')
    }
  }

  const toggleProductEnabled = async (product: ProductWithProfile) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_enabled: !product.is_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)

      if (error) throw error
      fetchData()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Error al cambiar el estado del producto')
    }
  }

  const updateUserRole = async (userId: string, newRole: 'user' | 'proveedor' | 'admin') => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      fetchData()
      setSelectedUser(null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Error al actualizar el rol del usuario')
    }
  }

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.user_profiles?.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const stats = {
    totalProducts: products.length,
    pending: products.filter(p => p.status === 'pending').length,
    approved: products.filter(p => p.status === 'approved').length,
    rejected: products.filter(p => p.status === 'rejected').length,
    totalUsers: users.length,
    providers: users.filter(u => u.role === 'proveedor').length,
    admins: users.filter(u => u.role === 'admin').length
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const created = new Date(date)
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) return 'Nuevo hoy'
    return 'Producto establecido'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
      case 'pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30'
      case 'rejected':
        return 'bg-rose-500/20 text-rose-300 border-rose-400/30'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30'
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30'
      case 'proveedor':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30'
    }
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setRoleFilter('all')
    setSearchTerm('')
    setIsFilterModalOpen(false)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (statusFilter !== 'all') count++
    if (roleFilter !== 'all') count++
    return count
  }

  // Función para obtener nombre del proveedor de forma segura con verificación
  const getProviderName = (product: ProductWithProfile): string => {
    if (!product.user_profiles?.full_name) return 'Proveedor Verificado'
    return product.user_profiles.full_name
  }

  // Función para obtener teléfono del proveedor de forma segura
  const getProviderPhone = (product: ProductWithProfile): string => {
    return product.user_profiles?.phone || ''
  }

  // Modal de Filtros
  const FiltersModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-2xl shadow-2xl p-5 w-full max-w-xs sm:max-w-sm animate-scale-in">
        <div className="text-center mb-4">
          <Filter className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 mx-auto mb-3" />
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
            Filtros
          </h3>
          <p className="text-blue-200 text-xs sm:text-sm">
            Configura los filtros según necesites
          </p>
        </div>
        
        <div className="space-y-4 mb-4">
          {activeTab === 'products' && (
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Estado del Producto
              </label>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'Todos los estados' },
                  { value: 'pending', label: 'Pendientes' },
                  { value: 'approved', label: 'Aprobados' },
                  { value: 'rejected', label: 'Rechazados' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatusFilter(option.value)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 ${
                      statusFilter === option.value 
                        ? 'bg-blue-500/30 border-2 border-blue-400' 
                        : 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30'
                    } text-blue-300`}
                    title={`Filtrar por ${option.label}`}
                  >
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="flex-1 text-left font-medium text-white text-sm">
                      {option.label}
                    </span>
                    {statusFilter === option.value && (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Rol del Usuario
              </label>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'Todos los roles' },
                  { value: 'user', label: 'Usuarios' },
                  { value: 'proveedor', label: 'Proveedores' },
                  { value: 'admin', label: 'Administradores' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRoleFilter(option.value)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 ${
                      roleFilter === option.value 
                        ? 'bg-purple-500/30 border-2 border-purple-400' 
                        : 'bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30'
                    } text-purple-300`}
                    title={`Filtrar por ${option.label}`}
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="flex-1 text-left font-medium text-white text-sm">
                      {option.label}
                    </span>
                    {roleFilter === option.value && (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Estado de filtros activos */}
        {getActiveFiltersCount() > 0 && (
          <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-400/30 mb-4">
            <div className="flex items-center justify-center space-x-2">
              <Filter className="h-3 w-3 text-blue-300" />
              <p className="text-xs text-blue-200">
                Filtros activos: <span className="text-white font-semibold">{getActiveFiltersCount()}</span>
              </p>
            </div>
          </div>
        )}

        {/* Botones del Modal */}
        <div className="flex justify-between space-x-3">
          <button
            type="button"
            onClick={clearFilters}
            className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 backdrop-blur-sm"
            title="Limpiar todos los filtros"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(false)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            title="Aplicar filtros"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )

  // Modal para Detalles del Producto
  const ProductDetailModal = () => {
    if (!selectedProductDetail) return null

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-3xl shadow-2xl w-full max-w-6xl mx-auto animate-scale-in overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header del Modal */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              <h3 className="text-xl sm:text-2xl font-bold text-white">Detalles del Producto</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowProductModal(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200"
              title="Cerrar detalles del producto"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Contenido del Modal */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Información del producto */}
              <div className="space-y-4 sm:space-y-6">
                {/* Título */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {selectedProductDetail.title}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(selectedProductDetail.status)}`}>
                      {selectedProductDetail.status === 'approved' ? 'Aprobado' : 
                       selectedProductDetail.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                    </span>
                    {!selectedProductDetail.is_enabled && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                        Deshabilitado
                      </span>
                    )}
                  </div>
                </div>

                {/* Precio */}
                <div className="flex items-center space-x-2">
                  <span className="text-3xl sm:text-4xl font-bold text-green-400 flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>{selectedProductDetail.price}</span>
                  </span>
                </div>

                {/* Descripción */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                    <Info className="h-5 w-5 text-blue-300" />
                    <span>Descripción</span>
                  </h4>
                  <p className="text-blue-200 leading-relaxed text-sm sm:text-base">
                    {selectedProductDetail.description || 'Sin descripción disponible'}
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
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-semibold text-sm sm:text-base">
                          {getProviderName(selectedProductDetail)}
                        </p>
                        <BadgeCheck className="h-4 w-4 text-emerald-400" />
                      </div>
                      {getProviderPhone(selectedProductDetail) && (
                        <p className="text-blue-300 text-sm">
                          {getProviderPhone(selectedProductDetail)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado y acciones */}
              <div className="space-y-4 sm:space-y-6">
                {/* Información de estado */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-3">Estado del Producto</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-white font-semibold text-sm">Creado</p>
                      <p className="text-blue-300 text-xs">
                        {new Date(selectedProductDetail.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mx-auto mb-2" />
                      <p className="text-white font-semibold text-sm">Disponible</p>
                      <p className="text-blue-300 text-xs">
                        {selectedProductDetail.is_enabled ? 'Sí' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notas del administrador */}
                {selectedProductDetail.admin_notes && (
                  <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-400/20">
                    <h4 className="text-amber-300 font-semibold mb-2">Notas del Administrador</h4>
                    <p className="text-amber-200 text-sm">{selectedProductDetail.admin_notes}</p>
                  </div>
                )}

                {/* Acciones */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => updateProductStatus(selectedProductDetail.id, 'approved')}
                    disabled={selectedProductDetail.status === 'approved'}
                    className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Aprobar este producto"
                  >
                    Aprobar Producto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(selectedProductDetail)
                      setShowProductModal(false)
                    }}
                    disabled={selectedProductDetail.status === 'rejected'}
                    className="w-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Rechazar este producto"
                  >
                    Rechazar Producto
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleProductEnabled(selectedProductDetail)}
                    className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 py-3 rounded-2xl font-semibold transition-all duration-200"
                    title={selectedProductDetail.is_enabled ? 'Deshabilitar producto' : 'Habilitar producto'}
                  >
                    {selectedProductDetail.is_enabled ? 'Deshabilitar' : 'Habilitar'} Producto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Modal para Cambiar Rol de Usuario
  const UserRoleModal = () => {
    if (!selectedUser) return null

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-3xl shadow-2xl w-full max-w-md mx-auto animate-scale-in overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              <h3 className="text-xl sm:text-2xl font-bold text-white">Cambiar Rol de Usuario</h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200"
              title="Cerrar modal de cambio de rol"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-white font-bold text-lg">{selectedUser.full_name || 'Usuario'}</h4>
              <p className="text-blue-300 text-sm">{selectedUser.phone || ''}</p>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(selectedUser.role)}`}>
                  {selectedUser.role === 'admin' ? 'Administrador' :
                   selectedUser.role === 'proveedor' ? 'Proveedor' : 'Usuario'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { value: 'user' as const, label: 'Usuario', description: 'Usuario regular del sistema' },
                { value: 'proveedor' as const, label: 'Proveedor', description: 'Puede publicar productos' },
                { value: 'admin' as const, label: 'Administrador', description: 'Acceso completo al sistema' }
              ].map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => updateUserRole(selectedUser.id, role.value)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                    selectedUser.role === role.value
                      ? 'bg-blue-500/30 border-2 border-blue-400'
                      : 'bg-white/5 border border-white/20 hover:bg-white/10'
                  }`}
                  title={`Cambiar rol a ${role.label}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{role.label}</p>
                      <p className="text-blue-300 text-sm">{role.description}</p>
                    </div>
                    {selectedUser.role === role.value && (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Modal para Rechazar Producto
  const RejectProductModal = () => {
    if (!selectedProduct) return null

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-3xl shadow-2xl w-full max-w-md mx-auto animate-scale-in overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-rose-400" />
              <h3 className="text-xl sm:text-2xl font-bold text-white">Rechazar Producto</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedProduct(null)
                setAdminNotes('')
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200"
              title="Cancelar rechazo"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-4">
              <h4 className="text-white font-semibold mb-2">{selectedProduct.title}</h4>
              <p className="text-blue-300 text-sm">Proveedor: {getProviderName(selectedProduct)}</p>
            </div>

            <label htmlFor="adminNotes" className="block text-white text-sm font-semibold mb-2">
              Motivo del rechazo (opcional)
            </label>
            <textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm resize-none"
              placeholder="Explica por qué se rechaza este producto..."
            />
            <p className="text-blue-300 text-xs mt-2">Esta información será visible para el proveedor</p>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null)
                  setAdminNotes('')
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-2xl font-semibold transition-all duration-200"
                title="Cancelar operación"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => updateProductStatus(selectedProduct.id, 'rejected', adminNotes)}
                className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                title="Confirmar rechazo del producto"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>
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
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mx-auto mb-6 shadow-2xl">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-4">
            Panel de Administración
          </h1>
          <p className="text-blue-200 text-xl mb-4">
            Gestión completa del sistema
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 text-center hover:scale-105 transition-all duration-300 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <dt className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Total Productos</dt>
            <dd className="mt-2 text-4xl font-bold text-white">{stats.totalProducts}</dd>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 text-center hover:scale-105 transition-all duration-300 animate-fade-in delay-100">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <dt className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Pendientes</dt>
            <dd className="mt-2 text-4xl font-bold text-white">{stats.pending}</dd>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 text-center hover:scale-105 transition-all duration-300 animate-fade-in delay-200">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center">
                <Check className="h-6 w-6 text-white" />
              </div>
            </div>
            <dt className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Aprobados</dt>
            <dd className="mt-2 text-4xl font-bold text-white">{stats.approved}</dd>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 text-center hover:scale-105 transition-all duration-300 animate-fade-in delay-300">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <dt className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Total Usuarios</dt>
            <dd className="mt-2 text-4xl font-bold text-white">{stats.totalUsers}</dd>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-2 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'products' as const, label: 'Gestión de Productos', icon: Package, count: products.length },
              { id: 'users' as const, label: 'Gestión de Usuarios', icon: Users, count: users.length }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 flex-1 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg' 
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
                title={`Cambiar a ${tab.label}`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/10 text-blue-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Búsqueda */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5 transition-colors duration-200 group-focus-within:text-white" />
              <input
                type="text"
                placeholder={`Buscar ${activeTab === 'products' ? 'productos, proveedores...' : 'usuarios...'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/30 text-white placeholder-blue-300 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/15 focus:bg-white/15"
                aria-label={`Buscar ${activeTab === 'products' ? 'productos y proveedores' : 'usuarios'}`}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Botón de Filtros */}
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className="flex items-center space-x-3 bg-white/10 border border-white/30 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 backdrop-blur-sm hover:bg-white/15 min-w-40 justify-between relative"
                title="Abrir panel de filtros"
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

              {/* Vista (solo para productos) */}
              {activeTab === 'products' && (
                <div className="flex bg-white/10 rounded-2xl p-1 border border-white/20">
                  <button
                    type="button"
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
                    type="button"
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
              )}
            </div>
          </div>
        </div>

        {/* Contenido de Pestañas */}
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-fade-in"
            >
              {/* Vista Grid de Productos */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl">
                      <Package className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                      <p className="text-blue-200 text-xl mb-2">No se encontraron productos</p>
                      <p className="text-blue-300 text-sm">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  ) : (
                    filteredProducts.map((product, index) => (
                      <div 
                        key={product.id} 
                        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden hover:scale-105 transition-all duration-300 animate-fade-in group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Header de la tarjeta */}
                        <div className="relative overflow-hidden">
                          <div className="w-full h-48 bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                            <Package className="h-16 w-16 text-gray-400" />
                          </div>
                          
                          {/* Badges superpuestos */}
                          <div className="absolute top-3 left-3 flex flex-col space-y-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(product.status)} flex items-center space-x-1 shadow-lg`}>
                              <Zap className="h-3 w-3" />
                              <span>
                                {product.status === 'approved' ? 'Aprobado' : 
                                 product.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                              </span>
                            </span>
                            {!product.is_enabled && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center space-x-1 shadow-lg">
                                <EyeOff className="h-3 w-3" />
                                <span>Deshabilitado</span>
                              </span>
                            )}
                          </div>

                          {/* Acciones rápidas */}
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col space-y-2">
                            <button
                              type="button"
                              onClick={() => updateProductStatus(product.id, 'approved')}
                              disabled={product.status === 'approved'}
                              className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/30 transition-all duration-200 backdrop-blur-sm disabled:opacity-50"
                              title="Aprobar producto"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedProduct(product)}
                              disabled={product.status === 'rejected'}
                              className="p-2 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-300 hover:bg-rose-500/30 transition-all duration-200 backdrop-blur-sm disabled:opacity-50"
                              title="Rechazar producto"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProductDetail(product)
                                setShowProductModal(true)
                              }}
                              className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 hover:bg-blue-500/30 transition-all duration-200 backdrop-blur-sm"
                              title="Ver detalles del producto"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Contenido de la tarjeta */}
                        <div className="p-6">
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

                          {/* Información del proveedor */}
                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <User className="h-3 w-3 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-1">
                                  <p className="text-white text-xs font-semibold">
                                    {getProviderName(product)}
                                  </p>
                                  <BadgeCheck className="h-3 w-3 text-emerald-400" />
                                </div>
                                {getProviderPhone(product) && (
                                  <p className="text-blue-300 text-xs">{getProviderPhone(product)}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1 text-green-400">
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">{getTimeAgo(product.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Vista Lista de Productos */}
              {viewMode === 'list' && (
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden mb-8">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Producto</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Precio</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Proveedor</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Estado</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Acciones</th>
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
                                <div className="h-16 w-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center">
                                  <Package className="h-8 w-8 text-gray-400" />
                                </div>
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
                                <div>
                                  <div className="flex items-center space-x-1">
                                    <p className="text-white font-medium text-sm">{getProviderName(product)}</p>
                                    <BadgeCheck className="h-3 w-3 text-emerald-400" />
                                  </div>
                                  {getProviderPhone(product) && (
                                    <p className="text-blue-300 text-xs">{getProviderPhone(product)}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col space-y-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(product.status)} text-center`}>
                                  {product.status === 'approved' ? 'Aprobado' : 
                                   product.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                                </span>
                                {!product.is_enabled && (
                                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/30 text-center">
                                    Deshabilitado
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => updateProductStatus(product.id, 'approved')}
                                  disabled={product.status === 'approved'}
                                  className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/30 transition-all duration-200 disabled:opacity-50"
                                  title="Aprobar producto"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedProduct(product)}
                                  disabled={product.status === 'rejected'}
                                  className="p-2 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-300 hover:bg-rose-500/30 transition-all duration-200 disabled:opacity-50"
                                  title="Rechazar producto"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProductDetail(product)
                                    setShowProductModal(true)
                                  }}
                                  className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 hover:bg-blue-500/30 transition-all duration-200"
                                  title="Ver detalles del producto"
                                >
                                  <Eye className="h-4 w-4" />
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
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-fade-in"
            >
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Usuario</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Contacto</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Rol</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Registro</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center">
                            <Users className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                            <p className="text-blue-200 text-xl mb-2">No se encontraron usuarios</p>
                            <p className="text-blue-300 text-sm">Intenta ajustar los filtros de búsqueda</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user, index) => (
                          <tr 
                            key={user.id} 
                            className="hover:bg-white/5 transition-colors duration-200 animate-fade-in group"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                                  <User className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-white font-semibold group-hover:text-blue-200 transition-colors duration-200">
                                    {user.full_name || 'Usuario sin nombre'}
                                  </h3>
                                  {user.email && (
                                    <p className="text-blue-300 text-sm">{user.email}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2 text-blue-300">
                                {user.phone && (
                                  <>
                                    <Phone className="h-4 w-4" />
                                    <span className="text-sm">{user.phone}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                                {user.role === 'admin' ? 'Administrador' :
                                 user.role === 'proveedor' ? 'Proveedor' : 'Usuario'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2 text-blue-300">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">{new Date(user.created_at).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() => setSelectedUser(user)}
                                className="px-4 py-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-2xl hover:bg-blue-500/30 transition-all duration-200 font-semibold"
                                title="Cambiar rol de usuario"
                              >
                                Cambiar Rol
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contador de resultados */}
        {filteredProducts.length > 0 && activeTab === 'products' && (
          <div className="text-center">
            <p className="text-blue-200 text-sm">
              Mostrando <span className="text-white font-semibold">{filteredProducts.length}</span> de{' '}
              <span className="text-white font-semibold">{products.length}</span> productos
            </p>
          </div>
        )}

        {filteredUsers.length > 0 && activeTab === 'users' && (
          <div className="text-center">
            <p className="text-blue-200 text-sm">
              Mostrando <span className="text-white font-semibold">{filteredUsers.length}</span> de{' '}
              <span className="text-white font-semibold">{users.length}</span> usuarios
            </p>
          </div>
        )}

        {/* Modales */}
        <AnimatePresence>
          {isFilterModalOpen && <FiltersModal />}
          {showProductModal && <ProductDetailModal />}
          {selectedUser && <UserRoleModal />}
          {selectedProduct && <RejectProductModal />}
        </AnimatePresence>
      </div>

      {/* Estilos de Animación */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
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
          .delay-300 {
            animation-delay: 300ms;
          }
        `}
      </style>
    </div>
  )
}

export default AdminDashboard