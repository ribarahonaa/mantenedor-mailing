// Mantenedor de Mailings - Innk
class MailingApp {
    constructor() {
        this.apiBaseUrl = '/api';
        this.currentUser = null;
        this.currentNewsletter = null;
        this.newsletterSections = [];
        this.isEditingMasterSection = false; // Nueva variable de estado
        this.editingSectionId = null; // ID de la sección que se está editando
        this.masterSections = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }
    
    setupEventListeners() {
        // Login/Register tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
        
        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
        
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });
        
        // Create newsletter
        document.getElementById('createNewsletterBtn').addEventListener('click', () => {
            this.createNewsletter();
        });
        
        // Back buttons
        document.getElementById('backToNewslettersBtn').addEventListener('click', () => {
            this.switchView('newsletters');
        });
        
        document.getElementById('backToNewslettersFromEditorBtn').addEventListener('click', () => {
            this.switchView('newsletters');
        });
        
        // Refresh newsletters
        document.getElementById('refreshNewslettersBtn').addEventListener('click', () => {
            this.loadNewsletters();
        });
        
        // Add master section (admin only)
        document.getElementById('addMasterSectionBtn').addEventListener('click', () => {
            this.showMasterSectionModal();
        });
        
        // Master section modal
        document.getElementById('saveMasterSectionBtn').addEventListener('click', () => {
            if (this.isEditingMasterSection) {
                this.updateMasterSection(this.editingSectionId);
            } else {
                this.saveMasterSection();
            }
        });
        
        document.getElementById('cancelMasterSectionBtn').addEventListener('click', () => {
            this.hideMasterSectionModal();
        });
        
        // Editor de código HTML
        document.getElementById('formatHtmlBtn').addEventListener('click', () => {
            this.formatHtmlCode();
        });
        
        document.getElementById('previewHtmlBtn').addEventListener('click', () => {
            this.previewHtmlCode();
        });
        
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreenEditor();
        });
        
        // Modal de edición de secciones
        document.getElementById('saveSectionBtn').addEventListener('click', () => {
            // La función se configura dinámicamente en showSectionEditorModal
        });
        
        document.getElementById('cancelSectionBtn').addEventListener('click', () => {
            document.getElementById('sectionEditorModal').style.display = 'none';
            // Limpiar el contenido del editor
            document.getElementById('sectionEditorContent').innerHTML = '';
        });
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                    
                    // Si es el modal de sección maestra, restaurar el comportamiento
                    if (modal.id === 'masterSectionModal') {
                        this.hideMasterSectionModal();
                    }
                    // Si es el modal de edición de secciones, limpiar el contenido
                    else if (modal.id === 'sectionEditorModal') {
                        document.getElementById('sectionEditorContent').innerHTML = '';
                    }
                }
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                // Si es el modal de sección maestra, restaurar el comportamiento
                if (e.target.id === 'masterSectionModal') {
                    this.hideMasterSectionModal();
                } else if (e.target.id === 'sectionEditorModal') {
                    e.target.style.display = 'none';
                    // Limpiar el contenido del editor
                    document.getElementById('sectionEditorContent').innerHTML = '';
                } else {
                    e.target.style.display = 'none';
                }
            }
        });

        // Newsletter editor
        document.getElementById('saveNewsletterBtn').addEventListener('click', () => {
            this.saveNewsletter();
        });

        document.getElementById('previewNewsletterBtn').addEventListener('click', () => {
            this.previewNewsletter();
        });

        document.getElementById('copyNewsletterHtmlBtn').addEventListener('click', () => {
            this.copyNewsletterHtml();
        });

        document.getElementById('backToNewslettersBtn').addEventListener('click', () => {
            this.switchView('newsletters');
        });
    }
    
    // Authentication methods
    async login() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.currentUser = data.user;
                
                this.showMainApp();
                this.loadInitialData();
                this.showNotification('Login exitoso', 'success');
            } else {
                this.showNotification(data.error, 'error');
            }
        } catch (error) {
            this.showNotification('Error de conexión', 'error');
        }
    }
    
    async register() {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.currentUser = data.user;
                this.showMainApp();
                this.loadInitialData();
                this.showNotification('Usuario creado exitosamente', 'success');
            } else {
                this.showNotification(data.error, 'error');
            }
        } catch (error) {
            this.showNotification('Error de conexión', 'error');
        }
    }
    
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUser = null;
        
        // Quitar clase app-active del body
        document.body.classList.remove('app-active');
        
        this.showLoginScreen();
        this.showNotification('Sesión cerrada', 'info');
    }
    
    checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            try {
                this.currentUser = JSON.parse(user);
                this.showMainApp();
                this.loadInitialData();
            } catch (error) {
                this.showLoginScreen();
            }
        } else {
            this.showLoginScreen();
        }
    }
    
    // UI methods
    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        document.querySelectorAll('.login-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tab}Form`).classList.add('active');
    }
    
    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen && mainApp) {
            // Quitar la clase app-active del body
            document.body.classList.remove('app-active');
            
            // Mostrar login
            loginScreen.classList.remove('hidden');
            loginScreen.style.display = 'flex';
            
            // Ocultar app principal
            mainApp.classList.add('hidden');
            mainApp.style.display = 'none';
        }
    }
    
    showMainApp() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen && mainApp) {
            // Agregar la clase app-active al body
            document.body.classList.add('app-active');
            
            // Ocultar login
            loginScreen.classList.add('hidden');
            loginScreen.style.display = 'none';
            
            // Mostrar app principal
            mainApp.classList.remove('hidden');
            mainApp.style.display = 'block';
            
            // Update user info
            const usernameElement = document.getElementById('currentUsername');
            const roleElement = document.getElementById('userRole');
            
            if (usernameElement && roleElement) {
                usernameElement.textContent = this.currentUser.username;
                roleElement.textContent = this.currentUser.role;
            } else {
                console.warn('⚠️ No se encontraron elementos de usuario');
            }
            
            // Show/hide admin elements
            const adminElements = document.querySelectorAll('.admin-only');
            
            adminElements.forEach(el => {
                el.style.display = this.currentUser.role === 'admin' ? 'block' : 'none';
            });
            
        } else {
            console.error('❌ No se pudieron encontrar los elementos de la interfaz');
        }
    }
    
    switchView(view) {
        // Hide all views
        document.querySelectorAll('.content-view').forEach(v => {
            v.classList.remove('active');
        });
        
        // Show selected view
        const targetView = document.getElementById(`${view}View`);
        if (targetView) {
            targetView.classList.add('active');
        } else {
            console.error('❌ No se encontró la vista:', `${view}View`);
            return;
        }
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeNavBtn = document.querySelector(`[data-view="${view}"]`);
        if (activeNavBtn) {
            activeNavBtn.classList.add('active');
        } else {
            console.warn('⚠️ No se encontró el botón de navegación para:', view);
        }
        
        // Load data for specific views
        if (view === 'newsletters') {
            this.loadNewsletters();
        } else if (view === 'masterSections') {
            this.loadMasterSections();
        } else if (view === 'createNewsletter') {
            // No need to load data for create newsletter view
        }
    }
    
    // Data loading methods
    async loadInitialData() {
        try {
            await Promise.all([
                this.loadNewsletters(),
                this.loadMasterSections()
            ]);
        } catch (error) {
            console.error('❌ Error cargando datos iniciales:', error);
        }
    }
    
    async loadNewsletters() {
        try {
            const response = await this.apiRequest('/newsletters');
            if (response.ok) {
                const data = await response.json();
                this.renderNewsletters(data.newsletters);
            }
        } catch (error) {
            this.showNotification('Error cargando newsletters', 'error');
        }
    }
    
    async loadMasterSections() {
        try {
            const response = await this.apiRequest('/master-sections');
            if (!response.ok) {
                if (response.status === 403) {
                    console.warn('⚠️ Acceso denegado a secciones maestras');
                } else {
                    this.showNotification('Error cargando secciones maestras', 'error');
                }
                return;
            }

            const data = await response.json();
            this.masterSections = Array.isArray(data.sections) ? data.sections : [];

            if (this.currentUser.role === 'admin') {
                this.renderMasterSections(this.masterSections);
            }

            this.renderAvailableSections();
        } catch (error) {
            console.error('❌ Error cargando secciones maestras:', error);
            this.showNotification('Error cargando secciones maestras', 'error');
        }
    }
    
    // API helper method
    async apiRequest(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        return fetch(`${this.apiBaseUrl}${endpoint}`, finalOptions);
    }
    
    // Newsletter methods
    async createNewsletter() {
        const name = document.getElementById('newsletterName').value;
        const description = document.getElementById('newsletterDescription').value;
        
        if (!name.trim()) {
            this.showNotification('El nombre del newsletter es requerido', 'error');
            return;
        }
        
        try {
            const response = await this.apiRequest('/newsletters', {
                method: 'POST',
                body: JSON.stringify({ name, description })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showNotification('Newsletter creado exitosamente', 'success');
                this.switchView('newsletters');
                document.getElementById('newsletterName').value = '';
                document.getElementById('newsletterDescription').value = '';
            } else {
                this.showNotification(data.error, 'error');
            }
        } catch (error) {
            this.showNotification('Error creando newsletter', 'error');
        }
    }
    
    async openNewsletterEditor(newsletterId) {
        try {
            const response = await this.apiRequest(`/newsletters/${newsletterId}`);
            if (response.ok) {
                const data = await response.json();
                this.currentNewsletter = data.newsletter;
                
                // Asegurar que newsletterSections es un array válido
                this.newsletterSections = Array.isArray(data.newsletter.sections) 
                    ? data.newsletter.sections 
                    : (Array.isArray(data.sections) ? data.sections : []);
                

                document.getElementById('editorTitle').textContent = `Editor: ${data.newsletter.name}`;
                this.switchView('newsletterEditor');
                this.renderNewsletterEditor();
            }
        } catch (error) {
            console.error('Error abriendo newsletter:', error);
            this.showNotification('Error abriendo newsletter', 'error');
        }
    }

    async duplicateNewsletter(newsletterId, name, description) {
        if (!newsletterId) {
            this.showNotification('Newsletter inválido para duplicar', 'error');
            return;
        }

        try {
            const response = await this.apiRequest(`/newsletters/${newsletterId}/duplicate`, {
                method: 'POST',
                body: JSON.stringify({ name, description })
            });

            let data = null;
            try {
                data = await response.json();
            } catch (parseError) {
                console.warn('⚠️ No se pudo parsear la respuesta de duplicación:', parseError);
            }

            if (!response.ok) {
                const message = data?.error || 'Error duplicando newsletter';
                this.showNotification(message, 'error');
                return;
            }

            this.showNotification('Newsletter duplicado exitosamente', 'success');

            await this.loadNewsletters();

            if (data?.newsletter?.id) {
                this.openNewsletterEditor(data.newsletter.id);
            }
        } catch (error) {
            console.error('❌ Error duplicando newsletter:', error);
            this.showNotification('Error duplicando newsletter', 'error');
        }
    }
    generateNewsletterHtml() {
        if (!this.currentNewsletter) {
            return null;
        }

        if (!Array.isArray(this.newsletterSections) || this.newsletterSections.length === 0) {
            return null;
        }

        const sectionsHtml = this.newsletterSections
            .map(section => section?.content?.html || '')
            .filter(html => html && html.trim().length > 0)
            .join('\n\n');

        const trimmedSections = sectionsHtml.trim();
        if (!trimmedSections) {
            return null;
        }

        const title = this.escapeHtml(this.currentNewsletter.name || 'Newsletter sin título');
        const wrapperStyle = [
            'margin: 0;',
            'padding: 32px 0;',
            'width: 100%;',
            'background-color: #f3f4f6;'
        ].join(' ');
        const containerStyle = [
            'width: 100%;',
            'max-width: 600px;',
            'margin: 0 auto;',
            'background-color: #ffffff;',
            'box-sizing: border-box;',
            "font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;",
            'color: #1f2937;',
            'line-height: 1.6;'
        ].join(' ');

        return `<!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f3f4f6;">
                <div style="${wrapperStyle}">
                    <div style="${containerStyle}">
                        ${trimmedSections}
                    </div>
                </div>
            </body>
            </html>`;
    }

    previewNewsletter() {
        if (!this.currentNewsletter) {
            this.showNotification('No hay newsletter seleccionado para previsualizar', 'warning');
            return;
        }

        const htmlDocument = this.generateNewsletterHtml();
        if (!htmlDocument) {
            this.showNotification('El newsletter no tiene contenido para previsualizar', 'warning');
            return;
        }

        const previewWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');

        if (!previewWindow) {
            this.showNotification('No se pudo abrir la vista previa. Verifica que no esté bloqueado el popup.', 'error');
            return;
        }

        previewWindow.document.open();
        previewWindow.document.write(htmlDocument);
        previewWindow.document.close();
        previewWindow.focus();

        this.showNotification('Vista previa abierta en una nueva pestaña', 'info');
    }

    async copyNewsletterHtml() {
        if (!this.currentNewsletter) {
            this.showNotification('No hay newsletter seleccionado para copiar', 'warning');
            return;
        }

        const htmlDocument = this.generateNewsletterHtml();
        if (!htmlDocument) {
            this.showNotification('El newsletter no tiene contenido para copiar', 'warning');
            return;
        }

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(htmlDocument);
                this.showNotification('Código HTML copiado al portapapeles', 'success');
                return;
            }
        } catch (error) {
            console.warn('⚠️ No se pudo copiar usando navigator.clipboard:', error);
        }

        const textarea = document.createElement('textarea');
        textarea.value = htmlDocument;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);

        let copySuccessful = false;
        try {
            textarea.select();
            copySuccessful = document.execCommand('copy');
        } catch (error) {
            console.warn('⚠️ No se pudo copiar usando execCommand:', error);
        } finally {
            document.body.removeChild(textarea);
        }

        if (copySuccessful) {
            this.showNotification('Código HTML copiado al portapapeles', 'success');
        } else {
            this.showNotification('No se pudo copiar automáticamente. Selecciona y copia manualmente.', 'warning');
        }
    }

    // Delete a newsletter by id
    async deleteNewsletter(newsletterId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este newsletter? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            let token = localStorage.getItem('token');
            let response = await fetch(`/api/newsletters/${newsletterId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            let result = await response.json();
            // Backend may return { success: true } or { message: '...' }
            if (result && (result.success || result.message)) {
                this.showNotification('Newsletter eliminado exitosamente', 'success');
                this.loadNewsletters(); // refresh list
            } else {
                this.showNotification('No se pudo confirmar la eliminación en la respuesta del servidor', 'error');
            }
        } catch (error) {
            this.showNotification('Error eliminando newsletter: ' + error.message, 'error');
        }
    }
    
    // Rendering methods
    renderNewsletters(newsletters) {
        const container = document.getElementById('newslettersList');
        
        if (newsletters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <p>No tienes newsletters creados</p>
                    <p>Crea tu primer newsletter para comenzar</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = newsletters.map(newsletter => `
            <div class="newsletter-card" data-id="${newsletter.id}">
                <div class="newsletter-info">
                    <h3>${newsletter.name}</h3>
                    <p>${newsletter.description || 'Sin descripción'}</p>
                    <div class="newsletter-meta">
                        <span class="status ${newsletter.status}">${newsletter.status}</span>
                        <span class="sections-count">${newsletter.sections_count || 0} secciones</span>
                        <span class="last-update">${new Date(newsletter.last_section_update || newsletter.updated_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="newsletter-actions">
                    <button class="edit-btn" onclick="app.openNewsletterEditor(${newsletter.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="duplicate-btn" onclick="app.duplicateNewsletter(${newsletter.id}, '${newsletter.name}', '${newsletter.description}')">
                        <i class="fas fa-copy"></i> Duplicar
                    </button>
                    <button class="delete-btn" onclick="app.deleteNewsletter(${newsletter.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderMasterSections(sections) {
        const container = document.getElementById('masterSectionsList');
        
        if (sections.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-puzzle-piece"></i>
                    <p>No hay secciones maestras creadas</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = sections.map(section => `
            <div class="master-section-card" data-id="${section.id}">
                <div class="section-info">
                    <h3>${section.name}</h3>
                    <p class="section-type">${section.type}</p>
                    <p class="section-title">${section.title}</p>
                </div>
                <div class="section-actions">
                    <button class="edit-btn" onclick="app.editMasterSection(${section.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="duplicate-btn" onclick="app.duplicateMasterSection(${section.id})">
                        <i class="fas fa-copy"></i> Duplicar
                    </button>
                    <button class="delete-btn" onclick="app.deleteMasterSection(${section.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Newsletter editor methods
    async renderNewsletterEditor() {

        // Asegurar que las secciones maestras estén cargadas
        if (!this.masterSections || !Array.isArray(this.masterSections) || this.masterSections.length === 0) {
            await this.loadMasterSections();
        }
        
        // Renderizar secciones existentes
        this.renderNewsletterSections();
        
        // Renderizar secciones disponibles
        this.renderAvailableSections();
    }
    
    renderNewsletterSections() {
        const container = document.getElementById('newsletterContainer');
        
        if (!container) {
            console.error('❌ No se encontró el contenedor del newsletter');
            return;
        }
        
        if (!this.newsletterSections || this.newsletterSections.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-plus-circle"></i>
                    <p>Arrastra secciones aquí para construir tu newsletter</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.newsletterSections.map((section, index) => {
            // Validar que la sección tiene datos válidos
            if (!section) {
                console.warn('⚠️ Sección nula en índice', index);
                return '';
            }
            
            // Obtener el HTML de la sección de manera segura
            let sectionHtml = '';
            try {
                sectionHtml = section.content && section.content.html 
                    ? section.content.html 
                    : '<p style="color: red;">⚠️ Sección sin contenido HTML</p>';
            } catch (error) {
                console.error('Error obteniendo HTML de sección:', error);
                sectionHtml = '<p style="color: red;">⚠️ Error cargando contenido</p>';
            }
            
            let sectionType = this.escapeHtml(section.section_type || section.type || 'Sin tipo');
            
            return `
            <div class="newsletter-section" data-section-id="${section.id}" data-index="${index}">
                <div class="section-header">
                    <span class="section-type">${sectionType}</span>
                    <div class="section-controls">
                        <button class="edit-section-btn" onclick="app.editNewsletterSection(${section.id})" title="Editar sección">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="move-up-btn" onclick="app.moveSectionUp(${index})" title="Mover arriba" ${index === 0 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="move-down-btn" onclick="app.moveSectionDown(${index})" title="Mover abajo" ${index === this.newsletterSections.length - 1 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button class="remove-section-btn" onclick="app.removeSectionFromNewsletter(${index})" title="Eliminar sección">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="section-content">
                    ${sectionHtml}
                </div>
            </div>
        `;
        }).filter(html => html).join('');
        
    }
    
    renderAvailableSections() {
        const container = document.getElementById('availableSections');
        if (!container) {
            console.warn('⚠️ No se encontró el contenedor de secciones disponibles');
            return;
        }

        if (!Array.isArray(this.masterSections) || this.masterSections.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-puzzle-piece"></i>
                    <p>No hay secciones maestras disponibles</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.masterSections.map(section => {
            // Validar que la sección tiene los datos necesarios
            if (!section || !section.id) {
                console.warn('⚠️ Sección inválida encontrada:', section);
                return '';
            }
            
            // Escapar datos para HTML
            let sectionName = this.escapeHtml(section.name || 'Sin nombre');
            let sectionType = this.escapeHtml(section.type || 'desconocido');
            let sectionTitle = this.escapeHtml(section.title || 'Sin título');
            
            return `
            <div class="available-section" data-section-id="${section.id}">
                <div class="section-info">
                    <h4>${sectionName}</h4>
                    <p class="section-type">${sectionType}</p>
                    <p class="section-title">${sectionTitle}</p>
                </div>
                <div class="section-actions">
                    <button class="add-section-btn" onclick="app.addSectionToNewsletter(${section.id})" title="Agregar al newsletter">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            </div>
        `;
        }).filter(html => html).join('');

    }
    
    // Agregar sección al newsletter
    async addSectionToNewsletter(sectionId) {

        try {
            // Validar que hay un newsletter activo
            if (!this.currentNewsletter) {
                this.showNotification('No hay newsletter activo. Por favor, abre un newsletter primero.', 'error');
                console.error('❌ No hay newsletter activo');
                return;
            }
            
            // Validar que masterSections está cargado
            if (!this.masterSections || !Array.isArray(this.masterSections) || this.masterSections.length === 0) {
                this.showNotification('No hay secciones maestras disponibles. Recargando...', 'warning');
                console.warn('⚠️ Master sections no está cargado, intentando recargar...');
                await this.loadMasterSections();
                
                // Verificar nuevamente después de recargar
                if (!this.masterSections || this.masterSections.length === 0) {
                    this.showNotification('No se pudieron cargar las secciones maestras', 'error');
                    console.error('❌ No se pudieron cargar master sections');
                    return;
                }
            }
            
            // Convertir sectionId a número para asegurar la comparación correcta
            let numericSectionId = typeof sectionId === 'string' ? parseInt(sectionId, 10) : sectionId;
            
            // Buscar la sección maestra con comparación flexible
            let masterSection = this.masterSections.find(s => {
                let sId = typeof s.id === 'string' ? parseInt(s.id, 10) : s.id;
                return sId === numericSectionId;
            });
            
            if (!masterSection) {
                console.error('❌ Sección maestra no encontrada. IDs disponibles:', this.masterSections.map(s => s.id));
                this.showNotification('Sección maestra no encontrada', 'error');
                return;
            }
            
            // Validar que la sección tiene contenido
            if (!masterSection.content || typeof masterSection.content !== 'object') {
                console.error('❌ La sección maestra no tiene contenido válido:', masterSection);
                this.showNotification('La sección maestra no tiene contenido válido', 'error');
                return;
            }
            
            // Validar que hay HTML en el contenido
            if (!masterSection.content.html) {
                console.error('❌ La sección maestra no tiene HTML:', masterSection);
                this.showNotification('La sección maestra no tiene HTML definido', 'error');
                return;
            }
            
            // Crear una copia de la sección para el newsletter
            let newsletterSection = {
                id: Date.now() + Math.random(), // ID temporal
                master_section_id: numericSectionId,
                section_type: masterSection.type,
                title: masterSection.title || 'Sin título',
                content: { 
                    title: masterSection.title || 'Sin título',
                    html: masterSection.content.html 
                },
                section_order: this.newsletterSections ? this.newsletterSections.length : 0,
                is_customized: false
            };
            
            // Inicializar el array si no existe
            if (!this.newsletterSections) {
                this.newsletterSections = [];
            }
            
            // Agregar al array local
            this.newsletterSections.push(newsletterSection);
            
            // Actualizar la vista
            this.renderNewsletterEditor();
            
            this.showNotification('Sección agregada al newsletter', 'success');
            
        } catch (error) {
            console.error('💥 Error agregando sección:', error);
            console.error('Stack trace:', error.stack);
            this.showNotification('Error agregando sección al newsletter: ' + error.message, 'error');
        }
    }
    
    // Editar sección del newsletter
    async editNewsletterSection(sectionId) {
        
        const section = this.newsletterSections.find(s => s.id === sectionId);
        if (!section) {
            this.showNotification('Sección no encontrada', 'error');
            return;
        }
        
        // Mostrar modal de edición
        this.showSectionEditorModal(section);
    }
    
    // Mostrar modal de edición de sección
    showSectionEditorModal(section) {
        const modal = document.getElementById('sectionEditorModal');
        const title = document.getElementById('sectionEditorModalTitle');
        const content = document.getElementById('sectionEditorContent');
        
        title.textContent = `Editar: ${section.title}`;
        
        content.innerHTML = `
            <div class="form-group">
                <label for="sectionTitle">Título de la Sección</label>
                <input type="text" id="editSectionTitle" value="${section.title}" required>
            </div>
            <div class="form-group">
                <label for="sectionContent">Contenido HTML</label>
                <div class="code-editor-container">
                    <div class="code-editor-header">
                        <span class="language-badge">HTML</span>
                        <div class="editor-controls">
                            <button type="button" onclick="app.formatSectionHtmlCode()" title="Formatear HTML">
                                <i class="fas fa-code"></i> Formatear
                            </button>
                            <button type="button" onclick="app.previewSectionHtmlCode()" title="Vista previa">
                                <i class="fas fa-eye"></i> Vista Previa
                            </button>
                            <button type="button" onclick="app.toggleFullscreenSectionEditor()" title="Pantalla completa">
                                <i class="fas fa-expand"></i>
                            </button>
                        </div>
                    </div>
                    <textarea id="editSectionContent" class="code-editor" placeholder="Escribe tu código HTML aquí...">${section.content.html}</textarea>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        
        // Configurar botón guardar
        const saveBtn = document.getElementById('saveSectionBtn');
        saveBtn.onclick = () => this.saveNewsletterSection(section.id);
    }
    
    // Guardar cambios en la sección del newsletter
    async saveNewsletterSection(sectionId) {
        const title = document.getElementById('editSectionTitle').value;
        const content = document.getElementById('editSectionContent').value;
        
        if (!title || !content) {
            this.showNotification('Todos los campos son requeridos', 'error');
            return;
        }
        
        // Actualizar la sección local
        const sectionIndex = this.newsletterSections.findIndex(s => s.id === sectionId);
        if (sectionIndex !== -1) {
            this.newsletterSections[sectionIndex].title = title;
            this.newsletterSections[sectionIndex].content.html = content;
            
            // Actualizar la vista
            this.renderNewsletterEditor();
            
            // Cerrar modal
            document.getElementById('sectionEditorModal').style.display = 'none';
            
            this.showNotification('Sección actualizada correctamente', 'success');
        }
    }
    
    // Formatear código HTML en el editor de secciones
    formatSectionHtmlCode() {
        const textarea = document.getElementById('editSectionContent');
        if (textarea) {
            const formatted = this.prettyPrintHtml(textarea.value);
            textarea.value = formatted;
            this.showNotification('Código HTML formateado correctamente', 'success');
        }
    }
    
    // Vista previa del código HTML en el editor de secciones
    previewSectionHtmlCode() {
        const textarea = document.getElementById('editSectionContent');
        if (textarea) {
            const htmlContent = textarea.value;
            if (!htmlContent.trim()) {
                this.showNotification('No hay contenido para previsualizar', 'warning');
                return;
            }
            
            // Crear ventana de vista previa
            const previewWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
            
            if (previewWindow) {
                previewWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Vista Previa del Código</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                margin: 20px; 
                                background-color: #f5f5f5;
                            }
                            .preview-header {
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                padding: 15px;
                                margin: -20px -20px 20px -20px;
                                border-radius: 0;
                            }
                            .preview-content {
                                background: white;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                            }
                        </style>
                    </head>
                    <body>
                        <div class="preview-header">
                            <h2>👁️ Vista Previa del Código HTML</h2>
                            <p>Editor de Secciones del Newsletter</p>
                        </div>
                        <div class="preview-content">
                            ${htmlContent}
                        </div>
                    </body>
                    </html>
                `);
                previewWindow.document.close();
                this.showNotification('Vista previa abierta en nueva ventana', 'info');
            } else {
                this.showNotification('No se pudo abrir la vista previa. Verifica que no esté bloqueado el popup.', 'error');
            }
        }
    }
    
    // Alternar pantalla completa del editor de secciones
    toggleFullscreenSectionEditor() {
        const modal = document.getElementById('sectionEditorModal');
        const textarea = document.getElementById('editSectionContent');
        
        if (modal && textarea) {
            if (modal.classList.contains('fullscreen')) {
                // Salir de pantalla completa
                modal.classList.remove('fullscreen');
                textarea.style.height = '400px';
                this.showNotification('Salido de pantalla completa', 'info');
            } else {
                // Entrar en pantalla completa
                modal.classList.add('fullscreen');
                textarea.style.height = '70vh';
                this.showNotification('Editor en pantalla completa', 'info');
            }
        }
    }
    
    // Mover sección hacia arriba
    moveSectionUp(index) {
        if (index > 0 && index < this.newsletterSections.length) {
            const temp = this.newsletterSections[index];
            this.newsletterSections[index] = this.newsletterSections[index - 1];
            this.newsletterSections[index - 1] = temp;
            
            // Actualizar órdenes
            this.newsletterSections.forEach((section, i) => {
                section.order = i;
            });
            
            this.renderNewsletterEditor();
            this.showNotification('Sección movida hacia arriba', 'info');
        } else {
            this.showNotification('No se puede mover esta sección hacia arriba', 'warning');
        }
    }
    
    // Mover sección hacia abajo
    moveSectionDown(index) {
        if (index >= 0 && index < this.newsletterSections.length - 1) {
            const temp = this.newsletterSections[index];
            this.newsletterSections[index] = this.newsletterSections[index + 1];
            this.newsletterSections[index + 1] = temp;
            
            // Actualizar órdenes
            this.newsletterSections.forEach((section, i) => {
                section.order = i;
            });
            
            this.renderNewsletterEditor();
            this.showNotification('Sección movida hacia abajo', 'info');
        } else {
            this.showNotification('No se puede mover esta sección hacia abajo', 'warning');
        }
    }
    
    // Eliminar sección del newsletter
    removeSectionFromNewsletter(index) {
        if (confirm('¿Estás seguro de que quieres eliminar esta sección del newsletter?')) {
            this.newsletterSections.splice(index, 1);
            
            // Actualizar órdenes
            this.newsletterSections.forEach((section, i) => {
                section.order = i;
            });
            
            this.renderNewsletterEditor();
            this.showNotification('Sección eliminada del newsletter', 'success');
        }
    }
    
    // Vista previa de sección
    previewSection(sectionId) {
        const section = this.masterSections.find(s => s.id === sectionId);
        if (!section) {
            this.showNotification('Sección no encontrada', 'error');
            return;
        }
        
        // Crear ventana de vista previa
        const previewWindow = window.open('', '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        
        if (previewWindow) {
            previewWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Vista Previa: ${section.name}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            background-color: #f5f5f5;
                        }
                        .preview-header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 15px;
                            margin: -20px -20px 20px -20px;
                            border-radius: 0;
                        }
                        .preview-content {
                            background: white;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                    </style>
                </head>
                <body>
                    <div class="preview-header">
                        <h2>👁️ Vista Previa: ${section.name}</h2>
                        <p>Tipo: ${section.type} | Título: ${section.title}</p>
                    </div>
                    <div class="preview-content">
                        ${section.content.html}
                    </div>
                </body>
                </html>
            `);
            previewWindow.document.close();
        } else {
            this.showNotification('No se pudo abrir la vista previa. Verifica que no esté bloqueado el popup.', 'error');
        }
    }
    
    // Guardar newsletter
    async saveNewsletter() {
        
        if (!this.currentNewsletter) {
            this.showNotification('No hay newsletter activo para guardar', 'error');
            return;
        }
        
        if (!this.newsletterSections || this.newsletterSections.length === 0) {
            this.showNotification('El newsletter debe tener al menos una sección', 'warning');
            return;
        }
        
        // Cambiar el botón a estado de guardado
        const saveBtn = document.getElementById('saveNewsletterBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        saveBtn.disabled = true;
        
        try {
            // Preparar datos para guardar
            const newsletterData = {
                id: this.currentNewsletter.id,
                sections: this.newsletterSections.map((section, index) => ({
                    master_section_id: section.master_section_id,
                    type: section.section_type || section.type || 'default',
                    title: section.title || 'Sin título',
                    content: section.content || { html: '', title: section.title || 'Sin título' },
                    order: index,
                    is_customized: section.is_customized || false
                }))
            };
            
            // Llamar a la API para guardar
            const response = await this.apiRequest(`/newsletters/${this.currentNewsletter.id}/sections`, {
                method: 'PUT',
                body: JSON.stringify(newsletterData)
            });
            
            if (response.ok) {
                const data = await response.json();
                this.showNotification('Newsletter guardado exitosamente', 'success');
                
                // Actualizar las secciones locales con las secciones guardadas desde el servidor
                if (data.sections && Array.isArray(data.sections)) {
                    this.newsletterSections = data.sections;
                    
                    // Re-renderizar el editor para mostrar las secciones actualizadas con sus IDs reales
                    this.renderNewsletterEditor();
                }
            } else {
                const errorData = await response.json();
                this.showNotification(errorData.error || 'Error guardando el newsletter', 'error');
                console.error('❌ Error guardando newsletter:', errorData);
            }
            
        } catch (error) {
            console.error('💥 Error de conexión:', error);
            this.showNotification('Error de conexión al guardar el newsletter', 'error');
        } finally {
            // Restaurar el botón
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    }
    
    // Master section methods
    showMasterSectionModal() {
        document.getElementById('masterSectionModal').style.display = 'block';
        document.getElementById('masterSectionModalTitle').textContent = 'Nueva Sección Maestra';
        document.getElementById('masterSectionForm').reset();
        this.isEditingMasterSection = false;
        this.editingSectionId = null;
    }
    
    hideMasterSectionModal() {
        document.getElementById('masterSectionModal').style.display = 'none';
        
        // Limpiar el formulario
        document.getElementById('masterSectionForm').reset();
        
        // Restaurar el título del modal
        document.getElementById('masterSectionModalTitle').textContent = 'Nueva Sección Maestra';
        
        // Restaurar el estado de edición
        this.isEditingMasterSection = false;
        this.editingSectionId = null;
    }
    
    async saveMasterSection() {
        const name = document.getElementById('sectionName').value;
        const type = document.getElementById('sectionType').value;
        const title = document.getElementById('sectionTitle').value;
        const content = document.getElementById('sectionContent').value;
        
        if (!name || !type || !title || !content) {
            this.showNotification('Todos los campos son requeridos', 'error');
            return;
        }
        
        const sectionData = {
            name,
            type,
            title,
            content: {
                title,
                html: content
            }
        };
        
        try {
            const response = await this.apiRequest('/master-sections', {
                method: 'POST',
                body: JSON.stringify(sectionData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showNotification('Sección maestra creada exitosamente', 'success');
                this.hideMasterSectionModal();
                this.loadMasterSections();
            } else {
                this.showNotification(data.error, 'error');
            }
        } catch (error) {
            this.showNotification('Error creando sección maestra', 'error');
        }
    }
    
    // Editar sección maestra
    async editMasterSection(sectionId) {
        
        try {
            const response = await this.apiRequest(`/master-sections/${sectionId}`);
            if (response.ok) {
                const data = await response.json();
                const section = data.section;
                
                // Llenar el modal con los datos existentes
                document.getElementById('sectionName').value = section.name;
                document.getElementById('sectionType').value = section.type;
                document.getElementById('sectionTitle').value = section.title;
                document.getElementById('sectionContent').value = section.content.html;
                
                // Cambiar el título del modal
                document.getElementById('masterSectionModalTitle').textContent = 'Editar Sección Maestra';
                
                // Mostrar el modal
                document.getElementById('masterSectionModal').style.display = 'block';
                
                // Configurar el estado de edición
                this.isEditingMasterSection = true;
                this.editingSectionId = sectionId;
                
            } else {
                this.showNotification('Error obteniendo sección maestra', 'error');
            }
        } catch (error) {
            this.showNotification('Error editando sección maestra', 'error');
        }
    }
    
    // Actualizar sección maestra
    async updateMasterSection(sectionId) {
        const name = document.getElementById('sectionName').value;
        const type = document.getElementById('sectionType').value;
        const title = document.getElementById('sectionTitle').value;
        const content = document.getElementById('sectionContent').value;
        
        if (!name || !type || !title || !content) {
            this.showNotification('Todos los campos son requeridos', 'error');
            return;
        }
        
        const sectionData = {
            name,
            type,
            title,
            content: {
                title,
                html: content
            }
        };
        
        try {
            const response = await this.apiRequest(`/master-sections/${sectionId}`, {
                method: 'PUT',
                body: JSON.stringify(sectionData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showNotification('Sección maestra actualizada exitosamente', 'success');
                this.hideMasterSectionModal();
                this.loadMasterSections();
            } else {
                this.showNotification(data.error, 'error');
            }
        } catch (error) {
            this.showNotification('Error actualizando sección maestra', 'error');
        }
    }
    
    // Duplicar sección maestra
    async duplicateMasterSection(sectionId) {
        
        try {
            const response = await this.apiRequest(`/master-sections/${sectionId}/duplicate`, {
                method: 'POST'
            });
            
            if (response.ok) {
                this.showNotification('Sección maestra duplicada exitosamente', 'success');
                this.loadMasterSections();
            } else {
                const data = await response.json();
                this.showNotification(data.error || 'Error duplicando sección maestra', 'error');
            }
        } catch (error) {
            this.showNotification('Error duplicando sección maestra', 'error');
        }
    }
    
    // Funciones del editor de código HTML
    formatHtmlCode() {
        const textarea = document.getElementById('sectionContent');
        const html = textarea.value;
        
        if (!html.trim()) {
            this.showNotification('No hay código HTML para formatear', 'warning');
            return;
        }
        
        try {
            // Crear un elemento temporal para parsear el HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Formatear el HTML usando la función de formateo
            const formattedHtml = this.prettyPrintHtml(html);
            textarea.value = formattedHtml;
            
            this.showNotification('Código HTML formateado correctamente', 'success');
        } catch (error) {
            this.showNotification('Error formateando el código HTML', 'error');
        }
    }
    
    prettyPrintHtml(html) {
        // Función simple para formatear HTML
        let formatted = html
            .replace(/></g, '>\n<')
            .replace(/\n\s*\n/g, '\n')
            .replace(/^\s+|\s+$/g, '');
        
        let indent = 0;
        const lines = formatted.split('\n');
        const formattedLines = [];
        
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            
            // Reducir indentación para etiquetas de cierre
            if (line.match(/^<\//)) {
                indent = Math.max(0, indent - 1);
            }
            
            // Agregar indentación
            const indentedLine = '    '.repeat(indent) + line;
            formattedLines.push(indentedLine);
            
            // Aumentar indentación para etiquetas de apertura (que no sean self-closing)
            if (line.match(/^<[^/][^>]*[^/]>$/) && !line.match(/\/>/)) {
                indent++;
            }
        }
        
        return formattedLines.join('\n');
    }

    escapeHtml(text) {
        if (typeof text !== 'string') {
            return '';
        }

        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    previewHtmlCode() {
        const html = document.getElementById('sectionContent').value;

        if (!html.trim()) {
            this.showNotification('No hay código HTML para previsualizar', 'warning');
            return;
        }
        
        // Crear ventana de vista previa
        const previewWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        if (previewWindow) {
            previewWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Vista Previa HTML</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            background-color: #f5f5f5;
                        }
                        .preview-header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 15px;
                            margin: -20px -20px 20px -20px;
                            border-radius: 0;
                        }
                        .preview-content {
                            background: white;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                    </style>
                </head>
                <body>
                    <div class="preview-header">
                        <h2>👁️ Vista Previa del HTML</h2>
                        <p>Esta es una vista previa de cómo se verá tu código HTML</p>
                    </div>
                    <div class="preview-content">
                        ${html}
                    </div>
                </body>
                </html>
            `);
            previewWindow.document.close();
        } else {
            this.showNotification('No se pudo abrir la vista previa. Verifica que no esté bloqueado el popup.', 'error');
        }
    }
    
    toggleFullscreenEditor() {
        const modal = document.getElementById('masterSectionModal');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const icon = fullscreenBtn.querySelector('i');
        
        if (modal.classList.contains('fullscreen')) {
            // Salir de pantalla completa
            modal.classList.remove('fullscreen');
            icon.className = 'fas fa-expand';
            fullscreenBtn.title = 'Pantalla completa';
            this.showNotification('Salido de pantalla completa', 'info');
        } else {
            // Entrar en pantalla completa
            modal.classList.add('fullscreen');
            icon.className = 'fas fa-compress';
            fullscreenBtn.title = 'Salir de pantalla completa';
            this.showNotification('Editor en pantalla completa', 'info');
        }
    }
    
    // Eliminar sección maestra
    async deleteMasterSection(sectionId) {
        
        if (!confirm('¿Estás seguro de que quieres eliminar esta sección maestra? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            const response = await this.apiRequest(`/master-sections/${sectionId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.showNotification('Sección maestra eliminada exitosamente', 'success');
                this.loadMasterSections();
            } else {
                const data = await response.json();
                this.showNotification(data.error || 'Error eliminando sección maestra', 'error');
            }
        } catch (error) {
            this.showNotification('Error eliminando sección maestra', 'error');
        }
    }
    
    // Utility methods
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationsContainer');
        const notification = document.createElement('div');
        
        // Configurar colores según el tipo
        let bgColor, textColor, icon;
        switch (type) {
            case 'success':
                bgColor = '#28a745';
                textColor = 'white';
                icon = '✅';
                break;
            case 'error':
                bgColor = '#dc3545';
                textColor = 'white';
                icon = '❌';
                break;
            case 'warning':
                bgColor = '#ffc107';
                textColor = '#212529';
                icon = '⚠️';
                break;
            case 'info':
            default:
                bgColor = '#17a2b8';
                textColor = 'white';
                icon = 'ℹ️';
                break;
        }
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${bgColor};
            color: ${textColor};
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
            animation: slideInRight 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <span style="margin-right: 10px;">${icon}</span>
            <span>${message}</span>
            <button style="
                background: none;
                border: none;
                color: ${textColor};
                margin-left: 15px;
                cursor: pointer;
                font-size: 18px;
                opacity: 0.8;
            " onclick="this.parentElement.remove()">&times;</button>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MailingApp();
    
    // Función para forzar la visualización de la aplicación principal
    window.forceShowMainApp = () => {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen && mainApp) {
            loginScreen.style.display = 'none';
            mainApp.style.display = 'block';
        } else {
            console.error('❌ No se pudieron encontrar los elementos');
        }
    };
    
}); 