import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Database connection
const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    ssl: { rejectUnauthorized: false }
});

// Get all doctors
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT m.*, e.nombre as especialidad_nombre 
             FROM medicos m 
             LEFT JOIN especialidades e ON m.especialidad_id = e.id 
             ORDER BY m.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo médicos:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT m.*, e.nombre as especialidad_nombre 
             FROM medicos m 
             LEFT JOIN especialidades e ON m.especialidad_id = e.id 
             WHERE m.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Médico no encontrado'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo médico:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Get doctors count
router.get('/count', async (req, res) => {
    try {
        const result = await db.query('SELECT COUNT(*) FROM medicos');
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Error contando médicos:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Create new doctor
router.post('/', async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            email,
            telefono,
            especialidad_id,
            licencia_medica
        } = req.body;

        const result = await db.query(
            `INSERT INTO medicos 
            (nombre, apellido, email, telefono, especialidad_id, licencia_medica, estado)
            VALUES ($1, $2, $3, $4, $5, $6, true)
            RETURNING *`,
            [nombre, apellido, email, telefono, especialidad_id, licencia_medica]
        );

        res.status(201).json({
            message: 'Médico creado exitosamente',
            medico: result.rows[0]
        });
    } catch (error) {
        console.error('Error creando médico:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Update doctor
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            apellido,
            email,
            telefono,
            especialidad_id,
            licencia_medica,
            estado
        } = req.body;

        const result = await db.query(
            `UPDATE medicos 
            SET nombre = $1, apellido = $2, email = $3, telefono = $4, 
                especialidad_id = $5, licencia_medica = $6, estado = $7
            WHERE id = $8
            RETURNING *`,
            [nombre, apellido, email, telefono, especialidad_id, licencia_medica, estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Médico no encontrado'
            });
        }

        res.json({
            message: 'Médico actualizado exitosamente',
            medico: result.rows[0]
        });
    } catch (error) {
        console.error('Error actualizando médico:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Delete doctor
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'DELETE FROM medicos WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Médico no encontrado'
            });
        }

        res.json({
            message: 'Médico eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando médico:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

export default router;
