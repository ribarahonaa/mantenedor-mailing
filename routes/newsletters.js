const express = require('express');
const { db } = require('../database/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Obtener todos los newsletters del usuario actual
router.get('/', (req, res) => {
    const query = `
        SELECT n.*, 
               COUNT(ns.id) as sections_count,
               MAX(ns.updated_at) as last_section_update
        FROM newsletters n 
        LEFT JOIN newsletter_sections ns ON n.id = ns.newsletter_id
        WHERE n.user_id = ? 
        GROUP BY n.id
        ORDER BY n.updated_at DESC
    `;
    
    db.all(query, [req.user.id], (err, newsletters) => {
        if (err) {
            return res.status(500).json({ error: 'Error obteniendo newsletters' });
        }
        
        res.json({ newsletters });
    });
});

// Obtener un newsletter específico con sus secciones
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    // Verificar que el newsletter pertenezca al usuario
    db.get('SELECT * FROM newsletters WHERE id = ? AND user_id = ?', [id, req.user.id], (err, newsletter) => {
        if (err) {
            return res.status(500).json({ error: 'Error obteniendo newsletter' });
        }
        
        if (!newsletter) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }
        
        // Obtener las secciones del newsletter
        db.all(`
            SELECT ns.*, ms.name as master_section_name, ms.type as master_section_type
            FROM newsletter_sections ns
            LEFT JOIN master_sections ms ON ns.master_section_id = ms.id
            WHERE ns.newsletter_id = ?
            ORDER BY ns.section_order
        `, [id], (err, sections) => {
            if (err) {
                return res.status(500).json({ error: 'Error obteniendo secciones del newsletter' });
            }
            
            // Parsear el contenido JSON de cada sección
            const parsedSections = sections.map(section => ({
                ...section,
                content: JSON.parse(section.content)
            }));
            
            res.json({
                newsletter,
                sections: parsedSections
            });
        });
    });
});

// Crear nuevo newsletter
router.post('/', (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'El nombre del newsletter es requerido' });
    }
    
    const query = `
        INSERT INTO newsletters (user_id, name, description, status) 
        VALUES (?, ?, ?, 'draft')
    `;
    
    db.run(query, [req.user.id, name, description || ''], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error creando newsletter' });
        }
        
        // Obtener el newsletter creado
        db.get('SELECT * FROM newsletters WHERE id = ?', [this.lastID], (err, newsletter) => {
            if (err) {
                return res.status(500).json({ error: 'Error obteniendo newsletter creado' });
            }
            
            res.status(201).json({
                message: 'Newsletter creado exitosamente',
                newsletter
            });
        });
    });
});

// Actualizar newsletter
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'El nombre del newsletter es requerido' });
    }
    
    // Verificar que el newsletter pertenezca al usuario
    db.get('SELECT id FROM newsletters WHERE id = ? AND user_id = ?', [id, req.user.id], (err, newsletter) => {
        if (err) {
            return res.status(500).json({ error: 'Error verificando newsletter' });
        }
        
        if (!newsletter) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }
        
        const query = `
            UPDATE newsletters 
            SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;
        
        db.run(query, [name, description || '', status || 'draft', id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error actualizando newsletter' });
            }
            
            // Obtener el newsletter actualizado
            db.get('SELECT * FROM newsletters WHERE id = ?', [id], (err, newsletter) => {
                if (err) {
                    return res.status(500).json({ error: 'Error obteniendo newsletter actualizado' });
                }
                
                res.json({
                    message: 'Newsletter actualizado exitosamente',
                    newsletter
                });
            });
        });
    });
});

// Eliminar newsletter
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    // Verificar que el newsletter pertenezca al usuario
    db.get('SELECT id FROM newsletters WHERE id = ? AND user_id = ?', [id, req.user.id], (err, newsletter) => {
        if (err) {
            return res.status(500).json({ error: 'Error verificando newsletter' });
        }
        
        if (!newsletter) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }
        
        // Eliminar en cascada (las secciones se eliminan automáticamente)
        db.run('DELETE FROM newsletters WHERE id = ?', [id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error eliminando newsletter' });
            }
            
            res.json({ message: 'Newsletter eliminado exitosamente' });
        });
    });
});

// Agregar sección al newsletter
router.post('/:id/sections', (req, res) => {
    const { id } = req.params;
    const { master_section_id, section_type, title, content, section_order } = req.body;
    
    if (!section_type || !title || !content) {
        return res.status(400).json({ error: 'Tipo, título y contenido son requeridos' });
    }
    
    // Verificar que el newsletter pertenezca al usuario
    db.get('SELECT id FROM newsletters WHERE id = ? AND user_id = ?', [id, req.user.id], (err, newsletter) => {
        if (err) {
            return res.status(500).json({ error: 'Error verificando newsletter' });
        }
        
        if (!newsletter) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }
        
        // Convertir el contenido a JSON si no lo está
        const contentJson = typeof content === 'string' ? content : JSON.stringify(content);
        
        const query = `
            INSERT INTO newsletter_sections (newsletter_id, master_section_id, section_type, title, content, section_order) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(query, [id, master_section_id || null, section_type, title, contentJson, section_order || 0], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error agregando sección al newsletter' });
            }
            
            // Obtener la sección creada
            db.get(`
                SELECT ns.*, ms.name as master_section_name, ms.type as master_section_type
                FROM newsletter_sections ns
                LEFT JOIN master_sections ms ON ns.master_section_id = ms.id
                WHERE ns.id = ?
            `, [this.lastID], (err, section) => {
                if (err) {
                    return res.status(500).json({ error: 'Error obteniendo sección creada' });
                }
                
                section.content = JSON.parse(section.content);
                
                res.status(201).json({
                    message: 'Sección agregada al newsletter exitosamente',
                    section
                });
            });
        });
    });
});

