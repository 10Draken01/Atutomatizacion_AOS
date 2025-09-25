# =============================================
# STAGE 1: Build (Compilar TypeScript)
# =============================================
FROM node:18-alpine AS builder

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# =============================================
# STAGE 2: Production (Imagen final)
# =============================================
FROM node:18-alpine AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar SOLO dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar código compilado desde el stage anterior
COPY --from=builder /app/dist ./dist

# Copiar otros archivos necesarios (si los tienes)
# COPY --from=builder /app/public ./public

# Cambiar propiedad de archivos al usuario nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exponer el puerto de la API
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["node", "dist/index.js"]