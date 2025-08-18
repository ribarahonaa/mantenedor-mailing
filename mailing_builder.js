// Mantenedor de Mailings - Innk
class MailingBuilder {
    constructor() {
        this.sections = [];
        this.sectionCounter = 0;
        this.currentEditingSection = null;
        this.currentEditingSectionType = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }
    
    setupEventListeners() {
        // Event listeners para las secciones del sidebar
        document.querySelectorAll('.section-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const sectionType = e.currentTarget.dataset.section;
                this.addSection(sectionType);
            });
        });
    }
    
    setupDragAndDrop() {
        const container = document.getElementById('newsletterContainer');
        
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('dragover');
        });
        
        container.addEventListener('dragleave', (e) => {
            container.classList.remove('dragover');
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('dragover');
        });
    }
    
    addSection(sectionType) {
        const section = this.createSection(sectionType);
        this.sections.push(section);
        this.renderSections();
        this.hideEmptyState();
    }
    
    createSection(sectionType) {
        this.sectionCounter++;
        const id = `section-${this.sectionCounter}`;
        
        return {
            id: id,
            type: sectionType,
            content: this.getSectionContent(sectionType),
            order: this.sections.length
        };
    }
    
    getSectionContent(sectionType) {
        const templates = {
            header: {
                title: 'Header con Logo',
                html: `
                    <div style="padding: 0; text-align: center;">
                        <div style="text-align: center; padding: 20px 0;">
                            <img src="https://i.imgur.com/NPugcbi.png" alt="Innk Logo" style="width: auto; height: auto; display: block; margin: 0 auto; max-height: 80px;">
                        </div>
                    </div>
                `
            },
            saludo: {
                title: 'Saludo Personalizado',
                html: `
                    <div style="margin-bottom: 30px; padding: 0 20px;">
                        <div style="background-color: #F6F6FE; padding: 20px; border-radius: 8px;">
                            <h1 style="color: #4747F3; font-size: 22px; margin: 0 0 15px 0; border-bottom: 2px solid #E6E6FA; padding-bottom: 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">¿Qué es la planificación de proyectos y cómo optimizarla?</h1>
                            <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Planificar proyectos de manera efectiva es clave para lograr resultados exitosos. En esta nota te compartimos:</p>
                            <ul style="margin: 0; padding-left: 20px; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                <li style="margin-bottom: 8px;">3 aspectos para planificar proyectos de forma exitosa.</li>
                                <li style="margin-bottom: 8px;">Principales tipos de planificación con ejemplos y consejos prácticos</li>
                                <li style="margin-bottom: 8px;">3 aspectos para planificar proyectos de forma exitosa.</li>
                            </ul>
                        </div>
                    </div>
                `
            },
            destacado: {
                title: 'Destacado',
                html: `
                    <div style="margin-bottom: 30px; padding: 0 20px;">
                        <h2 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">🔥 Destacado de la Semana</h2>
                        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Nueva funcionalidad disponible:</strong> Hemos lanzado nuestro sistema de gestión de proyectos mejorado con análisis en tiempo real y métricas avanzadas.</p>
                        <a href="#" style="display: inline-block; background-color: #FF8C00; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; margin: 10px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Descubrir Más</a>
                    </div>
                `
            },
            articulos: {
                title: 'Artículos',
                html: `
                    <div style="margin-bottom: 30px; padding: 0 20px;">
                        <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">📚 Artículos Recomendados</h2>
                        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>1. El Futuro de la IA en la Innovación Empresarial</strong><br>
                        Descubre cómo la inteligencia artificial está transformando la manera en que las empresas innovan y crean valor.</p>
                        
                        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>2. Metodologías Ágiles para Proyectos de Innovación</strong><br>
                        Aprende las mejores prácticas para implementar metodologías ágiles en tus proyectos de innovación.</p>
                        
                        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>3. Casos de Éxito: Empresas que Transformaron su Industria</strong><br>
                        Inspírate con historias reales de empresas que revolucionaron sus mercados.</p>
                    </div>
                `
            },
            eventos: {
                title: 'Eventos',
                html: `
                    <div style="margin-bottom: 30px; padding: 0 20px;">
                        <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">📅 Próximos Eventos</h2>
                        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Webinar: Innovación Sostenible</strong><br>
                        <em>Fecha:</em> 15 de Diciembre, 2024<br>
                        <em>Hora:</em> 14:00 - 15:30 (GMT-3)<br>
                        <em>Registro:</em> <a href="#" style="color: #20B2AA; text-decoration: none;">Inscríbete aquí</a></p>
                    </div>
                `
            },
            cta: {
                title: 'Call to Action',
                html: `
                    <div style="margin-bottom: 30px; padding: 0 20px; text-align: center;">
                        <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">¿Listo para Innovar?</h2>
                        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Únete a nuestra comunidad de innovadores y accede a recursos exclusivos, herramientas avanzadas y networking de calidad.</p>
                        <a href="#" style="display: inline-block; background-color: #FF8C00; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; margin: 10px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Comenzar Ahora</a>
                    </div>
                `
            },
            'dos-columnas-texto': {
                title: 'Dos Columnas - Texto',
                html: `
                    <div style="margin-bottom: 30px; padding: 0 20px;">
                        <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">📊 Análisis de Mercado</h2>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                            <tr>
                                <td width="50%" style="width: 50%; padding: 0 15px 0 0; vertical-align: top;">
                                    <h3 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Tendencias Emergentes</h3>
                                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">El mercado de la innovación está experimentando cambios significativos. Las empresas que adoptan tecnologías emergentes están viendo un aumento del 40% en su productividad.</p>
                                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">La inteligencia artificial y el machine learning están transformando la manera en que las organizaciones toman decisiones y optimizan sus procesos.</p>
                                </td>
                                <td width="50%" style="width: 50%; padding: 0 0 0 15px; vertical-align: top;">
                                    <h3 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Oportunidades de Crecimiento</h3>
                                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Las startups que se enfocan en soluciones sostenibles están captando la atención de inversores y consumidores por igual.</p>
                                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">El mercado de la innovación social representa una oportunidad de $2.5 billones que está creciendo a un ritmo del 15% anual.</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                `
            },
            'dos-columnas-foto-derecha': {
                title: 'Dos Columnas - Foto Derecha',
                html: `
                    <div style="margin-bottom: 30px; padding: 0 20px;">
                        <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">🚀 Nuevas Funcionalidades</h2>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                            <tr>
                                <td width="50%" style="width: 50%; padding: 0 15px 0 0; vertical-align: top;">
                                    <h3 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Dashboard Inteligente</h3>
                                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Hemos lanzado un nuevo dashboard que utiliza inteligencia artificial para analizar el rendimiento de tus proyectos en tiempo real.</p>
                                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Características principales:</p>
                                    <ul style="margin: 20px 0; padding-left: 25px; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; position: relative; padding-left: 25px;">Análisis predictivo de riesgos</li>
                                        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; position: relative; padding-left: 25px;">Métricas personalizables</li>
                                        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; position: relative; padding-left: 25px;">Reportes automáticos</li>
                                        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; position: relative; padding-left: 25px;">Integración con herramientas externas</li>
                                    </ul>
                                    <a href="#" style="display: inline-block; background-color: #FF8C00; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; margin: 10px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Explorar Dashboard</a>
                                </td>
                                <td width="50%" style="width: 50%; padding: 0 0 0 15px; vertical-align: top;">
                                    <div style="text-align: center; margin: 0;">
                                        <img src="https://static.wikia.nocookie.net/shipping/images/7/75/Mario.png/revision/latest?cb=20211003000425&path-prefix=es" alt="Dashboard Inteligente" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px;">
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                `
            },
            'dos-columnas-foto-izquierda': {
                title: 'Dos Columnas - Foto Izquierda',
                html: `
                    <div style="margin-bottom: 30px; padding: 0 20px;">
                        <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">💡 Casos de Éxito</h2>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                            <tr>
                                <td width="50%" style="width: 50%; padding: 0 15px 0 0; vertical-align: top;">
                                    <div style="text-align: center; margin: 0;">
                                        <img src="https://static.wikia.nocookie.net/shipping/images/7/75/Mario.png/revision/latest?cb=20211003000425&path-prefix=es" alt="Caso de Éxito" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px;">
                                    </div>
                                </td>
                                <td width="50%" style="width: 50%; padding: 0 0 0 15px; vertical-align: top;">
                                    <h3 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">TechCorp: Transformación Digital</h3>
                                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">TechCorp logró reducir sus costos operativos en un 35% y aumentar su eficiencia en un 60% implementando nuestras soluciones de innovación.</p>
                                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">El proyecto incluyó:</p>
                                    <ul style="margin: 20px 0; padding-left: 25px; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; position: relative; padding-left: 25px;">Automatización de procesos críticos</li>
                                        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; position: relative; padding-left: 25px;">Implementación de IA para análisis</li>
                                        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; position: relative; padding-left: 25px;">Capacitación del equipo</li>
                                        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; position: relative; padding-left: 25px;">Seguimiento continuo de métricas</li>
                                    </ul>
                                    <a href="#" style="display: inline-block; background: transparent; border: 2px solid #20B2AA; color: #20B2AA !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; margin: 10px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Leer Caso Completo</a>
                                </td>
                            </tr>
                        </table>
                    </div>
                `
            },
            'dos-columnas-fotos': {
                title: 'Dos Columnas - Fotos',
                html: `
                    <div style="margin-bottom: 30px; padding: 0 20px;">
                        <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">📸 Galería de Proyectos</h2>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                            <tr>
                                <td width="50%" style="width: 50%; padding: 0 15px 0 0; vertical-align: top;">
                                    <div style="text-align: center; margin: 0;">
                                        <img src="https://static.wikia.nocookie.net/shipping/images/7/75/Mario.png/revision/latest?cb=20211003000425&path-prefix=es" alt="Proyecto A" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px;">
                                        <h3 style="text-align: center; margin-top: 15px; color: #4A90E2; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Proyecto A</h3>
                                        <p style="text-align: center; margin: 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Sistema de gestión de innovación para empresas medianas</p>
                                    </div>
                                </td>
                                <td width="50%" style="width: 50%; padding: 0 0 0 15px; vertical-align: top;">
                                    <div style="text-align: center; margin: 0;">
                                        <img src="https://static.wikia.nocookie.net/shipping/images/7/75/Mario.png/revision/latest?cb=20211003000425&path-prefix=es" alt="Proyecto B" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px;">
                                        <h3 style="text-align: center; margin-top: 15px; color: #4A90E2; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Proyecto B</h3>
                                        <p style="text-align: center; margin: 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Plataforma de colaboración para equipos remotos</p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                `
            },
            footer: {
                title: 'Footer',
                html: `
                    <div style="background-color: #343a40; color: #ffffff; padding: 30px 0; text-align: center;">
                        <div style="padding: 0 20px;">
                            <h3 style="color: #ffffff; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Conecta con Innk</h3>
                            <div style="margin: 20px 0;">
                                <a href="#" style="display: inline-block; margin: 0 15px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                    <span style="font-size: 24px; margin-right: 8px;">🔗</span>
                                    LinkedIn
                                </a>
                                <a href="#" style="display: inline-block; margin: 0 15px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                    <span style="font-size: 24px; margin-right: 8px;">📷</span>
                                    Instagram
                                </a>
                            </div>
                            <p style="margin: 0 0 15px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">¿Tienes preguntas? <a href="mailto:hola@innk.cl" style="color: #ffffff; text-decoration: none;">hola@innk.cl</a></p>
                            <div style="font-size: 12px; color: #adb5bd; margin-top: 0px;">
                                <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Recibiste este email porque te suscribiste a nuestro newsletter.<br>
                                <a href="#" style="color: #adb5bd; text-decoration: none;">Cancelar suscripción</a> | <a href="#" style="color: #adb5bd; text-decoration: none;">Actualizar preferencias</a></p>
                            </div>
                        </div>
                    </div>
                `
            }
        };
        
        return templates[sectionType] || { title: 'Sección', html: '<p>Contenido de la sección</p>' };
    }
    
    renderSections() {
        const container = document.getElementById('newsletterContainer');
        container.innerHTML = '';
        
        if (this.sections.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.sections.forEach((section, index) => {
            const sectionElement = this.createSectionElement(section, index);
            container.appendChild(sectionElement);
        });
    }
    
    createSectionElement(section, index) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'newsletter-section';
        sectionDiv.draggable = true;
        sectionDiv.dataset.sectionId = section.id;
        
        sectionDiv.innerHTML = `
            <div class="section-header">
                <div class="drag-handle">⋮⋮</div>
                <div class="section-title">${section.content.title}</div>
                <div class="section-controls">
                    <button class="control-btn edit" onclick="mailingBuilder.editSection('${section.id}')">✏️</button>
                    <button class="control-btn delete" onclick="mailingBuilder.deleteSection('${section.id}')">🗑️</button>
                </div>
            </div>
            <div class="section-content">
                <div class="newsletter-preview">
                    ${section.content.html}
                </div>
            </div>
        `;
        
        // Configurar drag and drop
        this.setupSectionDragAndDrop(sectionDiv, index);
        
        return sectionDiv;
    }
    
    setupSectionDragAndDrop(sectionElement, index) {
        sectionElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
            sectionElement.style.opacity = '0.5';
        });
        
        sectionElement.addEventListener('dragend', (e) => {
            sectionElement.style.opacity = '1';
        });
        
        sectionElement.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        sectionElement.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = index;
            
            if (fromIndex !== toIndex) {
                this.reorderSection(fromIndex, toIndex);
            }
        });
    }
    
    reorderSection(fromIndex, toIndex) {
        const section = this.sections.splice(fromIndex, 1)[0];
        this.sections.splice(toIndex, 0, section);
        this.renderSections();
    }
    
    editSection(sectionId) {
        console.log('Editando sección:', sectionId);
        const section = this.sections.find(s => s.id === sectionId);
        if (!section) {
            console.log('Sección no encontrada');
            return;
        }
        
        // Obtener el tipo de sección del título
        const sectionType = this.getSectionTypeFromId(sectionId);
        console.log('Tipo de sección detectado:', sectionType);
        
        this.currentEditingSection = section;
        this.currentEditingSectionType = sectionType;
        this.showEditModal(section, sectionType);
    }
    
    showEditModal(section, sectionType) {
        console.log('Mostrando modal para:', sectionType);
        const modal = document.getElementById('editModal');
        const title = document.getElementById('editModalTitle');
        const container = document.getElementById('editFormContainer');
        
        if (!modal || !title || !container) {
            console.error('Elementos del modal no encontrados');
            return;
        }
        
        title.textContent = `Editar: ${section.content.title}`;
        container.innerHTML = this.generateEditForm(section, sectionType);
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('Modal mostrado correctamente');
    }
    
    generateEditForm(section, sectionType) {
        console.log('Generando formulario para tipo:', sectionType);
        let formHTML = '';
        
        switch (sectionType) {
            case 'header':
                formHTML = this.generateHeaderEditForm(section);
                break;
            case 'saludo':
                formHTML = this.generateSaludoEditForm(section);
                break;
            case 'destacado':
                formHTML = this.generateDestacadoEditForm(section);
                break;
            case 'articulos':
                formHTML = this.generateArticulosEditForm(section);
                break;
            case 'eventos':
                formHTML = this.generateEventosEditForm(section);
                break;
            case 'cta':
                formHTML = this.generateCTAEditForm(section);
                break;
            case 'dos-columnas-texto':
                formHTML = this.generateDosColumnasTextoEditForm(section);
                break;
            case 'dos-columnas-foto-derecha':
                formHTML = this.generateDosColumnasFotoDerechaEditForm(section);
                break;
            case 'dos-columnas-foto-izquierda':
                formHTML = this.generateDosColumnasFotoIzquierdaEditForm(section);
                break;
            case 'dos-columnas-fotos':
                formHTML = this.generateDosColumnasFotosEditForm(section);
                break;
            case 'footer':
                formHTML = this.generateFooterEditForm(section);
                break;
            default:
                console.log('Tipo de sección no reconocido en generateEditForm:', sectionType);
                formHTML = '<p>Formulario de edición no disponible para este tipo de sección.</p>';
        }
        
        console.log('Formulario generado, longitud HTML:', formHTML.length);
        return formHTML;
    }
    
    getSectionTypeFromId(sectionId) {
        // Buscar la sección en el array de secciones
        const section = this.sections.find(s => s.id === sectionId);
        if (!section) {
            console.log('Sección no encontrada en getSectionTypeFromId');
            return 'unknown';
        }
        
        // Determinar el tipo basándose en el título de la sección
        const title = section.content.title;
        console.log('Título de la sección:', title);
        
        if (title.includes('Header')) return 'header';
        if (title.includes('Saludo')) return 'saludo';
        if (title.includes('Destacado')) return 'destacado';
        if (title.includes('Artículos')) return 'articulos';
        if (title.includes('Eventos')) return 'eventos';
        if (title.includes('Call to Action')) return 'cta';
        if (title.includes('Dos Columnas - Texto')) return 'dos-columnas-texto';
        if (title.includes('Dos Columnas - Foto Derecha')) return 'dos-columnas-foto-derecha';
        if (title.includes('Dos Columnas - Foto Izquierda')) return 'dos-columnas-foto-izquierda';
        if (title.includes('Dos Columnas - Fotos')) return 'dos-columnas-fotos';
        if (title.includes('Footer')) return 'footer';
        
        console.log('Tipo de sección no reconocido, título:', title);
        return 'unknown';
    }
    
    getSectionType(section) {
        // Determinar el tipo de sección basándose en el contenido
        if (section.content.html.includes('Header con Logo')) return 'header';
        if (section.content.html.includes('Saludo Personalizado')) return 'saludo';
        if (section.content.html.includes('Destacado')) return 'destacado';
        if (section.content.html.includes('Artículos')) return 'articulos';
        if (section.content.html.includes('Eventos')) return 'eventos';
        if (section.content.html.includes('Call to Action')) return 'cta';
        if (section.content.html.includes('Dos Columnas - Texto')) return 'dos-columnas-texto';
        if (section.content.html.includes('Dos Columnas - Foto Derecha')) return 'dos-columnas-foto-derecha';
        if (section.content.html.includes('Dos Columnas - Foto Izquierda')) return 'dos-columnas-foto-izquierda';
        if (section.content.html.includes('Dos Columnas - Fotos')) return 'dos-columnas-fotos';
        if (section.content.html.includes('Footer')) return 'footer';
        return 'unknown';
    }
    
    generateHeaderEditForm(section) {
        return `
            <div class="edit-form-group">
                <label>URL del Logo:</label>
                <div class="url-input">
                    <input type="url" id="headerLogoUrl" value="https://i.imgur.com/NPugcbi.png" placeholder="https://ejemplo.com/logo.png">
                    <button onclick="previewImage('headerLogoUrl', 'headerLogoPreview')">👁️</button>
                </div>
                <div class="image-preview" id="headerLogoPreview">
                    <img src="https://i.imgur.com/NPugcbi.png" alt="Logo Preview">
                </div>
            </div>
        `;
    }
    
    generateSaludoEditForm(section) {
        return `
            <div class="edit-form-group">
                <label>Título Principal:</label>
                <input type="text" id="saludoTitulo" value="¿Qué es la planificación de proyectos y cómo optimizarla?" placeholder="Título del saludo">
            </div>
            <div class="edit-form-group">
                <label>Descripción:</label>
                <textarea id="saludoDescripcion" placeholder="Descripción del saludo">Planificar proyectos de manera efectiva es clave para lograr resultados exitosos. En esta nota te compartimos:</textarea>
            </div>
            <div class="edit-form-group">
                <label>Punto 1:</label>
                <input type="text" id="saludoPunto1" value="3 aspectos para planificar proyectos de forma exitosa." placeholder="Primer punto">
            </div>
            <div class="edit-form-group">
                <label>Punto 2:</label>
                <input type="text" id="saludoPunto2" value="Principales tipos de planificación con ejemplos y consejos prácticos" placeholder="Segundo punto">
            </div>
            <div class="edit-form-group">
                <label>Punto 3:</label>
                <input type="text" id="saludoPunto3" value="3 aspectos para planificar proyectos de forma exitosa." placeholder="Tercer punto">
            </div>
        `;
    }
    
    generateDestacadoEditForm(section) {
        return `
            <div class="edit-form-group">
                <label>Título del Destacado:</label>
                <input type="text" id="destacadoTitulo" value="🔥 Destacado de la Semana" placeholder="Título del destacado">
            </div>
            <div class="edit-form-group">
                <label>Descripción:</label>
                <textarea id="destacadoDescripcion" placeholder="Descripción del destacado">Nueva funcionalidad disponible: Hemos lanzado nuestro sistema de gestión de proyectos mejorado con análisis en tiempo real y métricas avanzadas.</textarea>
            </div>
            <div class="edit-form-group">
                <label>Texto del Botón:</label>
                <input type="text" id="destacadoBoton" value="Descubrir Más" placeholder="Texto del botón">
            </div>
            <div class="edit-form-group">
                <label>URL del Botón:</label>
                <input type="url" id="destacadoUrl" value="#" placeholder="https://ejemplo.com">
            </div>
        `;
    }
    
    generateArticulosEditForm(section) {
        return `
            <div class="edit-form-group">
                <label>Título de la Sección:</label>
                <input type="text" id="articulosTitulo" value="📚 Artículos Recomendados" placeholder="Título de la sección">
            </div>
            <div class="edit-form-group">
                <label>Artículo 1 - Título:</label>
                <input type="text" id="articulo1Titulo" value="El Futuro de la IA en la Innovación Empresarial" placeholder="Título del primer artículo">
            </div>
            <div class="edit-form-group">
                <label>Artículo 1 - Descripción:</label>
                <textarea id="articulo1Descripcion" placeholder="Descripción del primer artículo">Descubre cómo la inteligencia artificial está transformando la manera en que las empresas innovan y crean valor.</textarea>
            </div>
            <div class="edit-form-group">
                <label>Artículo 2 - Título:</label>
                <input type="text" id="articulo2Titulo" value="Metodologías Ágiles para Proyectos de Innovación" placeholder="Título del segundo artículo">
            </div>
            <div class="edit-form-group">
                <label>Artículo 2 - Descripción:</label>
                <textarea id="articulo2Descripcion" placeholder="Descripción del segundo artículo">Aprende las mejores prácticas para implementar metodologías ágiles en tus proyectos de innovación.</textarea>
            </div>
            <div class="edit-form-group">
                <label>Artículo 3 - Título:</label>
                <input type="text" id="articulo3Titulo" value="Casos de Éxito: Empresas que Transformaron su Industria" placeholder="Título del tercer artículo">
            </div>
            <div class="edit-form-group">
                <label>Artículo 3 - Descripción:</label>
                <textarea id="articulo3Descripcion" placeholder="Descripción del tercer artículo">Inspírate con historias reales de empresas que revolucionaron sus mercados.</textarea>
            </div>
        `;
    }
    
    generateEventosEditForm(section) {
        return `
            <div class="edit-form-group">
                <label>Título de la Sección:</label>
                <input type="text" id="eventosTitulo" value="📅 Próximos Eventos" placeholder="Título de la sección">
            </div>
            <div class="edit-form-group">
                <label>Nombre del Evento:</label>
                <input type="text" id="eventoNombre" value="Webinar: Innovación Sostenible" placeholder="Nombre del evento">
            </div>
            <div class="edit-form-group">
                <label>Fecha:</label>
                <input type="text" id="eventoFecha" value="15 de Diciembre, 2024" placeholder="Fecha del evento">
            </div>
            <div class="edit-form-group">
                <label>Hora:</label>
                <input type="text" id="eventoHora" value="14:00 - 15:15:30 (GMT-3)" placeholder="Hora del evento">
            </div>
            <div class="edit-form-group">
                <label>URL de Registro:</label>
                <input type="url" id="eventoUrl" value="#" placeholder="https://ejemplo.com/registro">
            </div>
        `;
    }
    
    generateCTAEditForm(section) {
        return `
            <div class="edit-form-group">
                <label>Título del CTA:</label>
                <input type="text" id="ctaTitulo" value="¿Listo para Innovar?" placeholder="Título del call to action">
            </div>
            <div class="edit-form-group">
                <label>Descripción:</label>
                <textarea id="ctaDescripcion" placeholder="Descripción del CTA">Únete a nuestra comunidad de innovadores y accede a recursos exclusivos, herramientas avanzadas y networking de calidad.</textarea>
            </div>
            <div class="edit-form-group">
                <label>Texto del Botón:</label>
                <input type="text" id="ctaBoton" value="Comenzar Ahora" placeholder="Texto del botón">
            </div>
            <div class="edit-form-group">
                <label>URL del Botón:</label>
                <input type="url" id="ctaUrl" value="#" placeholder="https://ejemplo.com">
            </div>
        `;
    }
    
    generateDosColumnasTextoEditForm(section) {
        return `
            <div class="edit-form-group">
                <label>Título de la Sección:</label>
                <input type="text" id="dosColTitulo" value="📊 Análisis de Mercado" placeholder="Título de la sección">
            </div>
            <div class="edit-form-group">
                <label>Columna Izquierda - Título:</label>
                <input type="text" id="dosColColIzqTitulo" value="Tendencias Emergentes" placeholder="Título de la columna izquierda">
            </div>
            <div class="edit-form-group">
                <label>Columna Izquierda - Contenido:</label>
                <textarea id="dosColColIzqContenido" placeholder="Contenido de la columna izquierda">El mercado de la innovación está experimentando cambios significativos. Las empresas que adoptan tecnologías emergentes están viendo un aumento del 40% en su productividad.</textarea>
            </div>
            <div class="edit-form-group">
                <label>Columna Derecha - Título:</label>
                <input type="text" id="dosColColDerTitulo" value="Oportunidades de Crecimiento" placeholder="Título de la columna derecha">
            </div>
            <div class="edit-form-group">
                <label>Columna Derecha - Contenido:</label>
                <textarea id="dosColColDerContenido" placeholder="Contenido de la columna derecha">Las startups que se enfocan en soluciones sostenibles están captando la atención de inversores y consumidores por igual.</textarea>
            </div>
        `;
    }
    
    generateDosColumnasFotoDerechaEditForm(section) {
        return `
            <div class="edit-form-group">
                <label>Título de la Sección:</label>
                <input type="text" id="fotoDerTitulo" value="🚀 Nuevas Funcionalidades" placeholder="Título de la sección">
            </div>
            <div class="edit-form-group">
                <label>Columna Izquierda - Título:</label>
                <input type="text" id="fotoDerColIzqTitulo" value="Dashboard Inteligente" placeholder="Título de la columna izquierda">
            </div>
            <div class="edit-form-group">
                <label>Columna Izquierda - Contenido:</label>
                <textarea id="fotoDerColIzqContenido" placeholder="Contenido de la columna izquierda">Hemos lanzado un nuevo dashboard que utiliza inteligencia artificial para analizar el rendimiento de tus proyectos en tiempo real.</textarea>
            </div>
            <div class="edit-form-group">
                <label>URL de la Imagen:</label>
                <div class="url-input">
                    <input type="url" id="fotoDerImagenUrl" value="https://static.wikia.nocookie.net/shipping/images/7/75/Mario.png/revision/latest?cb=20211003000425&path-prefix=es" placeholder="https://ejemplo.com/imagen.png">
                    <button onclick="previewImage('fotoDerImagenUrl', 'fotoDerImagenPreview')">👁️</button>
                </div>
                <div class="image-preview" id="fotoDerImagenPreview">
                    <img src="https://static.wikia.nocookie.net/shipping/images/7/75/Mario.png/revision/latest?cb=20211003000425&path-prefix=es" alt="Imagen Preview">
                </div>
            </div>
        `;
    }
    
    generateDosColumnasFotoIzquierdaEditForm(section) {
        return `
            <div class="edit-form-group">
                <label>Título de la Sección:</label>
                <input type="text" id="fotoIzqTitulo" value="💡 Casos de Éxito" placeholder="Título de la sección">
            </div>
            <div class="edit-form-group">
                <label>URL de la Imagen:</label>
                <div class="url-input">
                    <input type="url" id="fotoIzqImagenUrl" value="https://static.wikia.nocookie.net/shipping/images/7/75/Mario.png/revision/latest?cb=20211003000425&path-prefix=es" placeholder="https://ejemplo.com/imagen.png">
                    <button onclick="previewImage('fotoIzqImagenUrl', 'fotoIzqImagenPreview')">👁️</button>
                </div>
                <div class="image-preview" id="fotoIzqImagenPreview">
                    <img src="https://static.wikia.nocookie.net/shipping/images/7/75/Mario.png/revision/latest?cb=20211003000425&path-prefix=es" alt="Imagen Preview">
                </div>
            </div>
            <div class="edit-form-group">
                <label>Columna Derecha - Título:</label>
                <input type="text" id="fotoIzqColDerTitulo" value="TechCorp: Transformación Digital" placeholder="Título de la columna derecha">
            </div>
            <div class="edit-form-group">
                <label>Columna Derecha - Contenido:</label>
                <textarea id="fotoIzqColDerContenido" placeholder="Contenido de la columna derecha">TechCorp logró reducir sus costos operativos en un 35% y aumentar su eficiencia en un 60% implementando nuestras soluciones de innovación.</textarea>
            </div>
        `;
    }
    
    generateDosColumnasFotosEditForm(section) {
        return `
            <div class="edit-form-group">
                <label>Título de la Sección:</label>
                <input type="text" id="fotosTitulo" value="📸 Galería de Proyectos" placeholder="Título de la sección">
            </div>
            <div class="edit-form-group">
                <label>Proyecto A - URL de Imagen:</label>
                <div class="url-input">
                    <input type="url" id="proyectoAImagenUrl" value="https://static.wikia.nocookie.net/shipping/images/7/75/Mario.png/revision/latest?cb=20211003000425&path-prefix=es" placeholder="https://ejemplo.com/imagen.png">
                    <button onclick="previewImage('proyectoAImagenUrl', 'proyectoAImagenPreview')">👁️</button>
                </div>
                <div class="image-preview" id="proyectoAImagenPreview">
                    <img src="https://static.wikia.nocookie.net/shipping/images/7/75/Mario.png/revision/latest?cb=20211003000425&path-prefix=es" alt="Imagen Preview">
                </div>
            </div>
            <div class="edit-form-group">
                <label>Proyecto A - Título:</label>
                <input type="text" id="proyectoATitulo" value="Proyecto A" placeholder="Título del proyecto A">
            </div>
            <div class="edit-form-group">
                <label>Proyecto A - Descripción:</label>
                <textarea id="proyectoADescripcion" placeholder="Descripción del proyecto A">Sistema de gestión de innovación para empresas medianas</textarea>
            </div>
            <div class="edit-form-group">
                <label>Proyecto B - URL de Imagen:</label>
                <div class="url-input">
                    <input type="url" id="proyectoBImagenUrl" value="https://static.wikia.nocookie.net/shipping/images/7/75/Mario.png/revision/latest?cb=20211003000425&path-prefix=es" placeholder="https://ejemplo.com/imagen.png">
                    <button onclick="previewImage('proyectoBImagenUrl', 'proyectoBImagenPreview')">👁️</button>
                </div>
                                <div class="image-preview" id="proyectoBImagenPreview">
                    <img src="https://static.wikia.nocookie.net/shipping/images/7/75/Mario.png/revision/latest?cb=20211003000425&path-prefix=es" alt="Imagen Preview">
                </div>
            </div>
            <div class="edit-form-group">
                <label>Proyecto B - Título:</label>
                <input type="text" id="proyectoBTitulo" value="Proyecto B" placeholder="Título del proyecto B">
            </div>
            <div class="edit-form-group">
                <label>Proyecto B - Descripción:</label>
                <textarea id="proyectoBDescripcion" placeholder="Descripción del proyecto B">Plataforma de colaboración para equipos remotos</textarea>
            </div>
        `;
    }
    
    generateFooterEditForm(section) {
        return `
            <div class="edit-form-group">
                <label>Título del Footer:</label>
                <input type="text" id="footerTitulo" value="Conecta con Innk" placeholder="Título del footer">
            </div>
            <div class="edit-form-group">
                <label>URL de LinkedIn:</label>
                <input type="url" id="footerLinkedinUrl" value="#" placeholder="https://linkedin.com/company/innk">
            </div>
            <div class="edit-form-group">
                <label>URL de Instagram:</label>
                <input type="url" id="footerInstagramUrl" value="#" placeholder="https://instagram.com/innk">
            </div>
            <div class="edit-form-group">
                <label>Email de Contacto:</label>
                <input type="email" id="footerEmail" value="hola@innk.cl" placeholder="hola@innk.cl">
            </div>
        `;
    }
    
    saveSectionChanges() {
        if (!this.currentEditingSection || !this.currentEditingSectionType) return;
        
        let newHtml = '';
        
        switch (this.currentEditingSectionType) {
            case 'header':
                newHtml = this.updateHeaderSection();
                break;
            case 'saludo':
                newHtml = this.updateSaludoSection();
                break;
            case 'destacado':
                newHtml = this.updateDestacadoSection();
                break;
            case 'articulos':
                newHtml = this.updateArticulosSection();
                break;
            case 'eventos':
                newHtml = this.updateEventosSection();
                break;
            case 'cta':
                newHtml = this.updateCTASection();
                break;
            case 'dos-columnas-texto':
                newHtml = this.updateDosColumnasTextoSection();
                break;
            case 'dos-columnas-foto-derecha':
                newHtml = this.updateDosColumnasFotoDerechaSection();
                break;
            case 'dos-columnas-foto-izquierda':
                newHtml = this.updateDosColumnasFotoIzquierdaSection();
                break;
            case 'dos-columnas-fotos':
                newHtml = this.updateDosColumnasFotosSection();
                break;
            case 'footer':
                newHtml = this.updateFooterSection();
                break;
        }
        
        if (newHtml) {
            this.currentEditingSection.content.html = newHtml;
            this.renderSections();
            closeEditModal();
        }
    }
    
    deleteSection(sectionId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta sección?')) {
            this.sections = this.sections.filter(s => s.id !== sectionId);
            this.renderSections();
        }
    }
    
    updateHeaderSection() {
        const logoUrl = document.getElementById('headerLogoUrl').value;
        return `
            <div style="padding: 20px 0; text-align: center;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${logoUrl}" alt="Innk Logo" style="width: auto; height: auto; display: block; margin: 0 auto; max-height: 80px;">
                </div>
            </div>
        `;
    }
    
    updateSaludoSection() {
        const titulo = document.getElementById('saludoTitulo').value;
        const descripcion = document.getElementById('saludoDescripcion').value;
        const punto1 = document.getElementById('saludoPunto1').value;
        const punto2 = document.getElementById('saludoPunto2').value;
        const punto3 = document.getElementById('saludoPunto3').value;
        
        return `
            <div style="margin-bottom: 30px; padding: 0 20px;">
                <div style="background-color: #F6F6FE; padding: 20px; border-radius: 8px;">
                    <h1 style="color: #4747F3; font-size: 22px; margin: 0 0 15px 0; border-bottom: 2px solid #E6E6FA; padding-bottom: 10px; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${titulo}</h1>
                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${descripcion}</p>
                    <ul style="margin: 0; padding-left: 20px; color: #555555; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                        <li style="margin-bottom: 8px;">${punto1}</li>
                        <li style="margin-bottom: 8px;">${punto2}</li>
                        <li style="margin-bottom: 8px;">${punto3}</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    updateDestacadoSection() {
        const titulo = document.getElementById('destacadoTitulo').value;
        const descripcion = document.getElementById('destacadoDescripcion').value;
        const boton = document.getElementById('destacadoBoton').value;
        const url = document.getElementById('destacadoUrl').value;
        
        return `
            <div style="margin-bottom: 30px; padding: 0 20px;">
                <h2 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${titulo}</h2>
                <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Nueva funcionalidad disponible:</strong> ${descripcion}</p>
                <a href="${url}" style="display: inline-block; background-color: #FF8C00; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; margin: 10px 0; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${boton}</a>
            </div>
        `;
    }
    
    updateArticulosSection() {
        const titulo = document.getElementById('articulosTitulo').value;
        const articulo1Titulo = document.getElementById('articulo1Titulo').value;
        const articulo1Descripcion = document.getElementById('articulo1Descripcion').value;
        const articulo2Titulo = document.getElementById('articulo2Titulo').value;
        const articulo2Descripcion = document.getElementById('articulo2Descripcion').value;
        const articulo3Titulo = document.getElementById('articulo3Titulo').value;
        const articulo3Descripcion = document.getElementById('articulo3Descripcion').value;
        
        return `
            <div style="margin-bottom: 30px; padding: 0 20px;">
                <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${titulo}</h2>
                <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>1. ${articulo1Titulo}</strong><br>
                ${articulo1Descripcion}</p>
                
                <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>2. ${articulo2Titulo}</strong><br>
                ${articulo2Descripcion}</p>
                
                <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>3. ${articulo3Titulo}</strong><br>
                ${articulo3Descripcion}</p>
            </div>
        `;
    }
    
    updateEventosSection() {
        const titulo = document.getElementById('eventosTitulo').value;
        const nombre = document.getElementById('eventoNombre').value;
        const fecha = document.getElementById('eventoFecha').value;
        const hora = document.getElementById('eventoHora').value;
        const url = document.getElementById('eventoUrl').value;
        
        return `
            <div style="margin-bottom: 30px; padding: 0 20px;">
                <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${titulo}</h2>
                <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>${nombre}</strong><br>
                <em>Fecha:</em> ${fecha}<br>
                <em>Hora:</em> ${hora}<br>
                <em>Registro:</em> <a href="${url}" style="color: #20B2AA; text-decoration: none;">Inscríbete aquí</a></p>
            </div>
        `;
    }
    
    updateCTASection() {
        const titulo = document.getElementById('ctaTitulo').value;
        const descripcion = document.getElementById('ctaDescripcion').value;
        const boton = document.getElementById('ctaBoton').value;
        const url = document.getElementById('ctaUrl').value;
        
        return `
            <div style="margin-bottom: 30px; padding: 0 20px; text-align: center;">
                <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${titulo}</h2>
                <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${descripcion}</p>
                <a href="${url}" style="display: inline-block; background-color: #FF8C00; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; margin: 10px 0; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${boton}</a>
            </div>
        `;
    }
    
    updateDosColumnasTextoSection() {
        const titulo = document.getElementById('dosColTitulo').value;
        const colIzqTitulo = document.getElementById('dosColColIzqTitulo').value;
        const colIzqContenido = document.getElementById('dosColColIzqContenido').value;
        const colDerTitulo = document.getElementById('dosColColDerTitulo').value;
        const colDerContenido = document.getElementById('dosColColDerContenido').value;
        
        return `
            <div style="margin-bottom: 30px; padding: 0 20px;">
                <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${titulo}</h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                    <tr>
                        <td width="50%" style="width: 50%; padding: 0 15px 0 0; vertical-align: top;">
                            <h3 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${colIzqTitulo}</h3>
                            <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${colIzqContenido}</p>
                        </td>
                        <td width="50%" style="width: 50%; padding: 0 0 0 15px; vertical-align: top;">
                            <h3 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${colDerTitulo}</h3>
                            <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${colDerContenido}</p>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    }
    
    updateDosColumnasFotoDerechaSection() {
        const titulo = document.getElementById('fotoDerTitulo').value;
        const colIzqTitulo = document.getElementById('fotoDerColIzqTitulo').value;
        const colIzqContenido = document.getElementById('fotoDerColIzqContenido').value;
        const imagenUrl = document.getElementById('fotoDerImagenUrl').value;
        
        return `
            <div style="margin-bottom: 30px; padding: 0 20px;">
                <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${titulo}</h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                    <tr>
                        <td width="50%" style="width: 50%; padding: 0 15px 0 0; vertical-align: top;">
                            <h3 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${colIzqTitulo}</h3>
                            <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${colIzqContenido}</p>
                        </td>
                        <td width="50%" style="width: 50%; padding: 0 0 0 15px; vertical-align: top;">
                            <div style="text-align: center; margin: 0;">
                                <img src="${imagenUrl}" alt="Imagen" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px;">
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    }
    
    updateDosColumnasFotoIzquierdaSection() {
        const titulo = document.getElementById('fotoIzqTitulo').value;
        const imagenUrl = document.getElementById('fotoIzqImagenUrl').value;
        const colDerTitulo = document.getElementById('fotoIzqColDerTitulo').value;
        const colDerContenido = document.getElementById('fotoIzqColDerContenido').value;
        
        return `
            <div style="margin-bottom: 30px; padding: 0 20px;">
                <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${titulo}</h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                    <tr>
                        <td width="50%" style="width: 50%; padding: 0 15px 0 0; vertical-align: top;">
                            <div style="text-align: center; margin: 0;">
                                <img src="${imagenUrl}" alt="Imagen" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px;">
                            </div>
                        </td>
                        <td width="50%" style="width: 50%; padding: 0 0 0 15px; vertical-align: top;">
                            <h3 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${colDerTitulo}</h3>
                            <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${colDerContenido}</p>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    }
    
    updateDosColumnasFotosSection() {
        const titulo = document.getElementById('fotosTitulo').value;
        const proyectoAImagenUrl = document.getElementById('proyectoAImagenUrl').value;
        const proyectoATitulo = document.getElementById('proyectoATitulo').value;
        const proyectoADescripcion = document.getElementById('proyectoADescripcion').value;
        const proyectoBImagenUrl = document.getElementById('proyectoBImagenUrl').value;
        const proyectoBTitulo = document.getElementById('proyectoBTitulo').value;
        const proyectoBDescripcion = document.getElementById('proyectoBDescripcion').value;
        
        return `
            <div style="margin-bottom: 30px; padding: 0 20px;">
                <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${titulo}</h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                    <tr>
                        <td width="50%" style="width: 50%; padding: 0 15px 0 0; vertical-align: top;">
                            <div style="text-align: center; margin: 0;">
                                <img src="${proyectoAImagenUrl}" alt="Proyecto A" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px;">
                                <h3 style="text-align: center; margin-top: 15px; color: #4A90E2; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${proyectoATitulo}</h3>
                                <p style="text-align: center; margin: 0; color: #555555; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${proyectoADescripcion}</p>
                            </div>
                        </td>
                        <td width="50%" style="width: 50%; padding: 0 0 0 15px; vertical-align: top;">
                            <div style="text-align: center; margin: 0;">
                                <img src="${proyectoBImagenUrl}" alt="Proyecto B" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px;">
                                <h3 style="text-align: center; margin-top: 15px; color: #4A90E2; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${proyectoBTitulo}</h3>
                                <p style="text-align: center; margin: 0; color: #555555; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${proyectoBDescripcion}</p>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    }
    
    updateFooterSection() {
        const titulo = document.getElementById('footerTitulo').value;
        const linkedinUrl = document.getElementById('footerLinkedinUrl').value;
        const instagramUrl = document.getElementById('footerInstagramUrl').value;
        const email = document.getElementById('footerEmail').value;
        
        return `
            <div style="background-color: #343a40; color: #ffffff; padding: 30px 0; text-align: center;">
                <div style="padding: 0 20px;">
                    <h3 style="color: #ffffff; margin: 0 0 15px 0; font-size: 18px; font-family: 'Space Grotesk', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${titulo}</h3>
                    <div style="margin: 20px 0;">
                        <a href="${linkedinUrl}" style="display: inline-block; margin: 0 15px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                            <span style="font-size: 24px; margin-right: 8px;">🔗</span>
                            LinkedIn
                        </a>
                        <a href="${instagramUrl}" style="display: inline-block; margin: 0 15px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                            <span style="font-size: 24px; margin-right: 8px;">📷</span>
                            Instagram
                        </a>
                    </div>
                    <p style="margin: 0 0 15px 0; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">¿Tienes preguntas? <a href="mailto:${email}" style="color: #ffffff; text-decoration: none;">${email}</a></p>
                    <div style="font-size: 12px; color: #adb5bd; margin-top: 0px;">
                        <p style="margin: 0; font-family: 'Epilogue', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Recibiste este email porque te suscribiste a nuestro newsletter.<br>
                        <a href="#" style="color: #adb5bd; text-decoration: none;">Cancelar suscripción</a> | <a href="#" style="color: #adb5bd; text-decoration: none;">Actualizar preferencias</a></p>
                    </div>
                </div>
            </div>
        `;
    }
    
    hideEmptyState() {
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }
    
    showEmptyState() {
        const container = document.getElementById('newsletterContainer');
        container.innerHTML = `
            <div class="empty-state">
                <h3>🎯 Comienza a construir tu newsletter</h3>
                <p>Haz clic en las secciones del panel izquierdo para agregarlas aquí</p>
                <p>Puedes arrastrar y soltar para reordenar las secciones</p>
            </div>
        `;
    }
    
    exportCode() {
        if (this.sections.length === 0) {
            alert('No hay secciones para exportar. Agrega al menos una sección primero.');
            return;
        }
        
        let htmlCode = '';
        
        // Agregar estructura de tabla principal
        htmlCode += '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">\n';
        htmlCode += '    <tr>\n';
        htmlCode += '        <td align="center" style="background-color: #f4f4f4; padding: 20px 0;">\n';
        htmlCode += '            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">\n';
        
        // Agregar cada sección
        this.sections.forEach(section => {
            htmlCode += '                <tr>\n';
            htmlCode += '                    <td style="padding: 0; background-color: #ffffff;">\n';
            htmlCode += section.content.html;
            htmlCode += '                    </td>\n';
            htmlCode += '                </tr>\n';
        });
        
        // Cerrar estructura de tabla
        htmlCode += '            </table>\n';
        htmlCode += '        </td>\n';
        htmlCode += '    </tr>\n';
        htmlCode += '</table>';
        
        return htmlCode;
    }
    
    toggleViewMode() {
        const container = document.getElementById('newsletterContainer');
        const viewModeBtn = document.getElementById('viewModeBtn');
        
        if (this.sections.length === 0) {
            alert('No hay secciones para mostrar en vista previa. Agrega al menos una sección primero.');
            return;
        }
        
        if (container.classList.contains('newsletter-full-preview')) {
            // Volver a vista de construcción
            container.classList.remove('newsletter-full-preview');
            viewModeBtn.textContent = '👁️ Vista Previa';
            this.renderSections();
        } else {
            // Mostrar vista previa completa
            container.classList.add('newsletter-full-preview');
            viewModeBtn.textContent = '🔧 Modo Edición';
            this.renderFullPreview();
        }
    }
    
    renderFullPreview() {
        const container = document.getElementById('newsletterContainer');
        container.innerHTML = '';
        
        if (this.sections.length === 0) {
            this.showEmptyState();
            return;
        }
        
        // Crear estructura de tabla para vista previa completa
        const table = document.createElement('table');
        table.setAttribute('role', 'presentation');
        table.setAttribute('cellspacing', '0');
        table.setAttribute('cellpadding', '0');
        table.setAttribute('border', '0');
        table.setAttribute('width', '100%');
        table.style.cssText = 'max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);';
        
        this.sections.forEach(section => {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.style.cssText = 'padding: 0; background-color: #ffffff;';
            cell.innerHTML = section.content.html;
            row.appendChild(cell);
            table.appendChild(row);
        });
        
        container.appendChild(table);
    }
}

        // Función global para exportar código
        function exportCode() {
            const code = mailingBuilder.exportCode();
            const codeOutput = document.getElementById('codeOutput');
            
            if (code) {
                codeOutput.textContent = code;
                codeOutput.style.display = 'block';
                
                // Copiar al portapapeles
                navigator.clipboard.writeText(code).then(() => {
                    alert('¡Código copiado al portapapeles!');
                }).catch(() => {
                    // Fallback para navegadores que no soportan clipboard API
                    codeOutput.select();
                    document.execCommand('copy');
                    alert('¡Código copiado al portapapeles!');
                });
            }
        }
        
        // Función para alternar entre vista de construcción y vista previa
        function toggleViewMode() {
            mailingBuilder.toggleViewMode();
        }
        
        // Función para cerrar el modal de edición
        function closeEditModal() {
            const modal = document.getElementById('editModal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        // Función para previsualizar imágenes
        function previewImage(inputId, previewId) {
            const input = document.getElementById(inputId);
            const preview = document.getElementById(previewId);
            const img = preview.querySelector('img');
            
            if (input.value) {
                img.src = input.value;
                img.onerror = function() {
                    this.src = 'https://via.placeholder.com/200x150?text=Error+en+imagen';
                };
            }
        }
        
        // Función para guardar los cambios de edición
        function saveEditChanges() {
            if (mailingBuilder && mailingBuilder.currentEditingSection) {
                mailingBuilder.saveSectionChanges();
            }
        }

// Inicializar la aplicación
let mailingBuilder;
document.addEventListener('DOMContentLoaded', () => {
    mailingBuilder = new MailingBuilder();
}); 