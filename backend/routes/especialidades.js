import express from 'express';
import { db } from '../config/supabase.js';

const router = express.Router();

// Get all specialties
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM especialidades ORDER BY nombre ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo especialidades:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Get specialty by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'SELECT * FROM especialidades WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Especialidad no encontrada'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo especialidad:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Create new specialty
router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        const result = await db.query(
            'INSERT INTO especialidades (nombre, descripcion) VALUES ($1, $2) RETURNING *',
            [nombre, descripcion]
        );

        res.status(201).json({
            message: 'Especialidad creada exitosamente',
            especialidad: result.rows[0]
        });
    } catch (error) {
        console.error('Error creando especialidad:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Update specialty
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        const result = await db.query(
            'UPDATE especialidades SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
            [nombre, descripcion, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Especialidad no encontrada'
            });
        }

        res.json({
            message: 'Especialidad actualizada exitosamente',
            especialidad: result.rows[0]
        });
    } catch (error) {
        console.error('Error actualizando especialidad:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Delete specialty
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if specialty is being used by doctors
        const checkResult = await db.query(
            'SELECT COUNT(*) FROM medicos WHERE especialidad_id = $1',
            [id]
        );

        if (parseInt(checkResult.rows[0].count) > 0) {
            return res.status(400).json({
                message: 'No se puede eliminar la especialidad porque está siendo utilizada por médicos'
            });
        }

        const result = await db.query(
            'DELETE FROM especialidades WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Especialidad no encontrada'
            });
        }

        res.json({
            message: 'Especialidad eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando especialidad:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

export default router;
