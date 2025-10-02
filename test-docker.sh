#!/bin/bash

# Script de prueba para verificar que Docker funciona correctamente
# Uso: ./test-docker.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "🧪 Iniciando pruebas de Docker..."

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado"
    exit 1
fi

print_status "Docker y Docker Compose están instalados"

# Construir imágenes
print_info "Construyendo imágenes..."
docker-compose build --no-cache
print_status "Imágenes construidas"

# Iniciar servicios
print_info "Iniciando servicios..."
docker-compose up -d
print_status "Servicios iniciados"

# Esperar a que los servicios estén listos
print_info "Esperando a que los servicios estén listos..."
sleep 10

# Verificar que PostgreSQL está funcionando
print_info "Verificando PostgreSQL..."
if docker-compose exec postgres pg_isready -U postgres; then
    print_status "PostgreSQL está funcionando"
else
    print_error "PostgreSQL no está funcionando"
    exit 1
fi

# Verificar que la aplicación está funcionando
print_info "Verificando aplicación..."
if curl -f http://localhost:3001/api/auth/profile > /dev/null 2>&1; then
    print_status "Aplicación está funcionando"
else
    print_warning "Aplicación no responde (esto puede ser normal si requiere autenticación)"
fi

# Verificar que las tablas existen
print_info "Verificando estructura de base de datos..."
TABLE_COUNT=$(docker-compose exec postgres psql -U postgres -d newsletters -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

if [ "$TABLE_COUNT" -gt "0" ]; then
    print_status "Base de datos tiene $TABLE_COUNT tablas"
else
    print_error "No se encontraron tablas en la base de datos"
    exit 1
fi

# Verificar que el usuario admin existe
print_info "Verificando usuario admin..."
ADMIN_EXISTS=$(docker-compose exec postgres psql -U postgres -d newsletters -t -c "SELECT COUNT(*) FROM users WHERE username = 'admin';" 2>/dev/null | tr -d ' ')

if [ "$ADMIN_EXISTS" -eq "1" ]; then
    print_status "Usuario admin existe"
else
    print_error "Usuario admin no existe"
    exit 1
fi

# Probar login
print_info "Probando login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "Login exitoso"; then
    print_status "Login funciona correctamente"
else
    print_error "Login falló"
    echo "Respuesta: $LOGIN_RESPONSE"
    exit 1
fi

# Limpiar
print_info "Limpiando servicios de prueba..."
docker-compose down

echo ""
print_status "🎉 ¡Todas las pruebas pasaron exitosamente!"
echo ""
print_info "Tu configuración de Docker está lista para usar:"
echo "  - Ejecuta: ./docker-manager.sh start"
echo "  - Accede a: http://localhost:3001"
echo "  - Login con: admin / admin123"
