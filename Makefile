.PHONY: help install dev start init-db build up down restart logs shell init-db-docker reset-db clean dev-up dev-down dev-logs dev-shell

PORT ?= 3001
SERVICE := app
DEV_SERVICE := app-dev
DEV_COMPOSE := docker compose --profile dev
DB_FILE := database/newsletters.db

help:
	@echo "Targets disponibles:"
	@echo "  install          Instala dependencias npm (local)"
	@echo "  dev              Levanta servidor local con nodemon"
	@echo "  start            Levanta servidor local (node server.js)"
	@echo "  init-db          Inicializa base de datos local"
	@echo ""
	@echo "  build            Construye imagen Docker"
	@echo "  up               Levanta contenedor en background"
	@echo "  down             Detiene y elimina contenedor"
	@echo "  restart          Reinicia contenedor"
	@echo "  logs             Sigue logs del contenedor"
	@echo "  shell            Abre shell dentro del contenedor"
	@echo "  init-db-docker   Inicializa base de datos dentro del contenedor"
	@echo "  reset-db         Elimina DB local y la recrea (¡destructivo!)"
	@echo "  clean            Elimina contenedor, imagen y node_modules"
	@echo ""
	@echo "  dev-up           Levanta contenedor dev (bind mount + node --watch, live reload)"
	@echo "  dev-down         Detiene contenedor dev"
	@echo "  dev-logs         Sigue logs del contenedor dev"
	@echo "  dev-shell        Abre shell dentro del contenedor dev"

install:
	npm install

dev:
	npm run dev

start:
	npm start

init-db:
	npm run init-db

build:
	docker compose build

up:
	docker compose up -d
	@echo "Servidor disponible en http://localhost:$(PORT)"

down:
	docker compose down

restart: down up

logs:
	docker compose logs -f $(SERVICE)

shell:
	docker compose exec $(SERVICE) sh

init-db-docker:
	docker compose exec $(SERVICE) node init-database.js

reset-db:
	@echo "Eliminando $(DB_FILE)..."
	rm -f $(DB_FILE)
	$(MAKE) init-db

clean:
	docker compose down -v --rmi local || true
	rm -rf node_modules

dev-up:
	$(DEV_COMPOSE) up -d $(DEV_SERVICE)
	@echo "Dev server corriendo en http://localhost:$(PORT) (live reload activo)"

dev-down:
	$(DEV_COMPOSE) down

dev-logs:
	$(DEV_COMPOSE) logs -f $(DEV_SERVICE)

dev-shell:
	$(DEV_COMPOSE) exec $(DEV_SERVICE) sh
