const express = require('express');
const router = express.Router();
const { db } = require('../database/database');

// GET - Obtener todos los newsletters
router.get('/', (req, res) => {
    const query = `
        SELECT 
            n.id,
            n.name,
            n.description,
            n.created_at,
            n.updated_at,
            COUNT(s.id) as sections_count
        FROM newsletters n
        LEFT JOIN sections s ON n.id = s.newsletter_id
        GROUP BY n.id
        ORDER BY n.updated_at DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('❌ Error obteniendo newsletters:', err.message);
            return res.status(500).json({ 
                error: 'Error obteniendo newsletters',
                message: err.message 
            });
        }
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    });
});

// GET - Obtener un newsletter específico con sus secciones
router.get('/:id', (req, res) => {
    const newsletterId = req.params.id;
    
    // Obtener datos del newsletter
    const newsletterQuery = 'SELECT * FROM newsletters WHERE id = ?';
    
    db.get(newsletterQuery, [newsletterId], (err, newsletter) => {
        if (err) {
            console.error('❌ Error obteniendo newsletter:', err.message);
            return res.status(500).json({ 
                error: 'Error obteniendo newsletter',
                message: err.message 
            });
        }
        
        if (!newsletter) {
            return res.status(404).json({ 
                error: 'Newsletter no encontrado' 
            });
        }
        
        // Obtener secciones del newsletter
        const sectionsQuery = 'SELECT * FROM sections WHERE newsletter_id = ? ORDER BY section_order';
        
        db.all(sectionsQuery, [newsletterId], (err, sections) => {
            if (err) {
                console.error('❌ Error obteniendo secciones:', err.message);
                return res.status(500).json({ 
                    error: 'Error obteniendo secciones',
                    message: err.message 
                });
            }
            
            // Parsear el contenido de las secciones
            const parsedSections = sections.map(section => ({
                ...section,
                section_data: JSON.parse(section.section_data)
            }));
            
            res.json({
                success: true,
                data: {
                    ...newsletter,
                    sections: parsedSections
                }
            });
        });
    });
});

// POST - Crear un nuevo newsletter
router.post('/', (req, res) => {
    const { name, description, content, sections } = req.body;
    
    if (!name || !content) {
        return res.status(400).json({ 
            error: 'Nombre y contenido son requeridos' 
        });
    }
    
    const now = new Date().toISOString();
    
    // Insertar newsletter
    const insertNewsletterQuery = `
        INSERT INTO newsletters (name, description, content, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(insertNewsletterQuery, [name, description, content, now, now], function(err) {
        if (err) {
            console.error('❌ Error creando newsletter:', err.message);
            return res.status(500).json({ 
                error: 'Error creando newsletter',
                message: err.message 
            });
        }
        
        const newsletterId = this.lastID;
        
        // Si hay secciones, insertarlas
        if (sections && sections.length > 0) {
            const insertSectionQuery = `
                INSERT INTO sections (newsletter_id, section_type, section_data, section_order)
                VALUES (?, ?, ?, ?)
            `;
            
            let completed = 0;
            let hasError = false;
            
            sections.forEach((section, index) => {
                db.run(insertSectionQuery, [
                    newsletterId,
                    section.type,
                    JSON.stringify(section.data),
                    index
                ], (err) => {
                    if (err) {
                        console.error('❌ Error insertando sección:', err.message);
                        hasError = true;
                    }
                    
                    completed++;
                    
                    if (completed === sections.length) {
                        if (hasError) {
                            return res.status(500).json({ 
                                error: 'Newsletter creado pero con errores en las secciones',
                                newsletter_id: newsletterId 
                            });
                        }
                        
                        res.status(201).json({
                            success: true,
                            message: 'Newsletter creado exitosamente',
                            data: { id: newsletterId, name, description }
                        });
                    }
                });
            });
        } else {
            res.status(201).json({
                success: true,
                message: 'Newsletter creado exitosamente',
                data: { id: newsletterId, name, description }
            });
        }
    });
});

// PUT - Actualizar un newsletter existente
router.put('/:id', (req, res) => {
    const newsletterId = req.params.id;
    const { name, description, content, sections } = req.body;
    
    if (!name || !content) {
        return res.status(400).json({ 
            error: 'Nombre y contenido son requeridos' 
        });
    }
    
    const now = new Date().toISOString();
    
    // Actualizar newsletter
    const updateNewsletterQuery = `
        UPDATE newsletters 
        SET name = ?, description = ?, content = ?, updated_at = ?
        WHERE id = ?
    `;
    
    db.run(updateNewsletterQuery, [name, description, content, now, newsletterId], function(err) {
        if (err) {
            console.error('❌ Error actualizando newsletter:', err.message);
            return res.status(500).json({ 
                error: 'Error actualizando newsletter',
                message: err.message 
            });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ 
                error: 'Newsletter no encontrado' 
            });
        }
        
        // Si hay secciones, actualizarlas
        if (sections && sections.length > 0) {
            // Eliminar secciones existentes
            const deleteSectionsQuery = 'DELETE FROM sections WHERE newsletter_id = ?';
            
            db.run(deleteSectionsQuery, [newsletterId], (err) => {
                if (err) {
                    console.error('❌ Error eliminando secciones:', err.message);
                    return res.status(500).json({ 
                        error: 'Newsletter actualizado pero con errores en las secciones',
                        newsletter_id: newsletterId 
                    });
                }
                
                // Insertar nuevas secciones
                const insertSectionQuery = `
                    INSERT INTO sections (newsletter_id, section_type, section_data, section_order)
                    VALUES (?, ?, ?, ?)
                `;
                
                let completed = 0;
                let hasError = false;
                
                sections.forEach((section, index) => {
                    db.run(insertSectionQuery, [
                        newsletterId,
                        section.type,
                        JSON.stringify(section.data),
                        index
                    ], (err) => {
                        if (err) {
                            console.error('❌ Error insertando sección:', err.message);
                            hasError = true;
                        }
                        
                        completed++;
                        
                        if (completed === sections.length) {
                            if (hasError) {
                                return res.status(500).json({ 
                                    error: 'Newsletter actualizado pero con errores en las secciones',
                                    newsletter_id: newsletterId 
                                });
                            }
                            
                            res.json({
                                success: true,
                                message: 'Newsletter actualizado exitosamente',
                                data: { id: newsletterId, name, description }
                            });
                        }
                    });
                });
            });
        } else {
            res.json({
                success: true,
                message: 'Newsletter actualizado exitosamente',
                data: { id: newsletterId, name, description }
            });
        }
    });
});

// DELETE - Eliminar un newsletter
router.delete('/:id', (req, res) => {
    const newsletterId = req.params.id;
    
    const deleteQuery = 'DELETE FROM newsletters WHERE id = ?';
    
    db.run(deleteQuery, [newsletterId], function(err) {
        if (err) {
            console.error('❌ Error eliminando newsletter:', err.message);
            return res.status(500).json({ 
                error: 'Error eliminando newsletter',
                message: err.message 
            });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ 
                error: 'Newsletter no encontrado' 
            });
        }
        
        res.json({
            success: true,
            message: 'Newsletter eliminado exitosamente'
        });
    });
});

module.exports = router; 