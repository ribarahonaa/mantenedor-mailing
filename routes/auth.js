const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../database/database');

const router = express.Router();

// Clave secreta para JWT (en producción usar variable de entorno)
const JWT_SECRET = 'innk-secret-key-2024';

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        req.user = user;
        next();
    });
};

// Middleware para verificar si es admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
};

// Registro de usuarios
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validaciones básicas
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Verificar si el usuario ya existe
        db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error en la base de datos' });
            }

            if (row) {
                return res.status(400).json({ error: 'El usuario o email ya existe' });
            }

            // Hash de la contraseña
            const passwordHash = await bcrypt.hash(password, 10);

            // Crear usuario
            db.run('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)', 
                [username, email, passwordHash, 'user'], function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error creando usuario' });
                    }

                    // Generar token JWT
                    const token = jwt.sign(
                        { id: this.lastID, username, role: 'user' },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    );

                    res.json({
                        message: 'Usuario creado exitosamente',
                        user: { id: this.lastID, username, email, role: 'user' },
                        token
                    });
                });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Login de usuarios
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Buscar usuario
    db.get('SELECT * FROM users WHERE username = ? AND is_active = 1', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login exitoso',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });
    });
});

// Obtener perfil del usuario actual
router.get('/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ user });
    });
});

// Cambiar contraseña
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
        }

        // Obtener usuario actual
        db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Error en la base de datos' });
            }

            // Verificar contraseña actual
            const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: 'Contraseña actual incorrecta' });
            }

            // Hash de la nueva contraseña
            const newPasswordHash = await bcrypt.hash(newPassword, 10);

            // Actualizar contraseña
            db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
                [newPasswordHash, req.user.id], function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error actualizando contraseña' });
                    }

                    res.json({ message: 'Contraseña actualizada exitosamente' });
                });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = { router, authenticateToken, requireAdmin, JWT_SECRET }; 