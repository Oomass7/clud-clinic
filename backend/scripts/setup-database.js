import { db } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

async function setupDatabase() {
    try {
        console.log('🏥 Configurando base de datos para CrudClinic...');

        // Create tables
        await db.query(`
            DROP TABLE IF EXISTS citas CASCADE;
            DROP TABLE IF EXISTS pacientes CASCADE;
            DROP TABLE IF EXISTS medicos CASCADE;
            DROP TABLE IF EXISTS especialidades CASCADE;
            DROP TABLE IF EXISTS metodos_pago CASCADE;
            DROP TABLE IF EXISTS usuarios CASCADE;
        `);

        // Create especialidades table
        await db.query(`
            CREATE TABLE especialidades (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL UNIQUE,
                descripcion TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create metodos_pago table
        await db.query(`
            CREATE TABLE metodos_pago (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL UNIQUE,
                descripcion TEXT,
                estado BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create usuarios table
        await db.query(`
            CREATE TABLE usuarios (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                rol VARCHAR(20) DEFAULT 'usuario',
                estado BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create medicos table
        await db.query(`
            CREATE TABLE medicos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                apellido VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                telefono VARCHAR(20),
                especialidad_id INTEGER REFERENCES especialidades(id),
                licencia_medica VARCHAR(50) NOT NULL UNIQUE,
                estado BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create pacientes table
        await db.query(`
            CREATE TABLE pacientes (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                apellido VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                telefono VARCHAR(20),
                fecha_nacimiento DATE,
                genero CHAR(1),
                direccion TEXT,
                documento_identidad VARCHAR(20) UNIQUE,
                estado BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create citas table
        await db.query(`
            CREATE TABLE citas (
                id SERIAL PRIMARY KEY,
                paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
                medico_id INTEGER NOT NULL REFERENCES medicos(id),
                fecha_cita TIMESTAMP NOT NULL,
                duracion_minutos INTEGER DEFAULT 30,
                motivo_consulta TEXT,
                estado VARCHAR(20) DEFAULT 'programada',
                metodo_pago_id INTEGER REFERENCES metodos_pago(id),
                monto DECIMAL(10,2),
                notas TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ Tablas creadas exitosamente');

        // Insert initial data
        console.log('📝 Insertando datos iniciales...');

        // Insert specialties
        const especialidades = [
            'Medicina General',
            'Cardiología',
            'Dermatología',
            'Ginecología',
            'Pediatría',
            'Ortopedia',
            'Neurología',
            'Psiquiatría',
            'Oftalmología',
            'Otorrinolaringología'
        ];

        for (const especialidad of especialidades) {
            await db.query(
                'INSERT INTO especialidades (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING',
                [especialidad]
            );
        }

        // Insert payment methods
        const metodosPago = [
            { nombre: 'Efectivo', descripcion: 'Pago en efectivo' },
            { nombre: 'Tarjeta de Crédito', descripcion: 'Pago con tarjeta de crédito' },
            { nombre: 'Tarjeta de Débito', descripcion: 'Pago con tarjeta de débito' },
            { nombre: 'Transferencia', descripcion: 'Transferencia bancaria' },
            { nombre: 'Seguro Médico', descripcion: 'Cobertura por seguro médico' }
        ];

        for (const metodo of metodosPago) {
            await db.query(
                'INSERT INTO metodos_pago (nombre, descripcion) VALUES ($1, $2) ON CONFLICT (nombre) DO NOTHING',
                [metodo.nombre, metodo.descripcion]
            );
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.query(
            `INSERT INTO usuarios (username, email, password_hash, rol) 
             VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING`,
            ['admin', 'admin@crudclinic.com', hashedPassword, 'admin']
        );

        console.log('✅ Datos iniciales insertados exitosamente');

        // Create indexes for better performance
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_cita);
            CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
            CREATE INDEX IF NOT EXISTS idx_citas_medico ON citas(medico_id);
            CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
            CREATE INDEX IF NOT EXISTS idx_medicos_email ON medicos(email);
            CREATE INDEX IF NOT EXISTS idx_medicos_especialidad ON medicos(especialidad_id);
        `);

        console.log('✅ Índices creados exitosamente');

        console.log('🎉 Base de datos configurada exitosamente!');
        console.log('👤 Usuario admin creado:');
        console.log('   Usuario: admin');
        console.log('   Contraseña: admin123');

    } catch (error) {
        console.error('❌ Error configurando la base de datos:', error);
        process.exit(1);
    } finally {
        await db.end();
    }
}

setupDatabase();
