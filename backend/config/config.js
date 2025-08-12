// Configuración centralizada del proyecto - Sin variables de entorno
export const config = {
    // Server configuration
    server: {
        port: 4004,
        corsOrigin: 'http://localhost:5173',
        sessionSecret: 'crudclinic_session_secret_2024',
        jwtSecret: 'crudclinic_jwt_secret_2024',
        jwtExpiresIn: '24h'
    },
    
    // Database configuration (Supabase)
    database: {
        host: 'aws-0-us-east-2.pooler.supabase.com',
        user: 'postgres.civcdniazjqwjvmyyghg',
        password: '9rxTs4apiSgnlRXA',
        database: 'postgres',
        port: 6543,
        ssl: { rejectUnauthorized: false }
    },
    
    // File upload configuration
    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: [
            'text/csv'
        ],
        uploadPath: './uploads'
    },
    
    // Environment
    environment: 'development'
};

export default config;
