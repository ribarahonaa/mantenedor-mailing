const express = require('express');
const { db } = require('../database/database');
const { authenticateToken, requireAdmin } = require('./auth');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);
router.use(requireAdmin);

// Obtener todas las secciones maestras
router.get('/', (req, res) => {
    const query = `
        SELECT ms.*, u.username as created_by_username 
        FROM master_sections ms 
        LEFT JOIN users u ON ms.created_by = u.id 
        WHERE ms.is_active = 1 
        ORDER BY ms.created_at DESC
    `;
    
    db.all(query, [], (err, sections) => {
        if (err) {
            return res.status(500).json({ error: 'Error obteniendo secciones maestras' });
        }
        
        // Parsear el contenido JSON de cada sección
        const parsedSections = sections.map(section => ({
            ...section,
            content: JSON.parse(section.content)
        }));
        
        res.json({ sections: parsedSections });
    });
});

// Obtener una sección maestra por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    db.get(`
        SELECT ms.*, u.username as created_by_username 
        FROM master_sections ms 
        LEFT JOIN users u ON ms.created_by = u.id 
        WHERE ms.id = ? AND ms.is_active = 1
    `, [id], (err, section) => {
        if (err) {
            return res.status(500).json({ error: 'Error obteniendo sección maestra' });
        }
        
        if (!section) {
            return res.status(404).json({ error: 'Sección maestra no encontrada' });
        }
        
        // Parsear el contenido JSON
        section.content = JSON.parse(section.content);
        
        res.json({ section });
    });
});

// Crear nueva sección maestra
router.post('/', (req, res) => {
    const { name, type, title, content } = req.body;
    
    if (!name || !type || !title || !content) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    // Validar que el tipo sea válido
    const validTypes = ['header', 'saludo', 'destacado', 'articulos', 'eventos', 'cta', 'dos-columnas-texto', 'dos-columnas-foto-derecha', 'dos-columnas-foto-izquierda', 'dos-columnas-fotos', 'footer'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Tipo de sección no válido' });
    }
    
    // Convertir el contenido a JSON si no lo está
    const contentJson = typeof content === 'string' ? content : JSON.stringify(content);
    
    const query = `
        INSERT INTO master_sections (name, type, title, content, created_by) 
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [name, type, title, contentJson, req.user.id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error creando sección maestra' });
        }
        
        // Obtener la sección creada
        db.get(`
            SELECT ms.*, u.username as created_by_username 
            FROM master_sections ms 
            LEFT JOIN users u ON ms.created_by = u.id 
            WHERE ms.id = ?
        `, [this.lastID], (err, section) => {
            if (err) {
                return res.status(500).json({ error: 'Error obteniendo sección creada' });
            }
            
            section.content = JSON.parse(section.content);
            
            res.status(201).json({
                message: 'Sección maestra creada exitosamente',
                section
            });
        });
    });
});

// Actualizar sección maestra
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, type, title, content } = req.body;
    
    if (!name || !type || !title || !content) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    // Validar que el tipo sea válido
    const validTypes = ['header', 'saludo', 'destacado', 'articulos', 'eventos', 'cta', 'dos-columnas-texto', 'dos-columnas-foto-derecha', 'dos-columnas-foto-izquierda', 'dos-columnas-fotos', 'footer'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Tipo de sección no válido' });
    }
    
    // Convertir el contenido a JSON si no lo está
    const contentJson = typeof content === 'string' ? content : JSON.stringify(content);
    
    const query = `
        UPDATE master_sections 
        SET name = ?, type = ?, title = ?, content = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND is_active = 1
    `;
    
    db.run(query, [name, type, title, contentJson, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error actualizando sección maestra' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Sección maestra no encontrada' });
        }
        
        // Obtener la sección actualizada
        db.get(`
            SELECT ms.*, u.username as created_by_username 
            FROM master_sections ms 
            LEFT JOIN users u ON ms.created_by = u.id 
            WHERE ms.id = ?
        `, [id], (err, section) => {
            if (err) {
                return res.status(500).json({ error: 'Error obteniendo sección actualizada' });
            }
            
            section.content = JSON.parse(section.content);
            
            res.json({
                message: 'Sección maestra actualizada exitosamente',
                section
            });
        });
    });
});

// Eliminar sección maestra (soft delete)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    // Verificar si la sección está siendo usada en algún newsletter
    db.get(`
        SELECT COUNT(*) as count 
        FROM newsletter_sections 
        WHERE master_section_id = ?
    `, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error verificando uso de sección' });
        }
        
        if (result.count > 0) {
            return res.status(400).json({ 
                error: 'No se puede eliminar esta sección porque está siendo utilizada en newsletters',
                usageCount: result.count
            });
        }
        
        // Soft delete
        db.run(`
            UPDATE master_sections 
            SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error eliminando sección maestra' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Sección maestra no encontrada' });
            }
            
            res.json({ message: 'Sección maestra eliminada exitosamente' });
        });
    });
});

// Duplicar sección maestra
router.post('/:id/duplicate', (req, res) => {
    const { id } = req.params;
    
    // Obtener la sección original
    db.get('SELECT * FROM master_sections WHERE id = ? AND is_active = 1', [id], (err, section) => {
        if (err) {
            return res.status(500).json({ error: 'Error obteniendo sección original' });
        }
        
        if (!section) {
            return res.status(404).json({ error: 'Sección maestra no encontrada' });
        }
        
        // Crear copia con nombre modificado
        const newName = `${section.name} (Copia)`;
        const newTitle = `${section.title} (Copia)`;
        
        const query = `
            INSERT INTO master_sections (name, type, title, content, created_by) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(query, [newName, section.type, newTitle, section.content, req.user.id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error duplicando sección maestra' });
            }
            
            // Obtener la sección duplicada
            db.get(`
                SELECT ms.*, u.username as created_by_username 
                FROM master_sections ms 
                LEFT JOIN users u ON ms.created_by = u.id 
                WHERE ms.id = ?
            `, [this.lastID], (err, newSection) => {
                if (err) {
                    return res.status(500).json({ error: 'Error obteniendo sección duplicada' });
                }
                
                newSection.content = JSON.parse(newSection.content);
                
                res.status(201).json({
                    message: 'Sección maestra duplicada exitosamente',
                    section: newSection
                });
            });
        });
    });
});

module.exports = router; 