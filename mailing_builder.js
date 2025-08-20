// Mantenedor de Mailings - Innk
class MailingBuilder {
    constructor() {
        this.sections = [];
        this.sectionCounter = 0;
        this.currentEditingSection = null;
        this.currentEditingSectionType = null;
        this.currentNewsletterId = null;
        this.currentNewsletterName = '';
        this.currentNewsletterDescription = '';
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.loadNewslettersList();
        
        // Agregar función de debugging al objeto global
        window.debugSections = () => {
            console.log('Estado actual de las secciones:', this.sections);
            this.sections.forEach((section, index) => {
                console.log(`Sección ${index}:`, {
                    id: section.id,
                    type: this.getSectionTypeFromId(section.id),
                    title: section.content.title,
                    htmlPreview: section.content.html.substring(0, 100) + '...'
                });
            });
        };
    }
    
    setupEventListeners() {
        // Event listeners para las secciones del sidebar
        document.querySelectorAll('.section-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const sectionType = e.currentTarget.dataset.section;
                this.addSection(sectionType);
            });
        });
        
        // Event listener para el botón de guardar
        const saveBtn = document.getElementById('saveNewsletterBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveNewsletter());
        }
        
        // Event listener para el botón de nuevo
        const newBtn = document.getElementById('newNewsletterBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.newNewsletter());
        }
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
        
        // Agregar header con información del newsletter (sin botones)
        if (this.currentNewsletterName || this.currentNewsletterId) {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'newsletter-header';
            
            let headerHTML = '<div class="newsletter-info">';
            
            // Icono y título
            headerHTML += '<div class="newsletter-icon">📝</div>';
            headerHTML += '<div class="newsletter-details">';
            
            if (this.currentNewsletterName) {
                headerHTML += `<h3>${this.currentNewsletterName}</h3>`;
            } else {
                headerHTML += '<h3>Newsletter Sin Nombre</h3>';
            }
            
            if (this.currentNewsletterDescription) {
                headerHTML += `<p>${this.currentNewsletterDescription}</p>`;
            }
            
            headerHTML += '</div>';
            
            // Información del lado derecho
            if (this.currentNewsletterId) {
                headerHTML += '<div class="newsletter-meta">';
                headerHTML += `<span class="newsletter-id">ID: ${this.currentNewsletterId}</span>`;
                headerHTML += '<br>';
                headerHTML += `<span class="newsletter-sections">${this.sections.length} secciones</span>`;
                headerHTML += '</div>';
            }
            
            headerHTML += '</div>';
            
            headerDiv.innerHTML = headerHTML;
            container.appendChild(headerDiv);
        }
        
        // Agregar secciones
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
            
            if (fromIndex !== toIndex && !isNaN(fromIndex)) {
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
        const section = this.sections.find(s => s.id === sectionId);
        if (!section) {
            console.error('Sección no encontrada:', sectionId);
            return;
        }
        
        // Obtener el tipo de sección del título
        const sectionType = this.getSectionTypeFromId(sectionId);
        
        console.log('Editando sección:', {
            sectionId: sectionId,
            sectionType: sectionType,
            sectionTitle: section.content.title,
            sectionHtml: section.content.html.substring(0, 100) + '...'
        });
        
        this.currentEditingSection = section;
        this.currentEditingSectionType = sectionType;
        this.showEditModal(section, sectionType);
        
        // Mostrar notificación de que se está editando
        notifications.info('Editando Sección', `✏️ Editando: ${section.content.title || 'Sección sin título'}`);
    }
    
    showEditModal(section, sectionType) {
        // Limpiar solo el contenido del modal, NO las variables de edición
        this.resetEditModalContent();
        
        const modal = document.getElementById('editModal');
        const title = document.getElementById('editModalTitle');
        const container = document.getElementById('editFormContainer');
        const footer = modal.querySelector('.edit-modal-footer');
        
        if (!modal || !title || !container || !footer) {
            return;
        }
        
        title.textContent = `Editar: ${section.content.title}`;
        container.innerHTML = this.generateEditForm(section, sectionType);
        
        // Configurar los botones del modal dinámicamente
        footer.innerHTML = `
            <button class="control-btn edit" id="saveSectionBtn">💾 Guardar</button>
            <button class="control-btn delete" id="cancelSectionBtn">❌ Cancelar</button>
        `;
        
        // Configurar event listeners para los botones
        this.setupModalEventListeners();
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    setupModalEventListeners() {
        const saveBtn = document.getElementById('saveSectionBtn');
        const cancelBtn = document.getElementById('cancelSectionBtn');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSectionChanges();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                closeEditModal();
            });
        }
    }
    
    resetEditModal() {
        // Limpiar contenedor del formulario
        const container = document.getElementById('editFormContainer');
        if (container) {
            container.innerHTML = '';
        }
        
        // Limpiar título
        const title = document.getElementById('editModalTitle');
        if (title) {
            title.textContent = 'Editar Sección';
        }
        
        // Limpiar variables de edición
        this.currentEditingSection = null;
        this.currentEditingSectionType = null;
    }
    
    resetEditModalContent() {
        // Limpiar solo el contenido del modal, NO las variables de edición
        const container = document.getElementById('editFormContainer');
        if (container) {
            container.innerHTML = '';
        }
        
        // Limpiar título
        const title = document.getElementById('editModalTitle');
        if (title) {
            title.textContent = 'Editar Sección';
        }
        
        // NO limpiar las variables de edición aquí
    }
    
    // Función para verificar el estado del modal
    checkModalState() {
        const modal = document.getElementById('editModal');
        const title = document.getElementById('editModalTitle');
        const container = document.getElementById('editFormContainer');
        const footer = modal?.querySelector('.edit-modal-footer');
        
        return {
            modalExists: !!modal,
            titleExists: !!title,
            containerExists: !!container,
            footerExists: !!footer,
            modalVisible: modal?.style.display === 'block',
            hasContent: container?.innerHTML.length > 0,
            hasButtons: footer?.innerHTML.includes('Guardar')
        };
    }
    
    // Función para verificar el estado de edición
    checkEditState() {
        return {
            hasCurrentSection: !!this.currentEditingSection,
            hasSectionType: !!this.currentEditingSectionType,
            sectionId: this.currentEditingSection?.id,
            sectionType: this.currentEditingSectionType,
            sectionTitle: this.currentEditingSection?.content?.title,
            sectionContent: this.currentEditingSection?.content?.html ? 'Presente' : 'Ausente'
        };
    }
    
    generateEditForm(section, sectionType) {
        let formHTML = '';
        
        // Log para debugging
        console.log('Generando formulario de edición para:', {
            sectionId: section.id,
            sectionType: sectionType,
            sectionTitle: section.content.title,
            sectionHtml: section.content.html.substring(0, 100) + '...'
        });
        
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
                console.warn('Tipo de sección no reconocido:', sectionType, 'para sección:', section.id);
                formHTML = `
                    <div style="padding: 20px; text-align: center; color: #666;">
                        <p><strong>Formulario de edición no disponible para este tipo de sección.</strong></p>
                        <p>Tipo detectado: <code>${sectionType}</code></p>
                        <p>ID de sección: <code>${section.id}</code></p>
                        <p>Título: <code>${section.content.title}</code></p>
                        <p>Si crees que esto es un error, contacta al administrador.</p>
                    </div>
                `;
        }
        
        return formHTML;
    }
    
    getSectionTypeFromId(sectionId) {
        // Buscar la sección en el array de secciones
        const section = this.sections.find(s => s.id === sectionId);
        if (!section) {
            return 'unknown';
        }
        
        // Primero intentar determinar el tipo basándose en el contenido HTML
        const htmlContent = section.content.html;
        if (htmlContent.includes('Header con Logo')) return 'header';
        if (htmlContent.includes('Saludo Personalizado') || htmlContent.includes('background-color: #F6F6FE')) return 'saludo';
        if (htmlContent.includes('Destacado')) return 'destacado';
        if (htmlContent.includes('Artículos Recomendados')) return 'articulos';
        if (htmlContent.includes('Próximos Eventos')) return 'eventos';
        if (htmlContent.includes('¿Listo para Innovar?')) return 'cta';
        if (htmlContent.includes('Dos Columnas - Texto') || htmlContent.includes('Análisis de Mercado')) return 'dos-columnas-texto';
        if (htmlContent.includes('Dos Columnas - Foto Derecha')) return 'dos-columnas-foto-derecha';
        if (htmlContent.includes('Dos Columnas - Foto Izquierda')) return 'dos-columnas-foto-izquierda';
        if (htmlContent.includes('Dos Columnas - Fotos')) return 'dos-columnas-fotos';
        if (htmlContent.includes('Footer')) return 'footer';
        
        // Si no se puede determinar por HTML, intentar por el título
        const title = section.content.title;
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
        
        return 'unknown';
    }
    
    getSectionType(section) {
        // Determinar el tipo de sección basándose en el contenido
        const htmlContent = section.content.html;
        
        if (htmlContent.includes('Header con Logo')) return 'header';
        if (htmlContent.includes('Saludo Personalizado') || htmlContent.includes('background-color: #F6F6FE')) return 'saludo';
        if (htmlContent.includes('Destacado')) return 'destacado';
        if (htmlContent.includes('Artículos Recomendados')) return 'articulos';
        if (htmlContent.includes('Próximos Eventos')) return 'eventos';
        if (htmlContent.includes('¿Listo para Innovar?')) return 'cta';
        if (htmlContent.includes('Dos Columnas - Texto') || htmlContent.includes('Análisis de Mercado')) return 'dos-columnas-texto';
        if (htmlContent.includes('Dos Columnas - Foto Derecha')) return 'dos-columnas-foto-derecha';
        if (htmlContent.includes('Dos Columnas - Foto Izquierda')) return 'dos-columnas-foto-izquierda';
        if (htmlContent.includes('Dos Columnas - Fotos')) return 'dos-columnas-fotos';
        if (htmlContent.includes('Footer')) return 'footer';
        
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
        // Debug: mostrar el estado actual
        const debugInfo = {
            hasCurrentSection: !!this.currentEditingSection,
            hasSectionType: !!this.currentEditingSectionType,
            sectionId: this.currentEditingSection?.id,
            sectionType: this.currentEditingSectionType,
            sectionTitle: this.currentEditingSection?.content?.title
        };
        
        if (!this.currentEditingSection || !this.currentEditingSectionType) {
            notifications.error('Error', `No hay sección seleccionada para editar. Debug: ${JSON.stringify(debugInfo)}`);
            return;
        }
        
        let newHtml = '';
        
        try {
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
                default:
                    notifications.error('Error', `Tipo de sección no reconocido: ${this.currentEditingSectionType}`);
                    return;
            }
            
            if (newHtml) {
                // Actualizar el contenido HTML de la sección
                this.currentEditingSection.content.html = newHtml;
                
                // Actualizar también el título si es posible
                if (this.currentEditingSection.content.title) {
                    // Extraer el título del nuevo HTML si es posible
                    const titleMatch = newHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/);
                    if (titleMatch) {
                        this.currentEditingSection.content.title = titleMatch[1];
                    }
                }
                
                // Forzar la actualización de la vista
                this.renderSections();
                
                // Mostrar notificación de éxito
                notifications.success('Sección Actualizada', '✅ Cambios guardados correctamente');
                
                // Limpiar variables de edición
                this.currentEditingSection = null;
                this.currentEditingSectionType = null;
                
                // Cerrar el modal
                closeEditModal();
            } else {
                notifications.error('Error', 'No se pudo generar el contenido de la sección');
            }
        } catch (error) {
            notifications.error('Error', 'Error al guardar los cambios: ' + error.message);
        }
    }
    
    deleteSection(sectionId) {
        // Mostrar notificación de confirmación con ID único
        const notificationId = `delete-section-${sectionId}-${Date.now()}`;
        
        const confirmNotification = notifications.show({
            type: 'warning',
            title: 'Confirmar Eliminación',
            message: '¿Estás seguro de que quieres eliminar esta sección?',
            duration: 0, // No auto-remover
            actions: [
                {
                    text: 'Sí, Eliminar',
                    type: 'primary',
                    onclick: `mailingBuilder.confirmDeleteSection('${sectionId}', '${notificationId}')`
                },
                {
                    text: 'Cancelar',
                    type: 'secondary',
                    onclick: `notifications.remove(document.getElementById('${notificationId}'))`
                }
            ]
        });
        
        // Asignar el ID personalizado a la notificación
        if (confirmNotification) {
            confirmNotification.id = notificationId;
        }
    }
    
    confirmDeleteSection(sectionId, notificationId) {
        // Remover la notificación de confirmación de manera segura
        this.removeConfirmationNotification(notificationId);
        
        // Eliminar la sección
        this.sections = this.sections.filter(s => s.id !== sectionId);
        this.renderSections();
        notifications.success('Sección Eliminada', '✅ Sección eliminada exitosamente');
    }
    
    // Función helper para remover notificaciones de confirmación
    removeConfirmationNotification(notificationId) {
        try {
            notifications.remove(notificationId);
        } catch (error) {
            // Si hay algún error, intentar remover por ID directamente
            const notification = document.getElementById(notificationId);
            if (notification && notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }
    }
    
    // Función para limpiar todas las notificaciones de confirmación pendientes
    clearPendingConfirmations() {
        const pendingNotifications = document.querySelectorAll('.notification.warning');
        pendingNotifications.forEach(notification => {
            if (notification.querySelector('.notification-actions')) {
                notifications.remove(notification);
            }
        });
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
                <div style="margin-top: 20px;">
                    <button id="newNewsletterBtn" class="export-btn" style="margin-right: 10px;">📝 Nuevo Newsletter</button>
                    <button id="loadNewsletterBtn" class="control-btn edit" style="padding: 8px 16px;">📂 Cargar Newsletter</button>
                </div>
            </div>
        `;
        
        // Agregar event listeners a los nuevos botones
        const newBtn = document.getElementById('newNewsletterBtn');
        const loadBtn = document.getElementById('loadNewsletterBtn');
        
        if (newBtn) {
            newBtn.addEventListener('click', () => this.newNewsletter());
        }
        
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.showLoadNewsletterModal());
        }
    }
    
    exportCode() {
        if (this.sections.length === 0) {
            notifications.warning('Sin Contenido', 'No hay secciones para exportar. Agrega al menos una sección primero.');
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
            notifications.warning('Sin Contenido', 'No hay secciones para mostrar en vista previa. Agrega al menos una sección primero.');
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
    
    toggleManageView() {
        const container = document.getElementById('newsletterContainer');
        const manageBtn = document.getElementById('manageNewslettersBtn');
        
        if (container.classList.contains('manage-view')) {
            // Volver a vista de construcción
            container.classList.remove('manage-view');
            manageBtn.textContent = '📚 Gestionar Newsletters';
            this.renderSections();
        } else {
            // Mostrar vista de gestión
            container.classList.add('manage-view');
            manageBtn.textContent = '🔧 Volver al Constructor';
            this.renderManageView();
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
    
    renderManageView() {
        const container = document.getElementById('newsletterContainer');
        container.innerHTML = '';
        
        // Header de la vista de gestión
        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = 'background: linear-gradient(135deg, #4A90E2, #7B68EE); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;';
        headerDiv.innerHTML = `
            <h2 style="margin: 0 0 10px 0; font-family: \'Space Grotesk\', sans-serif;">📚 Gestión de Newsletters</h2>
            <p style="margin: 0; opacity: 0.9;">Administra todos tus newsletters guardados</p>
        `;
        container.appendChild(headerDiv);
        
        // Botón para crear nuevo newsletter
        const newBtnDiv = document.createElement('div');
        newBtnDiv.style.cssText = 'text-align: center; margin-bottom: 20px;';
        newBtnDiv.innerHTML = `
            <button onclick="mailingBuilder.createNewFromManage()" class="export-btn" style="margin: 0;">
                🆕 Crear Nuevo Newsletter
            </button>
        `;
        container.appendChild(newBtnDiv);
        
        // Contenedor para la lista de newsletters
        const listContainer = document.createElement('div');
        listContainer.id = 'newslettersListContainer';
        listContainer.style.cssText = 'background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';
        container.appendChild(listContainer);
        
        // Cargar y mostrar la lista
        this.loadAndRenderNewslettersList();
    }
    
    // ===== FUNCIONES DE LA API =====
    
    async loadNewslettersList() {
        try {
            const response = await fetch('/api/newsletter');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            if (result.success) {
                this.newslettersList = result.data;
                this.updateNewsletterSelector();
                this.showConnectionStatus(true);
            }
        } catch (error) {
            console.error('Error cargando newsletters:', error);
            this.showConnectionStatus(false);
        }
    }
    
    showConnectionStatus(isConnected) {
        const container = document.getElementById('newsletterContainer');
        let statusElement = container.querySelector('.connection-status');
        
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.className = 'connection-status';
            statusElement.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 10px 15px; border-radius: 5px; font-size: 12px; z-index: 1000;';
            document.body.appendChild(statusElement);
        }
        
        if (isConnected) {
            statusElement.textContent = '✅ Conectado a la API';
            statusElement.style.backgroundColor = '#d4edda';
            statusElement.style.color = '#155724';
            statusElement.style.border = '1px solid #c3e6cb';
        } else {
            statusElement.textContent = '❌ Sin conexión a la API';
            statusElement.style.backgroundColor = '#f8d7da';
            statusElement.style.color = '#721c24';
            statusElement.style.border = '1px solid #f5c6cb';
        }
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            if (statusElement) {
                statusElement.style.opacity = '0';
                statusElement.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    if (statusElement && statusElement.parentNode) {
                        statusElement.parentNode.removeChild(statusElement);
                    }
                }, 500);
            }
        }, 3000);
    }
    
    // ===== FUNCIONES DE GESTIÓN DE NEWSLETTERS =====
    
    async loadAndRenderNewslettersList() {
        try {
            const response = await fetch('/api/newsletter');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            if (result.success) {
                this.newslettersList = result.data;
                this.renderNewslettersList();
            }
        } catch (error) {
            console.error('Error cargando newsletters:', error);
            this.showErrorInManageView('Error cargando newsletters: ' + error.message);
        }
    }
    
    renderNewslettersList() {
        const container = document.getElementById('newslettersListContainer');
        
        if (!this.newslettersList || this.newslettersList.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #999;">
                    <h3 style="margin: 0 0 15px 0; color: #666;">📭 No hay newsletters guardados</h3>
                    <p style="margin: 0;">Crea tu primer newsletter para comenzar</p>
                </div>
            `;
            return;
        }
        
        let html = '<div style="margin-bottom: 20px;">';
        html += '<h3 style="color: #4A90E2; margin: 0 0 15px 0; font-family: \'Space Grotesk\', sans-serif;">📋 Newsletters Guardados (' + this.newslettersList.length + ')</h3>';
        html += '</div>';
        
        this.newslettersList.forEach(newsletter => {
            const date = new Date(newsletter.updated_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
                <div class="newsletter-item" data-newsletter-id="${newsletter.id}" style="border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: #f8f9fa; transition: all 0.3s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 8px 0; color: #4A90E2; font-family: \'Space Grotesk\', sans-serif; font-size: 18px;">📝 ${newsletter.name}</h4>
                            <p style="margin: 0 0 10px 0; color: #666; font-style: italic;">${newsletter.description || 'Sin descripción'}</p>
                            <div style="display: flex; gap: 15px; font-size: 12px; color: #999;">
                                <span>🆔 ID: ${newsletter.id}</span>
                                <span>📅 ${date}</span>
                                <span>🔢 ${newsletter.sections_count} secciones</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; flex-shrink: 0;">
                            <button class="control-btn edit load-btn" data-newsletter-id="${newsletter.id}" style="padding: 8px 16px;">
                                📂 Cargar
                            </button>
                            <button class="control-btn edit edit-btn" data-newsletter-id="${newsletter.id}" style="padding: 8px 16px;">
                                ✏️ Editar
                            </button>
                            <button class="control-btn delete delete-btn" data-newsletter-id="${newsletter.id}" style="padding: 8px 16px;">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                    <div style="border-top: 1px solid #e9ecef; padding-top: 15px;">
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button class="control-btn edit duplicate-btn" data-newsletter-id="${newsletter.id}" style="padding: 6px 12px; font-size: 12px;">
                                📋 Duplicar
                            </button>
                            <button class="control-btn edit export-btn" data-newsletter-id="${newsletter.id}" style="padding: 6px 12px; font-size: 12px;">
                                📤 Exportar HTML
                            </button>
                            <button class="control-btn edit preview-btn" data-newsletter-id="${newsletter.id}" style="padding: 6px 12px; font-size: 12px;">
                                👁️ Vista Previa
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Agregar event listeners después de crear el HTML
        this.addNewsletterEventListeners();
    }
    
    addNewsletterEventListeners() {
        // Agregar event listeners para los botones de acción
        const container = document.getElementById('newslettersListContainer');
        
        // Botones de Cargar
        container.querySelectorAll('.load-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newsletterId = parseInt(btn.getAttribute('data-newsletter-id'));
                if (newsletterId) {
                    this.loadNewsletterFromManage(newsletterId);
                } else {
                    notifications.error('Error', 'No se pudo identificar el newsletter');
                }
            });
        });
        
        // Botones de Editar
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newsletterId = parseInt(btn.getAttribute('data-newsletter-id'));
                if (newsletterId) {
                    this.editNewsletterFromManage(newsletterId);
                } else {
                    notifications.error('Error', 'No se pudo identificar el newsletter');
                }
            });
        });
        
        // Botones de Eliminar
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newsletterId = parseInt(btn.getAttribute('data-newsletter-id'));
                if (newsletterId) {
                    this.deleteNewsletterFromManage(newsletterId);
                } else {
                    notifications.error('Error', 'No se pudo identificar el newsletter');
                }
            });
        });
        
        // Botones de Duplicar
        container.querySelectorAll('.duplicate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newsletterId = parseInt(btn.getAttribute('data-newsletter-id'));
                if (newsletterId) {
                    this.duplicateNewsletter(newsletterId);
                } else {
                    notifications.error('Error', 'No se pudo identificar el newsletter');
                }
            });
        });
        
        // Botones de Exportar
        container.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newsletterId = parseInt(btn.getAttribute('data-newsletter-id'));
                if (newsletterId) {
                    this.exportNewsletter(newsletterId);
                } else {
                    notifications.error('Error', 'No se pudo identificar el newsletter');
                }
            });
        });
        
        // Botones de Vista Previa
        container.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newsletterId = parseInt(btn.getAttribute('data-newsletter-id'));
                if (newsletterId) {
                    this.previewNewsletter(newsletterId);
                } else {
                    notifications.error('Error', 'No se pudo identificar el newsletter');
                }
            });
        });
        
        // Configurar indicadores visuales para los botones
        const totalButtons = container.querySelectorAll('button').length;
        
        // Agregar indicador visual de que los botones están activos
        container.querySelectorAll('button').forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.title = 'Botón activo - Haz clic para usar';
        });
        
        // Agregar indicador visual de que los botones están activos
        container.querySelectorAll('button').forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.title = 'Botón activo - Haz clic para usar';
            
            // Agregar un indicador visual sutil
            btn.style.border = '2px solid transparent';
            btn.addEventListener('mouseenter', () => {
                btn.style.border = '2px solid #4A90E2';
                btn.style.transform = 'scale(1.02)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.border = '2px solid transparent';
                btn.style.transform = 'scale(1)';
            });
        });
    }
    
    extractNewsletterIdFromButton(button) {
        // Buscar el newsletter ID en el contexto del botón
        const newsletterItem = button.closest('.newsletter-item');
        if (newsletterItem) {
            // Buscar el ID en el texto del span que contiene el ID
            const idSpans = newsletterItem.querySelectorAll('span');
            for (let span of idSpans) {
                if (span.textContent.includes('🆔 ID:')) {
                    const idMatch = span.textContent.match(/🆔 ID: (\d+)/);
                    if (idMatch) {
                        return parseInt(idMatch[1]);
                    }
                }
            }
            
            // Fallback: buscar en el onclick original
            const onclick = button.getAttribute('onclick');
            if (onclick) {
                const idMatch = onclick.match(/\((\d+)\)/);
                if (idMatch) {
                    return parseInt(idMatch[1]);
                }
            }
        }
        return null;
    }
    
    createNewFromManage() {
        this.toggleManageView(); // Volver al constructor
        this.newNewsletter(); // Crear nuevo newsletter
    }
    
    async loadNewsletterFromManage(newsletterId) {
        await this.loadNewsletter(newsletterId);
        this.toggleManageView(); // Volver al constructor
    }
    
    editNewsletterFromManage(newsletterId) {
        // Cargar el newsletter y mostrar modal de edición
        this.loadNewsletter(newsletterId).then(() => {
            this.toggleManageView(); // Volver al constructor
            this.showSaveNewsletterModal(); // Mostrar modal de edición
        });
    }
    
    async deleteNewsletterFromManage(newsletterId) {
        // Mostrar notificación de confirmación con ID único
        const notificationId = `delete-newsletter-${newsletterId}-${Date.now()}`;
        
        const confirmNotification = notifications.show({
            type: 'warning',
            title: 'Confirmar Eliminación',
            message: '¿Estás seguro de que quieres eliminar este newsletter? Esta acción no se puede deshacer.',
            duration: 0, // No auto-remover
            actions: [
                {
                    text: 'Sí, Eliminar',
                    type: 'primary',
                    onclick: `mailingBuilder.confirmDeleteNewsletter(${newsletterId}, '${notificationId}')`
                },
                {
                    text: 'Cancelar',
                    type: 'secondary',
                    onclick: `notifications.remove(document.getElementById('${notificationId}'))`
                }
            ]
        });
        
        // Asignar el ID personalizado a la notificación
        if (confirmNotification) {
            confirmNotification.id = notificationId;
        }
    }
    
    async confirmDeleteNewsletter(newsletterId, notificationId) {
        // Remover la notificación de confirmación de manera segura
        this.removeConfirmationNotification(notificationId);
        
        try {
            const response = await fetch(`/api/newsletter/${newsletterId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                notifications.success('Newsletter Eliminado', '✅ Newsletter eliminado exitosamente');
                this.loadAndRenderNewslettersList(); // Recargar la lista
                
                // Si era el newsletter actual, limpiar
                if (this.currentNewsletterId === newsletterId) {
                    this.newNewsletter();
                }
            }
        } catch (error) {
            notifications.error('Error al Eliminar', '❌ Error eliminando newsletter: ' + error.message);
        }
    }
    
    async duplicateNewsletter(newsletterId) {
        try {
            const response = await fetch(`/api/newsletter/${newsletterId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            if (result.success) {
                const newsletter = result.data;
                
                // Crear copia con nombre modificado
                const duplicateData = {
                    name: `${newsletter.name} (Copia)`,
                    description: `${newsletter.description || ''} - Copia`,
                    content: newsletter.content,
                    sections: newsletter.sections.map(section => ({
                        type: section.section_type,
                        data: section.section_data
                    }))
                };
                
                const duplicateResponse = await fetch('/api/newsletter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(duplicateData)
                });
                
                if (duplicateResponse.ok) {
                    notifications.success('Newsletter Duplicado', '✅ Newsletter duplicado exitosamente');
                    this.loadAndRenderNewslettersList(); // Recargar la lista
                } else {
                    throw new Error('Error al duplicar');
                }
            }
        } catch (error) {
            console.error('Error duplicando newsletter:', error);
            notifications.error('Error al Duplicar', '❌ Error duplicando newsletter: ' + error.message);
        }
    }
    
    async exportNewsletter(newsletterId) {
        try {
            const response = await fetch(`/api/newsletter/${newsletterId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            if (result.success) {
                const newsletter = result.data;
                
                // Generar HTML del newsletter
                let htmlCode = '';
                if (newsletter.sections && newsletter.sections.length > 0) {
                    htmlCode += '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">\n';
                    htmlCode += '    <tr>\n';
                    htmlCode += '        <td align="center" style="background-color: #f4f4f4; padding: 20px 0;">\n';
                    htmlCode += '            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">\n';
                    
                    newsletter.sections.forEach(section => {
                        htmlCode += '                <tr>\n';
                        htmlCode += '                    <td style="padding: 0; background-color: #ffffff;">\n';
                        htmlCode += section.section_data.html;
                        htmlCode += '                    </td>\n';
                        htmlCode += '                </tr>\n';
                    });
                    
                    htmlCode += '            </table>\n';
                    htmlCode += '        </td>\n';
                    htmlCode += '    </tr>\n';
                    htmlCode += '</table>';
                }
                
                // Mostrar código en modal
                this.showExportModal(htmlCode, newsletter.name);
            }
        } catch (error) {
            console.error('Error exportando newsletter:', error);
            alert('❌ Error exportando newsletter: ' + error.message);
        }
    }
    
    showExportModal(htmlCode, newsletterName) {
        const modal = document.getElementById('editModal');
        const title = document.getElementById('editModalTitle');
        const container = document.getElementById('editFormContainer');
        
        title.textContent = `📤 Exportar: ${newsletterName}`;
        container.innerHTML = `
            <div class="edit-form-group">
                <label>Código HTML del Newsletter:</label>
                <textarea readonly style="min-height: 300px; font-family: monospace; font-size: 12px;">${htmlCode}</textarea>
            </div>
                    <div style="text-align: center; margin-top: 20px;">
            <button onclick="navigator.clipboard.writeText('${htmlCode.replace(/'/g, "\\'")}').then(() => notifications.success('Código Copiado', '✅ Código copiado al portapapeles'))" class="control-btn edit">
                📋 Copiar al Portapapeles
            </button>
        </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Cambiar botones del modal
        const footer = modal.querySelector('.edit-modal-footer');
        footer.innerHTML = `
            <button class="control-btn delete" onclick="closeEditModal()">❌ Cerrar</button>
        `;
    }
    
    async previewNewsletter(newsletterId) {
        try {
            const response = await fetch(`/api/newsletter/${newsletterId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            if (result.success) {
                const newsletter = result.data;
                
                // Mostrar preview en modal
                this.showPreviewModal(newsletter);
            }
        } catch (error) {
            console.error('Error previsualizando newsletter:', error);
            alert('❌ Error previsualizando newsletter: ' + error.message);
        }
    }
    
    showPreviewModal(newsletter) {
        const modal = document.getElementById('editModal');
        const title = document.getElementById('editModalTitle');
        const container = document.getElementById('editFormContainer');
        
        title.textContent = `👁️ Vista Previa: ${newsletter.name}`;
        
        let previewHTML = '<div style="max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 15px; border-radius: 10px;">';
        previewHTML += '<div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">';
        
        if (newsletter.sections && newsletter.sections.length > 0) {
            newsletter.sections.forEach(section => {
                previewHTML += '<div style="padding: 0;">';
                previewHTML += section.section_data.html;
                previewHTML += '</div>';
            });
        }
        
        previewHTML += '</div></div>';
        
        container.innerHTML = previewHTML;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Cambiar botones del modal
        const footer = modal.querySelector('.edit-modal-footer');
        footer.innerHTML = `
            <button class="control-btn delete" onclick="closeEditModal()">❌ Cerrar</button>
        `;
    }
    
    showErrorInManageView(message) {
        const container = document.getElementById('newslettersListContainer');
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #dc3545;">
                <h3 style="margin: 0 0 15px 0;">❌ Error</h3>
                <p style="margin: 0;">${message}</p>
                <button onclick="mailingBuilder.loadAndRenderNewslettersList()" class="control-btn edit" style="margin-top: 15px;">
                    🔄 Reintentar
                </button>
            </div>
        `;
    }
    

    
    updateNewsletterSelector() {
        const container = document.getElementById('newsletterContainer');
        if (container.querySelector('.empty-state')) {
            const loadBtn = container.querySelector('#loadNewsletterBtn');
            if (loadBtn && this.newslettersList && this.newslettersList.length > 0) {
                loadBtn.textContent = `📂 Cargar Newsletter (${this.newslettersList.length})`;
            }
        }
    }
    
    async saveNewsletter() {
        if (this.sections.length === 0) {
            notifications.warning('Sin Contenido', 'No hay secciones para guardar. Agrega al menos una sección primero.');
            return;
        }
        
        // Mostrar modal para nombre y descripción
        this.showSaveNewsletterModal();
    }
    
    showSaveNewsletterModal() {
        const modal = document.getElementById('editModal');
        const title = document.getElementById('editModalTitle');
        const container = document.getElementById('editFormContainer');
        
        title.textContent = '💾 Guardar Newsletter';
        container.innerHTML = `
            <div class="edit-form-group">
                <label>Nombre del Newsletter:</label>
                <input type="text" id="newsletterName" value="${this.currentNewsletterName || ''}" placeholder="Mi Newsletter Mensual" required>
            </div>
            <div class="edit-form-group">
                <label>Descripción:</label>
                <textarea id="newsletterDescription" placeholder="Descripción del newsletter">${this.currentNewsletterDescription || ''}</textarea>
            </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Cambiar botones del modal
        const footer = modal.querySelector('.edit-modal-footer');
        footer.innerHTML = `
            <button class="control-btn edit" onclick="mailingBuilder.performSaveNewsletter()">💾 Guardar</button>
            <button class="control-btn delete" onclick="closeEditModal()">❌ Cancelar</button>
        `;
    }
    
    async performSaveNewsletter() {
        const name = document.getElementById('newsletterName').value.trim();
        const description = document.getElementById('newsletterDescription').value.trim();
        
        if (!name) {
            notifications.error('Campo Requerido', 'El nombre del newsletter es requerido');
            return;
        }
        
        // Sincronizar cambios de secciones antes de guardar
        this.syncSectionChanges();
        
        try {
            const newsletterData = {
                name: name,
                description: description,
                content: this.exportCode(),
                sections: this.sections.map(section => ({
                    type: section.type,
                    data: section.content
                }))
            };
            
            const url = this.currentNewsletterId ? 
                `/api/newsletter/${this.currentNewsletterId}` : 
                '/api/newsletter';
            
            const method = this.currentNewsletterId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newsletterData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                if (!this.currentNewsletterId) {
                    this.currentNewsletterId = result.data.id;
                }
                this.currentNewsletterName = name;
                this.currentNewsletterDescription = description;
                
                notifications.success('Newsletter Guardado', '✅ Newsletter guardado exitosamente');
                closeEditModal();
                this.loadNewslettersList();
                
                // Actualizar la vista actual
                this.renderSections();
            }
        } catch (error) {
            console.error('Error guardando newsletter:', error);
            notifications.error('Error al Guardar', '❌ Error guardando newsletter: ' + error.message);
        }
    }
    
    // Función para sincronizar cambios de secciones
    syncSectionChanges() {
        // Verificar que las secciones tengan contenido válido
        let hasChanges = false;
        this.sections.forEach((section, index) => {
            if (!section.content || !section.content.html) {
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            // Algunas secciones tienen contenido inválido
        }
    }
    

    
    newNewsletter() {
        this.sections = [];
        this.sectionCounter = 0;
        this.currentNewsletterId = null;
        this.currentNewsletterName = '';
        this.currentNewsletterDescription = '';
        this.renderSections();
    }
    
    showLoadNewsletterModal() {
        if (!this.newslettersList || this.newslettersList.length === 0) {
            notifications.info('Sin Newsletters', 'No hay newsletters guardados para cargar');
            return;
        }
        
        const modal = document.getElementById('editModal');
        const title = document.getElementById('editModalTitle');
        const container = document.getElementById('editFormContainer');
        
        title.textContent = '📂 Cargar Newsletter';
        
        let newslettersHTML = '';
        this.newslettersList.forEach(newsletter => {
            const date = new Date(newsletter.updated_at).toLocaleDateString('es-ES');
            newslettersHTML += `
                <div class="edit-form-group" style="border: 1px solid #e9ecef; padding: 15px; border-radius: 8px; margin-bottom: 15px; cursor: pointer;" onclick="mailingBuilder.loadNewsletter(${newsletter.id})">
                    <h4 style="margin: 0 0 10px 0; color: #666;">${newsletter.name}</h4>
                    <p style="margin: 0 0 8px 0; color: #666;">${newsletter.description || 'Sin descripción'}</p>
                    <p style="margin: 0; font-size: 12px; color: #999;">Actualizado: ${date} | Secciones: ${newsletter.sections_count}</p>
                </div>
            `;
        });
        
        container.innerHTML = newslettersHTML;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Cambiar botones del modal
        const footer = modal.querySelector('.editModal-footer');
        footer.innerHTML = `
            <button class="control-btn delete" onclick="closeEditModal()">❌ Cerrar</button>
        `;
    }
    
    async loadNewsletter(newsletterId) {
        try {
            const response = await fetch(`/api/newsletter/${newsletterId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            if (result.success) {
                const newsletter = result.data;
                
                // Cargar datos del newsletter
                this.currentNewsletterId = newsletter.id;
                this.currentNewsletterName = newsletter.name;
                this.currentNewsletterDescription = newsletter.description;
                
                // Cargar secciones
                this.sections = [];
                this.sectionCounter = 0;
                
                if (newsletter.sections && newsletter.sections.length > 0) {
                    newsletter.sections.forEach((section, index) => {
                        this.sectionCounter++;
                        this.sections.push({
                            id: `section-${this.sectionCounter}`,
                            type: section.section_type,
                            content: section.section_data,
                            order: index
                        });
                    });
                }
                
                closeEditModal();
                this.renderSections();
                this.hideEmptyState();
                
                notifications.success('Newsletter Cargado', `✅ Newsletter "${newsletter.name}" cargado exitosamente`);
            }
        } catch (error) {
            console.error('Error cargando newsletter:', error);
            notifications.error('Error al Cargar', '❌ Error cargando newsletter: ' + error.message);
        }
    }
    
    async deleteNewsletter(newsletterId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este newsletter? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/newsletter/${newsletterId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ Newsletter eliminado exitosamente');
                this.loadNewslettersList();
                
                // Si era el newsletter actual, limpiar
                if (this.currentNewsletterId === newsletterId) {
                    this.newNewsletter();
                }
            }
        } catch (error) {
            console.error('Error eliminando newsletter:', error);
            alert('❌ Error eliminando newsletter: ' + error.message);
        }
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
            notifications.success('Código Copiado', '¡Código copiado al portapapeles!');
        }).catch(() => {
            // Fallback para navegadores que no soportan clipboard API
            codeOutput.select();
            document.execCommand('copy');
            notifications.success('Código Copiado', '¡Código copiado al portapapeles!');
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
        
        // Función global para eliminar newsletter
        function deleteNewsletter(newsletterId) {
            if (mailingBuilder) {
                mailingBuilder.deleteNewsletter(newsletterId);
            }
        }
        

        
        // ===== FUNCIONES GLOBALES =====
        function closeEditModal() {
            const modal = document.getElementById('editModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Limpiar variables de edición si existen
                if (window.mailingBuilder) {
                    mailingBuilder.currentEditingSection = null;
                    mailingBuilder.currentEditingSectionType = null;
                }
            }
        }
        
        // Función global para debugging del estado de edición
        function checkEditState() {
            if (window.mailingBuilder) {
                const state = mailingBuilder.checkEditState();
                console.log('=== ESTADO DE EDICIÓN ===');
                console.log('Estado:', state);
                return state;
            } else {
                console.log('❌ MailingBuilder no está inicializado');
                return null;
            }
        }
        
        // ===== SISTEMA DE NOTIFICACIONES =====
        class NotificationSystem {
            constructor() {
                this.container = document.getElementById('notificationContainer');
                this.notifications = [];
                this.counter = 0;
            }
            
            show(options) {
                const {
                    type = 'info',
                    title = '',
                    message = '',
                    duration = 5000,
                    actions = [],
                    icon = this.getDefaultIcon(type)
                } = options;
                
                const notification = this.createNotification(type, title, message, actions, icon);
                this.container.appendChild(notification);
                
                // Agregar a la lista
                this.notifications.push(notification);
                
                // Auto-remover después del tiempo especificado
                if (duration > 0) {
                    setTimeout(() => {
                        this.remove(notification);
                    }, duration);
                }
                
                // Agregar evento de cierre
                const closeBtn = notification.querySelector('.notification-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        this.remove(notification);
                    });
                }
                
                return notification;
            }
            
            createNotification(type, title, message, actions, icon) {
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.id = `notification-${++this.counter}`;
                
                let actionsHTML = '';
                if (actions && actions.length > 0) {
                    actionsHTML = '<div class="notification-actions">';
                    actions.forEach(action => {
                        actionsHTML += `<button class="btn btn-${action.type || 'primary'}" onclick="${action.onclick}">${action.text}</button>`;
                    });
                    actionsHTML += '</div>';
                }
                
                notification.innerHTML = `
                    <div class="notification-header">
                        <h4 class="notification-title">
                            <span class="notification-icon">${icon}</span>
                            ${title}
                        </h4>
                        <button class="notification-close">&times;</button>
                    </div>
                    <div class="notification-body">${message}</div>
                    ${actionsHTML}
                    <div class="notification-progress">
                        <div class="notification-progress-bar"></div>
                    </div>
                `;
                
                return notification;
            }
            
            getDefaultIcon(type) {
                const icons = {
                    success: '✅',
                    error: '❌',
                    warning: '⚠️',
                    info: 'ℹ️'
                };
                return icons[type] || icons.info;
            }
            
            remove(notification) {
                // Si se pasa un ID en lugar de un elemento, buscar el elemento
                if (typeof notification === 'string') {
                    notification = document.getElementById(notification);
                }
                
                if (notification && notification.parentNode) {
                    notification.classList.add('removing');
                    setTimeout(() => {
                        if (notification && notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                        // Remover de la lista
                        const index = this.notifications.indexOf(notification);
                        if (index > -1) {
                            this.notifications.splice(index, 1);
                        }
                    }, 300);
                }
            }
            
            removeAll() {
                this.notifications.forEach(notification => {
                    this.remove(notification);
                });
            }
            
            // Métodos de conveniencia
            success(title, message, options = {}) {
                return this.show({ type: 'success', title, message, ...options });
            }
            
            error(title, message, options = {}) {
                return this.show({ type: 'error', title, message, ...options });
            }
            
            warning(title, message, options = {}) {
                return this.show({ type: 'warning', title, message, ...options });
            }
            
            info(title, message, options = {}) {
                return this.show({ type: 'info', title, message, ...options });
            }
        }
        
        // Instancia global del sistema de notificaciones
        const notifications = new NotificationSystem();

// Inicializar la aplicación
let mailingBuilder;
document.addEventListener('DOMContentLoaded', () => {
    mailingBuilder = new MailingBuilder();
}); 