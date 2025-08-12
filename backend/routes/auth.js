import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/supabase.js';
import { config } from '../config/config.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'Usuario y contraseña son requeridos'
            });
        }

        // Get user from database
        const result = await db.query(
            'SELECT * FROM usuarios WHERE username = $1 AND estado = true',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Credenciales inválidas'
            });
        }

        const user = result.rows[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                message: 'Credenciales inválidas'
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                role: user.rol 
            },
            config.server.jwtSecret,
            { expiresIn: config.server.jwtExpiresIn }
        );

        // Store user in session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.rol
        };

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                message: 'Error al cerrar sesión'
            });
        }
        res.json({
            message: 'Sesión cerrada exitosamente'
        });
    });
});

// Get current user
router.get('/me', (req, res) => {
    if (req.session.user) {
        res.json({
            user: req.session.user
        });
    } else {
        res.status(401).json({
            message: 'No autenticado'
        });
    }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Token no proporcionado'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({
            valid: true,
            user: decoded
        });
    } catch (error) {
        res.status(401).json({
            message: 'Token inválido'
        });
    }
});

export default router;
