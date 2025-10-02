const express = require('express');
const { query } = require('../database/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Obtener todos los newsletters del usuario actual
router.get('/', async (req, res) => {
    try {
        const result = await query(`
            SELECT n.*, 
                   COUNT(ns.id) as sections_count,
                   MAX(ns.updated_at) as last_section_update
            FROM newsletters n 
            LEFT JOIN newsletter_sections ns ON n.id = ns.newsletter_id
            WHERE n.user_id = $1 
            GROUP BY n.id
            ORDER BY n.updated_at DESC
        `, [req.user.id]);
        
        res.json({ newsletters: result.rows });
    } catch (error) {
        console.error('Error obteniendo newsletters:', error);
        res.status(500).json({ error: 'Error obteniendo newsletters' });
    }
});

// Obtener un newsletter específico con sus secciones
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar que el newsletter pertenezca al usuario
        const newsletterResult = await query(
            'SELECT * FROM newsletters WHERE id = $1 AND user_id = $2', 
            [id, req.user.id]
        );

        if (newsletterResult.rows.length === 0) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }

        const newsletter = newsletterResult.rows[0];
        
        // Obtener las secciones del newsletter
        const sectionsResult = await query(`
            SELECT ns.*, ms.name as master_section_name, ms.type as master_section_type
            FROM newsletter_sections ns
            LEFT JOIN master_sections ms ON ns.master_section_id = ms.id
            WHERE ns.newsletter_id = $1
            ORDER BY ns.section_order ASC
        `, [id]);

        const sections = sectionsResult.rows.map(section => ({
            ...section,
            content: JSON.parse(section.content)
        }));

        res.json({ 
            newsletter: {
                ...newsletter,
                sections
            }
        });
    } catch (error) {
        console.error('Error obteniendo newsletter:', error);
        res.status(500).json({ error: 'Error obteniendo newsletter' });
    }
});

// Crear nuevo newsletter
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'El nombre del newsletter es requerido' });
        }

        const result = await query(`
            INSERT INTO newsletters (user_id, name, description) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `, [req.user.id, name, description || '']);

        const newsletter = result.rows[0];

        res.status(201).json({ 
            message: 'Newsletter creado exitosamente',
            newsletter 
        });
    } catch (error) {
        console.error('Error creando newsletter:', error);
        res.status(500).json({ error: 'Error creando newsletter' });
    }
});

// Actualizar newsletter
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'El nombre del newsletter es requerido' });
        }

        // Verificar que el newsletter pertenezca al usuario
        const newsletterResult = await query(
            'SELECT id FROM newsletters WHERE id = $1 AND user_id = $2', 
            [id, req.user.id]
        );

        if (newsletterResult.rows.length === 0) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }

        const result = await query(`
            UPDATE newsletters 
            SET name = $1, description = $2, status = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4 AND user_id = $5
            RETURNING *
        `, [name, description || '', status || 'draft', id, req.user.id]);

        const newsletter = result.rows[0];

        res.json({ 
            message: 'Newsletter actualizado exitosamente',
            newsletter 
        });
    } catch (error) {
        console.error('Error actualizando newsletter:', error);
        res.status(500).json({ error: 'Error actualizando newsletter' });
    }
});

// Eliminar newsletter
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el newsletter pertenezca al usuario
        const newsletterResult = await query(
            'SELECT id FROM newsletters WHERE id = $1 AND user_id = $2', 
            [id, req.user.id]
        );

        if (newsletterResult.rows.length === 0) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }

        // Eliminar secciones del newsletter primero
        await query('DELETE FROM newsletter_sections WHERE newsletter_id = $1', [id]);

        // Eliminar el newsletter
        await query('DELETE FROM newsletters WHERE id = $1', [id]);

        res.json({ message: 'Newsletter eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando newsletter:', error);
        res.status(500).json({ error: 'Error eliminando newsletter' });
    }
});

