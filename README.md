# 🏥 CrudClinic - Agenda Médica Inteligente

Una aplicación web completa para la gestión de citas médicas, desarrollada con tecnologías modernas y siguiendo las mejores prácticas de desarrollo.

## 📋 Descripción del Proyecto

CrudClinic es un sistema integral de gestión médica que permite administrar citas, pacientes, médicos y especialidades de manera eficiente. El proyecto incluye normalización de datos, carga masiva desde archivos y consultas avanzadas.

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- **Login seguro** con JWT y sesiones
- **Roles de usuario** (admin, médico, recepcionista, usuario)
- **Encriptación de contraseñas** con bcrypt
- **Control de acceso** por rutas

### 📊 Gestión Completa de Datos
- **CRUD completo** para:
  - 👥 Pacientes
  - 👨‍⚕️ Médicos
  - 📅 Citas
  - 🏥 Especialidades
- **Dashboard interactivo** con estadísticas en tiempo real
- **Filtros avanzados** por médico, fecha, especialidad
- **Búsqueda y paginación**

### 📁 Carga Masiva de Datos
- **Soporte para CSV** y **Excel** (.xlsx, .xls)
- **Validación automática** de datos
- **Manejo de errores** robusto
- **Procesamiento asíncrono**

### 🎨 Interfaz Moderna
- **Diseño responsive** con Bootstrap 5
- **SPA (Single Page Application)** con JavaScript vanilla
- **Navegación intuitiva** con sidebar
- **Modales para formularios**
- **Feedback visual** con alertas

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación
- **Multer** - Manejo de archivos
- **bcryptjs** - Encriptación

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos y animaciones
- **JavaScript ES6+** - Lógica de aplicación
- **Bootstrap 5** - Framework CSS
- **Font Awesome** - Iconografía

### Herramientas de Desarrollo
- **Vite** - Build tool y dev server
- **Nodemon** - Auto-reload del servidor
- **Dotenv** - Variables de entorno

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- PostgreSQL
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd crudclinic
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:
```env
DB_HOST=tu_host
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_base_de_datos
DB_PORT=5432
DB_SSL=false
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h
SESSION_SECRET=tu_session_secret
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:5173
PORT=4000
```

### 4. Configurar la base de datos
```bash
npm run db:setup
```

### 5. Iniciar la aplicación
```bash
# Desarrollo (frontend + backend)
npm start

# Solo frontend
npm run dev

# Solo backend
npm run server
```

## 📱 Uso de la Aplicación

### Acceso Inicial
- **URL**: `http://localhost:5173`
- **Usuario por defecto**: `admin`
- **Contraseña**: `admin123`

### Funcionalidades Principales

#### Dashboard
- Estadísticas en tiempo real
- Próximas citas
- Resumen de actividad

#### Gestión de Pacientes
- Crear, editar, eliminar pacientes
- Búsqueda y filtros
- Historial de citas

#### Gestión de Médicos
- Registro de médicos por especialidad
- Gestión de licencias médicas
- Horarios y disponibilidad

#### Gestión de Citas
- Programación de citas
- Estados: programada, confirmada, en proceso, completada, cancelada
- Filtros por médico y fecha

#### Carga Masiva
- Subir archivos CSV/Excel
- Validación automática
- Reporte de resultados

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Verificar sesión

### Pacientes
- `GET /api/pacientes` - Listar pacientes
- `POST /api/pacientes` - Crear paciente
- `PUT /api/pacientes/:id` - Actualizar paciente
- `DELETE /api/pacientes/:id` - Eliminar paciente

### Médicos
- `GET /api/medicos` - Listar médicos
- `POST /api/medicos` - Crear médico
- `PUT /api/medicos/:id` - Actualizar médico
- `DELETE /api/medicos/:id` - Eliminar médico

### Citas
- `GET /api/citas` - Listar citas
- `POST /api/citas` - Crear cita
- `PUT /api/citas/:id` - Actualizar cita
- `DELETE /api/citas/:id` - Eliminar cita

### Carga de Archivos
- `POST /api/upload/csv` - Cargar CSV
- `POST /api/upload/excel` - Cargar Excel

## 📊 Consultas Avanzadas

### Ejemplos de Consultas SQL
```sql
-- Citas por médico en un rango de fechas
SELECT c.*, p.nombre as paciente_nombre, m.nombre as medico_nombre
FROM citas c
JOIN pacientes p ON c.paciente_id = p.id
JOIN medicos m ON c.medico_id = m.id
WHERE m.id = $1 AND c.fecha_cita BETWEEN $2 AND $3;

-- Pacientes con más de 3 citas
SELECT p.*, COUNT(c.id) as total_citas
FROM pacientes p
JOIN citas c ON p.id = c.paciente_id
GROUP BY p.id
HAVING COUNT(c.id) > 3;

-- Ingresos por método de pago
SELECT mp.nombre, SUM(c.monto) as total_ingresos
FROM citas c
JOIN metodos_pago mp ON c.metodo_pago_id = mp.id
WHERE c.fecha_cita BETWEEN $1 AND $2
GROUP BY mp.id, mp.nombre;
```

## 🧪 Testing

### Pruebas de Funcionalidad
```bash
# Verificar conexión a base de datos
npm run db:setup

# Probar endpoints de la API
curl http://localhost:4000/api/health
```

## 📁 Estructura del Proyecto

```
crudclinic/
├── server/
│   ├── routes/           # Rutas de la API
│   ├── middleware/       # Middleware personalizado
│   ├── models/          # Modelos de datos
│   ├── controllers/     # Controladores
│   └── index.js         # Servidor principal
├── src/
│   └── app.js           # Lógica del frontend
├── scripts/
│   ├── setup-database.js # Configuración de BD
│   └── seed-data.js     # Datos de prueba
├── uploads/             # Archivos subidos
├── public/              # Archivos estáticos
├── index.html           # Página principal
├── package.json         # Dependencias
├── vite.config.js       # Configuración de Vite
└── README.md           # Documentación
```

## 🔒 Seguridad

### Medidas Implementadas
- **Validación de entrada** en todos los endpoints
- **Sanitización de datos** antes de insertar en BD
- **Control de acceso** basado en roles
- **Rate limiting** para prevenir ataques
- **CORS configurado** para desarrollo/producción
- **Variables de entorno** para datos sensibles

## 🚀 Despliegue

### Producción
1. Configurar variables de entorno para producción
2. Build del frontend: `npm run build`
3. Configurar servidor web (nginx/apache)
4. Configurar PM2 para Node.js
5. Configurar SSL/TLS

### Docker (Opcional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Juan Velez** - Desarrollo inicial

## 🙏 Agradecimientos

- Bootstrap por el framework CSS
- Font Awesome por los iconos
- Vite por las herramientas de desarrollo
- PostgreSQL por la base de datos

---

**🏥 CrudClinic - Agenda Médica Inteligente**  
*Gestionando la salud del futuro, hoy.*
