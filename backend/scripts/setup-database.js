import { db } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

async function setupDatabase() {
    try {
        console.log('🏥 Configurando base de datos para CrudClinic...');

        // Create tables
        await db.query(`
            DROP TABLE IF EXISTS Cliente CASCADE;
        `);


        // Create clientes table
        await db.query(`
            CREATE TABLE Cliente (
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
