const { query, testConnection, closeDatabase } = require('./database/database');
const bcrypt = require('bcrypt');

console.log('🚀 Inicializando base de datos PostgreSQL...');

// Función principal de inicialización
const initializeDatabase = async () => {
    try {
        // Probar conexión
        const connected = await testConnection();
        if (!connected) {
            console.error('❌ No se pudo conectar a PostgreSQL. Verifica la configuración.');
            process.exit(1);
        }

        // Crear tabla de usuarios
        await createUsersTable();
        
        // Crear tabla de secciones maestras
        await createMasterSectionsTable();
        
        // Crear tabla de newsletters
        await createNewslettersTable();
        
        // Crear tabla de secciones de newsletters
        await createNewsletterSectionsTable();
        
        // Crear tabla de plantillas
        await createTemplatesTable();
        
        // Crear datos por defecto
        await createDefaultData();
        
        console.log('✅ Base de datos inicializada correctamente');
        console.log('🎉 ¡Puedes ejecutar el servidor ahora!');
        console.log('🔑 Usuario admin: admin / admin123');
        
    } catch (error) {
        console.error('❌ Error inicializando la base de datos:', error);
        process.exit(1);
    } finally {
        await closeDatabase();
    }
};

// Crear tabla de usuarios
const createUsersTable = async () => {
    const createUsersTableSQL = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'user' CHECK(role IN ('admin', 'user')),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    try {
        await query(createUsersTableSQL);
        console.log('✅ Tabla users creada/verificada');
    } catch (error) {
        console.error('❌ Error creando tabla users:', error.message);
        throw error;
    }
};

