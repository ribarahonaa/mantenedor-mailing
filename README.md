# 🚀 Mantenedor de Mailings - Innk

Un sistema profesional para la gestión de newsletters con sistema de usuarios, secciones maestras y gestión de contenido personalizado.

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- **Login/Registro** de usuarios
- **Roles diferenciados**: Admin y Usuario
- **JWT tokens** para sesiones seguras
- **Gestión de contraseñas** con hash bcrypt

### ⚙️ Gestión de Secciones Maestras (Solo Admin)
- **Crear, editar y eliminar** secciones base
- **Tipos predefinidos**: Header, Saludo, Destacado, Artículos, Eventos, CTA, etc.
- **Duplicación** de secciones existentes
- **Soft delete** para mantener integridad de datos

### 📧 Gestión de Newsletters
- **Crear newsletters** personalizados
- **Agregar secciones** desde las maestras
- **Editar contenido** sin afectar secciones originales
- **Reordenar secciones** con drag & drop
- **Duplicar newsletters** existentes
- **Estados**: Borrador, Publicado, Archivado

### 🎯 Sistema de Copias Inteligente
- **Cambios locales**: Las modificaciones en newsletters NO afectan las secciones maestras
- **Trazabilidad**: Cada newsletter mantiene referencia a su sección original
- **Personalización**: Contenido único por newsletter

## 🏗️ Arquitectura del Sistema

### Base de Datos
```
users                    # Usuarios del sistema
├── id, username, email, password_hash, role, is_active
├── created_at, updated_at

master_sections          # Secciones base (solo admin)
├── id, name, type, title, content, is_active
├── created_by, created_at, updated_at

newsletters              # Newsletters de usuarios
├── id, user_id, name, description, status
├── created_at, updated_at

newsletter_sections      # Secciones de newsletters (copias)
├── id, newsletter_id, master_section_id
├── section_type, title, content, section_order
├── is_customized, created_at, updated_at

templates                # Plantillas del sistema
├── id, name, description, content, is_default
├── created_at
```

### API Endpoints

#### Autenticación (`/api/auth`)
- `POST /register` - Registro de usuarios
- `POST /login` - Login de usuarios
- `GET /profile` - Perfil del usuario actual
- `PUT /change-password` - Cambiar contraseña

#### Secciones Maestras (`/api/master-sections`) - Solo Admin
- `GET /` - Listar todas las secciones
- `GET /:id` - Obtener sección específica
- `POST /` - Crear nueva sección
- `PUT /:id` - Actualizar sección
- `DELETE /:id` - Eliminar sección (soft delete)
- `POST /:id/duplicate` - Duplicar sección

#### Newsletters (`/api/newsletters`)
- `GET /` - Listar newsletters del usuario
- `GET /:id` - Obtener newsletter con secciones
- `POST /` - Crear nuevo newsletter
- `PUT /:id` - Actualizar newsletter
- `DELETE /:id` - Eliminar newsletter
- `POST /:id/sections` - Agregar sección al newsletter
- `PUT /:id/sections/:sectionId` - Editar sección del newsletter
- `DELETE /:id/sections/:sectionId` - Eliminar sección del newsletter
- `PUT /:id/sections/reorder` - Reordenar secciones
- `POST /:id/duplicate` - Duplicar newsletter

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 14+ 
- PostgreSQL 12+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd mantenedor-mailing
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar PostgreSQL
```bash
# Crear base de datos
sudo -u postgres createdb newsletters

# Crear usuario (opcional)
sudo -u postgres createuser --interactive
```

### 4. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar configuración
nano .env
```

Configuración mínima en `.env`:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=newsletters
DB_PASSWORD=tu_password_postgres
DB_PORT=5432
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
```

### 5. Inicializar la base de datos
```bash
node init-database.js
```

### 6. Iniciar el servidor
```bash
node server.js
```

### 7. Acceder a la aplicación
- **URL**: http://localhost:3001
- **Usuario Admin**: `admin` / `admin123`

## 🔄 Migración desde SQLite

Si tienes datos existentes en SQLite y quieres migrarlos a PostgreSQL:

### 1. Preparar PostgreSQL
```bash
# Asegúrate de que PostgreSQL esté configurado y funcionando
sudo systemctl status postgresql
```

### 2. Ejecutar migración
```bash
# Ejecutar script de migración
node migrate-to-postgres.js
```

