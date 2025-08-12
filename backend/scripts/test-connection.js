import { testConnection } from '../config/supabase.js';

console.log('🔍 Probando conexión a Supabase...');

async function testSupabaseConnection() {
    try {
        const isConnected = await testConnection();
        
        if (isConnected) {
            console.log('✅ Conexión exitosa a Supabase PostgreSQL');
            console.log('🚀 Tu aplicación está lista para funcionar');
        } else {
            console.log('❌ Error conectando a Supabase');
            console.log('📋 Verifica:');
            console.log('   - Tu contraseña de base de datos');
            console.log('   - Las claves de Supabase');
            console.log('   - La configuración de red');
        }
    } catch (error) {
        console.error('❌ Error durante la prueba:', error.message);
    }
    
    process.exit(0);
}

testSupabaseConnection();