// Guardar todas las secciones del newsletter
router.put('/:id/sections', (req, res) => {
    const { id } = req.params;
    const { sections } = req.body;
    
    console.log('💾 Guardando secciones del newsletter:', id);
    console.log('📋 Datos recibidos:', { sections: sections ? sections.length : 0 });
    console.log('👤 Usuario autenticado:', req.user.id);
    
    // Verificar que el newsletter pertenezca al usuario
    db.get('SELECT * FROM newsletters WHERE id = ? AND user_id = ?', [id, req.user.id], (err, newsletter) => {
        if (err) {
            console.error('❌ Error verificando newsletter:', err);
            return res.status(500).json({ error: 'Error verificando newsletter' });
        }
        
        if (!newsletter) {
            console.error('❌ Newsletter no encontrado o no pertenece al usuario');
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }
        
        console.log('✅ Newsletter verificado:', newsletter.name);
        
        // Iniciar transacción
        db.serialize(() => {
            let hasError = false;
            let responseSent = false;
            
            // Función para enviar respuesta de error
            const sendError = (status, message) => {
                if (!responseSent) {
                    responseSent = true;
                    console.log('❌ Enviando error:', status, message);
                    res.status(status).json({ error: message });
                }
            };
            
            // Función para enviar respuesta de éxito
            const sendSuccess = (data) => {
                if (!responseSent) {
                    responseSent = true;
                    console.log('✅ Enviando respuesta de éxito');
                    res.json(data);
                }
            };
            
            // Eliminar secciones existentes
            console.log('🗑️ Eliminando secciones existentes...');
            db.run('DELETE FROM newsletter_sections WHERE newsletter_id = ?', [id], (err) => {
                if (err) {
                    console.error('❌ Error eliminando secciones existentes:', err);
                    return sendError(500, 'Error eliminando secciones existentes');
                }
                
                console.log('✅ Secciones existentes eliminadas');
                
                // Insertar nuevas secciones
                if (sections && sections.length > 0) {
                    console.log('➕ Insertando', sections.length, 'nuevas secciones...');
                    const insertQuery = `
                        INSERT INTO newsletter_sections 
                        (newsletter_id, master_section_id, section_type, title, content, section_order, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    `;
                    
                    let completed = 0;
                    
                    sections.forEach((section, index) => {
                        if (hasError) return; // No continuar si ya hay error
                        
                        console.log(`📝 Insertando sección ${index + 1}/${sections.length}:`, section.title);
                        
                        db.run(insertQuery, [
                            id,
                            section.master_section_id,
                            section.type,
                            section.title,
                            JSON.stringify(section.content),
                            index
                        ], function(err) {
                            if (err) {
                                console.error('❌ Error insertando sección:', err);
                                hasError = true;
                                return sendError(500, 'Error guardando algunas secciones');
                            }
                            
                            completed++;
                            console.log(`✅ Sección ${index + 1} insertada (${completed}/${sections.length})`);
                            
                            if (completed === sections.length && !hasError) {
                                console.log('🎯 Todas las secciones insertadas, actualizando timestamp...');
                                // Actualizar timestamp del newsletter
                                db.run('UPDATE newsletters SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id], (err) => {
                                    if (err) {
                                        console.error('❌ Error actualizando timestamp del newsletter:', err);
                                    } else {
                                        console.log('✅ Timestamp del newsletter actualizado');
                                    }
                                    
                                    // Obtener el newsletter actualizado
                                    db.get('SELECT * FROM newsletters WHERE id = ?', [id], (err, updatedNewsletter) => {
                                        if (err) {
                                            console.error('❌ Error obteniendo newsletter actualizado:', err);
                                        } else {
                                            console.log('✅ Newsletter actualizado obtenido');
                                        }
                                        
                                        sendSuccess({
                                            message: 'Newsletter guardado exitosamente',
                                            newsletter: updatedNewsletter || newsletter
                                        });
                                    });
                                });
                            }
                        });
                    });
                } else {
                    console.log('📝 No hay secciones para insertar, solo actualizando timestamp...');
                    // Si no hay secciones, solo actualizar el timestamp
                    db.run('UPDATE newsletters SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id], (err) => {
                        if (err) {
                            console.error('❌ Error actualizando timestamp del newsletter:', err);
                        } else {
                            console.log('✅ Timestamp del newsletter actualizado');
                        }
                        
                        sendSuccess({
                            message: 'Newsletter guardado exitosamente (sin secciones)',
                            newsletter
                        });
                    });
                }
            });
        });
    });
});

