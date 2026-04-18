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

### Opción A: Local con Node.js

#### Prerrequisitos
- Node.js 14+
- npm o yarn

```bash
git clone <repository-url>
cd mantenedor-mailing
npm install
npm run init-db     # inicializa database/newsletters.db
npm start           # levanta servidor en http://localhost:3001
```

### Opción B: Docker + Make (recomendado)

#### Prerrequisitos
- Docker y Docker Compose
- `make`

```bash
make build            # construye la imagen
make up               # levanta el contenedor (puerto 3001)
make init-db-docker   # inicializa la DB dentro del contenedor (solo la primera vez)
make logs             # ver logs en vivo
make down             # detener y eliminar el contenedor
```

La base de datos vive en `./database/newsletters.db` y se monta como volumen, por lo que persiste entre rebuilds. Ejecuta `make help` para ver todos los targets disponibles (`shell`, `restart`, `reset-db`, `clean`, etc.).

### Acceso
- **URL**: http://localhost:3001
- **Usuario Admin**: `admin` / `admin123`

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
- **SQLite3** como base de datos
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

### Error de Conexión a Base de Datos
```bash
# Verificar que la base de datos existe
ls -la database/

# Recrear la base de datos
rm -f database/newsletters.db
node init-database.js
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