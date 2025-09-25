# Automatización del flujo de CI/CD con Docker y AWS en la rama develop
## Configurar que solo se pueda subir código a **develop** mediante Pull Requests (PRs). 

* Ir a proyecto de GitHub
* Ir a Configuracion
* Ir a Ramas o Branches
* Click **Agregar conjunto de reglas de rama** || **Add branch ruleset**
* Ingresar nombre, en mi caso hice use **developRules**
* Ingresar rama objetivo, en mi caso use **develop** ya que era la rama a poner restricciones
* En **Reglas de rama** activar las siguientes opciones:
   * Restringir eliminaciones || Restict deletions
   * Requerir una solicitud de extracción antes de fusionar || Require a pull request before merging
      * Aprobaciones requeridas || Required approvals
      * Descartar las aprobaciones de pull request obsoletas cuando se envían nuevas confirmaciones || Dismiss stale pull request approvals when new commits are pushed
      * Bloquear force pushes || Block force pushes
* Guardar

# -------------------------------------------------

## DockerFile
### Aqui tendriamos que crear el archivo **DockerFile** el cual es escencial para crear la imagen de docker en la que correremos nuestra **API**.

* En la raiz de nuestro proyecto a la altura de **src** creamos un **DockerFile**
* Primero tendremos que conocer los comandos basicos para poder decirle a docker que hacer:
   * **FROM:**
      * Este es importante por que le dice a Docker que tipo de imagen usara como base, en nuestro caso usaremos estos 2:
         * **node:18** → Node.js v18 en Ubuntu (más pesado)
         * **node:18-alpine** → Node.js v18 en Alpine Linux (más ligero) 
         * **Nota:** Hay mas imagenes base que se pueden usar dependiendo las necesidades.
   * **WORKDIR:**
      * Esta le dice a **Docker** cual sera su directorio de trabajo, crea una carpeta y ahi trabaja
   * **COPY:**
      * Esta le dice a **Docker** copia tal cosa y pegala aqui:
         * **Ejemplo:** COPY package*.json ./
      * Lo que copiara es lo que esta en el entorno de el **DockerFile**.
      * Lo que pegara se ira a el **WORKDIR**
   * **RUN:**
      * Este le dice que ejecute algo dentro de la imagen en construccion
   * **EXPOSE:**
      * Este le dice a **Docker** que abra ese puerto en el contenedor en construccion
   * **CMD:**
      * Este le dice a **Docker** ejecuta este comando cuando el contenedor este en ejecucion
* Ahora sabiendo esto hacemos lo siguiente:
```dockerfile
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
```

## DockerIgnore
### Aqui tendriamos que crear el archivo **.dockerignore** el cual es escencial para crear la imagen de docker en la que correremos nuestra **API**

* En la raiz de nuestro proyecto a la altura de **src** creamos un **.dockerignore**
* Este funciona como el **.gitignore**, el cual ignora todo lo que se especifique dentro al momento de hacer push, con **.dockerignore** es lo mismo pero en momento de construccion 
* Ahora sabiendo esto hacemos lo siguiente:
```dockerignore
# Dependencias
node_modules
npm-debug.log*

# Archivos de desarrollo
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Archivos temporales
.tmp
.temp

# IDE/Editor
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Git
.git
.gitignore

# Documentación
README.md
docs/

# Testing
coverage/
.nyc_output

# TypeScript
*.tsbuildinfo

# Build output (se genera en el container)
dist/
```