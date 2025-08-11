// CrudClinic - Agenda Médica Inteligente
// Aplicación principal

class CrudClinicApp {
    constructor() {
        this.currentUser = { username: 'admin', role: 'admin' }; // Usuario por defecto
        this.currentView = 'dashboard';
        this.apiBase = '/api';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showMainApp(); // Mostrar directamente la aplicación sin login
    }

    setupEventListeners() {
        // Logout (ahora solo para mostrar el usuario)
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAlert('Sesión cerrada', 'info');
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.getAttribute('data-view');
                if (view) {
                    this.navigateToView(view);
                }
            });
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadCurrentView();
        });

        // Modal save buttons
        document.getElementById('saveCitaBtn').addEventListener('click', () => this.saveCita());
        document.getElementById('savePacienteBtn').addEventListener('click', () => this.savePaciente());
        document.getElementById('saveMedicoBtn').addEventListener('click', () => this.saveMedico());
        document.getElementById('saveEspecialidadBtn').addEventListener('click', () => this.saveEspecialidad());

        // Upload forms
        document.getElementById('csvUploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadCSV();
        });

        document.getElementById('excelUploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadExcel();
        });
    }

    showMainApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        // Set default user info
        this.currentUser = { username: 'admin', role: 'admin' };
        document.getElementById('userInfo').textContent = this.currentUser.username;
        document.getElementById('currentUser').textContent = this.currentUser.username;

        // Load initial view
        this.navigateToView('dashboard');
    }

    navigateToView(view) {
        this.currentView = view;
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            citas: 'Gestión de Citas',
            pacientes: 'Gestión de Pacientes',
            medicos: 'Gestión de Médicos',
            especialidades: 'Gestión de Especialidades',
            upload: 'Carga de Datos'
        };
        document.getElementById('pageTitle').textContent = titles[view] || 'Dashboard';

        // Show/hide views
        document.querySelectorAll('.view-content').forEach(v => v.classList.add('hidden'));
        document.getElementById(`${view}View`).classList.remove('hidden');

        // Load data for current view
        this.loadCurrentView();
    }

    async loadCurrentView() {
        switch (this.currentView) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'citas':
                await this.loadCitas();
                break;
            case 'pacientes':
                await this.loadPacientes();
                break;
            case 'medicos':
                await this.loadMedicos();
                break;
            case 'especialidades':
                await this.loadEspecialidades();
                break;
        }
    }

    async loadDashboard() {
        try {
            const [citasResponse, pacientesResponse, medicosResponse, proximasResponse] = await Promise.all([
                fetch(`${this.apiBase}/citas/count`),
                fetch(`${this.apiBase}/pacientes/count`),
                fetch(`${this.apiBase}/medicos/count`),
                fetch(`${this.apiBase}/citas/proximas`)
            ]);

            const citasCount = await citasResponse.json();
            const pacientesCount = await pacientesResponse.json();
            const medicosCount = await medicosResponse.json();
            const proximasCitas = await proximasResponse.json();

            document.getElementById('totalCitas').textContent = citasCount.count || 0;
            document.getElementById('totalPacientes').textContent = pacientesCount.count || 0;
            document.getElementById('totalMedicos').textContent = medicosCount.count || 0;
            document.getElementById('citasHoy').textContent = proximasCitas.length || 0;

            this.renderProximasCitas(proximasCitas);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    renderProximasCitas(citas) {
        const tbody = document.getElementById('proximasCitasTable');
        tbody.innerHTML = '';

        if (citas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay citas próximas</td></tr>';
            return;
        }

        citas.forEach(cita => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cita.paciente_nombre} ${cita.paciente_apellido}</td>
                <td>Dr. ${cita.medico_nombre} ${cita.medico_apellido}</td>
                <td>${new Date(cita.fecha_cita).toLocaleString()}</td>
                <td><span class="badge bg-${this.getEstadoColor(cita.estado)}">${cita.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="app.editCita(${cita.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getEstadoColor(estado) {
        const colors = {
            'programada': 'warning',
            'confirmada': 'info',
            'en_proceso': 'primary',
            'completada': 'success',
            'cancelada': 'danger'
        };
        return colors[estado] || 'secondary';
    }

    async loadCitas() {
        try {
            const response = await fetch(`${this.apiBase}/citas`);
            const citas = await response.json();
            this.renderCitas(citas);
        } catch (error) {
            console.error('Error loading citas:', error);
        }
    }

    renderCitas(citas) {
        const tbody = document.getElementById('citasTable');
        tbody.innerHTML = '';

        if (citas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay citas registradas</td></tr>';
            return;
        }

        citas.forEach(cita => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cita.id}</td>
                <td>${cita.paciente_nombre} ${cita.paciente_apellido}</td>
                <td>Dr. ${cita.medico_nombre} ${cita.medico_apellido}</td>
                <td>${cita.especialidad_nombre}</td>
                <td>${new Date(cita.fecha_cita).toLocaleString()}</td>
                <td><span class="badge bg-${this.getEstadoColor(cita.estado)}">${cita.estado}</span></td>
                <td>$${cita.monto || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="app.editCita(${cita.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteCita(${cita.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadPacientes() {
        try {
            const response = await fetch(`${this.apiBase}/pacientes`);
            const pacientes = await response.json();
            this.renderPacientes(pacientes);
        } catch (error) {
            console.error('Error loading pacientes:', error);
        }
    }

    renderPacientes(pacientes) {
        const tbody = document.getElementById('pacientesTable');
        tbody.innerHTML = '';

        if (pacientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay pacientes registrados</td></tr>';
            return;
        }

        pacientes.forEach(paciente => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${paciente.id}</td>
                <td>${paciente.nombre} ${paciente.apellido}</td>
                <td>${paciente.email || '-'}</td>
                <td>${paciente.telefono || '-'}</td>
                <td>${paciente.fecha_nacimiento || '-'}</td>
                <td>${paciente.genero || '-'}</td>
                <td><span class="badge bg-${paciente.estado ? 'success' : 'danger'}">${paciente.estado ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="app.editPaciente(${paciente.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deletePaciente(${paciente.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadMedicos() {
        try {
            const response = await fetch(`${this.apiBase}/medicos`);
            const medicos = await response.json();
            this.renderMedicos(medicos);
        } catch (error) {
            console.error('Error loading medicos:', error);
        }
    }

    renderMedicos(medicos) {
        const tbody = document.getElementById('medicosTable');
        tbody.innerHTML = '';

        if (medicos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay médicos registrados</td></tr>';
            return;
        }

        medicos.forEach(medico => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${medico.id}</td>
                <td>Dr. ${medico.nombre} ${medico.apellido}</td>
                <td>${medico.email}</td>
                <td>${medico.telefono || '-'}</td>
                <td>${medico.especialidad_nombre}</td>
                <td>${medico.licencia_medica}</td>
                <td><span class="badge bg-${medico.estado ? 'success' : 'danger'}">${medico.estado ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="app.editMedico(${medico.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteMedico(${medico.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadEspecialidades() {
        try {
            const response = await fetch(`${this.apiBase}/especialidades`);
            const especialidades = await response.json();
            this.renderEspecialidades(especialidades);
        } catch (error) {
            console.error('Error loading especialidades:', error);
        }
    }

    renderEspecialidades(especialidades) {
        const tbody = document.getElementById('especialidadesTable');
        tbody.innerHTML = '';

        if (especialidades.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay especialidades registradas</td></tr>';
            return;
        }

        especialidades.forEach(especialidad => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${especialidad.id}</td>
                <td>${especialidad.nombre}</td>
                <td>${especialidad.descripcion || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="app.editEspecialidad(${especialidad.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteEspecialidad(${especialidad.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // CRUD Operations
    async saveCita() {
        const citaData = {
            paciente_id: document.getElementById('citaPaciente').value,
            medico_id: document.getElementById('citaMedico').value,
            fecha_cita: document.getElementById('citaFecha').value,
            duracion_minutos: document.getElementById('citaDuracion').value,
            motivo_consulta: document.getElementById('citaMotivo').value,
            metodo_pago_id: document.getElementById('citaMetodoPago').value,
            monto: document.getElementById('citaMonto').value,
            notas: document.getElementById('citaNotas').value
        };

        const citaId = document.getElementById('citaId').value;
        const method = citaId ? 'PUT' : 'POST';
        const url = citaId ? `${this.apiBase}/citas/${citaId}` : `${this.apiBase}/citas`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(citaData)
            });

            if (response.ok) {
                this.showAlert('Cita guardada exitosamente', 'success');
                bootstrap.Modal.getInstance(document.getElementById('citaModal')).hide();
                this.loadCurrentView();
            } else {
                const error = await response.json();
                this.showAlert(error.message || 'Error al guardar la cita', 'danger');
            }
        } catch (error) {
            this.showAlert('Error de conexión', 'danger');
        }
    }

    async savePaciente() {
        const pacienteData = {
            nombre: document.getElementById('pacienteNombre').value,
            apellido: document.getElementById('pacienteApellido').value,
            email: document.getElementById('pacienteEmail').value,
            telefono: document.getElementById('pacienteTelefono').value,
            fecha_nacimiento: document.getElementById('pacienteFechaNac').value,
            genero: document.getElementById('pacienteGenero').value,
            direccion: document.getElementById('pacienteDireccion').value,
            documento_identidad: document.getElementById('pacienteDocumento').value
        };

        const pacienteId = document.getElementById('pacienteId').value;
        const method = pacienteId ? 'PUT' : 'POST';
        const url = pacienteId ? `${this.apiBase}/pacientes/${pacienteId}` : `${this.apiBase}/pacientes`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pacienteData)
            });

            if (response.ok) {
                this.showAlert('Paciente guardado exitosamente', 'success');
                bootstrap.Modal.getInstance(document.getElementById('pacienteModal')).hide();
                this.loadCurrentView();
            } else {
                const error = await response.json();
                this.showAlert(error.message || 'Error al guardar el paciente', 'danger');
            }
        } catch (error) {
            this.showAlert('Error de conexión', 'danger');
        }
    }

    async saveMedico() {
        const medicoData = {
            nombre: document.getElementById('medicoNombre').value,
            apellido: document.getElementById('medicoApellido').value,
            email: document.getElementById('medicoEmail').value,
            telefono: document.getElementById('medicoTelefono').value,
            especialidad_id: document.getElementById('medicoEspecialidad').value,
            licencia_medica: document.getElementById('medicoLicencia').value
        };

        const medicoId = document.getElementById('medicoId').value;
        const method = medicoId ? 'PUT' : 'POST';
        const url = medicoId ? `${this.apiBase}/medicos/${medicoId}` : `${this.apiBase}/medicos`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(medicoData)
            });

            if (response.ok) {
                this.showAlert('Médico guardado exitosamente', 'success');
                bootstrap.Modal.getInstance(document.getElementById('medicoModal')).hide();
                this.loadCurrentView();
            } else {
                const error = await response.json();
                this.showAlert(error.message || 'Error al guardar el médico', 'danger');
            }
        } catch (error) {
            this.showAlert('Error de conexión', 'danger');
        }
    }

    async saveEspecialidad() {
        const especialidadData = {
            nombre: document.getElementById('especialidadNombre').value,
            descripcion: document.getElementById('especialidadDescripcion').value
        };

        const especialidadId = document.getElementById('especialidadId').value;
        const method = especialidadId ? 'PUT' : 'POST';
        const url = especialidadId ? `${this.apiBase}/especialidades/${especialidadId}` : `${this.apiBase}/especialidades`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(especialidadData)
            });

            if (response.ok) {
                this.showAlert('Especialidad guardada exitosamente', 'success');
                bootstrap.Modal.getInstance(document.getElementById('especialidadModal')).hide();
                this.loadCurrentView();
            } else {
                const error = await response.json();
                this.showAlert(error.message || 'Error al guardar la especialidad', 'danger');
            }
        } catch (error) {
            this.showAlert('Error de conexión', 'danger');
        }
    }

    // Upload functions
    async uploadCSV() {
        const formData = new FormData();
        const file = document.getElementById('csvFile').files[0];
        const dataType = document.getElementById('csvDataType').value;

        if (!file || !dataType) {
            this.showAlert('Por favor selecciona un archivo y tipo de datos', 'warning', document.getElementById('uploadMessage'));
            return;
        }

        formData.append('file', file);
        formData.append('type', dataType);

        try {
            const response = await fetch(`${this.apiBase}/upload/csv`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                this.showAlert(`Archivo cargado exitosamente. ${result.message}`, 'success', document.getElementById('uploadMessage'));
                document.getElementById('csvUploadForm').reset();
            } else {
                this.showAlert(result.message || 'Error al cargar el archivo', 'danger', document.getElementById('uploadMessage'));
            }
        } catch (error) {
            this.showAlert('Error de conexión', 'danger', document.getElementById('uploadMessage'));
        }
    }

    async uploadExcel() {
        const formData = new FormData();
        const file = document.getElementById('excelFile').files[0];
        const dataType = document.getElementById('excelDataType').value;

        if (!file || !dataType) {
            this.showAlert('Por favor selecciona un archivo y tipo de datos', 'warning', document.getElementById('uploadMessage'));
            return;
        }

        formData.append('file', file);
        formData.append('type', dataType);

        try {
            const response = await fetch(`${this.apiBase}/upload/excel`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                this.showAlert(`Archivo cargado exitosamente. ${result.message}`, 'success', document.getElementById('uploadMessage'));
                document.getElementById('excelUploadForm').reset();
            } else {
                this.showAlert(result.message || 'Error al cargar el archivo', 'danger', document.getElementById('uploadMessage'));
            }
        } catch (error) {
            this.showAlert('Error de conexión', 'danger', document.getElementById('uploadMessage'));
        }
    }

    // Utility functions
    showAlert(message, type, container = null) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        if (container) {
            container.innerHTML = '';
            container.appendChild(alertDiv);
        } else {
            // Show in top bar
            const topBar = document.querySelector('.top-bar');
            topBar.appendChild(alertDiv);
        }

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Initialize the application
const app = new CrudClinicApp();

// Make app globally available for onclick handlers
window.app = app;
