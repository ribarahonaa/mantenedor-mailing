const express = require('express');
const { query } = require('../database/database');
const { authenticateToken, requireAdmin } = require('./auth');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Obtener todas las secciones maestras
router.get('/', async (req, res) => {
    try {
        const result = await query(`
            SELECT ms.*, u.username as created_by_username
            FROM master_sections ms 
            LEFT JOIN users u ON ms.created_by = u.id 
            WHERE ms.is_active = true 
            ORDER BY ms.created_at DESC
        `);
        
        // Parsear el contenido JSON de cada sección
        const parsedSections = result.rows.map(section => ({
            ...section,
            content: JSON.parse(section.content)
        }));
        
        res.json({ sections: parsedSections });
    } catch (error) {
        console.error('Error obteniendo secciones maestras:', error);
        res.status(500).json({ error: 'Error obteniendo secciones maestras' });
    }
});

// Las operaciones siguientes requieren permisos de administrador
router.use(requireAdmin);

// Obtener una sección maestra por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(`
            SELECT ms.*, u.username as created_by_username 
            FROM master_sections ms 
            LEFT JOIN users u ON ms.created_by = u.id 
            WHERE ms.id = $1 AND ms.is_active = true
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sección maestra no encontrada' });
        }

        const section = result.rows[0];
        section.content = JSON.parse(section.content);

        res.json({ section });
    } catch (error) {
        console.error('Error obteniendo sección maestra:', error);
        res.status(500).json({ error: 'Error obteniendo sección maestra' });
    }
});

// Crear nueva sección maestra
router.post('/', async (req, res) => {
    try {
        const { name, type, title, content } = req.body;

        if (!name || !type || !title || !content) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        // Validar que el tipo sea válido
        const validTypes = ['header', 'saludo', 'destacado', 'articulos', 'eventos', 'cta', 'footer', 'dos-columnas-texto', 'dos-columnas-foto-derecha', 'dos-columnas-foto-izquierda', 'dos-columnas-fotos'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'Tipo de sección inválido' });
        }

        const result = await query(`
            INSERT INTO master_sections (name, type, title, content, created_by) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `, [name, type, title, JSON.stringify(content), req.user.id]);

        const section = result.rows[0];
        section.content = JSON.parse(section.content);

        res.status(201).json({ 
            message: 'Sección maestra creada exitosamente',
            section 
        });
    } catch (error) {
        console.error('Error creando sección maestra:', error);
        res.status(500).json({ error: 'Error creando sección maestra' });
    }
});

// Actualizar sección maestra
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, title, content } = req.body;

        if (!name || !type || !title || !content) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        // Validar que el tipo sea válido
        const validTypes = ['header', 'saludo', 'destacado', 'articulos', 'eventos', 'cta', 'footer', 'dos-columnas-texto', 'dos-columnas-foto-derecha', 'dos-columnas-foto-izquierda', 'dos-columnas-fotos'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'Tipo de sección inválido' });
        }

        const result = await query(`
            UPDATE master_sections 
            SET name = $1, type = $2, title = $3, content = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5 AND is_active = true
            RETURNING *
        `, [name, type, title, JSON.stringify(content), id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sección maestra no encontrada' });
        }

        const section = result.rows[0];
        section.content = JSON.parse(section.content);

        res.json({ 
            message: 'Sección maestra actualizada exitosamente',
            section 
        });
    } catch (error) {
        console.error('Error actualizando sección maestra:', error);
        res.status(500).json({ error: 'Error actualizando sección maestra' });
    }
});

// Eliminar sección maestra (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(`
            UPDATE master_sections 
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_active = true
            RETURNING id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sección maestra no encontrada' });
        }

        res.json({ message: 'Sección maestra eliminada exitosamente' });
    } catch (error) {
        console.error('Error eliminando sección maestra:', error);
        res.status(500).json({ error: 'Error eliminando sección maestra' });
    }
});

// Duplicar sección maestra
router.post('/:id/duplicate', async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener la sección original
        const originalResult = await query(`
            SELECT * FROM master_sections 
            WHERE id = $1 AND is_active = true
        `, [id]);

        if (originalResult.rows.length === 0) {
            return res.status(404).json({ error: 'Sección maestra no encontrada' });
        }

        const originalSection = originalResult.rows[0];

        // Crear la copia
        const result = await query(`
            INSERT INTO master_sections (name, type, title, content, created_by) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `, [
            `${originalSection.name} (Copia)`,
            originalSection.type,
            originalSection.title,
            originalSection.content,
            req.user.id
        ]);

        const section = result.rows[0];
        section.content = JSON.parse(section.content);

        res.status(201).json({ 
            message: 'Sección maestra duplicada exitosamente',
            section 
        });
    } catch (error) {
        console.error('Error duplicando sección maestra:', error);
        res.status(500).json({ error: 'Error duplicando sección maestra' });
    }
});

module.exports = router;