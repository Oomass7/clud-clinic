# 🏥 CrudClinic - Medical Appointment Management System

A complete web application for medical appointment management, developed with modern technologies and following best development practices.

## 📋 Project Description

CrudClinic is an integral medical management system that allows efficient administration of appointments, patients, doctors, and specialties. The project includes data normalization, bulk data loading from files, and advanced queries.

## ✨ Main Features

### 🔐 Authentication and Security
- **Secure login** with JWT and sessions
- **User roles** (admin, doctor, receptionist, user)
- **Password encryption** with bcrypt
- **Route access control**

### 📊 Complete Data Management
- **Full CRUD** for:
  - 👥 Patients
  - 👨‍⚕️ Doctors
  - 📅 Appointments
  - 🏥 Specialties
- **Interactive dashboard** with real-time statistics
- **Advanced filters** by doctor, date, specialty
- **Search and pagination**

### 📁 Bulk Data Loading
- **CSV file support**
- **Automatic data validation**
- **Robust error handling**
- **Asynchronous processing**

### 🎨 Modern Interface
- **Responsive design** with Bootstrap 5
- **SPA (Single Page Application)** with vanilla JavaScript
- **Intuitive navigation** with sidebar
- **Modals for forms**
- **Visual feedback** with alerts

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **Multer** - File handling
- **bcryptjs** - Encryption

### Frontend
- **HTML5** - Semantic structure
- **CSS3** - Styles and animations
- **JavaScript ES6+** - Application logic
- **Bootstrap 5** - CSS framework
- **Font Awesome** - Iconography

### Development Tools
- **Vite** - Build tool and dev server
- **Nodemon** - Server auto-reload

## 🚀 Installation and Configuration

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (or Supabase)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd API_Connection
```

### 2. Install all dependencies
```bash
npm run install:all
```

### 3. Configure the database
```bash
npm run db:setup
```

### 4. Load sample data
```bash
npm run db:seed
```

### 5. Start the application
```bash
# Development (frontend + backend)
npm run dev

# Only backend
npm run backend

# Only frontend
npm run frontend
```

## 📱 Application Usage

### Initial Access
- **URL**: `http://localhost:5173`
- **Default user**: `admin`
- **Password**: `admin123`

### Main Functionalities

#### Dashboard
- Real-time statistics
- Upcoming appointments
- Activity summary

#### Patient Management
- Create, edit, delete patients
- Search and filters
- Appointment history

#### Doctor Management
- Doctor registration by specialty
- Medical license management
- Schedules and availability

#### Appointment Management
- Appointment scheduling
- States: scheduled, confirmed, in progress, completed, cancelled
- Filters by doctor and date

#### Bulk Loading
- Upload CSV files
- Automatic validation
- Results report

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Verify session

### Patients
- `GET /api/pacientes` - List patients
- `POST /api/pacientes` - Create patient
- `PUT /api/pacientes/:id` - Update patient
- `DELETE /api/pacientes/:id` - Delete patient

### Doctors
- `GET /api/medicos` - List doctors
- `POST /api/medicos` - Create doctor
- `PUT /api/medicos/:id` - Update doctor
- `DELETE /api/medicos/:id` - Delete doctor

### Appointments
- `GET /api/citas` - List appointments
- `POST /api/citas` - Create appointment
- `PUT /api/citas/:id` - Update appointment
- `DELETE /api/citas/:id` - Delete appointment

### File Upload
- `POST /api/upload/csv` - Upload CSV

## 📊 Advanced Queries

### SQL Query Examples
```sql
-- Appointments by doctor in a date range
SELECT c.*, p.nombre as paciente_nombre, m.nombre as medico_nombre
FROM citas c
JOIN pacientes p ON c.paciente_id = p.id
JOIN medicos m ON c.medico_id = m.id
WHERE m.id = $1 AND c.fecha_cita BETWEEN $2 AND $3;

-- Patients with more than 3 appointments
SELECT p.*, COUNT(c.id) as total_citas
FROM pacientes p
JOIN citas c ON p.id = c.paciente_id
GROUP BY p.id
HAVING COUNT(c.id) > 3;

-- Revenue by payment method
SELECT mp.nombre, SUM(c.monto) as total_ingresos
FROM citas c
JOIN metodos_pago mp ON c.metodo_pago_id = mp.id
WHERE c.fecha_cita BETWEEN $1 AND $2
GROUP BY mp.id, mp.nombre;
```

## 🧪 Testing

### Functionality Tests
```bash
# Verify database connection
npm run test:connection

# Test API endpoints
curl http://localhost:4000/api/health
```

## 📁 Project Structure

```
crudclinic/
├── backend/              # Backend application
│   ├── config/          # Configuration files
│   ├── routes/          # API routes
│   ├── scripts/         # Database scripts
│   ├── uploads/         # Uploaded files
│   ├── index.js         # Main server file
│   └── package.json     # Backend dependencies
├── frontend/            # Frontend application
│   ├── src/            # Source files
│   ├── index.html      # Main HTML file
│   ├── vite.config.js  # Vite configuration
│   └── package.json    # Frontend dependencies
├── package.json         # Main project file
└── README.md           # Documentation
```

## 🔒 Security

### Implemented Measures
- **Input validation** in all endpoints
- **Data sanitization** before database insertion
- **Role-based access control**
- **Rate limiting** to prevent attacks
- **CORS configured** for development/production
- **Centralized configuration** without environment variables

## 🚀 Deployment

### Production
1. Configure production settings
2. Build frontend: `npm run build`
3. Configure web server (nginx/apache)
4. Configure PM2 for Node.js
5. Configure SSL/TLS

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is under the MIT License. See the `LICENSE` file for more details.

## 👥 Authors

- **Juan Velez** - Initial development

## 🙏 Acknowledgments

- Bootstrap for the CSS framework
- Font Awesome for the icons
- Vite for development tools
- PostgreSQL for the database

---

**🏥 CrudClinic - Medical Appointment Management System**  
*Managing the health of the future, today.*