// Agregar sección al newsletter
router.post('/:id/sections', async (req, res) => {
    try {
        const { id } = req.params;
        const { master_section_id } = req.body;

        if (!master_section_id) {
            return res.status(400).json({ error: 'ID de sección maestra es requerido' });
        }

        // Verificar que el newsletter pertenezca al usuario
        const newsletterResult = await query(
            'SELECT id FROM newsletters WHERE id = $1 AND user_id = $2', 
            [id, req.user.id]
        );

        if (newsletterResult.rows.length === 0) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }

        // Obtener la sección maestra
        const masterSectionResult = await query(
            'SELECT * FROM master_sections WHERE id = $1 AND is_active = true', 
            [master_section_id]
        );

        if (masterSectionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Sección maestra no encontrada' });
        }

        const masterSection = masterSectionResult.rows[0];

        // Obtener el siguiente orden de sección
        const orderResult = await query(
            'SELECT COALESCE(MAX(section_order), 0) + 1 as next_order FROM newsletter_sections WHERE newsletter_id = $1',
            [id]
        );

        const nextOrder = orderResult.rows[0].next_order;

        // Crear la sección en el newsletter
        const result = await query(`
            INSERT INTO newsletter_sections (newsletter_id, master_section_id, section_type, title, content, section_order) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `, [
            id, 
            master_section_id, 
            masterSection.type, 
            masterSection.title, 
            masterSection.content, 
            nextOrder
        ]);

        const section = result.rows[0];
        section.content = JSON.parse(section.content);

        res.status(201).json({ 
            message: 'Sección agregada exitosamente',
            section 
        });
    } catch (error) {
        console.error('Error agregando sección:', error);
        res.status(500).json({ error: 'Error agregando sección' });
    }
});

// Guardar/actualizar todas las secciones del newsletter
router.put('/:id/sections', async (req, res) => {
    try {
        const { id } = req.params;
        const { sections } = req.body;

        if (!sections || !Array.isArray(sections)) {
            return res.status(400).json({ error: 'Se requiere un array de secciones' });
        }

        // Verificar que el newsletter pertenezca al usuario
        const newsletterResult = await query(
            'SELECT id FROM newsletters WHERE id = $1 AND user_id = $2', 
            [id, req.user.id]
        );

        if (newsletterResult.rows.length === 0) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }

        // Eliminar todas las secciones existentes del newsletter
        await query('DELETE FROM newsletter_sections WHERE newsletter_id = $1', [id]);

        // Insertar las nuevas secciones
        const insertedSections = [];
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            
            // Validar datos de la sección
            if (!section.master_section_id || !section.type || !section.content) {
                console.warn('Sección inválida omitida:', section);
                continue;
            }

            const result = await query(`
                INSERT INTO newsletter_sections 
                (newsletter_id, master_section_id, section_type, title, content, section_order, is_customized) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING *
            `, [
                id,
                section.master_section_id,
                section.type,
                section.title || 'Sin título',
                JSON.stringify(section.content),
                section.order !== undefined ? section.order : i,
                section.is_customized || false
            ]);

            if (result.rows.length > 0) {
                const insertedSection = result.rows[0];
                insertedSection.content = JSON.parse(insertedSection.content);
                insertedSections.push(insertedSection);
            }
        }

        // Actualizar el timestamp del newsletter
        await query(
            'UPDATE newsletters SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );

        res.json({ 
            message: 'Secciones guardadas exitosamente',
            sections: insertedSections,
            count: insertedSections.length
        });
    } catch (error) {
        console.error('Error guardando secciones del newsletter:', error);
        res.status(500).json({ error: 'Error guardando secciones del newsletter' });
    }
});

// Editar sección del newsletter
router.put('/:id/sections/:sectionId', async (req, res) => {
    try {
        const { id, sectionId } = req.params;
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Título y contenido son requeridos' });
        }

        // Verificar que el newsletter pertenezca al usuario
        const newsletterResult = await query(
            'SELECT id FROM newsletters WHERE id = $1 AND user_id = $2', 
            [id, req.user.id]
        );

        if (newsletterResult.rows.length === 0) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }

        const result = await query(`
            UPDATE newsletter_sections 
            SET title = $1, content = $2, is_customized = true, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 AND newsletter_id = $4
            RETURNING *
        `, [title, JSON.stringify(content), sectionId, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sección no encontrada' });
        }

        const section = result.rows[0];
        section.content = JSON.parse(section.content);

        res.json({ 
            message: 'Sección actualizada exitosamente',
            section 
        });
    } catch (error) {
        console.error('Error actualizando sección:', error);
        res.status(500).json({ error: 'Error actualizando sección' });
    }
});

