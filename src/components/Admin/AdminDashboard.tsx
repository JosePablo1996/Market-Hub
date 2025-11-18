// src/components/Admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Product, UserProfile } from '../../lib/supabase'
import { Check, X, Eye, EyeOff, Search, Users, Package, Filter, TrendingUp, Clock, Grid, List, Shield } from 'lucide-react'
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
  const [showFilters, setShowFilters] = useState(false)
  const [showUserFilters, setShowUserFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
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
    } catch (error) {
      console.error('Error updating product status:', error)
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
    } catch (error) {
      console.error('Error toggling product:', error)
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
    } catch (error) {
      console.error('Error updating user role:', error)
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
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-white/80 text-sm font-medium">{title}</div>
            {trend && (
              <div className="flex items-center mt-2 text-xs font-medium">
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

  // Modal de Filtros para Productos - MÁS COMPACTO
  const ProductFiltersModal = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-md"
      onClick={() => setShowFilters(false)}
    >
      <motion.div
        className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl sm:rounded-3xl w-full max-w-xs sm:max-w-sm mx-auto shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl sm:rounded-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20">
            <h3 className="text-lg sm:text-xl font-bold text-white">Filtrar Productos</h3>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="text-purple-300 hover:text-white transition-colors duration-200 p-1"
              aria-label="Cerrar filtros"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="space-y-3">
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
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setStatusFilter(option.value)
                        setShowFilters(false)
                      }}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border backdrop-blur-sm text-left ${
                        statusFilter === option.value
                          ? 'bg-blue-500/20 text-blue-300 border-blue-400/30 shadow-lg'
                          : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  // Modal de Filtros para Usuarios - MÁS COMPACTO
  const UserFiltersModal = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-md"
      onClick={() => setShowUserFilters(false)}
    >
      <motion.div
        className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl sm:rounded-3xl w-full max-w-xs sm:max-w-sm mx-auto shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl sm:rounded-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20">
            <h3 className="text-lg sm:text-xl font-bold text-white">Filtrar Usuarios</h3>
            <button
              type="button"
              onClick={() => setShowUserFilters(false)}
              className="text-purple-300 hover:text-white transition-colors duration-200 p-1"
              aria-label="Cerrar filtros"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Rol del Usuario
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: 'all', label: 'Todos los roles' },
                    { value: 'user', label: 'Usuarios' },
                    { value: 'proveedor', label: 'Proveedores' },
                    { value: 'admin', label: 'Administradores' }
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setRoleFilter(option.value)
                        setShowUserFilters(false)
                      }}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border backdrop-blur-sm text-left ${
                        roleFilter === option.value
                          ? 'bg-purple-500/20 text-purple-300 border-purple-400/30 shadow-lg'
                          : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  // Modal para Detalles del Producto - MÁS COMPACTO
  const ProductDetailModal = () => {
    if (!selectedProductDetail) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-md"
        onClick={() => setShowProductModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl sm:rounded-3xl w-full max-w-sm sm:max-w-2xl mx-auto max-h-[85vh] overflow-y-auto shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl sm:rounded-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20">
              <h3 className="text-lg sm:text-xl font-bold text-white">Detalles del Producto</h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="text-purple-300 hover:text-white transition-colors duration-200 p-1"
                aria-label="Cerrar detalles"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/10 rounded-xl p-3 sm:p-4 border border-white/20">
                  <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Información General</h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div>
                      <span className="text-purple-200">Título:</span>
                      <p className="text-white font-medium mt-1">{selectedProductDetail.title}</p>
                    </div>
                    <div>
                      <span className="text-purple-200">Descripción:</span>
                      <p className="text-white mt-1">{selectedProductDetail.description}</p>
                    </div>
                    <div>
                      <span className="text-purple-200">Precio:</span>
                      <p className="text-emerald-300 font-bold text-base sm:text-lg mt-1">${selectedProductDetail.price}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-3 sm:p-4 border border-white/20">
                  <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Información del Proveedor</h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div>
                      <span className="text-purple-200">Nombre:</span>
                      <p className="text-white mt-1">{selectedProductDetail.user_profiles?.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-purple-200">Teléfono:</span>
                      <p className="text-white mt-1">{selectedProductDetail.user_profiles?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-3 sm:p-4 border border-white/20">
                  <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Estado del Producto</h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200">Estado:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedProductDetail.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                        selectedProductDetail.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                      }`}>
                        {selectedProductDetail.status === 'approved' ? 'Aprobado' : 
                         selectedProductDetail.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200">Habilitado:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedProductDetail.is_enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                      }`}>
                        {selectedProductDetail.is_enabled ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-200">Creado:</span>
                      <p className="text-white mt-1">{new Date(selectedProductDetail.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {selectedProductDetail.admin_notes && (
                  <div className="bg-amber-500/10 rounded-xl p-3 sm:p-4 border border-amber-400/20">
                    <h4 className="text-amber-300 font-semibold mb-2 text-sm">Notas del Administrador</h4>
                    <p className="text-amber-200 text-xs sm:text-sm">{selectedProductDetail.admin_notes}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateProductStatus(selectedProductDetail.id, 'approved')}
                    disabled={selectedProductDetail.status === 'approved'}
                    className="flex-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm hover:bg-emerald-500/30 text-sm"
                  >
                    Aprobar
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedProduct(selectedProductDetail)
                      setShowProductModal(false)
                    }}
                    disabled={selectedProductDetail.status === 'rejected'}
                    className="flex-1 bg-rose-500/20 text-rose-300 border border-rose-400/30 rounded-xl py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm hover:bg-rose-500/30 text-sm"
                  >
                    Rechazar
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Modal para Cambiar Rol de Usuario - MÁS COMPACTO
  const UserRoleModal = () => {
    if (!selectedUser) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-md"
        onClick={() => setSelectedUser(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl sm:rounded-3xl w-full max-w-xs sm:max-w-sm mx-auto shadow-2xl relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl sm:rounded-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20">
              <h3 className="text-lg sm:text-xl font-bold text-white">Cambiar Rol</h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-purple-300 hover:text-white transition-colors duration-200 p-1"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="text-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <p className="text-white font-medium text-sm sm:text-base">{selectedUser.full_name}</p>
                <p className="text-purple-200 text-xs sm:text-sm mt-1">
                  Rol actual: <span className="text-white font-semibold">
                    {selectedUser.role === 'admin' ? 'Administrador' :
                     selectedUser.role === 'proveedor' ? 'Proveedor' : 'Usuario'}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { value: 'user' as const, label: 'Usuario', description: 'Usuario regular' },
                  { value: 'proveedor' as const, label: 'Proveedor', description: 'Puede publicar productos' },
                  { value: 'admin' as const, label: 'Administrador', description: 'Acceso completo' }
                ].map((role) => (
                  <motion.button
                    key={role.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateUserRole(selectedUser.id, role.value)}
                    className={`w-full p-3 text-left rounded-xl transition-all duration-300 border backdrop-blur-sm ${
                      selectedUser.role === role.value 
                        ? 'bg-purple-600/20 border-purple-500 shadow-lg' 
                        : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-purple-400/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="font-semibold text-white text-sm">
                          {role.label}
                        </div>
                        <div className="text-purple-200 text-xs mt-1">
                          {role.description}
                        </div>
                      </div>
                      {selectedUser.role === role.value && (
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/20">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedUser(null)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 border border-white/20 backdrop-blur-sm text-sm"
                >
                  Cancelar
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Modal para Rechazar Producto - MÁS COMPACTO
  const RejectProductModal = () => {
    if (!selectedProduct) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-md"
        onClick={() => setSelectedProduct(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl sm:rounded-3xl w-full max-w-xs sm:max-w-sm mx-auto shadow-2xl relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl sm:rounded-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-500/20 rounded-xl flex items-center justify-center border border-rose-400/30">
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Rechazar Producto</h3>
                  <p className="text-purple-200 text-xs sm:text-sm">
                    {selectedProduct.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null)
                  setAdminNotes('')
                }}
                className="text-purple-300 hover:text-white transition-colors duration-200 p-1"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <label htmlFor="adminNotes" className="block text-white text-sm font-semibold mb-2">
                Motivo del rechazo (opcional)
              </label>
              <div className="relative mb-3">
                <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-transparent border border-white/40 text-white placeholder-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 resize-none relative z-10 text-sm"
                  placeholder="Explica por qué se rechaza este producto..."
                  aria-describedby="notesDescription"
                />
              </div>
              <div id="notesDescription" className="text-purple-200 text-xs mb-4">
                Esta información será visible para el proveedor
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedProduct(null)
                    setAdminNotes('')
                  }}
                  className="flex-1 px-4 py-2.5 text-white/70 border border-white/40 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm font-medium text-sm"
                  aria-label="Cancelar rechazo de producto"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateProductStatus(selectedProduct.id, 'rejected', adminNotes)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-300 backdrop-blur-sm border border-rose-400/30 font-medium shadow-lg hover:shadow-xl text-sm"
                  aria-label="Confirmar rechazo del producto"
                >
                  Rechazar
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent shadow-2xl"
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
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto mb-4 shadow-2xl">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3">
              Panel de Administración
            </h1>
            <p className="text-purple-200 text-sm sm:text-lg">
              Gestiona productos, usuarios y configuraciones del sistema
            </p>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <StatCard 
            title="Total Productos" 
            value={stats.totalProducts} 
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
            trend={stats.pending > 0 ? "Revisión necesaria" : "Al día"}
          />
          <StatCard 
            title="Aprobados" 
            value={stats.approved} 
            icon={Check} 
            color="bg-emerald-500/20"
            bgColor="bg-gradient-to-br from-emerald-600/90 to-emerald-700/90"
            trend="+8%"
          />
          <StatCard 
            title="Total Usuarios" 
            value={stats.totalUsers} 
            icon={Users} 
            color="bg-violet-500/20"
            bgColor="bg-gradient-to-br from-violet-600/90 to-violet-700/90"
            trend="+5%"
          />
        </div>

        {/* Pestañas de Navegación */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-2 shadow-2xl relative overflow-hidden"
        >
          {/* Efecto de fondo decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {[
                { id: 'products' as const, label: 'Productos', icon: Package, count: products.length },
                { id: 'users' as const, label: 'Usuarios', icon: Users, count: users.length }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-sm font-semibold transition-all duration-300 flex-1 backdrop-blur-sm group border ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg border-white/20' 
                      : 'text-white/70 hover:text-white hover:bg-white/10 border-white/10'
                  }`}
                  aria-label={`Ver ${tab.label}`}
                >
                  <tab.icon className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 transition-transform duration-300 ${
                    activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 group-hover:bg-white/20'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contenido de Pestañas */}
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Efecto de fondo decorativo */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                {/* Header de Productos */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8">
                  <div className="mb-4 lg:mb-0">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                      Gestión de Productos
                    </h2>
                    <p className="text-purple-200 text-sm sm:text-base">
                      Mostrando {filteredProducts.length} de {products.length} productos
                    </p>
                  </div>

                  {/* Controles: Búsqueda, Filtros y Vista */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Búsqueda */}
                    <div className="relative flex-1 min-w-[200px]">
                      <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 h-4 w-4 z-10" aria-hidden="true" />
                      <input
                        type="text"
                        placeholder="Buscar productos, proveedores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-transparent border border-white/40 text-white placeholder-purple-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 relative z-10 text-sm sm:text-base"
                        aria-label="Buscar productos o proveedores"
                      />
                    </div>
                    
                    {/* Botón Filtros */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowFilters(true)}
                      className="px-4 py-3 bg-white/10 border border-white/40 rounded-2xl text-white flex items-center justify-center gap-2 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 text-sm sm:text-base"
                      aria-label="Abrir filtros"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filtros</span>
                    </motion.button>

                    {/* Selector de Vista */}
                    <div className="flex bg-white/10 border border-white/40 rounded-2xl backdrop-blur-sm overflow-hidden">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode('list')}
                        className={`p-3 transition-all duration-300 ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-300' : 'text-white/70 hover:text-white'}`}
                        title="Vista de lista"
                        aria-label="Vista de lista"
                      >
                        <List className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode('grid')}
                        className={`p-3 transition-all duration-300 ${viewMode === 'grid' ? 'bg-purple-500/20 text-purple-300' : 'text-white/70 hover:text-white'}`}
                        title="Vista de cuadrícula"
                        aria-label="Vista de cuadrícula"
                      >
                        <Grid className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Lista de Productos - Vista de Lista */}
                {viewMode === 'list' && (
                  <div className="space-y-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto custom-scrollbar mt-6">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 text-purple-200">
                        <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" aria-hidden="true" />
                        <p className="text-base sm:text-lg">No se encontraron productos</p>
                        <p className="text-xs sm:text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15 group"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                <h3 className="font-bold text-white text-lg sm:text-xl group-hover:text-purple-200 transition-colors duration-300">
                                  {product.title}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  <span className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-full border backdrop-blur-sm ${
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
                                    <span className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/30 rounded-full backdrop-blur-sm">
                                      Deshabilitado
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-white/80 text-sm mb-4 line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white/80 text-xs sm:text-sm">Precio:</span>
                                  <span className="text-emerald-300 font-bold text-base sm:text-lg">${product.price}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white/80 text-xs sm:text-sm">Proveedor:</span>
                                  <span className="text-white/70 text-xs sm:text-sm">{product.user_profiles?.full_name || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white/80 text-xs sm:text-sm">Teléfono:</span>
                                  <span className="text-white/70 text-xs sm:text-sm">{product.user_profiles?.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white/80 text-xs sm:text-sm">Creado:</span>
                                  <span className="text-white/70 text-xs sm:text-sm">{new Date(product.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {product.admin_notes && (
                                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-400/20 rounded-lg text-sm text-amber-300 backdrop-blur-sm">
                                  <strong className="font-semibold">Notas del administrador:</strong> {product.admin_notes}
                                </div>
                              )}
                            </div>

                            <div className="flex lg:flex-col items-center lg:items-end gap-2 sm:gap-3">
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateProductStatus(product.id, 'approved')}
                                disabled={product.status === 'approved'}
                                className="p-2 sm:p-3 text-emerald-400 hover:bg-emerald-500/20 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 border border-emerald-400/30 backdrop-blur-sm shadow-lg hover:shadow-xl"
                                title="Aprobar producto"
                                aria-label={`Aprobar producto ${product.title}`}
                              >
                                <Check className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                              </motion.button>

                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedProduct(product)}
                                disabled={product.status === 'rejected'}
                                className="p-2 sm:p-3 text-rose-400 hover:bg-rose-500/20 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 border border-rose-400/30 backdrop-blur-sm shadow-lg hover:shadow-xl"
                                title="Rechazar producto"
                                aria-label={`Rechazar producto ${product.title}`}
                              >
                                <X className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                              </motion.button>

                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleProductEnabled(product)}
                                className={`p-2 sm:p-3 rounded-2xl transition-all duration-200 border backdrop-blur-sm shadow-lg hover:shadow-xl ${
                                  product.is_enabled 
                                    ? 'text-emerald-400 hover:bg-emerald-500/20 border-emerald-400/30' 
                                    : 'text-slate-400 hover:bg-slate-500/20 border-slate-400/30'
                                }`}
                                title={product.is_enabled ? 'Deshabilitar producto' : 'Habilitar producto'}
                                aria-label={product.is_enabled ? `Deshabilitar producto ${product.title}` : `Habilitar producto ${product.title}`}
                              >
                                {product.is_enabled ? 
                                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" /> : 
                                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                                }
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* Grid de Productos - Vista de Cuadrícula */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
                    {filteredProducts.length === 0 ? (
                      <div className="col-span-full text-center py-8 sm:py-12 text-purple-200">
                        <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" aria-hidden="true" />
                        <p className="text-base sm:text-lg">No se encontraron productos</p>
                        <p className="text-xs sm:text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15 group cursor-pointer"
                          onClick={() => {
                            setSelectedProductDetail(product)
                            setShowProductModal(true)
                          }}
                        >
                          <div className="space-y-4">
                            {/* Header con título y estado */}
                            <div className="flex items-start justify-between">
                              <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-purple-200 transition-colors duration-300 line-clamp-2 flex-1 mr-3">
                                {product.title}
                              </h3>
                              <div className="flex flex-col gap-1">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm ${
                                  product.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                                  product.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                                  'bg-rose-500/20 text-rose-300 border-rose-400/30'
                                }`}>
                                  {product.status === 'approved' ? 'Aprobado' : 
                                   product.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                                </span>
                                {!product.is_enabled && (
                                  <span className="px-2 py-1 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/30 rounded-full backdrop-blur-sm">
                                    Deshabilitado
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Descripción */}
                            <p className="text-white/70 text-sm line-clamp-3 leading-relaxed">
                              {product.description}
                            </p>

                            {/* Información rápida */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-white/80 text-sm">Precio:</span>
                                <span className="text-emerald-300 font-bold text-base">${product.price}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-white/80 text-sm">Proveedor:</span>
                                <span className="text-white/70 text-sm">{product.user_profiles?.full_name || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-white/80 text-sm">Creado:</span>
                                <span className="text-white/70 text-sm">{new Date(product.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Botón de acción rápida */}
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedProductDetail(product)
                                setShowProductModal(true)
                              }}
                              className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl border border-white/20 transition-all duration-300 text-sm font-medium"
                            >
                              Ver detalles
                            </motion.button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Efecto de fondo decorativo */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8">
                  <div className="mb-4 lg:mb-0">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                      Gestión de Usuarios
                    </h2>
                    <p className="text-purple-200 text-sm sm:text-base">Total: {users.length} usuarios registrados en el sistema</p>
                  </div>

                  {/* Filtros para Usuarios */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 h-4 w-4 z-10" aria-hidden="true" />
                      <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-transparent border border-white/40 text-white placeholder-purple-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 relative z-10 text-sm sm:text-base"
                        aria-label="Buscar usuarios"
                      />
                    </div>
                    
                    {/* Botón Filtros */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUserFilters(true)}
                      className="px-4 py-3 bg-white/10 border border-white/40 rounded-2xl text-white flex items-center justify-center gap-2 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 text-sm sm:text-base"
                      aria-label="Abrir filtros de usuarios"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filtros</span>
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto custom-scrollbar mt-6">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-purple-200">
                      <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" aria-hidden="true" />
                      <p className="text-base sm:text-lg">No se encontraron usuarios</p>
                      <p className="text-xs sm:text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15 group"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
                              <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" aria-hidden="true" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h3 className="font-bold text-white text-lg sm:text-xl group-hover:text-purple-200 transition-colors duration-300">
                                  {user.full_name || 'Usuario sin nombre'}
                                </h3>
                                <span className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-full border backdrop-blur-sm ${
                                  user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' :
                                  user.role === 'proveedor' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                                  'bg-slate-500/20 text-slate-300 border-slate-400/30'
                                }`}>
                                  {user.role === 'admin' ? 'Administrador' :
                                   user.role === 'proveedor' ? 'Proveedor' : 'Usuario'}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-white/70 text-sm">
                                  {user.phone && `📱 ${user.phone}`}
                                </p>
                                <p className="text-white/50 text-xs">
                                  Registrado: {new Date(user.created_at).toLocaleDateString('es-ES', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>

                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedUser(user)}
                            className="px-4 py-2 sm:px-6 sm:py-2.5 bg-white/10 border border-white/40 rounded-2xl text-white hover:bg-white/15 transition-all duration-300 backdrop-blur-sm font-medium min-w-[120px] sm:min-w-[140px] text-sm sm:text-base"
                            aria-label={`Cambiar rol de ${user.full_name}`}
                          >
                            Cambiar Rol
                          </motion.button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modales */}
        <AnimatePresence>
          {showFilters && <ProductFiltersModal />}
          {showUserFilters && <UserFiltersModal />}
          {showProductModal && <ProductDetailModal />}
          {selectedUser && <UserRoleModal />}
          {selectedProduct && <RejectProductModal />}
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

export default AdminDashboard