// Crear tabla de secciones maestras
const createMasterSectionsTable = async () => {
    const createMasterSectionsTableSQL = `
        CREATE TABLE IF NOT EXISTS master_sections (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(200) NOT NULL,
            content TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    try {
        await query(createMasterSectionsTableSQL);
        console.log('✅ Tabla master_sections creada/verificada');
    } catch (error) {
        console.error('❌ Error creando tabla master_sections:', error.message);
        throw error;
    }
};

// Crear tabla de newsletters
const createNewslettersTable = async () => {
    const createNewslettersTableSQL = `
        CREATE TABLE IF NOT EXISTS newsletters (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            status VARCHAR(20) DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    try {
        await query(createNewslettersTableSQL);
        console.log('✅ Tabla newsletters creada/verificada');
    } catch (error) {
        console.error('❌ Error creando tabla newsletters:', error.message);
        throw error;
    }
};

// Crear tabla de secciones de newsletters
const createNewsletterSectionsTable = async () => {
    const createNewsletterSectionsTableSQL = `
        CREATE TABLE IF NOT EXISTS newsletter_sections (
            id SERIAL PRIMARY KEY,
            newsletter_id INTEGER NOT NULL,
            master_section_id INTEGER,
            section_type VARCHAR(50) NOT NULL,
            title VARCHAR(200) NOT NULL,
            content TEXT NOT NULL,
            section_order INTEGER NOT NULL,
            is_customized BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    try {
        await query(createNewsletterSectionsTableSQL);
        console.log('✅ Tabla newsletter_sections creada/verificada');
    } catch (error) {
        console.error('❌ Error creando tabla newsletter_sections:', error.message);
        throw error;
    }
};

// Crear tabla de plantillas
const createTemplatesTable = async () => {
    const createTemplatesTableSQL = `
        CREATE TABLE IF NOT EXISTS templates (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            content TEXT NOT NULL,
            is_default BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    try {
        await query(createTemplatesTableSQL);
        console.log('✅ Tabla templates creada/verificada');
    } catch (error) {
        console.error('❌ Error creando tabla templates:', error.message);
        throw error;
    }
};

// Crear datos por defecto
const createDefaultData = async () => {
    await createAdminUser();
    await createDefaultMasterSections();
    await createDefaultTemplate();
};

// Crear usuario admin por defecto
const createAdminUser = async () => {
    try {
        const adminPassword = 'admin123'; // Cambiar en producción
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        
        await query(`
            INSERT INTO users (username, email, password_hash, role) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) DO NOTHING
        `, ['admin', 'admin@innk.com', passwordHash, 'admin']);
        
        console.log('✅ Usuario admin creado/verificado');
        console.log('🔑 Credenciales admin: admin / admin123');
    } catch (error) {
        console.error('❌ Error creando usuario admin:', error.message);
        throw error;
    }
};

// Crear secciones maestras por defecto
const createDefaultMasterSections = async () => {
    const defaultSections = [
        {
            name: 'Header con Logo',
            type: 'header',
            title: 'Header con Logo',
            content: JSON.stringify({
                title: 'Header con Logo',
                html: `<div style="padding: 0; text-align: center;">
                    <div style="text-align: center; padding: 20px 0;">
                        <img src="https://i.imgur.com/NPugcbi.png" alt="Innk Logo" style="width: auto; height: auto; display: block; margin: 0 auto; max-height: 80px;">
                    </div>
                </div>`
            })
        },
        {
            name: 'Saludo Personalizado',
            type: 'saludo',
            title: 'Saludo Personalizado',
            content: JSON.stringify({
                title: 'Saludo Personalizado',
                html: `<div style="margin-bottom: 30px; padding: 0 20px;">
                    <div style="background-color: #F6F6FE; padding: 20px; border-radius: 8px;">
                        <h1 style="color: #4747F3; font-size: 22px; margin: 0 0 15px 0; border-bottom: 2px solid #E6E6FA; padding-bottom: 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">¿Qué es la planificación de proyectos y cómo optimizarla?</h1>
                        <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Planificar proyectos de manera efectiva es clave para lograr resultados exitosos. En esta nota te compartimos:</p>
                        <ul style="margin: 0; padding-left: 20px; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                            <li style="margin-bottom: 8px;">3 aspectos para planificar proyectos de forma exitosa.</li>
                            <li style="margin-bottom: 8px;">Principales tipos de planificación con ejemplos y consejos prácticos</li>
                            <li style="margin-bottom: 8px;">3 aspectos para planificar proyectos de forma exitosa.</li>
                        </ul>
                    </div>
                </div>`
            })
        },
        {
            name: 'Destacado',
            type: 'destacado',
            title: 'Destacado',
            content: JSON.stringify({
                title: 'Destacado',
                html: `<div style="margin-bottom: 30px; padding: 0 20px;">
                    <h2 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">🔥 Destacado de la Semana</h2>
                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Nueva funcionalidad disponible:</strong> Hemos lanzado nuestro sistema de gestión de proyectos mejorado con análisis en tiempo real y métricas avanzadas.</p>
                    <a href="#" style="display: inline-block; background-color: #FF8C00; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; margin: 10px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Descubrir Más</a>
                </div>`
            })
        },
        {
            name: 'Artículos',
            type: 'articulos',
            title: 'Artículos',
            content: JSON.stringify({
                title: 'Artículos',
                html: `<div style="margin-bottom: 30px; padding: 0 20px;">
                    <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">📚 Artículos Recomendados</h2>
                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>1. El Futuro de la IA en la Innovación Empresarial</strong><br>
                    Descubre cómo la inteligencia artificial está transformando la manera en que las empresas innovan y crean valor.</p>
                    
                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>2. Metodologías Ágiles para Proyectos de Innovación</strong><br>
                    Aprende las mejores prácticas para implementar metodologías ágiles en tus proyectos de innovación.</p>
                    
                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>3. Casos de Éxito: Empresas que Transformaron su Industria</strong><br>
                    Inspírate con historias reales de empresas que revolucionaron sus mercados.</p>
                </div>`
            })
        },
        {
            name: 'Eventos',
            type: 'eventos',
            title: 'Eventos',
            content: JSON.stringify({
                title: 'Eventos',
                html: `<div style="margin-bottom: 30px; padding: 0 20px;">
                    <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">📅 Próximos Eventos</h2>
                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Webinar: Innovación Sostenible</strong><br>
                    <em>Fecha:</em> 15 de Diciembre, 2024<br>
                    <em>Hora:</em> 14:00 - 15:30 (GMT-3)<br>
                    <em>Registro:</em> <a href="#" style="color: #20B2AA; text-decoration: none;">Inscríbete aquí</a></p>
                </div>`
            })
        },
        {
            name: 'Call to Action',
            type: 'cta',
            title: 'Call to Action',
            content: JSON.stringify({
                title: 'Call to Action',
                html: `<div style="margin-bottom: 30px; padding: 0 20px; text-align: center;">
                    <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">¿Listo para Innovar?</h2>
                    <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Únete a nuestra comunidad de innovadores y accede a recursos exclusivos, herramientas avanzadas y networking de calidad.</p>
                    <a href="#" style="display: inline-block; background-color: #FF8C00; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; margin: 10px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Comenzar Ahora</a>
                </div>`
            })
        },
        {
            name: 'Dos Columnas - Texto',
            type: 'dos-columnas-texto',
            title: 'Dos Columnas - Texto',
            content: JSON.stringify({
                title: 'Dos Columnas - Texto',
                html: `<div style="margin-bottom: 30px; padding: 0 20px;">
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
                </div>`
            })
        },
        {
            name: 'Dos Columnas - Foto Derecha',
            type: 'dos-columnas-foto-derecha',
            title: 'Dos Columnas - Foto Derecha',
            content: JSON.stringify({
                title: 'Dos Columnas - Foto Derecha',
                html: `<div style="margin-bottom: 30px; padding: 0 20px;">
                    <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">🚀 Proyecto Destacado</h2>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                        <tr>
                            <td width="60%" style="width: 60%; padding: 0 15px 0 0; vertical-align: top;">
                                <h3 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Plataforma de Gestión Inteligente</h3>
                                <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Desarrollamos una plataforma integral que combina IA y análisis de datos para optimizar la gestión de proyectos empresariales.</p>
                                <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Características principales:</strong></p>
                                <ul style="margin: 0; padding-left: 20px; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                    <li>Análisis predictivo de riesgos</li>
                                    <li>Automatización de tareas repetitivas</li>
                                    <li>Dashboard en tiempo real</li>
                                    <li>Integración con herramientas existentes</li>
                                </ul>
                            </td>
                            <td width="40%" style="width: 40%; padding: 0 0 0 15px; vertical-align: top;">
                                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop" alt="Plataforma de Gestión" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                            </td>
                        </tr>
                    </table>
                </div>`
            })
        },
        {
            name: 'Dos Columnas - Foto Izquierda',
            type: 'dos-columnas-foto-izquierda',
            title: 'Dos Columnas - Foto Izquierda',
            content: JSON.stringify({
                title: 'Dos Columnas - Foto Izquierda',
                html: `<div style="margin-bottom: 30px; padding: 0 20px;">
                    <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">💡 Innovación en Acción</h2>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                        <tr>
                            <td width="40%" style="width: 40%; padding: 0 15px 0 0; vertical-align: top;">
                                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop" alt="Equipo Innovando" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                            </td>
                            <td width="60%" style="width: 60%; padding: 0 0 0 15px; vertical-align: top;">
                                <h3 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Nuestro Enfoque</h3>
                                <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Creemos en la innovación colaborativa y en el poder de las ideas que surgen cuando equipos diversos trabajan juntos hacia un objetivo común.</p>
                                <p style="margin: 0 0 15px 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Valores que nos guían:</strong></p>
                                <ul style="margin: 0; padding-left: 20px; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                    <li>Creatividad sin límites</li>
                                    <li>Colaboración efectiva</li>
                                    <li>Resultados medibles</li>
                                    <li>Impacto sostenible</li>
                                </ul>
                            </td>
                        </tr>
                    </table>
                </div>`
            })
        },
        {
            name: 'Dos Columnas - Fotos',
            type: 'dos-columnas-fotos',
            title: 'Dos Columnas - Fotos',
            content: JSON.stringify({
                title: 'Dos Columnas - Fotos',
                html: `<div style="margin-bottom: 30px; padding: 0 20px;">
                    <h2 style="color: #4A90E2; margin: 0 0 15px 0; font-size: 18px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">📸 Galería de Proyectos</h2>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                        <tr>
                            <td width="50%" style="width: 50%; padding: 0 15px 0 0; vertical-align: top;">
                                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop" alt="Proyecto A" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 10px;">
                                <h3 style="color: #4A90E2; margin: 0 0 10px 0; font-size: 16px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Sistema de Gestión</h3>
                                <p style="margin: 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">Plataforma integral para empresas en crecimiento</p>
                            </td>
                            <td width="50%" style="width: 50%; padding: 0 0 0 15px; vertical-align: top;">
                                <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop" alt="Proyecto B" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 10px;">
                                <h3 style="color: #4A90E2; margin: 0 0 10px 0; font-size: 16px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">App Móvil</h3>
                                <p style="margin: 0; color: #555555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">Solución móvil para gestión de equipos</p>
                            </td>
                        </tr>
                    </table>
                </div>`
            })
        },
        {
            name: 'Footer',
            type: 'footer',
            title: 'Footer',
            content: JSON.stringify({
                title: 'Footer',
                html: `<div style="background-color: #2c3e50; color: white; padding: 30px 20px; text-align: center;">
                    <div style="margin-bottom: 20px;">
                        <img src="https://i.imgur.com/NPugcbi.png" alt="Innk Logo" style="width: auto; height: auto; max-height: 60px; margin-bottom: 15px;">
                        <p style="margin: 0; font-size: 16px; color: #bdc3c7;">Transformando ideas en innovación</p>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #3498db; margin: 0 0 15px 0; font-size: 18px;">Síguenos</h3>
                        <div style="display: flex; justify-content: center; gap: 20px;">
                            <a href="#" style="color: #3498db; text-decoration: none; font-size: 20px;">📧</a>
                            <a href="#" style="color: #3498db; text-decoration: none; font-size: 20px;">📱</a>
                            <a href="#" style="color: #3498db; text-decoration: none; font-size: 20px;">💼</a>
                            <a href="#" style="color: #3498db; text-decoration: none; font-size: 20px;">🌐</a>
                        </div>
                    </div>
                    <div style="border-top: 1px solid #34495e; padding-top: 20px;">
                        <p style="margin: 0; color: #bdc3c7; font-size: 14px;">© 2024 Innk. Todos los derechos reservados.</p>
                        <p style="margin: 5px 0 0 0; color: #bdc3c7; font-size: 12px;">Este email fue enviado a [email] | <a href="#" style="color: #3498db;">Darse de baja</a></p>
                    </div>
                </div>`
            })
        }
    ];

    try {
        for (const section of defaultSections) {
            // Verificar si la sección ya existe
            const existingSection = await query(
                'SELECT id FROM master_sections WHERE name = $1',
                [section.name]
            );

            if (existingSection.rows.length === 0) {
                await query(`
                    INSERT INTO master_sections (name, type, title, content) 
                    VALUES ($1, $2, $3, $4)
                `, [section.name, section.type, section.title, section.content]);
                
                console.log(`✅ Sección maestra "${section.name}" creada`);
            } else {
                console.log(`⏭️ Sección maestra "${section.name}" ya existe`);
            }
        }
    } catch (error) {
        console.error('❌ Error creando secciones maestras:', error.message);
        throw error;
    }
};

// Crear plantilla por defecto
const createDefaultTemplate = async () => {
    const defaultTemplate = {
        name: 'Plantilla Básica',
        description: 'Plantilla básica para newsletters',
        content: JSON.stringify([]),
        is_default: true
    };

    try {
        // Verificar si la plantilla ya existe
        const existingTemplate = await query(
            'SELECT id FROM templates WHERE name = $1',
            [defaultTemplate.name]
        );

        if (existingTemplate.rows.length === 0) {
            await query(`
                INSERT INTO templates (name, description, content, is_default) 
                VALUES ($1, $2, $3, $4)
            `, [defaultTemplate.name, defaultTemplate.description, defaultTemplate.content, defaultTemplate.is_default]);
            
            console.log('✅ Plantilla por defecto creada');
        } else {
            console.log('⏭️ Plantilla por defecto ya existe');
        }
    } catch (error) {
        console.error('❌ Error insertando plantilla por defecto:', error.message);
        throw error;
    }
};

// Ejecutar inicialización
initializeDatabase(); 