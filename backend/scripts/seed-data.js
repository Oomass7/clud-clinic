import { db } from '../config/supabase.js';

async function seedData() {
    try {
        console.log('🌱 Insertando datos de prueba...');

        // Insertar pacientes de prueba
        const pacientes = [
            {
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan.perez@email.com',
                telefono: '3001234567',
                fecha_nacimiento: '1990-05-15',
                genero: 'M',
                direccion: 'Calle 123 #45-67, Bogotá',
                documento_identidad: '12345678'
            },
            {
                nombre: 'María',
                apellido: 'García',
                email: 'maria.garcia@email.com',
                telefono: '3002345678',
                fecha_nacimiento: '1985-08-22',
                genero: 'F',
                direccion: 'Carrera 78 #12-34, Medellín',
                documento_identidad: '23456789'
            },
            {
                nombre: 'Carlos',
                apellido: 'López',
                email: 'carlos.lopez@email.com',
                telefono: '3003456789',
                fecha_nacimiento: '1992-12-10',
                genero: 'M',
                direccion: 'Avenida 5 #23-45, Cali',
                documento_identidad: '34567890'
            }
        ];

        for (const paciente of pacientes) {
            await db.query(
                `INSERT INTO pacientes (nombre, apellido, email, telefono, fecha_nacimiento, genero, direccion, documento_identidad, estado)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
                 ON CONFLICT (email) DO NOTHING`,
                [paciente.nombre, paciente.apellido, paciente.email, paciente.telefono, 
                 paciente.fecha_nacimiento, paciente.genero, paciente.direccion, paciente.documento_identidad]
            );
        }

        // Insertar médicos de prueba
        const medicos = [
            {
                nombre: 'Dr. Ana',
                apellido: 'Rodríguez',
                email: 'ana.rodriguez@clinic.com',
                telefono: '3004567890',
                especialidad_id: 1, // Medicina General
                licencia_medica: 'MED001'
            },
            {
                nombre: 'Dr. Roberto',
                apellido: 'Martínez',
                email: 'roberto.martinez@clinic.com',
                telefono: '3005678901',
                especialidad_id: 2, // Cardiología
                licencia_medica: 'MED002'
            },
            {
                nombre: 'Dra. Patricia',
                apellido: 'Hernández',
                email: 'patricia.hernandez@clinic.com',
                telefono: '3006789012',
                especialidad_id: 4, // Ginecología
                licencia_medica: 'MED003'
            }
        ];

        for (const medico of medicos) {
            await db.query(
                `INSERT INTO medicos (nombre, apellido, email, telefono, especialidad_id, licencia_medica, estado)
                 VALUES ($1, $2, $3, $4, $5, $6, true)
                 ON CONFLICT (email) DO NOTHING`,
                [medico.nombre, medico.apellido, medico.email, medico.telefono, 
                 medico.especialidad_id, medico.licencia_medica]
            );
        }

        // Obtener IDs de pacientes y médicos para crear citas
        const pacientesResult = await db.query('SELECT id FROM pacientes LIMIT 3');
        const medicosResult = await db.query('SELECT id FROM medicos LIMIT 3');
        const metodosPagoResult = await db.query('SELECT id FROM metodos_pago LIMIT 2');

        if (pacientesResult.rows.length > 0 && medicosResult.rows.length > 0) {
            // Insertar citas de prueba
            const citas = [
                {
                    paciente_id: pacientesResult.rows[0].id,
                    medico_id: medicosResult.rows[0].id,
                    fecha_cita: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
                    duracion_minutos: 30,
                    motivo_consulta: 'Consulta general de rutina',
                    metodo_pago_id: metodosPagoResult.rows[0]?.id,
                    monto: 50000,
                    estado: 'programada'
                },
                {
                    paciente_id: pacientesResult.rows[1]?.id,
                    medico_id: medicosResult.rows[1]?.id,
                    fecha_cita: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // En 2 días
                    duracion_minutos: 45,
                    motivo_consulta: 'Revisión cardiológica',
                    metodo_pago_id: metodosPagoResult.rows[1]?.id,
                    monto: 80000,
                    estado: 'confirmada'
                }
            ];

            for (const cita of citas) {
                if (cita.paciente_id && cita.medico_id) {
                    await db.query(
                        `INSERT INTO citas (paciente_id, medico_id, fecha_cita, duracion_minutos, motivo_consulta, metodo_pago_id, monto, estado)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [cita.paciente_id, cita.medico_id, cita.fecha_cita, cita.duracion_minutos,
                         cita.motivo_consulta, cita.metodo_pago_id, cita.monto, cita.estado]
                    );
                }
            }
        }

        console.log('✅ Datos de prueba insertados exitosamente');
        console.log('📊 Resumen:');
        console.log('   - 3 pacientes creados');
        console.log('   - 3 médicos creados');
        console.log('   - 2 citas creadas');

    } catch (error) {
        console.error('❌ Error insertando datos de prueba:', error);
    } finally {
        await db.end();
    }
}

seedData();