// Eliminar sección del newsletter
router.delete('/:id/sections/:sectionId', (req, res) => {
    const { id, sectionId } = req.params;
    
    // Verificar que el newsletter pertenezca al usuario
    db.get('SELECT id FROM newsletters WHERE id = ? AND user_id = ?', [id, req.user.id], (err, newsletter) => {
        if (err) {
            return res.status(500).json({ error: 'Error verificando newsletter' });
        }
        
        if (!newsletter) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }
        
        db.run('DELETE FROM newsletter_sections WHERE id = ? AND newsletter_id = ?', [sectionId, id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error eliminando sección del newsletter' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Sección no encontrada' });
            }
            
            res.json({ message: 'Sección del newsletter eliminada exitosamente' });
        });
    });
});

// Reordenar secciones del newsletter
router.put('/:id/sections/reorder', (req, res) => {
    const { id } = req.params;
    const { sectionOrders } = req.body; // Array de {id, order}
    
    if (!Array.isArray(sectionOrders)) {
        return res.status(400).json({ error: 'Se requiere un array de órdenes de secciones' });
    }
    
    // Verificar que el newsletter pertenezca al usuario
    db.get('SELECT id FROM newsletters WHERE id = ? AND user_id = ?', [id, req.user.id], (err, newsletter) => {
        if (err) {
            return res.status(500).json({ error: 'Error verificando newsletter' });
        }
        
        if (!newsletter) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }
        
        // Actualizar el orden de cada sección
        let completed = 0;
        let errors = [];
        
        sectionOrders.forEach(({ id: sectionId, order }) => {
            db.run('UPDATE newsletter_sections SET section_order = ? WHERE id = ? AND newsletter_id = ?', 
                [order, sectionId, id], function(err) {
                    if (err) {
                        errors.push(`Error actualizando sección ${sectionId}: ${err.message}`);
                    }
                    
                    completed++;
                    
                    if (completed === sectionOrders.length) {
                        if (errors.length > 0) {
                            return res.status(500).json({ 
                                error: 'Error reordenando secciones',
                                details: errors
                            });
                        }
                        
                        res.json({ message: 'Secciones reordenadas exitosamente' });
                    }
                });
        });
    });
});

