import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

// Import configurations
import { testConnection } from './config/supabase.js';
import { config } from './config/config.js';

// Import routes
import authRoutes from './routes/auth.js';
import pacientesRoutes from './routes/pacientes.js';
import uploadRoutes from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.server.port;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: config.server.corsOrigin,
    credentials: true
}));

// Session configuration
app.use(session({
    secret: config.server.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clientes', pacientesRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'CrudClinic API funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: config.environment
    });
});

// Serve the main HTML file for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: 'La ruta solicitada no existe'
    });
});

// Start server
app.listen(PORT, async () => {
    console.log('🏥 CrudClinic API corriendo en http://localhost:' + PORT);
    console.log('📊 Health check: http://localhost:' + PORT + '/api/health');
    console.log('🔐 Modo: development');
    
    // Test Supabase connection
    await testConnection();
});

export default app;
