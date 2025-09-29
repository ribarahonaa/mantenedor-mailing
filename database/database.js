const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta de la base de datos
const dbPath = path.join(__dirname, 'newsletters.db');

// Crear conexión a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.message);
    } else {
        console.log('✅ Conectado a la base de datos SQLite');
        console.log(`📁 Base de datos ubicada en: ${dbPath}`);
    }
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

// Función para cerrar la base de datos
const closeDatabase = () => {
    db.close((err) => {
        if (err) {
            console.error('❌ Error cerrando la base de datos:', err.message);
        } else {
            console.log('✅ Base de datos cerrada correctamente');
        }
    });
};

module.exports = { db, closeDatabase }; 