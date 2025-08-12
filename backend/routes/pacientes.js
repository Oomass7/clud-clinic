                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            import express from 'express';
import { db } from '../config/supabase.js';

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROMclientes ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo clientes:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Get patients count
router.get('/count', async (req, res) => {
    try {
        const result = await db.query('SELECT COUNT(*) FROM clientes');
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Error contando clientes:', error);
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
            'SELECT * FROM clientes WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'cliente no encontrado'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo cliente:', error);
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
            email,
            telefono,
            direccion,
            número_identificación
        } = req.body;

        const result = await db.query(
            `INSERT INTO clientes 
            (nombre, email, telefono, direccion, número_identificación)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
            RETURNING *`,
            [nombre, email, telefono, direccion, número_identificación]
        );

        res.status(201).json({
            message: 'cliente creado exitosamente',
            paciente: result.rows[0]
        });
    } catch (error) {
        console.error('Error creando cliente:', error);
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
            email,
            telefono,
            direccion,
            número_identificación
        } = req.body;

        const result = await db.query(
            `UPDATE pacientes 
            SET nombre = $1, apellido = $2, email = $3, telefono = $4, 
                fecha_nacimiento = $5, genero = $6, direccion = $7, 
                documento_identidad = $8, estado = $9
            WHERE id = $10
            RETURNING *`,
            [nombre, email, telefono, direccion, número_identificación, id]
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
            'DELETE FROM clientes WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'cliente no encontrado'
            });
        }

        res.json({
            message: 'cliente eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando cliente:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

export default router;
