import { Pool } from 'pg';
import { config } from './config.js';

// Database connection for direct SQL queries - Configuración centralizada
export const db = new Pool(config.database);

// Test database connection
export async function testConnection() {
    try {
        const client = await db.connect();
        console.log('✅ Conexión a Supabase PostgreSQL exitosa');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a Supabase:', error);
        return false;
    }
}

export default { db, testConnection };
