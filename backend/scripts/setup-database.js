import { db } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

async function setupDatabase() {
    try {
        console.log('🏥 Configurando base de datos para CrudClinic...');

        // Create tables
        await db.query(`
            DROP TABLE IF EXISTS citas CASCADE;
            DROP TABLE IF EXISTS pacientes CASCADE;
        `);


        // Create pacientes table
        await db.query(`
            CREATE TABLE clientes (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                correo VARCHAR(100) NOT NULL UNIQUE,
                telefono VARCHAR(20),
                direccion TEXT,
                numero_identificación VARCHAR(20) UNIQUE
            );
        `);


        console.log('✅ Tablas creadas exitosamente');

        // Insert initial data
        console.log('📝 Insertando datos iniciales...');



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
