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
    
        document.getElementById('saveclienteBtn').addEventListener('click', () => this.savecliente());
        
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
            Factura: 'Factura',
            clientes: 'clientes',
            Transacción: 'Transacción',
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
            case 'Factura':
                await this.loadCitas();
                break;
            case 'Clientes':
                await this.loadPacientes();
                break;
    }}

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
            
            // Load dropdown data for forms
            await this.loadDropdownData();
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showAlert('Error cargando datos del dashboard', 'danger');
        }
    }

    async loadDropdownData() {
        try {
            // Load pacientes for cita form
            const pacientesResponse = await fetch(`${this.apiBase}/pacientes`);
            const pacientes = await pacientesResponse.json();
            this.populateSelect('citaPaciente', pacientes, 'id', 'nombre', 'apellido');

            // Load medicos for cita form
            const medicosResponse = await fetch(`${this.apiBase}/medicos`);
            const medicos = await medicosResponse.json();
            this.populateSelect('citaMedico', medicos, 'id', 'nombre', 'apellido');

            // Load especialidades for medico form
            const especialidadesResponse = await fetch(`${this.apiBase}/especialidades`);
            const especialidades = await especialidadesResponse.json();
            this.populateSelect('medicoEspecialidad', especialidades, 'id', 'nombre');

            // Load metodos de pago for cita form
            const metodosPagoResponse = await fetch(`${this.apiBase}/metodos-pago`);
            const metodosPago = await metodosPagoResponse.json();
            this.populateSelect('citaMetodoPago', metodosPago, 'id', 'nombre');
        } catch (error) {
            console.error('Error loading dropdown data:', error);
        }
    }

    populateSelect(selectId, data, valueField, ...displayFields) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Clear existing options except the first one
        select.innerHTML = select.options[0] ? select.options[0].outerHTML : '';

        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            
            // Combine display fields
            const displayText = displayFields.map(field => item[field]).filter(Boolean).join(' ');
            option.textContent = displayText;
            
            select.appendChild(option);
        });
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

        // Validate required fields
        if (!citaData.paciente_id || !citaData.medico_id || !citaData.fecha_cita) {
            this.showAlert('Por favor completa todos los campos requeridos', 'warning');
            return;
        }

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
                this.clearForm('citaForm');
            } else {
                const error = await response.json();
                this.showAlert(error.message || 'Error al guardar la cita', 'danger');
            }
        } catch (error) {
            console.error('Error saving cita:', error);
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

    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            // Clear hidden fields
            const hiddenFields = form.querySelectorAll('input[type="hidden"]');
            hiddenFields.forEach(field => field.value = '');
        }
    }

    async editCita(id) {
        try {
            const response = await fetch(`${this.apiBase}/citas/${id}`);
            const cita = await response.json();
            
            // Populate form
            document.getElementById('citaId').value = cita.id;
            document.getElementById('citaPaciente').value = cita.paciente_id;
            document.getElementById('citaMedico').value = cita.medico_id;
            document.getElementById('citaFecha').value = cita.fecha_cita.slice(0, 16); // Format for datetime-local
            document.getElementById('citaDuracion').value = cita.duracion_minutos;
            document.getElementById('citaMotivo').value = cita.motivo_consulta;
            document.getElementById('citaMetodoPago').value = cita.metodo_pago_id;
            document.getElementById('citaMonto').value = cita.monto;
            document.getElementById('citaNotas').value = cita.notas || '';

            // Update modal title
            document.querySelector('#citaModal .modal-title').innerHTML = '<i class="fas fa-edit"></i> Editar Cita';
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('citaModal'));
            modal.show();
        } catch (error) {
            console.error('Error loading cita:', error);
            this.showAlert('Error cargando la cita', 'danger');
        }
    }

    async deleteCita(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/citas/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showAlert('Cita eliminada exitosamente', 'success');
                this.loadCurrentView();
            } else {
                const error = await response.json();
                this.showAlert(error.message || 'Error al eliminar la cita', 'danger');
            }
        } catch (error) {
            console.error('Error deleting cita:', error);
            this.showAlert('Error de conexión', 'danger');
        }
    }

    async editPaciente(id) {
        try {
            const response = await fetch(`${this.apiBase}/pacientes/${id}`);
            const paciente = await response.json();
            
            // Populate form
            document.getElementById('pacienteId').value = paciente.id;
            document.getElementById('pacienteNombre').value = paciente.nombre;
            document.getElementById('pacienteApellido').value = paciente.apellido;
            document.getElementById('pacienteEmail').value = paciente.email;
            document.getElementById('pacienteTelefono').value = paciente.telefono || '';
            document.getElementById('pacienteFechaNac').value = paciente.fecha_nacimiento || '';
            document.getElementById('pacienteGenero').value = paciente.genero || '';
            document.getElementById('pacienteDireccion').value = paciente.direccion || '';
            document.getElementById('pacienteDocumento').value = paciente.documento_identidad || '';

            // Update modal title
            document.querySelector('#pacienteModal .modal-title').innerHTML = '<i class="fas fa-edit"></i> Editar Paciente';
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('pacienteModal'));
            modal.show();
        } catch (error) {
            console.error('Error loading paciente:', error);
            this.showAlert('Error cargando el paciente', 'danger');
        }
    }

    async deletePaciente(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/pacientes/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showAlert('Paciente eliminado exitosamente', 'success');
                this.loadCurrentView();
            } else {
                const error = await response.json();
                this.showAlert(error.message || 'Error al eliminar el paciente', 'danger');
            }
        } catch (error) {
            console.error('Error deleting paciente:', error);
            this.showAlert('Error de conexión', 'danger');
        }
    }

    async editMedico(id) {
        try {
            const response = await fetch(`${this.apiBase}/medicos/${id}`);
            const medico = await response.json();
            
            // Populate form
            document.getElementById('medicoId').value = medico.id;
            document.getElementById('medicoNombre').value = medico.nombre;
            document.getElementById('medicoApellido').value = medico.apellido;
            document.getElementById('medicoEmail').value = medico.email;
            document.getElementById('medicoTelefono').value = medico.telefono || '';
            document.getElementById('medicoEspecialidad').value = medico.especialidad_id || '';
            document.getElementById('medicoLicencia').value = medico.licencia_medica;

            // Update modal title
            document.querySelector('#medicoModal .modal-title').innerHTML = '<i class="fas fa-edit"></i> Editar Médico';
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('medicoModal'));
            modal.show();
        } catch (error) {
            console.error('Error loading medico:', error);
            this.showAlert('Error cargando el médico', 'danger');
        }
    }

    async deleteMedico(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este médico?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/medicos/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showAlert('Médico eliminado exitosamente', 'success');
                this.loadCurrentView();
            } else {
                const error = await response.json();
                this.showAlert(error.message || 'Error al eliminar el médico', 'danger');
            }
        } catch (error) {
            console.error('Error deleting medico:', error);
            this.showAlert('Error de conexión', 'danger');
        }
    }

    async editEspecialidad(id) {
        try {
            const response = await fetch(`${this.apiBase}/especialidades/${id}`);
            const especialidad = await response.json();
            
            // Populate form
            document.getElementById('especialidadId').value = especialidad.id;
            document.getElementById('especialidadNombre').value = especialidad.nombre;
            document.getElementById('especialidadDescripcion').value = especialidad.descripcion || '';

            // Update modal title
            document.querySelector('#especialidadModal .modal-title').innerHTML = '<i class="fas fa-edit"></i> Editar Especialidad';
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('especialidadModal'));
            modal.show();
        } catch (error) {
            console.error('Error loading especialidad:', error);
            this.showAlert('Error cargando la especialidad', 'danger');
        }
    }

    async deleteEspecialidad(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta especialidad?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/especialidades/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showAlert('Especialidad eliminada exitosamente', 'success');
                this.loadCurrentView();
            } else {
                const error = await response.json();
                this.showAlert(error.message || 'Error al eliminar la especialidad', 'danger');
            }
        } catch (error) {
            console.error('Error deleting especialidad:', error);
            this.showAlert('Error de conexión', 'danger');
        }
    }
}

// Initialize the application
const app = new CrudClinicApp();

// Make app globally available for onclick handlers
window.app = app;
