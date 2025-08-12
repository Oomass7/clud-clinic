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
                                case 'Clientes':
                                    await db.query(
                                        `INSERT INTO clientes (nombre, email, telefono, direccion, número_identificación)
                                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
                                        [row.nombre, row.email, row.telefono,  row.direccion, row.número_identificación]
                                    );
                                    break;

                                case 'Factura':

                                    await db.query(
                                        `INSERT INTO Factura (id_factura, monto_facturado, monto_pagado, periodo_facturación)
                                         VALUES ($1, $2, $3, $4, $5)`,
                                        [row.id_factura, row.monto_facturado, row.monto_pagado, row.periodo_facturación]
                                    );
                                    break;

                                
                                case 'Transacción':

                                    await db.query(
                                        `INSERT INTO Transacción (id_transación, plataforma, monto, estado, fecha_hora)
                                         VALUES ($1, $2, $3, $4, $5)`,
                                        [row.id_transacción, row.plataforma, row.monto, row.estado, row.fecha_hora]
                                    );
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