### 3. Verificar migración
```bash
# Verificar que los datos se migraron correctamente
psql -U postgres -d newsletters -c "SELECT COUNT(*) FROM users;"
```

**Nota**: El script de migración preserva todos los datos existentes y mantiene las relaciones entre tablas.

## 🐳 Instalación con Docker

Para una instalación rápida usando Docker (recomendado):

### 1. Setup Automático con Docker
```bash
# Clonar el repositorio
git clone <repository-url>
cd mantenedor-mailing

# Usar el gestor de Docker (recomendado)
chmod +x docker-manager.sh
./docker-manager.sh start
```

### 2. Setup Manual con Docker Compose
```bash
# Iniciar servicios de producción
docker-compose up -d

# O iniciar servicios de desarrollo
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Acceder a la aplicación
- **URL**: http://localhost:3001
- **Usuario Admin**: `admin` / `admin123`

### 4. Comandos Docker útiles
```bash
# Ver logs
./docker-manager.sh logs

# Abrir shell en la aplicación
./docker-manager.sh shell

# Abrir shell de PostgreSQL
./docker-manager.sh db-shell

# Crear backup de la base de datos
./docker-manager.sh backup

# Ver estado de los servicios
./docker-manager.sh status

# Detener servicios
./docker-manager.sh stop
```

### 5. Gestión completa con Docker Manager
El script `docker-manager.sh` proporciona comandos convenientes:

```bash
./docker-manager.sh help  # Ver todos los comandos disponibles
```

**Comandos principales:**
- `start` - Iniciar en producción
- `dev` - Iniciar en desarrollo
- `stop` - Detener servicios
- `logs` - Ver logs
- `backup` - Crear backup
- `clean` - Limpiar Docker

### 6. Ventajas de usar Docker

**🐳 Consistencia**
- Mismo entorno en desarrollo y producción
- No hay problemas de "funciona en mi máquina"
- Configuración automática de PostgreSQL

**⚡ Rapidez**
- Setup en menos de 2 minutos
- No necesitas instalar PostgreSQL localmente
- Inicialización automática de la base de datos

**🔒 Aislamiento**
- Contenedores aislados del sistema host
- Fácil limpieza y reinstalación
- Múltiples versiones sin conflictos

**📦 Portabilidad**
- Funciona en cualquier sistema con Docker
- Fácil deployment en servidores
- Backup y restore simplificado

### 7. Probar la Instalación
```bash
# Ejecutar pruebas automáticas
chmod +x test-docker.sh
./test-docker.sh
```

Este script verifica que:
- Docker y Docker Compose están instalados
- Las imágenes se construyen correctamente
- Los servicios se inician sin errores
- PostgreSQL está funcionando
- La aplicación responde
- La base de datos tiene las tablas correctas
- El usuario admin existe y puede hacer login

## ⚡ Setup Rápido

Para una configuración automática:

```bash
# Ejecutar script de setup
chmod +x setup.sh
./setup.sh
```

El script automáticamente:
- Instala PostgreSQL si es necesario
- Configura variables de entorno
- Crea la base de datos
- Inicializa los datos por defecto

## 👥 Roles y Permisos

### 🔑 Administrador
- **Acceso completo** a todas las funcionalidades
- **Gestión de secciones maestras** (crear, editar, eliminar)
- **Crear y gestionar** newsletters
- **Acceso a estadísticas** del sistema

### 👤 Usuario
- **Crear y gestionar** sus propios newsletters
- **Agregar secciones** desde las maestras disponibles
- **Personalizar contenido** de sus newsletters
- **No puede modificar** secciones maestras

## 🎨 Tipos de Secciones Disponibles

### 📋 Secciones Básicas
- **Header**: Logo y encabezado
- **Saludo**: Mensaje de bienvenida personalizable
- **Destacado**: Contenido resaltado con CTA
- **Artículos**: Lista de artículos recomendados
- **Eventos**: Próximos eventos y webinars
- **CTA**: Llamadas a la acción
- **Footer**: Pie de página con información de contacto

### 📊 Secciones Avanzadas
- **Dos Columnas - Texto**: Contenido en dos columnas
- **Dos Columnas - Foto Derecha**: Texto + imagen
- **Dos Columnas - Foto Izquierda**: Imagen + texto
- **Dos Columnas - Fotos**: Imágenes en ambas columnas

## 🔧 Tecnologías Utilizadas

### Backend
- **Node.js** con Express.js
- **PostgreSQL** como base de datos
- **JWT** para autenticación
- **bcrypt** para hash de contraseñas

### Frontend
- **HTML5** semántico
- **CSS3** con diseño responsive
- **JavaScript ES6+** vanilla
- **Font Awesome** para iconos

### Características Técnicas
- **Arquitectura RESTful**
- **Middleware de autenticación**
- **Validación de datos**
- **Manejo de errores robusto**
- **Diseño responsive** para móviles

## 📱 Uso del Sistema

### 1. Iniciar Sesión
- Usar credenciales de admin o crear cuenta nueva
- El sistema redirige automáticamente según el rol

### 2. Gestionar Secciones Maestras (Admin)
- Navegar a "Secciones Maestras"
- Crear nuevas secciones con contenido HTML
- Editar o duplicar secciones existentes

### 3. Crear Newsletter
- Navegar a "Crear Newsletter"
- Definir nombre y descripción
- El sistema crea un newsletter vacío

### 4. Editar Newsletter
- Seleccionar newsletter de la lista
- Agregar secciones desde el panel izquierdo
- Editar contenido de cada sección
- Reordenar secciones según necesidad

### 5. Personalizar Contenido
- Cada sección puede ser editada independientemente
- Los cambios NO afectan las secciones maestras
- Sistema de copias inteligente

## 🛡️ Seguridad

### Autenticación
- **JWT tokens** con expiración de 24 horas
- **Hash de contraseñas** con bcrypt (10 rounds)
- **Validación de roles** en endpoints sensibles

### Validación de Datos
- **Sanitización** de inputs HTML
- **Validación** de tipos de sección
- **Verificación** de permisos por usuario

### Base de Datos
- **Preparación de queries** para prevenir SQL injection
- **Soft delete** para mantener integridad referencial
- **Transacciones** para operaciones críticas

## 🔄 Flujo de Trabajo Recomendado

### Para Administradores
1. **Crear secciones maestras** con contenido base
2. **Revisar y aprobar** secciones creadas
3. **Mantener** biblioteca de secciones actualizada
4. **Monitorear** uso de secciones en newsletters

### Para Usuarios
1. **Crear newsletter** con nombre descriptivo
2. **Seleccionar secciones** relevantes
3. **Personalizar contenido** según necesidades
4. **Revisar y guardar** cambios
5. **Publicar** cuando esté listo

## 🚨 Solución de Problemas

### Error de Conexión a PostgreSQL
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql

# Verificar conexión
psql -U postgres -d newsletters -c "SELECT NOW();"

# Recrear la base de datos si es necesario
sudo -u postgres dropdb newsletters
sudo -u postgres createdb newsletters
node init-database.js
```

