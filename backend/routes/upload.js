import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/supabase.js';
import { config } from '../config/config.js';
import csv from 'csv-parser';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (config.upload.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten archivos CSV.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.upload.maxFileSize
    }
});

// Upload CSV file
router.post('/csv', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'No se proporcionó ningún archivo'
            });
        }

        const { type } = req.body;
        if (!type) {
            return res.status(400).json({
                message: 'Tipo de datos no especificado'
            });
        }

        const results = [];
        const filePath = req.file.path;

        // Parse CSV file
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    let insertedCount = 0;
                    let errors = [];

                    for (const row of results) {
                        try {
                            switch (type) {
                                case 'pacientes':
                                    await db.query(
                                        `INSERT INTO pacientes (nombre, apellido, email, telefono, fecha_nacimiento, genero, direccion, documento_identidad, estado)
                                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
                                        [row.nombre, row.apellido, row.email, row.telefono, row.fecha_nacimiento, row.genero, row.direccion, row.documento_identidad]
                                    );
                                    break;

                                case 'medicos':
                                    // First, get or create specialty
                                    let especialidadId = null;
                                    if (row.especialidad) {
                                        const especialidadResult = await db.query(
                                            'SELECT id FROM especialidades WHERE nombre ILIKE $1',
                                            [row.especialidad]
                                        );
                                        
                                        if (especialidadResult.rows.length === 0) {
                                            const newEspecialidad = await db.query(
                                                'INSERT INTO especialidades (nombre) VALUES ($1) RETURNING id',
                                                [row.especialidad]
                                            );
                                            especialidadId = newEspecialidad.rows[0].id;
                                        } else {
                                            especialidadId = especialidadResult.rows[0].id;
                                        }
                                    }

                                    await db.query(
                                        `INSERT INTO medicos (nombre, apellido, email, telefono, especialidad_id, licencia_medica, estado)
                                         VALUES ($1, $2, $3, $4, $5, $6, true)`,
                                        [row.nombre, row.apellido, row.email, row.telefono, especialidadId, row.licencia_medica]
                                    );
                                    break;

                                case 'citas':
                                    // Get patient and doctor IDs
                                    const pacienteResult = await db.query(
                                        'SELECT id FROM pacientes WHERE email = $1',
                                        [row.paciente_email]
                                    );
                                    
                                    const medicoResult = await db.query(
                                        'SELECT id FROM medicos WHERE email = $1',
                                        [row.medico_email]
                                    );

                                    if (pacienteResult.rows.length > 0 && medicoResult.rows.length > 0) {
                                        await db.query(
                                            `INSERT INTO citas (paciente_id, medico_id, fecha_cita, duracion_minutos, motivo_consulta, monto, estado)
                                             VALUES ($1, $2, $3, $4, $5, $6, 'programada')`,
                                            [pacienteResult.rows[0].id, medicoResult.rows[0].id, row.fecha_cita, row.duracion_minutos || 30, row.motivo_consulta, row.monto]
                                        );
                                    } else {
                                        errors.push(`Cita: Paciente o médico no encontrado para ${row.paciente_email} - ${row.medico_email}`);
                                        continue;
                                    }
                                    break;

                                default:
                                    errors.push(`Tipo de datos no soportado: ${type}`);
                                    continue;
                            }
                            insertedCount++;
                        } catch (error) {
                            errors.push(`Error en fila: ${JSON.stringify(row)} - ${error.message}`);
                        }
                    }

                    // Clean up uploaded file
                    fs.unlinkSync(filePath);

                    res.json({
                        message: `Archivo procesado exitosamente. ${insertedCount} registros insertados.`,
                        inserted: insertedCount,
                        errors: errors.length > 0 ? errors : undefined
                    });

                } catch (error) {
                    console.error('Error procesando CSV:', error);
                    res.status(500).json({
                        message: 'Error procesando el archivo CSV'
                    });
                }
            });

    } catch (error) {
        console.error('Error en upload CSV:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
});



export default router;