// Eliminar sección del newsletter
router.delete('/:id/sections/:sectionId', async (req, res) => {
    try {
        const { id, sectionId } = req.params;

        // Verificar que el newsletter pertenezca al usuario
        const newsletterResult = await query(
            'SELECT id FROM newsletters WHERE id = $1 AND user_id = $2', 
            [id, req.user.id]
        );

        if (newsletterResult.rows.length === 0) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }

        const result = await query(
            'DELETE FROM newsletter_sections WHERE id = $1 AND newsletter_id = $2 RETURNING id',
            [sectionId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sección no encontrada' });
        }

        res.json({ message: 'Sección eliminada exitosamente' });
    } catch (error) {
        console.error('Error eliminando sección:', error);
        res.status(500).json({ error: 'Error eliminando sección' });
    }
});

// Reordenar secciones del newsletter
router.put('/:id/sections/reorder', async (req, res) => {
    try {
        const { id } = req.params;
        const { sections } = req.body;

        if (!sections || !Array.isArray(sections)) {
            return res.status(400).json({ error: 'Array de secciones es requerido' });
        }

        // Verificar que el newsletter pertenezca al usuario
        const newsletterResult = await query(
            'SELECT id FROM newsletters WHERE id = $1 AND user_id = $2', 
            [id, req.user.id]
        );

        if (newsletterResult.rows.length === 0) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }

        // Actualizar el orden de cada sección
        for (let i = 0; i < sections.length; i++) {
            await query(
                'UPDATE newsletter_sections SET section_order = $1 WHERE id = $2 AND newsletter_id = $3',
                [i + 1, sections[i].id, id]
            );
        }

        res.json({ message: 'Secciones reordenadas exitosamente' });
    } catch (error) {
        console.error('Error reordenando secciones:', error);
        res.status(500).json({ error: 'Error reordenando secciones' });
    }
});

// Duplicar newsletter
router.post('/:id/duplicate', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el newsletter pertenezca al usuario
        const newsletterResult = await query(
            'SELECT * FROM newsletters WHERE id = $1 AND user_id = $2', 
            [id, req.user.id]
        );

        if (newsletterResult.rows.length === 0) {
            return res.status(404).json({ error: 'Newsletter no encontrado' });
        }

        const originalNewsletter = newsletterResult.rows[0];

        // Crear el newsletter duplicado
        const newsletterResult2 = await query(`
            INSERT INTO newsletters (user_id, name, description, status) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *
        `, [
            req.user.id, 
            `${originalNewsletter.name} (Copia)`, 
            originalNewsletter.description, 
            'draft'
        ]);

        const newNewsletter = newsletterResult2.rows[0];

        // Obtener las secciones del newsletter original
        const sectionsResult = await query(
            'SELECT * FROM newsletter_sections WHERE newsletter_id = $1 ORDER BY section_order',
            [id]
        );

        // Duplicar las secciones
        for (const section of sectionsResult.rows) {
            await query(`
                INSERT INTO newsletter_sections (newsletter_id, master_section_id, section_type, title, content, section_order, is_customized) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                newNewsletter.id,
                section.master_section_id,
                section.section_type,
                section.title,
                section.content,
                section.section_order,
                section.is_customized
            ]);
        }

        res.status(201).json({ 
            message: 'Newsletter duplicado exitosamente',
            newsletter: newNewsletter
        });
    } catch (error) {
        console.error('Error duplicando newsletter:', error);
        res.status(500).json({ error: 'Error duplicando newsletter' });
    }
});

module.exports = router;