### Error de Variables de Entorno
```bash
# Verificar que el archivo .env existe
ls -la .env

# Verificar configuración
cat .env

# Recrear archivo de configuración
cp env.example .env
nano .env
```

### Error de Permisos de Base de Datos
```bash
# Verificar permisos del usuario
sudo -u postgres psql -c "\du"

# Crear usuario si es necesario
sudo -u postgres createuser --interactive
```

### Error de Autenticación
- Verificar que el token JWT no haya expirado
- Hacer logout y login nuevamente
- Verificar credenciales en la base de datos

### Error de Permisos
- Verificar que el usuario tenga el rol correcto
- Solo los administradores pueden gestionar secciones maestras

## 🔮 Próximas Funcionalidades

### Versión 2.0
- **Sistema de plantillas** avanzado
- **Preview en tiempo real** de newsletters
- **Exportación** a HTML, PDF y email
- **Analytics** de engagement

### Versión 3.0
- **API pública** para integraciones
- **Sistema de suscripciones** por email
- **Automatización** de envíos
- **Integración** con servicios de email marketing

## 📞 Soporte

### Documentación
- Este README contiene toda la información necesaria
- Los comentarios en el código explican la lógica

### Reportar Issues
- Crear issue en el repositorio
- Incluir pasos para reproducir el problema
- Adjuntar logs de error si es posible

### Contribuciones
- Fork del repositorio
- Crear rama para nueva funcionalidad
- Enviar pull request con descripción detallada

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo LICENSE para más detalles.

---

**Desarrollado con ❤️ por el equipo de Innk**

*Sistema profesional para la gestión de newsletters empresariales* 