// Duplicar newsletter
router.post('/:id/duplicate', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'El nombre del newsletter duplicado es requerido' });
    }
    
    // Verificar que el newsletter pertenezca al usuario
    db.get('SELECT * FROM newsletters WHERE id = ? AND user_id = ?', [id, req.user.id], (err, newsletter) => {
        if (err) {
            return res.status(500).json({ error: 'Error verificando newsletter' });
        }
        
        if (!newsletter) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }
        
        // Crear nuevo newsletter
        db.run(`
            INSERT INTO newsletters (user_id, name, description, status) 
            VALUES (?, ?, ?, 'draft')
        `, [req.user.id, name, description || newsletter.description], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error duplicando newsletter' });
            }
            
            const newNewsletterId = this.lastID;
            
            // Copiar todas las secciones
            db.all('SELECT * FROM newsletter_sections WHERE newsletter_id = ? ORDER BY section_order', [id], (err, sections) => {
                if (err) {
                    return res.status(500).json({ error: 'Error obteniendo secciones del newsletter original' });
                }
                
                if (sections.length === 0) {
                    // Newsletter sin secciones, solo devolver el creado
                    db.get('SELECT * FROM newsletters WHERE id = ?', [newNewsletterId], (err, newNewsletter) => {
                        if (err) {
                            return res.status(500).json({ error: 'Error obteniendo newsletter duplicado' });
                        }
                        
                        res.status(201).json({
                            message: 'Newsletter duplicado exitosamente',
                            newsletter: newNewsletter,
                            sections: []
                        });
                    });
                    return;
                }
                
                // Copiar cada sección
                let completed = 0;
                let errors = [];
                
                sections.forEach((section, index) => {
                    db.run(`
                        INSERT INTO newsletter_sections (newsletter_id, master_section_id, section_type, title, content, section_order) 
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [newNewsletterId, section.master_section_id, section.section_type, section.title, section.content, section.section_order], function(err) {
                        if (err) {
                            errors.push(`Error copiando sección ${section.id}: ${err.message}`);
                        }
                        
                        completed++;
                        
                        if (completed === sections.length) {
                            if (errors.length > 0) {
                                return res.status(500).json({ 
                                    error: 'Error duplicando newsletter',
                                    details: errors
                                });
                            }
                            
                            // Obtener el newsletter duplicado con sus secciones
                            db.get('SELECT * FROM newsletters WHERE id = ?', [newNewsletterId], (err, newNewsletter) => {
                                if (err) {
                                    return res.status(500).json({ error: 'Error obteniendo newsletter duplicado' });
                                }
                                
                                db.all(`
                                    SELECT ns.*, ms.name as master_section_name, ms.type as master_section_type
                                    FROM newsletter_sections ns
                                    LEFT JOIN master_sections ms ON ns.master_section_id = ms.id
                                    WHERE ns.newsletter_id = ?
                                    ORDER BY ns.section_order
                                `, [newNewsletterId], (err, newSections) => {
                                    if (err) {
                                        return res.status(500).json({ error: 'Error obteniendo secciones del newsletter duplicado' });
                                    }
                                    
                                    // Parsear el contenido JSON de cada sección
                                    const parsedSections = newSections.map(section => ({
                                        ...section,
                                        content: JSON.parse(section.content)
                                    }));
                                    
                                    res.status(201).json({
                                        message: 'Newsletter duplicado exitosamente',
                                        newsletter: newNewsletter,
                                        sections: parsedSections
                                    });
                                });
                            });
                        }
                    });
                });
            });
        });
    });
});

// Actualizar sección del newsletter
router.put('/:id/sections/:sectionId', (req, res) => {
    const { id, sectionId } = req.params;
    const { title, content } = req.body;
    
    // Verificar que el newsletter pertenezca al usuario
    db.get('SELECT * FROM newsletters WHERE id = ? AND user_id = ?', [id, req.user.id], (err, newsletter) => {
        if (err) {
            return res.status(500).json({ error: 'Error verificando newsletter' });
        }
        
        if (!newsletter) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }
        
        // Actualizar la sección
        const updateQuery = `
            UPDATE newsletter_sections 
            SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND newsletter_id = ?
        `;
        
        db.run(updateQuery, [title, JSON.stringify(content), sectionId, id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error actualizando sección' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Sección no encontrada' });
            }
            
            res.json({ message: 'Sección actualizada exitosamente' });
        });
    });
});

module.exports = router; 