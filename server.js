const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Importar rutas de la API
const { router: authRoutes } = require('./routes/auth');
const masterSectionsRoutes = require('./routes/master-sections');
const newsletterRoutes = require('./routes/newsletters');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/master-sections', masterSectionsRoutes);
app.use('/api/newsletters', newsletterRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Algo salió mal en el servidor',
        message: err.message 
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📱 Frontend disponible en http://localhost:${PORT}`);
    console.log(`🔐 API de autenticación: http://localhost:${PORT}/api/auth`);
    console.log(`⚙️ API de secciones maestras: http://localhost:${PORT}/api/master-sections`);
    console.log(`📧 API de newsletters: http://localhost:${PORT}/api/newsletters`);
}); 