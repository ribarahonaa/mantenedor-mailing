#!/bin/bash

# Script de gestión de Docker para Mantenedor de Mailings
# Uso: ./docker-manager.sh [comando]

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

# Función para mostrar ayuda
show_help() {
    echo "🐳 Gestor de Docker para Mantenedor de Mailings"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start       - Iniciar servicios en producción"
    echo "  dev         - Iniciar servicios en modo desarrollo"
    echo "  stop        - Detener todos los servicios"
    echo "  restart     - Reiniciar servicios"
    echo "  build       - Construir imágenes"
    echo "  logs        - Ver logs de los servicios"
    echo "  shell       - Abrir shell en el contenedor de la app"
    echo "  db-shell    - Abrir shell de PostgreSQL"
    echo "  clean       - Limpiar contenedores e imágenes"
    echo "  status      - Mostrar estado de los servicios"
    echo "  backup      - Crear backup de la base de datos"
    echo "  restore     - Restaurar backup de la base de datos"
    echo "  migrate     - Ejecutar migración de datos"
    echo "  help        - Mostrar esta ayuda"
}

# Función para iniciar servicios de producción
start_production() {
    print_info "Iniciando servicios de producción..."
    docker compose up -d
    print_status "Servicios de producción iniciados"
    print_info "Aplicación disponible en: http://localhost:3001"
}

# Función para iniciar servicios de desarrollo
start_development() {
    print_info "Iniciando servicios de desarrollo..."
    docker compose -f docker-compose.dev.yml up -d
    print_status "Servicios de desarrollo iniciados"
    print_info "Aplicación disponible en: http://localhost:3001"
}

# Función para detener servicios
stop_services() {
    print_info "Deteniendo servicios..."
    docker compose down
    docker compose -f docker-compose.dev.yml down
    print_status "Servicios detenidos"
}

# Función para reiniciar servicios
restart_services() {
    print_info "Reiniciando servicios..."
    docker compose restart
    print_status "Servicios reiniciados"
}

# Función para construir imágenes
build_images() {
    print_info "Construyendo imágenes..."
    docker compose build --no-cache
    print_status "Imágenes construidas"
}

# Función para ver logs
show_logs() {
    print_info "Mostrando logs de los servicios..."
    docker compose logs -f
}

# Función para abrir shell en la app
open_shell() {
    print_info "Abriendo shell en el contenedor de la aplicación..."
    docker compose exec app sh
}

# Función para abrir shell de PostgreSQL
open_db_shell() {
    print_info "Abriendo shell de PostgreSQL..."
    docker compose exec postgres psql -U postgres -d newsletters
}

# Función para limpiar contenedores e imágenes
clean_docker() {
    print_warning "Esto eliminará todos los contenedores e imágenes. ¿Continuar? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Limpiando Docker..."
        docker compose down -v
        docker compose -f docker-compose.dev.yml down -v
        docker system prune -f
        docker volume prune -f
        print_status "Docker limpiado"
    else
        print_info "Operación cancelada"
    fi
}

# Función para mostrar estado
show_status() {
    print_info "Estado de los servicios:"
    docker compose ps
}

# Función para crear backup
create_backup() {
    print_info "Creando backup de la base de datos..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker compose exec postgres pg_dump -U postgres newsletters > "$BACKUP_FILE"
    print_status "Backup creado: $BACKUP_FILE"
}

# Función para restaurar backup
restore_backup() {
    print_warning "Ingresa el nombre del archivo de backup:"
    read -r backup_file
    if [ -f "$backup_file" ]; then
        print_info "Restaurando backup: $backup_file"
        docker compose exec -T postgres psql -U postgres newsletters < "$backup_file"
        print_status "Backup restaurado"
    else
        print_error "Archivo de backup no encontrado: $backup_file"
    fi
}

# Función para ejecutar migración
run_migration() {
    print_info "Ejecutando migración de datos..."
    docker compose exec app node migrate-to-postgres.js
    print_status "Migración completada"
}

# Función principal
main() {
    case "${1:-help}" in
        start)
            start_production
            ;;
        dev)
            start_development
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        build)
            build_images
            ;;
        logs)
            show_logs
            ;;
        shell)
            open_shell
            ;;
        db-shell)
            open_db_shell
            ;;
        clean)
            clean_docker
            ;;
        status)
            show_status
            ;;
        backup)
            create_backup
            ;;
        restore)
            restore_backup
            ;;
        migrate)
            run_migration
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Comando desconocido: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@"
