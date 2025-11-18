@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo Creando README.md para MarketHub...

(
echo # MarketHub - Plataforma de Comercio Multirol
echo.
echo ^![React](https://img.shields.io/badge/React-18.2.0-blue^)
echo ^![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue^)
echo ^![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green^)
echo ^![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC^)
echo.
echo Una plataforma moderna de comercio electrónico construida con React, TypeScript y Supabase, que implementa un sistema de roles y seguridad a nivel de filas ^(RLS^) para gestionar productos, proveedores y administradores.
echo.
echo ## 🚀 Características
echo.
echo ### 🔐 Sistema de Autenticación y Roles
echo - **Tres roles de usuario**: Cliente, Proveedor, Administrador
echo - **Registro seguro** con validación de roles
echo - **Modo invitado** para explorar el catálogo sin registro
echo - **Recuperación de contraseña** integrada
echo.
echo ### 🛡️ Seguridad con RLS ^(Row Level Security^)
echo - **Políticas granulares** por rol de usuario
echo - **Proveedores** solo ven y gestionan sus productos
echo - **Clientes** solo ven productos aprobados y habilitados
echo - **Administradores** tienen acceso completo al sistema
echo.
echo ### 🎨 Experiencia de Usuario
echo - **Diseño glassmorphism** moderno y atractivo
echo - **Interfaz responsive** para todos los dispositivos
echo - **Animaciones fluidas** con Framer Motion
echo - **Navegación intuitiva** por roles
echo.
echo ## 📋 Roles y Permisos
echo.
echo ### 👤 Cliente
echo - Explorar catálogo de productos aprobados
echo - Ver detalles de productos
echo - Modo invitado sin registro
echo.
echo ### 🏢 Proveedor
echo - Gestionar productos propios ^(CRUD completo^)
echo - Subir imágenes de productos
echo - Seguir estado de aprobación de productos
echo.
echo ### ⚡ Administrador
echo - Gestionar todos los productos
echo - Aprobar/rechazar productos de proveedores
echo - Ver estadísticas del sistema
echo - Acceso completo a la plataforma
echo.
echo ## 🛠️ Tecnologías
echo.
echo ### Frontend
echo - **React 18** con TypeScript
echo - **Vite** para desarrollo y build
echo - **Tailwind CSS** para estilos
echo - **Framer Motion** para animaciones
echo - **Lucide React** para iconos
echo.
echo ### Backend ^& Base de Datos
echo - **Supabase** ^(PostgreSQL^)
echo - **Autenticación** integrada
echo - **Row Level Security ^(RLS^)**
echo - **Edge Functions** para notificaciones
echo.
echo ## 🚀 Instalación y Configuración
echo.
echo ### Prerrequisitos
echo - Node.js 16+ 
echo - npm o yarn
echo - Cuenta en Supabase
echo.
echo ### 1. Clonar el repositorio
echo ^``^`bash
echo git clone https://github.com/JosePablo1996/Market-Hub.git
echo cd Market-Hub
echo ^``^`
echo.
echo ### 2. Instalar dependencias
echo ^``^`bash
echo npm install
echo ^``^`
echo.
echo ### 3. Configurar variables de entorno
echo Crear archivo ^`.env^` en la raíz del proyecto:
echo ^``^`env
echo VITE_SUPABASE_URL=tu_url_de_supabase
echo VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
echo ^``^`
echo.
echo ### 4. Ejecutar en desarrollo
echo ^``^`bash
echo npm run dev
echo ^``^`
echo.
echo ### 5. Build para producción
echo ^``^`bash
echo npm run build
echo ^``^`
echo.
echo ## 🗄️ Estructura de la Base de Datos
echo.
echo ### Tablas Principales
echo.
echo #### ^`user_profiles^`
echo - ^`id^` ^(UUID, FK a auth.users^)
echo - ^`role^` ^('user' ^| 'proveedor' ^| 'admin'^)
echo - ^`full_name^` ^(text^)
echo - ^`phone^` ^(text, opcional^)
echo - ^`created_at^`, ^`updated_at^`
echo.
echo #### ^`products^`
echo - ^`id^` ^(UUID, primary key^)
echo - ^`proveedor_id^` ^(UUID, FK a user_profiles^)
echo - ^`title^` ^(text^)
echo - ^`description^` ^(text^)
echo - ^`price^` ^(numeric^)
echo - ^`photo_url^` ^(text^)
echo - ^`status^` ^('pending' ^| 'approved' ^| 'rejected' ^| 'disabled'^)
echo - ^`is_enabled^` ^(boolean^)
echo - ^`admin_notes^` ^(text^)
echo - ^`approved_by^` ^(UUID^)
echo - ^`approved_at^` ^(timestamp^)
echo - ^`created_at^`, ^`updated_at^`
echo.
echo ## 🔒 Políticas RLS Implementadas
echo.
echo ### Para ^`user_profiles^`
echo ^``^`sql
echo -- Usuarios solo pueden leer su propio perfil
echo CREATE POLICY "Users can view own profile" ON user_profiles
echo FOR SELECT USING ^(auth.uid^(^) = id^);
echo.
echo -- Administradores pueden ver todos los perfiles
echo CREATE POLICY "Admins can view all profiles" ON user_profiles
echo FOR SELECT USING ^(
echo   EXISTS ^(SELECT 1 FROM user_profiles WHERE id = auth.uid^(^) AND role = 'admin'^)
echo ^);
echo ^``^`
echo.
echo ### Para ^`products^`
echo ^``^`sql
echo -- Clientes solo ven productos aprobados y habilitados
echo CREATE POLICY "Customers see approved products" ON products
echo FOR SELECT USING ^(status = 'approved' AND is_enabled = true^);
echo.
echo -- Proveedores solo ven y gestionan sus productos
echo CREATE POLICY "Providers manage own products" ON products
echo FOR ALL USING ^(proveedor_id = auth.uid^(^)^);
echo.
echo -- Administradores tienen acceso completo
echo CREATE POLICY "Admins have full access" ON products
echo FOR ALL USING ^(
echo   EXISTS ^(SELECT 1 FROM user_profiles WHERE id = auth.uid^(^) AND role = 'admin'^)
echo ^);
echo ^``^`
echo.
echo ## 📁 Estructura del Proyecto
echo.
echo ^``^`
echo src/
echo ├── components/
echo │   ├── Auth/
echo │   │   ├── LoginForm.tsx
echo │   │   ├── RegisterForm.tsx
echo │   │   └── ForgotPasswordForm.tsx
echo │   ├── Admin/
echo │   │   └── AdminDashboard.tsx
echo │   ├── Proveedor/
echo │   │   ├── ProveedorDashboard.tsx
echo │   │   └── ProductForm.tsx
echo │   ├── User/
echo │   │   └── UserDashboard.tsx
echo │   └── Guest/
echo │       └── GuestDashboard.tsx
echo ├── contexts/
echo │   └── useAuth.tsx
echo ├── lib/
echo │   └── supabase.ts
echo └── App.tsx
echo ^``^`
echo.
echo ## 🎯 Flujos Principales
echo.
echo ### Registro de Usuario
echo 1. Usuario completa formulario de registro
echo 2. Sistema crea cuenta en Supabase Auth
echo 3. Se inserta perfil en ^`user_profiles^` con rol seleccionado
echo 4. Redirección automática al dashboard según rol
echo.
echo ### Gestión de Productos ^(Proveedor^)
echo 1. Proveedor inicia sesión
echo 2. Accede a su dashboard personalizado
echo 3. Crea/edita/elimina productos
echo 4. Los productos quedan en estado "pending" hasta aprobación
echo.
echo ### Aprobación de Productos ^(Admin^)
echo 1. Administrador revisa productos pendientes
echo 2. Aprueba/rechaza con comentarios
echo 3. Sistema notifica al proveedor ^(Edge Function^)
echo 4. Producto visible/invisible según estado
echo.
echo ## 🔄 Migración a React Native
echo.
echo El proyecto está diseñado para facilitar migración a React Native:
echo.
echo - **Lógica reutilizable**: Hooks y context pueden migrarse directamente
echo - **Supabase compatible**: Mismo backend para web y mobile
echo - **Autenticación portable**: Mismo flujo de auth
echo - **Tipado consistente**: TypeScript garantiza consistencia
echo.
echo ## 🤝 Contribución
echo.
echo 1. Fork el proyecto
echo 2. Crea una rama para tu feature ^(^`git checkout -b feature/AmazingFeature^`^)
echo 3. Commit tus cambios ^(^`git commit -m 'Add some AmazingFeature'^`^)
echo 4. Push a la rama ^(^`git push origin feature/AmazingFeature^`^)
echo 5. Abre un Pull Request
echo.
echo ## 📝 Licencia
echo.
echo Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE^) para detalles.
echo.
echo ## 👨‍💻 Autor
echo.
echo **José Pablo Miranda Quintanilla**  
echo - GitHub: [^@JosePablo1996](https://github.com/JosePablo1996^)
echo - Universidad Francisco Gavidia
) > README.md

echo ✅ README.md creado exitosamente!
echo.
echo Archivo generado en: %CD%\README.md
pause