#!/bin/bash
set -e

echo "🚀 Inicializando base de datos PostgreSQL..."

# Crear extensiones necesarias
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Crear extensiones útiles
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- Configurar timezone
    SET timezone = 'UTC';
    
    -- Crear usuario específico para la aplicación (opcional)
    -- CREATE USER app_user WITH PASSWORD 'app_password';
    -- GRANT ALL PRIVILEGES ON DATABASE newsletters TO app_user;
    
    echo "✅ Extensiones y configuración creadas"
EOSQL

echo "🎉 Base de datos PostgreSQL inicializada correctamente"
