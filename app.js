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
        this.selectedSectionIndex = null; // índice de sección seleccionada en el canvas
        this.canvasViewport = 'desktop'; // 'desktop' | 'mobile'

        this.init();
    }

    // Cambia el ancho del papel en el editor (escritorio/móvil)
    setCanvasViewport(mode) {
        if (mode !== 'desktop' && mode !== 'mobile') return;
        this.canvasViewport = mode;
        const canvas = document.querySelector('.editor-canvas');
        if (canvas) canvas.dataset.viewport = mode;
        document.querySelectorAll('.viewport-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.viewport === mode);
        });
    }
    
    init() {
        this.setupEventListeners();
        this.setupAuthListeners();

        // Si venimos de un link de reset, el flujo de reset tiene prioridad:
        // limpiamos cualquier sesión previa y saltamos checkAuthStatus (que
        // abriría el dashboard antes de que termine la validación del token).
        const params = new URLSearchParams(window.location.search);
        const isResetPath = window.location.pathname === '/reset-password';
        const hasResetToken = params.get('token');

        if (isResetPath && hasResetToken) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.showLoginScreen();
            this.checkResetTokenInUrl();
            return;
        }

        this.checkAuthStatus();
    }

    setupAuthListeners() {
        const byId = (id) => document.getElementById(id);

        const forgotLink = byId('forgotPasswordLink');
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginPanel('forgot');
            });
        }

        const forgotForm = byId('forgotForm');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.requestPasswordReset();
            });
        }

        const backFromForgot = byId('backToLoginFromForgot');
        if (backFromForgot) {
            backFromForgot.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginPanel('login');
            });
        }

        const backFromResult = byId('backToLoginFromResult');
        if (backFromResult) {
            backFromResult.addEventListener('click', () => this.showLoginPanel('login'));
        }

        const copyForgotUrlBtn = byId('copyForgotUrlBtn');
        if (copyForgotUrlBtn) {
            copyForgotUrlBtn.addEventListener('click', () => {
                const input = byId('forgotResultUrl');
                if (!input) return;
                input.select();
                navigator.clipboard.writeText(input.value).then(() => {
                    this.showNotification('Link copiado al portapapeles', 'success');
                });
            });
        }

        const resetForm = byId('resetForm');
        if (resetForm) {
            resetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitPasswordReset();
            });
        }
    }

    checkResetTokenInUrl() {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const isResetPath = window.location.pathname === '/reset-password';
        if (!token || !isResetPath) return;

        this.resetToken = token;
        fetch(`${this.apiBaseUrl}/auth/validate-reset-token/${encodeURIComponent(token)}`)
            .then(r => r.json().then(data => ({ ok: r.ok, data })))
            .then(({ ok, data }) => {
                if (!ok || !data.valid) {
                    this.showNotification(data.reason || 'Link de reset inválido o expirado', 'error');
                    this.showLoginPanel('login');
                    history.replaceState(null, '', '/');
                    return;
                }
                const subtitle = document.getElementById('loginHeaderSubtitle');
                const title = document.getElementById('loginHeaderTitle');
                if (title) title.textContent = `Hola, ${data.username}`;
                if (subtitle) subtitle.textContent = 'Establece una nueva contraseña para tu cuenta';
                this.showLoginPanel('reset');
            })
            .catch(() => {
                this.showNotification('No se pudo validar el link de reset', 'error');
                this.showLoginPanel('login');
            });
    }

    async requestPasswordReset() {
        const email = document.getElementById('forgotEmail').value.trim();
        if (!email) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (!response.ok) {
                this.showNotification(data.error || 'Error solicitando reset', 'error');
                return;
            }

            // Si el backend incluye resetUrl, mostramos el link en la UI
            if (data.resetUrl) {
                const fullUrl = `${window.location.origin}${data.resetUrl}`;
                const input = document.getElementById('forgotResultUrl');
                if (input) input.value = fullUrl;
                this.showLoginPanel('result');
            } else {
                this.showNotification(data.message || 'Revisa tu email', 'info');
                this.showLoginPanel('login');
            }
        } catch (err) {
            this.showNotification('Error de red solicitando reset', 'error');
        }
    }

    async submitPasswordReset() {
        const pwd = document.getElementById('resetPassword').value;
        const pwd2 = document.getElementById('resetPasswordConfirm').value;
        console.log('🔑 submitPasswordReset', { hasToken: !!this.resetToken, pwdLen: pwd.length });

        if (!this.resetToken) {
            this.showNotification('Falta el token de reset. Abre el link del email nuevamente.', 'error');
            return;
        }
        if (pwd !== pwd2) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }
        if (pwd.length < 6) {
            this.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.resetToken, newPassword: pwd })
            });
            const data = await response.json();
            console.log('🔑 reset-password respuesta:', response.status, data);

            if (!response.ok) {
                this.showNotification(data.error || 'Error restableciendo contraseña', 'error');
                return;
            }
            this.showNotification('Contraseña actualizada. Inicia sesión con la nueva.', 'success');
            history.replaceState(null, '', '/');
            this.resetToken = null;
            document.getElementById('loginHeaderTitle').textContent = 'Bienvenido';
            document.getElementById('loginHeaderSubtitle').textContent = 'Inicia sesión para gestionar tus newsletters';
            this.showLoginPanel('login');
        } catch (err) {
            console.error('🔑 reset-password error:', err);
            this.showNotification('Error de red restableciendo contraseña', 'error');
        }
    }

    // Cambia qué panel se muestra dentro de la pantalla de login
    // Valores: 'login' | 'register' | 'forgot' | 'result' | 'reset'
    showLoginPanel(panel) {
        const panelMap = {
            login: 'loginForm',
            register: 'registerForm',
            forgot: 'forgotForm',
            result: 'forgotResult',
            reset: 'resetForm'
        };
        document.querySelectorAll('.login-form').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(panelMap[panel]);
        if (target) target.classList.add('active');

        // Tabs visibles solo en login/register
        const tabs = document.getElementById('loginTabs');
        if (tabs) {
            tabs.style.display = (panel === 'login' || panel === 'register') ? '' : 'none';
        }
        if (panel === 'login' || panel === 'register') {
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === panel);
            });
        }
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
        
        console.log('🔐 Intentando login con:', username);
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            console.log('📡 Respuesta del servidor:', data);
            
            if (response.ok) {
                console.log('✅ Login exitoso, guardando datos...');
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.currentUser = data.user;
                
                console.log('👤 Usuario actual:', this.currentUser);
                console.log('🔄 Mostrando aplicación principal...');
                
                this.showMainApp();
                this.loadInitialData();
                this.showNotification('Login exitoso', 'success');
                
                console.log('🎉 Aplicación principal mostrada');
            } else {
                console.log('❌ Error en login:', data.error);
                this.showNotification(data.error, 'error');
            }
        } catch (error) {
            console.error('💥 Error de conexión:', error);
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
        this.showLoginPanel(tab);
    }
    
    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen && mainApp) {
            loginScreen.classList.remove('hidden');
            loginScreen.style.display = 'block';
            
            mainApp.classList.add('hidden');
            mainApp.style.display = 'none';
        }
    }
    
    showMainApp() {
        console.log('🔄 Ejecutando showMainApp...');
        
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        console.log('📱 Elementos encontrados:', {
            loginScreen: !!loginScreen,
            mainApp: !!mainApp
        });
        
        if (loginScreen && mainApp) {
            // Usar clases CSS más específicas
            loginScreen.classList.add('hidden');
            loginScreen.style.display = 'none';
            
            mainApp.classList.remove('hidden');
            mainApp.style.display = 'block';
            
            console.log('✅ Pantallas cambiadas correctamente');
            
            // Update user info
            const usernameElement = document.getElementById('currentUsername');
            const roleElement = document.getElementById('userRole');
            
            if (usernameElement && roleElement) {
                usernameElement.textContent = this.currentUser.username;
                roleElement.textContent = this.currentUser.role;
                console.log('👤 Información de usuario actualizada');
            } else {
                console.warn('⚠️ No se encontraron elementos de usuario');
            }
            
            // Show/hide admin elements
            const adminElements = document.querySelectorAll('.admin-only');
            console.log('🔑 Elementos admin encontrados:', adminElements.length);
            
            adminElements.forEach(el => {
                el.style.display = this.currentUser.role === 'admin' ? 'block' : 'none';
            });
            
            console.log('🎯 Aplicación principal mostrada exitosamente');
        } else {
            console.error('❌ No se pudieron encontrar los elementos de la interfaz');
        }
    }
    
    switchView(view) {
        console.log('🔄 Cambiando a vista:', view);
        
        // Hide all views
        document.querySelectorAll('.content-view').forEach(v => {
            v.classList.remove('active');
        });
        
        // Show selected view
        const targetView = document.getElementById(`${view}View`);
        if (targetView) {
            targetView.classList.add('active');
            console.log('✅ Vista mostrada:', view);
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
            console.log('✅ Navegación actualizada');
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
            console.log('📝 Vista de crear newsletter activada');
        }
    }
    
    // Data loading methods
    async loadInitialData() {
        console.log('📊 Cargando datos iniciales...');
        
        try {
            await Promise.all([
                this.loadNewsletters(),
                this.loadMasterSections()
            ]);
            console.log('✅ Datos iniciales cargados exitosamente');
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
                this.newsletterSections = data.sections;
                this.selectedSectionIndex = null;

                document.getElementById('editorTitle').textContent = `Editor: ${data.newsletter.name}`;
                this.switchView('newsletterEditor');
                this.renderNewsletterEditor();
            }
        } catch (error) {
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
    renderNewsletterEditor() {
        console.log('🎨 Renderizando editor de newsletter...');

        // Renderizar secciones existentes
        this.renderNewsletterSections();

        // Renderizar secciones disponibles
        this.renderAvailableSections();

        // Renderizar panel de propiedades (derecha)
        this.renderPropertiesPanel();
    }
    
    renderNewsletterSections() {
        const container = document.getElementById('newsletterContainer');

        // Handlers de drop se registran una sola vez
        this.attachCanvasDropHandlers(container);

        if (!this.newsletterSections || this.newsletterSections.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-plus-circle"></i>
                    <p>Arrastra bloques aquí para construir tu newsletter</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.newsletterSections.map((section, index) => {
            const isSelected = this.selectedSectionIndex === index;
            return `
            <div class="newsletter-section${isSelected ? ' selected' : ''}"
                data-section-id="${section.id}"
                data-index="${index}"
                draggable="true"
                ondragstart="app.handleCanvasDragStart(event, ${index})"
                ondragend="app.handleCanvasDragEnd(event)"
                onclick="app.selectSection(${index}); event.stopPropagation();">
                <div class="section-content">
                    ${section.content.html}
                </div>
            </div>`;
        }).join('');
    }

    attachCanvasDropHandlers(container) {
        if (!container || container.dataset.dropBound === '1') return;
        container.dataset.dropBound = '1';
        container.addEventListener('dragover', (e) => this.handleDragOver(e));
        container.addEventListener('drop', (e) => this.handleDrop(e));
        container.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        // Click en zona vacía del canvas deselecciona
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                this.selectSection(null);
            }
        });
    }

    // Selección de sección en el canvas
    selectSection(index) {
        this.selectedSectionIndex = index;
        this.renderNewsletterSections();
        this.renderPropertiesPanel();
    }

    // Panel de propiedades (columna derecha)
    renderPropertiesPanel() {
        const panel = document.getElementById('propertiesPanel');
        if (!panel) return;

        const idx = this.selectedSectionIndex;
        const section = (idx !== null && idx >= 0) ? this.newsletterSections[idx] : null;

        if (!section) {
            panel.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-sliders-h"></i>
                    <p>Selecciona un bloque para editar sus propiedades</p>
                </div>
            `;
            return;
        }

        const total = this.newsletterSections.length;
        const canMoveUp = idx > 0;
        const canMoveDown = idx < total - 1;
        const customizedBadge = section.is_customized
            ? '<span class="prop-badge prop-badge-warning" title="Modificada respecto a la maestra">personalizada</span>'
            : '';

        panel.innerHTML = `
            <div class="prop-section">
                <div class="prop-label">Tipo</div>
                <div class="prop-type-row">
                    <span class="prop-type-badge">${section.section_type}</span>
                    ${customizedBadge}
                </div>
            </div>

            <div class="prop-section">
                <label class="prop-label" for="propTitle">Título</label>
                <input type="text" id="propTitle" class="prop-input" value="${this.escapeAttr(section.title || '')}" onblur="app.updateSelectedSectionTitle(this.value)">
            </div>

            <div class="prop-section">
                <div class="prop-label">Posición</div>
                <div class="prop-position-row">
                    <button class="prop-btn prop-btn-secondary" onclick="app.moveSectionUp(${idx})" ${canMoveUp ? '' : 'disabled'} title="Mover arriba">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <span class="prop-position-indicator">${idx + 1} / ${total}</span>
                    <button class="prop-btn prop-btn-secondary" onclick="app.moveSectionDown(${idx})" ${canMoveDown ? '' : 'disabled'} title="Mover abajo">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
            </div>

            <div class="prop-section prop-actions">
                <button class="prop-btn prop-btn-primary" onclick="app.editNewsletterSection(${section.id})">
                    <i class="fas fa-code"></i> Editar contenido
                </button>
                <button class="prop-btn prop-btn-danger" onclick="app.removeSectionFromNewsletter(${idx})">
                    <i class="fas fa-trash"></i> Eliminar bloque
                </button>
            </div>
        `;
    }

    // Escapa valores para usar en atributos HTML (evita romper quotes)
    escapeAttr(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Actualiza el título de la sección seleccionada desde el panel
    updateSelectedSectionTitle(newTitle) {
        const idx = this.selectedSectionIndex;
        if (idx === null || !this.newsletterSections[idx]) return;
        this.newsletterSections[idx].title = newTitle;
    }
    
    renderAvailableSections() {
        const container = document.getElementById('availableSections');
        if (!container) {
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

        container.innerHTML = this.masterSections.map(section => `
            <div class="available-section"
                data-section-id="${section.id}"
                draggable="true"
                ondragstart="app.handleSidebarDragStart(event, ${section.id})"
                ondragend="app.handleCanvasDragEnd(event)">
                <div class="section-info">
                    <h4>${section.name}</h4>
                    <p class="section-type">${section.type}</p>
                    <p class="section-title">${section.title}</p>
                </div>
                <div class="section-actions">
                    <button class="add-section-btn" onclick="app.addSectionToNewsletter(${section.id})" title="Agregar al newsletter">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ========== Drag & drop ==========
    handleSidebarDragStart(e, masterSectionId) {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('application/x-master-id', String(masterSectionId));
        this.dragSource = 'sidebar';
    }

    handleCanvasDragStart(e, index) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/x-section-index', String(index));
        this.dragSource = 'canvas';
        e.currentTarget.classList.add('dragging');
    }

    handleCanvasDragEnd(e) {
        if (e.currentTarget && e.currentTarget.classList) {
            e.currentTarget.classList.remove('dragging');
        }
        this.clearDropIndicators();
        this.dragInsertionIndex = null;
        this.dragSource = null;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = this.dragSource === 'canvas' ? 'move' : 'copy';

        const container = document.getElementById('newsletterContainer');
        const sections = Array.from(container.querySelectorAll('.newsletter-section'));

        sections.forEach(s => s.classList.remove('drop-before', 'drop-after'));
        container.classList.remove('drop-empty');

        if (sections.length === 0) {
            container.classList.add('drop-empty');
            this.dragInsertionIndex = 0;
            return;
        }

        const y = e.clientY;
        let insertionIndex = sections.length;
        for (let i = 0; i < sections.length; i++) {
            const rect = sections[i].getBoundingClientRect();
            if (y < rect.top + rect.height / 2) {
                insertionIndex = i;
                break;
            }
        }
        this.dragInsertionIndex = insertionIndex;

        if (insertionIndex < sections.length) {
            sections[insertionIndex].classList.add('drop-before');
        } else {
            sections[sections.length - 1].classList.add('drop-after');
        }
    }

    handleDragLeave(e) {
        const container = document.getElementById('newsletterContainer');
        if (!container) return;
        if (!container.contains(e.relatedTarget)) {
            this.clearDropIndicators();
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const masterId = e.dataTransfer.getData('application/x-master-id');
        const sectionIndexRaw = e.dataTransfer.getData('application/x-section-index');
        const targetIndex = this.dragInsertionIndex ?? this.newsletterSections.length;

        this.clearDropIndicators();

        if (masterId) {
            this.addSectionToNewsletter(parseInt(masterId, 10), targetIndex);
        } else if (sectionIndexRaw !== '') {
            this.reorderSection(parseInt(sectionIndexRaw, 10), targetIndex);
        }

        this.dragInsertionIndex = null;
        this.dragSource = null;
    }

    clearDropIndicators() {
        const container = document.getElementById('newsletterContainer');
        if (!container) return;
        container.classList.remove('drop-empty');
        container.querySelectorAll('.drop-before, .drop-after').forEach(el => {
            el.classList.remove('drop-before', 'drop-after');
        });
    }

    reorderSection(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.newsletterSections.length) return;
        // Drop sobre la misma posición o justo después (no-op)
        if (fromIndex === toIndex || fromIndex + 1 === toIndex) return;

        const [moved] = this.newsletterSections.splice(fromIndex, 1);
        const adjustedTo = fromIndex < toIndex ? toIndex - 1 : toIndex;
        this.newsletterSections.splice(adjustedTo, 0, moved);

        this.newsletterSections.forEach((section, i) => {
            section.order = i;
        });

        this.selectedSectionIndex = adjustedTo;
        this.renderNewsletterEditor();
        this.showNotification('Bloques reordenados', 'info');
    }
    
    // Agregar sección al newsletter
    async addSectionToNewsletter(sectionId, insertIndex = null) {
        console.log('➕ Agregando sección al newsletter:', sectionId, 'en índice', insertIndex);
        
        try {
            // Buscar la sección maestra
            const masterSection = this.masterSections.find(s => s.id === sectionId);
            if (!masterSection) {
                this.showNotification('Sección maestra no encontrada', 'error');
                return;
            }
            
            // Crear una copia de la sección para el newsletter
            const newsletterSection = {
                id: Date.now() + Math.random(), // ID temporal
                master_section_id: sectionId,
                section_type: masterSection.type,
                title: masterSection.title,
                content: { ...masterSection.content },
                order: this.newsletterSections.length
            };
            
            // Insertar en la posición indicada (o al final si no se especifica)
            const insertAt = (typeof insertIndex === 'number' && insertIndex >= 0 && insertIndex <= this.newsletterSections.length)
                ? insertIndex
                : this.newsletterSections.length;
            this.newsletterSections.splice(insertAt, 0, newsletterSection);

            // Recalcular órdenes
            this.newsletterSections.forEach((s, i) => { s.order = i; });

            // Seleccionar el bloque recién agregado
            this.selectedSectionIndex = insertAt;

            // Actualizar la vista
            this.renderNewsletterEditor();

            this.showNotification('Sección agregada al newsletter', 'success');
            
        } catch (error) {
            console.error('Error agregando sección:', error);
            this.showNotification('Error agregando sección al newsletter', 'error');
        }
    }
    
    // Editar sección del newsletter
    async editNewsletterSection(sectionId) {
        console.log('✏️ Editando sección del newsletter:', sectionId);
        
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

            this.newsletterSections.forEach((section, i) => {
                section.order = i;
            });

            // Selección sigue al bloque movido
            if (this.selectedSectionIndex === index) {
                this.selectedSectionIndex = index - 1;
            } else if (this.selectedSectionIndex === index - 1) {
                this.selectedSectionIndex = index;
            }

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

            this.newsletterSections.forEach((section, i) => {
                section.order = i;
            });

            if (this.selectedSectionIndex === index) {
                this.selectedSectionIndex = index + 1;
            } else if (this.selectedSectionIndex === index + 1) {
                this.selectedSectionIndex = index;
            }

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

            this.newsletterSections.forEach((section, i) => {
                section.order = i;
            });

            // Ajustar selección tras eliminar
            if (this.selectedSectionIndex === index) {
                this.selectedSectionIndex = null;
            } else if (this.selectedSectionIndex !== null && this.selectedSectionIndex > index) {
                this.selectedSectionIndex -= 1;
            }

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
        console.log('💾 Guardando newsletter...');
        
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
                    type: section.section_type,
                    title: section.title,
                    content: section.content,
                    order: index
                }))
            };
            
            console.log('📤 Enviando datos del newsletter:', newsletterData);
            
            // Llamar a la API para guardar
            const response = await this.apiRequest(`/newsletters/${this.currentNewsletter.id}/sections`, {
                method: 'PUT',
                body: JSON.stringify(newsletterData)
            });
            
            if (response.ok) {
                const data = await response.json();
                this.showNotification('Newsletter guardado exitosamente', 'success');
                
                // Actualizar el newsletter local con la respuesta del servidor
                if (data.newsletter) {
                    this.currentNewsletter = data.newsletter;
                }
                
                console.log('✅ Newsletter guardado correctamente');
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
        console.log('✏️ Editando sección maestra:', sectionId);
        
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
        console.log('📋 Duplicando sección maestra:', sectionId);
        
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
        console.log('🗑️ Eliminando sección maestra:', sectionId);
        
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
    
    // Agregar función de debugging al objeto global
    window.debugApp = () => {
        console.log('🔍 Estado de la aplicación:', {
            currentUser: window.app.currentUser,
            token: localStorage.getItem('token'),
            user: localStorage.getItem('user'),
            loginScreen: document.getElementById('loginScreen'),
            mainApp: document.getElementById('mainApp'),
            currentUsername: document.getElementById('currentUsername'),
            userRole: document.getElementById('userRole')
        });
    };
    
    // Función para forzar la visualización de la aplicación principal
    window.forceShowMainApp = () => {
        console.log('🚀 Forzando visualización de la aplicación principal...');
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen && mainApp) {
            loginScreen.style.display = 'none';
            mainApp.style.display = 'block';
            console.log('✅ Aplicación principal forzada a mostrarse');
        } else {
            console.error('❌ No se pudieron encontrar los elementos');
        }
    };
    
    // Función para probar el DOM
    window.testDOM = () => {
        console.log('🧪 Probando elementos del DOM...');
        
        const elements = {
            loginScreen: document.getElementById('loginScreen'),
            mainApp: document.getElementById('mainApp'),
            currentUsername: document.getElementById('currentUsername'),
            userRole: document.getElementById('userRole'),
            loginForm: document.getElementById('loginForm'),
            registerForm: document.getElementById('registerForm')
        };
        
        console.log('📋 Elementos encontrados:', elements);
        
        // Verificar clases CSS
        if (elements.loginScreen) {
            console.log('🔍 Clases de loginScreen:', elements.loginScreen.className);
            console.log('🔍 Estilo display de loginScreen:', elements.loginScreen.style.display);
            console.log('🔍 Computed style de loginScreen:', window.getComputedStyle(elements.loginScreen).display);
        }
        
        if (elements.mainApp) {
            console.log('🔍 Clases de mainApp:', elements.mainApp.className);
            console.log('🔍 Estilo display de mainApp:', elements.mainApp.style.display);
            console.log('🔍 Computed style de mainApp:', window.getComputedStyle(elements.mainApp).display);
        }
    };
    
    // Función para verificar todas las vistas
    window.testViews = () => {
        console.log('🧪 Probando todas las vistas...');
        
        const views = [
            'newsletters',
            'masterSections', 
            'createNewsletter',
            'newsletterEditor'
        ];
        
        views.forEach(view => {
            const viewElement = document.getElementById(`${view}View`);
            const navButton = document.querySelector(`[data-view="${view}"]`);
            
            console.log(`📱 Vista ${view}:`, {
                element: !!viewElement,
                navButton: !!navButton,
                elementId: viewElement ? viewElement.id : 'NO ENCONTRADO',
                navButtonDataView: navButton ? navButton.dataset.view : 'NO ENCONTRADO'
            });
        });
    };
    
    // Función para probar cambio de vistas
    window.testSwitchView = (view) => {
        console.log(`🧪 Probando cambio a vista: ${view}`);
        if (window.app && window.app.switchView) {
            window.app.switchView(view);
        } else {
            console.error('❌ La aplicación no está disponible');
        }
    };
    
    // Agregar función de debugging al objeto global
    window.debugSections = () => {
        console.log('Estado actual de las secciones:', window.app.sections);
        if (window.app.sections) {
            window.app.sections.forEach((section, index) => {
                console.log(`Sección ${index}:`, {
                    id: section.id,
                    type: window.app.getSectionTypeFromId ? window.app.getSectionTypeFromId(section.id) : 'N/A',
                    title: section.content ? section.content.title : 'N/A',
                    htmlPreview: section.content && section.content.html ? section.content.html.substring(0, 100) + '...' : 'N/A'
                });
            });
        } else {
            console.log('No hay secciones cargadas');
        }
    };
}); 