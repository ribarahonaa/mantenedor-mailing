const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
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

// ==========================================================
// Reset de contraseña (sin email — devuelve el link en la respuesta)
// ==========================================================

// Solicitar reset: genera token, lo guarda en DB y devuelve el link
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
    }

    db.get('SELECT id, username FROM users WHERE email = ? AND is_active = 1', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        // Respuesta genérica para no filtrar si el email existe.
        // Si el usuario existe, incluimos `resetUrl` con el link real.
        const genericMessage = 'Si el email está registrado, recibirás instrucciones para restablecer la contraseña.';

        if (!user) {
            return res.json({ message: genericMessage });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // +1 hora

        db.run(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, token, expiresAt],
            (insertErr) => {
                if (insertErr) {
                    return res.status(500).json({ error: 'Error generando token de reset' });
                }

                const resetUrl = `/reset-password?token=${token}`;
                res.json({
                    message: genericMessage,
                    resetUrl,
                    expiresAt,
                    username: user.username
                });
            }
        );
    });
});

// Validar token (para el frontend antes de mostrar el formulario)
router.get('/validate-reset-token/:token', (req, res) => {
    const { token } = req.params;

    db.get(
        `SELECT prt.id, prt.user_id, prt.expires_at, prt.used, u.username
         FROM password_reset_tokens prt
         JOIN users u ON u.id = prt.user_id
         WHERE prt.token = ?`,
        [token],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error en la base de datos' });
            }
            if (!row) {
                return res.status(404).json({ valid: false, reason: 'Token no encontrado' });
            }
            if (row.used) {
                return res.status(400).json({ valid: false, reason: 'Token ya utilizado' });
            }
            if (new Date(row.expires_at) < new Date()) {
                return res.status(400).json({ valid: false, reason: 'Token expirado' });
            }
            res.json({ valid: true, username: row.username });
        }
    );
});

// Consumir token y establecer nueva contraseña
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    db.get(
        'SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token = ?',
        [token],
        async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error en la base de datos' });
            }
            if (!row) {
                return res.status(404).json({ error: 'Token no válido' });
            }
            if (row.used) {
                return res.status(400).json({ error: 'Token ya utilizado' });
            }
            if (new Date(row.expires_at) < new Date()) {
                return res.status(400).json({ error: 'Token expirado. Solicita uno nuevo.' });
            }

            try {
                const passwordHash = await bcrypt.hash(newPassword, 10);

                db.serialize(() => {
                    db.run(
                        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [passwordHash, row.user_id],
                        function (updateErr) {
                            if (updateErr) {
                                return res.status(500).json({ error: 'Error actualizando contraseña' });
                            }

                            db.run(
                                'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
                                [row.id],
                                (markErr) => {
                                    if (markErr) {
                                        // La contraseña ya se actualizó; reportar pero no fallar
                                        console.error('Warning: no se pudo marcar token como usado:', markErr.message);
                                    }
                                    res.json({ message: 'Contraseña restablecida correctamente' });
                                }
                            );
                        }
                    );
                });
            } catch (hashError) {
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        }
    );
});

module.exports = { router, authenticateToken, requireAdmin, JWT_SECRET }; 