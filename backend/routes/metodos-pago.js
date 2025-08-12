import express from 'express';
import { db } from '../config/supabase.js';

const router = express.Router();

// Get all payment methods
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM metodos_pago ORDER BY nombre ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo métodos de pago:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Get payment method by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'SELECT * FROM metodos_pago WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Método de pago no encontrado'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo método de pago:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Create new payment method
router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        const result = await db.query(
            `INSERT INTO metodos_pago (nombre, descripcion, estado)
             VALUES ($1, $2, true)
             RETURNING *`,
            [nombre, descripcion]
        );

        res.status(201).json({
            message: 'Método de pago creado exitosamente',
            metodo_pago: result.rows[0]
        });
    } catch (error) {
        console.error('Error creando método de pago:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Update payment method
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, estado } = req.body;

        const result = await db.query(
            `UPDATE metodos_pago 
             SET nombre = $1, descripcion = $2, estado = $3
             WHERE id = $4
             RETURNING *`,
            [nombre, descripcion, estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Método de pago no encontrado'
            });
        }

        res.json({
            message: 'Método de pago actualizado exitosamente',
            metodo_pago: result.rows[0]
        });
    } catch (error) {
        console.error('Error actualizando método de pago:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Delete payment method
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'DELETE FROM metodos_pago WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Método de pago no encontrado'
            });
        }

        res.json({
            message: 'Método de pago eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando método de pago:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

export default router;
