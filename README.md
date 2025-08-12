# Assessment

## 📋 Project Description

This is a project that will help several companies to be able to organize themselves better.

## ✨ Main Features

### 📊 Complete Data Management
- **Full CRUD** for:
  - 👥 Clients

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

#### client Management
- Create, edit, delete clients
- Search and filters
- Appointment history

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

- **Mari Carmona** - Initial development

## 🙏 Acknowledgments

- Bootstrap for the CSS framework
- Font Awesome for the icons
- Vite for development tools
- PostgreSQL for the database
