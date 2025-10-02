#!/bin/sh

echo "🚀 Iniciando Mantenedor de Mailings..."

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  echo "PostgreSQL no está listo - esperando..."
  sleep 2
done

echo "✅ PostgreSQL está listo!"

# Verificar si las tablas existen
echo "🔍 Verificando estructura de base de datos..."
TABLES_EXIST=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")

if [ "$TABLES_EXIST" -eq "0" ]; then
  echo "📋 Inicializando base de datos..."
  node init-database.js
else
  echo "✅ Base de datos ya inicializada"
fi

echo "🎉 Iniciando aplicación..."
exec npm start
