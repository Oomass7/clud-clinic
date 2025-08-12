                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            import express from 'express';
import { db } from '../config/supabase.js';

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM pacientes ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo pacientes:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Get patients count
router.get('/count', async (req, res) => {
    try {
        const result = await db.query('SELECT COUNT(*) FROM pacientes');
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Error contando pacientes:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'SELECT * FROM pacientes WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Paciente no encontrado'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo paciente:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Create new patient
router.post('/', async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            email,
            telefono,
            fecha_nacimiento,
            genero,
            direccion,
            documento_identidad
        } = req.body;

        const result = await db.query(
            `INSERT INTO pacientes 
            (nombre, apellido, email, telefono, fecha_nacimiento, genero, direccion, documento_identidad, estado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
            RETURNING *`,
            [nombre, apellido, email, telefono, fecha_nacimiento, genero, direccion, documento_identidad]
        );

        res.status(201).json({
            message: 'Paciente creado exitosamente',
            paciente: result.rows[0]
        });
    } catch (error) {
        console.error('Error creando paciente:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Update patient
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            apellido,
            email,
            telefono,
            fecha_nacimiento,
            genero,
            direccion,
            documento_identidad,
            estado
        } = req.body;

        const result = await db.query(
            `UPDATE pacientes 
            SET nombre = $1, apellido = $2, email = $3, telefono = $4, 
                fecha_nacimiento = $5, genero = $6, direccion = $7, 
                documento_identidad = $8, estado = $9
            WHERE id = $10
            RETURNING *`,
            [nombre, apellido, email, telefono, fecha_nacimiento, genero, direccion, documento_identidad, estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Paciente no encontrado'
            });
        }

        res.json({
            message: 'Paciente actualizado exitosamente',
            paciente: result.rows[0]
        });
    } catch (error) {
        console.error('Error actualizando paciente:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Delete patient
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'DELETE FROM pacientes WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Paciente no encontrado'
            });
        }

        res.json({
            message: 'Paciente eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando paciente:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

export default router;
