const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'newsletters',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
    max: 20, // Máximo número de conexiones en el pool
    idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30 segundos
    connectionTimeoutMillis: 2000, // Timeout de conexión de 2 segundos
});

// Event listeners para el pool
pool.on('connect', () => {
    console.log('✅ Nueva conexión establecida con PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en el pool de conexiones:', err);
});

// Función para ejecutar queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`📊 Query ejecutada en ${duration}ms: ${text.substring(0, 50)}...`);
        return res;
    } catch (error) {
        console.error('❌ Error ejecutando query:', error);
        throw error;
    }
};

// Función para obtener una conexión del pool
const getClient = async () => {
    return await pool.connect();
};

// Función para cerrar el pool de conexiones
const closeDatabase = async () => {
    try {
        await pool.end();
        console.log('✅ Pool de conexiones cerrado correctamente');
    } catch (error) {
        console.error('❌ Error cerrando el pool de conexiones:', error);
    }
};

// Función para probar la conexión
const testConnection = async () => {
    try {
        const result = await query('SELECT NOW()');
        console.log('✅ Conectado a PostgreSQL exitosamente');
        console.log(`🕐 Hora del servidor: ${result.rows[0].now}`);
        return true;
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error.message);
        return false;
    }
};

module.exports = { 
    pool, 
    query, 
    getClient, 
    closeDatabase, 
    testConnection 
}; 