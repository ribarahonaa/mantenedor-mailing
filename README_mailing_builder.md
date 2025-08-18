# 🚀 Mantenedor de Mailings - Innk

Una herramienta visual para construir newsletters profesionales sin necesidad de escribir código HTML.

## 📁 Archivos Incluidos

### 1. `mailing_builder.html`
- **Interfaz principal** del mantenedor de mailings
- Diseño responsive y moderno
- Panel izquierdo con secciones disponibles
- Área de construcción visual del newsletter

### 2. `mailing_builder.js`
- **Lógica de funcionamiento** completa
- Manejo de drag & drop
- Gestión de secciones
- Exportación de código HTML

### 3. `README_mailing_builder.md`
- **Documentación completa** de uso
- Instrucciones paso a paso
- Ejemplos de uso

## 🎯 Características Principales

### ✅ Funcionalidades
- **Construcción visual** de newsletters
- **Drag & drop** para reordenar secciones
- **Edición** de secciones existentes
- **Eliminación** de secciones
- **Exportación** de código HTML limpio
- **Interfaz intuitiva** y fácil de usar

### 🎨 Secciones Disponibles
- **Header con Logo**: Logo de Innk y título
- **Saludo Personalizado**: Mensaje de bienvenida
- **Destacado**: Contenido destacado con CTA
- **Artículos**: Lista de artículos recomendados
- **Eventos**: Próximos eventos y webinars
- **Call to Action**: Llamada a la acción principal
- **Dos Columnas - Texto**: Contenido en dos columnas
- **Dos Columnas - Foto Derecha**: Texto + imagen
- **Dos Columnas - Foto Izquierda**: Imagen + texto
- **Dos Columnas - Fotos**: Imágenes en ambas columnas
- **Footer**: Pie de página con redes sociales

## 🚀 Cómo Usar

### 1. **Abrir la Aplicación**
- Abre `mailing_builder.html` en tu navegador
- Verás la interfaz con el panel izquierdo y área de construcción

### 2. **Agregar Secciones**
- **Haz clic** en cualquier sección del panel izquierdo
- La sección se agregará automáticamente al área de construcción
- Puedes agregar múltiples secciones en cualquier orden

### 3. **Reordenar Secciones**
- **Arrastra y suelta** las secciones para reordenarlas
- Usa el ícono de arrastre (⋮⋮) en el header de cada sección
- Las secciones se reorganizan visualmente en tiempo real

### 4. **Editar Secciones**
- **Haz clic** en el botón ✏️ de cualquier sección
- Actualmente muestra un alert (se puede expandir para edición completa)
- Las secciones mantienen su contenido original

### 5. **Eliminar Secciones**
- **Haz clic** en el botón 🗑️ de cualquier sección
- Confirma la eliminación
- La sección se elimina inmediatamente

### 6. **Exportar Código**
- **Haz clic** en "📋 Generar Código HTML"
- El código se genera y se copia al portapapeles
- El código se muestra en el área de salida

## 🎨 Personalización

### **Colores y Estilos**
- Todas las secciones usan la paleta de colores de Innk
- CSS inline para máxima compatibilidad con clientes de correo
- Estilos consistentes en todas las secciones

### **Contenido**
- Cada sección tiene contenido de ejemplo
- El contenido se puede personalizar editando el JavaScript
- Las imágenes usan placeholders que se pueden cambiar

## 📱 Compatibilidad

### **Navegadores**
- Chrome, Firefox, Safari, Edge (versiones modernas)
- Responsive design para dispositivos móviles
- Funciona offline sin dependencias externas

### **Exportación**
- **Sin etiquetas HTML/HEAD/BODY** (compatible con Klenty)
- **CSS inline** para máxima compatibilidad
- **Estructura de tabla** para clientes de correo antiguos

## 🔧 Estructura del Código Exportado

### **Formato de Salida**
```html
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
        <td align="center" style="background-color: #f4f4f4; padding: 20px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <!-- Secciones del newsletter aquí -->
            </table>
        </td>
    </tr>
</table>
```

### **Características del Código**
- **Estructura de tabla** para compatibilidad
- **CSS inline** en cada elemento
- **Sin dependencias** externas
- **Responsive** para móviles
- **Compatible** con todos los clientes de correo

## 🚀 Funcionalidades Avanzadas

### **Drag & Drop**
- Reordenamiento visual de secciones
- Indicadores visuales durante el arrastre
- Posicionamiento automático

### **Gestión de Estado**
- Contador único para cada sección
- Persistencia durante la sesión
- Validación de operaciones

### **Exportación Inteligente**
- Generación automática de estructura
- Código optimizado y limpio
- Copia automática al portapapeles

## 🎯 Casos de Uso

### **Para Marketing Teams**
- Crear newsletters rápidamente
- Prototipar diseños
- Iterar contenido fácilmente

### **Para Desarrolladores**
- Generar código HTML base
- Personalizar plantillas
- Mantener consistencia visual

### **Para Diseñadores**
- Visualizar layouts
- Probar diferentes combinaciones
- Crear variaciones rápidamente

## 🔮 Futuras Mejoras

### **Funcionalidades Planificadas**
- **Editor visual** para cada sección
- **Plantillas predefinidas**
- **Guardado y carga** de proyectos
- **Preview en tiempo real**
- **Integración** con sistemas de email marketing

### **Mejoras Técnicas**
- **Base de datos** para proyectos
- **API** para integración
- **Sistema de usuarios** y permisos
- **Historial** de versiones

## 📞 Soporte

### **Para Ayuda**
- Revisa este README
- Consulta el código JavaScript
- Prueba las funcionalidades paso a paso

### **Reportar Problemas**
- Verifica la consola del navegador
- Asegúrate de usar un navegador moderno
- Confirma que JavaScript esté habilitado

## 📝 Licencia

Esta herramienta está diseñada para uso interno de Innk. Puedes personalizarla según tus necesidades de marca y contenido.

---

**¡Feliz construcción de newsletters! 🎉** 