# MarketHub - Plataforma de Comercio Multirol

//img.shields.io/badge/React-18.2.0-blue)
//img.shields.io/badge/TypeScript-5.0-blue)
//img.shields.io/badge/Supabase-PostgreSQL-green)
//img.shields.io/badge/Tailwind-CSS-38B2AC)

Una plataforma moderna de comercio electrónico construida con React, TypeScript y Supabase, que implementa un sistema de roles y seguridad a nivel de filas (RLS) para gestionar productos, proveedores y administradores.

## 🚀 Características

### 🔐 Sistema de Autenticación y Roles
- **Tres roles de usuario**: Cliente, Proveedor, Administrador
- **Registro seguro** con validación de roles
- **Modo invitado** para explorar el catálogo sin registro
- **Recuperación de contraseña** integrada

### 🛡️ Seguridad con RLS (Row Level Security)
- **Políticas granulares** por rol de usuario
- **Proveedores** solo ven y gestionan sus productos
- **Clientes** solo ven productos aprobados y habilitados
- **Administradores** tienen acceso completo al sistema

### 🎨 Experiencia de Usuario
- **Diseño glassmorphism** moderno y atractivo
- **Interfaz responsive** para todos los dispositivos
- **Animaciones fluidas** con Framer Motion
- **Navegación intuitiva** por roles

## 📋 Roles y Permisos

### 👤 Cliente
- Explorar catálogo de productos aprobados
- Ver detalles de productos
- Modo invitado sin registro

### 🏢 Proveedor
- Gestionar productos propios (CRUD completo)
- Subir imágenes de productos
- Seguir estado de aprobación de productos

### ⚡ Administrador
- Gestionar todos los productos
- Aprobar/rechazar productos de proveedores
- Ver estadísticas del sistema
- Acceso completo a la plataforma

## 🛠️ Tecnologías

### Frontend
- **React 18** con TypeScript
- **Vite** para desarrollo y build
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **Lucide React** para iconos

### Backend & Base de Datos
- **Supabase** (PostgreSQL)
- **Autenticación** integrada
- **Row Level Security (RLS)**
- **Edge Functions** para notificaciones

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16+ 
- npm o yarn
- Cuenta en Supabase

### 1. Clonar el repositorio
```bash
git clone https://github.com/JosePablo1996/Market-Hub.git
cd Market-Hub
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

### 5. Build para producción
```bash
npm run build
```

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

#### `user_profiles`
- `id` (UUID, FK a auth.users)
- `role` ('user' | 'proveedor' | 'admin')
- `full_name` (text)
- `phone` (text, opcional)
- `created_at`, `updated_at`

#### `products`
- `id` (UUID, primary key)
- `proveedor_id` (UUID, FK a user_profiles)
- `title` (text)
- `description` (text)
- `price` (numeric)
- `photo_url` (text)
- `status` ('pending' | 'approved' | 'rejected' | 'disabled')
- `is_enabled` (boolean)
- `admin_notes` (text)
- `approved_by` (UUID)
- `approved_at` (timestamp)
- `created_at`, `updated_at`

## 🔒 Políticas RLS Implementadas

### Para `user_profiles`
```sql
-- Usuarios solo pueden leer su propio perfil
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

-- Administradores pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
```

### Para `products`
```sql
-- Clientes solo ven productos aprobados y habilitados
CREATE POLICY "Customers see approved products" ON products
FOR SELECT USING (status = 'approved' AND is_enabled = true);

-- Proveedores solo ven y gestionan sus productos
CREATE POLICY "Providers manage own products" ON products
FOR ALL USING (proveedor_id = auth.uid());

-- Administradores tienen acceso completo
CREATE POLICY "Admins have full access" ON products
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── Auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ForgotPasswordForm.tsx
│   ├── Admin/
│   │   └── AdminDashboard.tsx
│   ├── Proveedor/
│   │   ├── ProveedorDashboard.tsx
│   │   └── ProductForm.tsx
│   ├── User/
│   │   └── UserDashboard.tsx
│   └── Guest/
│       └── GuestDashboard.tsx
├── contexts/
│   └── useAuth.tsx
├── lib/
│   └── supabase.ts
└── App.tsx
```

## 🎯 Flujos Principales

### Registro de Usuario
1. Usuario completa formulario de registro
2. Sistema crea cuenta en Supabase Auth
3. Se inserta perfil en `user_profiles` con rol seleccionado
4. Redirección automática al dashboard según rol

### Gestión de Productos (Proveedor)
1. Proveedor inicia sesión
2. Accede a su dashboard personalizado
3. Crea/edita/elimina productos
4. Los productos quedan en estado "pending" hasta aprobación

### Aprobación de Productos (Admin)
1. Administrador revisa productos pendientes
2. Aprueba/rechaza con comentarios
3. Sistema notifica al proveedor (Edge Function)
4. Producto visible/invisible según estado

## 🔄 Migración a React Native

El proyecto está diseñado para facilitar migración a React Native:

- **Lógica reutilizable**: Hooks y context pueden migrarse directamente
- **Supabase compatible**: Mismo backend para web y mobile
- **Autenticación portable**: Mismo flujo de auth
- **Tipado consistente**: TypeScript garantiza consistencia

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**José Pablo Miranda Quintanilla**  
- GitHub: [@JosePablo1996](https://github.com/JosePablo1996)
- Universidad Francisco Gavidia
