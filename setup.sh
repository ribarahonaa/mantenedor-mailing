#!/bin/bash

echo "🚀 Configurando Mantenedor de Mailings con PostgreSQL..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 14+ primero."
    exit 1
fi

print_status "Node.js encontrado: $(node --version)"

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL no está instalado. Instalando..."
    
    # Detectar sistema operativo
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Ubuntu/Debian
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y postgresql postgresql-contrib
        # CentOS/RHEL
        elif command -v yum &> /dev/null; then
            sudo yum install -y postgresql-server postgresql-contrib
            sudo postgresql-setup initdb
            sudo systemctl enable postgresql
            sudo systemctl start postgresql
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install postgresql
            brew services start postgresql
        else
            print_error "Homebrew no está instalado. Por favor instala PostgreSQL manualmente."
            exit 1
        fi
    fi
fi

print_status "PostgreSQL encontrado"

# Instalar dependencias de Node.js
print_status "Instalando dependencias de Node.js..."
npm install

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    print_status "Creando archivo de configuración .env..."
    cp env.example .env
    
    # Solicitar configuración de base de datos
    echo ""
    echo "📝 Configuración de PostgreSQL:"
    read -p "Usuario de PostgreSQL (default: postgres): " db_user
    read -p "Contraseña de PostgreSQL: " -s db_password
    echo ""
    read -p "Host de PostgreSQL (default: localhost): " db_host
    read -p "Puerto de PostgreSQL (default: 5432): " db_port
    
    # Usar valores por defecto si están vacíos
    db_user=${db_user:-postgres}
    db_host=${db_host:-localhost}
    db_port=${db_port:-5432}
    
    # Actualizar archivo .env
    sed -i "s/DB_USER=postgres/DB_USER=$db_user/" .env
    sed -i "s/DB_PASSWORD=postgres/DB_PASSWORD=$db_password/" .env
    sed -i "s/DB_HOST=localhost/DB_HOST=$db_host/" .env
    sed -i "s/DB_PORT=5432/DB_PORT=$db_port/" .env
    
    print_status "Archivo .env configurado"
else
    print_warning "Archivo .env ya existe, saltando configuración"
fi

# Crear base de datos PostgreSQL
print_status "Creando base de datos PostgreSQL..."
sudo -u postgres createdb newsletters 2>/dev/null || print_warning "Base de datos 'newsletters' ya existe"

# Inicializar base de datos
print_status "Inicializando base de datos..."
node init-database.js

if [ $? -eq 0 ]; then
    print_status "Base de datos inicializada correctamente"
else
    print_error "Error inicializando base de datos"
    exit 1
fi

echo ""
echo "🎉 ¡Configuración completada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Ejecutar: npm start"
echo "   2. Abrir: http://localhost:3001"
echo "   3. Login con: admin / admin123"
echo ""
echo "🔧 Comandos útiles:"
echo "   - npm start          : Iniciar servidor"
echo "   - npm run dev        : Modo desarrollo"
echo "   - npm run test-db    : Probar conexión a DB"
echo "   - npm run migrate    : Migrar desde SQLite"
echo ""
print_status "¡Listo para usar!"
