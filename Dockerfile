FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorio para logs
RUN mkdir -p logs

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exponer puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/auth/profile', (res) => { process.exit(res.statusCode === 401 ? 0 : 1) })"

# Usar script de entrada personalizado
ENTRYPOINT ["./docker-entrypoint.sh"]
