import express from 'express';
import { db } from '../config/supabase.js';

const router = express.Router();

// Get all appointments
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT c.*, 
                    p.nombre as paciente_nombre, p.apellido as paciente_apellido,
                    m.nombre as medico_nombre, m.apellido as medico_apellido,
                    e.nombre as especialidad_nombre,
                    mp.nombre as metodo_pago_nombre
             FROM citas c
             LEFT JOIN pacientes p ON c.paciente_id = p.id
             LEFT JOIN medicos m ON c.medico_id = m.id
             LEFT JOIN especialidades e ON m.especialidad_id = e.id
             LEFT JOIN metodos_pago mp ON c.metodo_pago_id = mp.id
             ORDER BY c.fecha_cita DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo citas:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Get appointments count
router.get('/count', async (req, res) => {
    try {
        const result = await db.query('SELECT COUNT(*) FROM citas');
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Error contando citas:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Get upcoming appointments
router.get('/proximas', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const result = await db.query(
            `SELECT c.*, 
                    p.nombre as paciente_nombre, p.apellido as paciente_apellido,
                    m.nombre as medico_nombre, m.apellido as medico_apellido,
                    e.nombre as especialidad_nombre
             FROM citas c
             LEFT JOIN pacientes p ON c.paciente_id = p.id
             LEFT JOIN medicos m ON c.medico_id = m.id
             LEFT JOIN especialidades e ON m.especialidad_id = e.id
             WHERE c.fecha_cita >= $1 AND c.estado != 'cancelada'
             ORDER BY c.fecha_cita ASC
             LIMIT 10`,
            [today]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo citas próximas:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT c.*, 
                    p.nombre as paciente_nombre, p.apellido as paciente_apellido,
                    m.nombre as medico_nombre, m.apellido as medico_apellido,
                    e.nombre as especialidad_nombre,
                    mp.nombre as metodo_pago_nombre
             FROM citas c
             LEFT JOIN pacientes p ON c.paciente_id = p.id
             LEFT JOIN medicos m ON c.medico_id = m.id
             LEFT JOIN especialidades e ON m.especialidad_id = e.id
             LEFT JOIN metodos_pago mp ON c.metodo_pago_id = mp.id
             WHERE c.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Cita no encontrada'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo cita:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Create new appointment
router.post('/', async (req, res) => {
    try {
        const {
            paciente_id,
            medico_id,
            fecha_cita,
            duracion_minutos,
            motivo_consulta,
            metodo_pago_id,
            monto,
            notas
        } = req.body;

        const result = await db.query(
            `INSERT INTO citas 
            (paciente_id, medico_id, fecha_cita, duracion_minutos, motivo_consulta, 
             metodo_pago_id, monto, notas, estado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'programada')
            RETURNING *`,
            [paciente_id, medico_id, fecha_cita, duracion_minutos, motivo_consulta, 
             metodo_pago_id, monto, notas]
        );

        res.status(201).json({
            message: 'Cita creada exitosamente',
            cita: result.rows[0]
        });
    } catch (error) {
        console.error('Error creando cita:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Update appointment
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            paciente_id,
            medico_id,
            fecha_cita,
            duracion_minutos,
            motivo_consulta,
            metodo_pago_id,
            monto,
            notas,
            estado
        } = req.body;

        const result = await db.query(
            `UPDATE citas 
            SET paciente_id = $1, medico_id = $2, fecha_cita = $3, 
                duracion_minutos = $4, motivo_consulta = $5, metodo_pago_id = $6,
                monto = $7, notas = $8, estado = $9
            WHERE id = $10
            RETURNING *`,
            [paciente_id, medico_id, fecha_cita, duracion_minutos, motivo_consulta,
             metodo_pago_id, monto, notas, estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Cita no encontrada'
            });
        }

        res.json({
            message: 'Cita actualizada exitosamente',
            cita: result.rows[0]
        });
    } catch (error) {
        console.error('Error actualizando cita:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'DELETE FROM citas WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Cita no encontrada'
            });
        }

        res.json({
            message: 'Cita eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando cita:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});

export default router;
