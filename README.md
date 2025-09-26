
# Automatización del flujo de CI/CD con Docker y AWS en la rama develop

# Automatización del flujo de CI/CD con Docker y AWS

## Protección de la rama develop mediante Pull Requests

### Objetivo
Configurar que solo se pueda subir código a la rama **develop** mediante Pull Requests (PRs), evitando pushes directos y asegurando revisión de código.

### Pasos para configurar las reglas de rama:

1. **Acceder a la configuración del repositorio**
   - Ir a tu proyecto en GitHub
   - Click en **Settings** (Configuración)
   - En el menú lateral, seleccionar **Rules** (Reglas)

2. **Crear nuevo conjunto de reglas**
   - Click en **New branch ruleset** (Nuevo conjunto de reglas de rama)
   - **Ruleset name:** `developRules`
   - **Enforcement status:** Active

3. **Configurar rama objetivo**
   - En **Target branches**, click **Add target**
   - Seleccionar **Include by pattern**
   - Ingresar: `develop`

4. **Activar reglas de protección**
   - ✅ **Restrict deletions** (Restringir eliminaciones)
   - ✅ **Require a pull request before merging** (Requerir PR antes de fusionar)
     - **Required approvals:** 1 (mínimo)
     - ✅ **Dismiss stale pull request approvals when new commits are pushed**
   - ✅ **Block force pushes** (Bloquear force pushes)

5. **Guardar configuración**
   - Click en **Create** para activar las reglas

### Resultado
Una vez configurado, cualquier intento de push directo a develop será rechazado con el mensaje:
```
remote: error: GH013: Repository rule violations found for refs/heads/develop.
remote: - Changes must be made through a pull request.
```

---

## Dockerfile

### Propósito
El **Dockerfile** es un archivo de texto que contiene instrucciones para crear una imagen Docker de nuestra aplicación API. Define el entorno, dependencias y configuración necesaria.

### Ubicación
- Crear en la **raíz del proyecto** (mismo nivel que `package.json`)
- Nombre del archivo: `Dockerfile` (sin extensión)

### Comandos básicos explicados

| Comando | Propósito | Ejemplo |
|---------|-----------|---------|
| **FROM** | Define la imagen base | `FROM node:18-alpine` |
| **WORKDIR** | Establece directorio de trabajo | `WORKDIR /app` |
| **COPY** | Copia archivos del host al contenedor | `COPY package*.json ./` |
| **RUN** | Ejecuta comandos durante la construcción | `RUN npm ci` |
| **EXPOSE** | Documenta qué puerto usa la app | `EXPOSE 8000` |
| **CMD** | Comando que se ejecuta al iniciar el contenedor | `CMD ["node", "dist/index.js"]` |

### Dockerfile optimizado (Multi-stage build)

```dockerfile
# =============================================
# STAGE 1: Build (Compilar TypeScript)
# =============================================
FROM node:18-alpine AS builder

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de npm
COPY package*.json ./

# Instalar todas las dependencias (incluye devDependencies para compilar)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# =============================================
# STAGE 2: Production (Imagen final optimizada)
# =============================================
FROM node:18-alpine AS production

# Crear usuario no-root para mayor seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar SOLO dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código JavaScript compilado desde el stage builder
COPY --from=builder /app/dist ./dist

# Cambiar propietario de archivos al usuario nodejs
RUN chown -R nodejs:nodejs /app

# Cambiar al usuario no-root
USER nodejs

# Documentar que la aplicación usa el puerto 8000
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["node", "dist/index.js"]
```

### Ventajas del Multi-stage build
- **Imagen más ligera:** Solo contiene dependencias de producción
- **Más segura:** No incluye herramientas de desarrollo
- **Mejor rendimiento:** Menos capas y archivos innecesarios

---

## .dockerignore

### Propósito
El archivo **.dockerignore** funciona como `.gitignore` pero para Docker. Define qué archivos y carpetas **NO** incluir en la imagen Docker durante la construcción.

### Ubicación
- Crear en la **raíz del proyecto** (mismo nivel que `Dockerfile`)
- Nombre del archivo: `.dockerignore`

### Contenido recomendado

```dockerignore
# =============================================
# DEPENDENCIAS (se instalan en el contenedor)
# =============================================
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# =============================================
# ARCHIVOS DE ENTORNO (sensibles)
# =============================================
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# =============================================
# ARCHIVOS DE LOG
# =============================================
logs
*.log
lerna-debug.log*

# =============================================
# ARCHIVOS TEMPORALES
# =============================================
.tmp
.temp
*.tmp
*.temp

# =============================================
# CONFIGURACIÓN DE EDITORES/IDEs
# =============================================
.vscode/
.idea/
*.swp
*.swo
*~

# =============================================
# ARCHIVOS DEL SISTEMA OPERATIVO
# =============================================
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# =============================================
# CONTROL DE VERSIONES
# =============================================
.git/
.gitignore
.gitattributes

# =============================================
# DOCUMENTACIÓN Y PRUEBAS
# =============================================
README.md
docs/
documentation/
coverage/
.nyc_output
jest.config.js

# =============================================
# TYPESCRIPT (archivos compilados)
# =============================================
*.tsbuildinfo
tsconfig.json

# =============================================
# BUILD OUTPUT (se genera en el contenedor)
# =============================================
dist/
build/

# =============================================
# ARCHIVOS DE CONFIGURACIÓN DE DESARROLLO
# =============================================
nodemon.json
.prettierrc*
.eslintrc*
webpack.config.js

# =============================================
# DOCKER (evitar recursión)
# =============================================
Dockerfile*
docker-compose*.yml
.dockerignore
```

### Por qué es importante
- **Reduce tamaño:** Imágenes más pequeñas y rápidas
- **Mejora seguridad:** No incluye archivos sensibles como `.env`
- **Acelera build:** Menos archivos para procesar
- **Evita conflictos:** No incluye `node_modules` del host

---

## docker-compose.yml para desarrollo local

### Propósito
Docker Compose permite definir y ejecutar aplicaciones multi-contenedor. En nuestro caso, orquesta la API y MongoDB trabajando juntos.

### Ubicación
- Crear en la **raíz del proyecto**
- Nombre: `docker-compose.yml` (para uso local)
- Opcionalmente: `docker-compose.example.yml` (template para el repositorio)

### Configuración para desarrollo

```yaml
version: '3.8'

services:
  # ==========================================
  # API (construida desde Dockerfile local)
  # ==========================================
  api:
    build: .                          # Construye usando el Dockerfile local
    container_name: api_core
    ports:
      - "8000:8000"                   # Puerto host:contenedor
    environment:
      - NODE_ENV=development
      - PORT=8000
      - MONGO_URI=mongodb://mongodb:27017/coredb
      - DB_NAME=coredb
      - JWT_SECRET=${JWT_SECRET}
      - FOLDER_ID=${FOLDER_ID}
    depends_on:
      - mongodb                       # Espera a que MongoDB inicie primero
    restart: unless-stopped
    networks:
      - core_network
    volumes:
      - ./uploads:/app/uploads        # Persistir archivos subidos
      - ./src:/app/src               # Hot reload durante desarrollo (opcional)

  # ==========================================
  # MongoDB (imagen oficial)
  # ==========================================
  mongodb:
    image: mongo:7.0
    container_name: core_database
    ports:
      - "27017:27017"                # Expuesto para herramientas como MongoDB Compass
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER:-admin}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD:-dev123}
      - MONGO_INITDB_DATABASE=${DB_NAME:-coredb}
    volumes:
      - mongodb_data:/data/db         # Persistir datos de la base
      - ./mongo-init:/docker-entrypoint-initdb.d  # Scripts de inicialización
    restart: unless-stopped
    networks:
      - core_network

# ==========================================
# VOLÚMENES PARA PERSISTENCIA
# ==========================================
volumes:
  mongodb_data:
    driver: local
    name: core_mongodb_data

# ==========================================
# RED PERSONALIZADA
# ==========================================
networks:
  core_network:
    driver: bridge
    name: core_network
```

### .env.example para variables locales

```bash
# ==========================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ==========================================
NODE_ENV=development
PORT=8000

# ==========================================
# BASE DE DATOS
# ==========================================
DB_NAME=coredb
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=dev123

# ==========================================
# SEGURIDAD
# ==========================================
JWT_SECRET=tu-jwt-secret-para-desarrollo-minimo-32-caracteres

# ==========================================
# SERVICIOS EXTERNOS
# ==========================================
FOLDER_ID=tu-folder-id-de-google-drive
```

### Comandos útiles

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver solo logs de la API
docker-compose logs -f api

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes (¡CUIDADO! Pierdes datos)
docker-compose down -v

# Reconstruir la imagen de la API
docker-compose build api

# Reiniciar solo la API
docker-compose restart api
```

### Diferencias entre desarrollo y producción

| Aspecto | Desarrollo | Producción (EC2) |
|---------|------------|------------------|
| **Imagen API** | `build: .` | `image: usuario/api:latest` |
| **Puerto MongoDB** | Expuesto (27017) | No expuesto |
| **Variables** | Archivo `.env` local | GitHub Secrets |
| **Volúmenes** | Hot reload | Solo persistencia |
| **Reinicio** | Manual | `restart: unless-stopped` |

---

## Archivo .env para desarrollo local

### Crear archivo .env local
```bash
# Copiar template
cp .env.example .env

# Editar con valores reales
nano .env
```

### Agregar .env al .gitignore
```gitignore
# Variables de entorno
.env
.env.local
.env.production
```

### Verificar funcionamiento
```bash
# Probar configuración local
docker-compose config

# Iniciar servicios
docker-compose up -d

# Verificar que funciona
curl http://localhost:8000/health
```

---

## Mejores prácticas aplicadas

### Seguridad
- ✅ Usuario no-root en contenedor
- ✅ Variables de entorno para secrets
- ✅ Puerto MongoDB no expuesto en producción
- ✅ Archivos sensibles en .dockerignore

### Eficiencia
- ✅ Multi-stage build para imagen ligera
- ✅ Cache de dependencias con npm ci
- ✅ Limpieza de cache npm
- ✅ .dockerignore optimizado

### Mantenibilidad
- ✅ Documentación clara de cada comando
- ✅ Variables con valores por defecto
- ✅ Redes y volúmenes con nombres específicos
- ✅ Restart policies configuradas

---

## Secrets de GitHub
### Configuración de variables de entorno seguras para el pipeline de CI/CD

Los secrets son variables de entorno encriptadas que GitHub Actions utiliza durante el pipeline. Son fundamentales para la seguridad ya que contienen información sensible como contraseñas, tokens y claves.

### Acceso a la configuración de Secrets:
* Ir a tu repositorio en GitHub
* Click en **Settings** (Configuración)
* En el menú lateral izquierdo, ir a **Secrets and variables**
* Seleccionar **Actions**
* Click en **New repository secret**

### Secrets requeridos para el pipeline:

#### **Docker Hub (Para subir la imagen)**
```
DOCKER_USERNAME: tu_usuario_dockerhub
DOCKER_PASSWORD: tu_token_o_contraseña_dockerhub
```

#### **AWS EC2 (Para deployment)**
```
EC2_HOST: 54.123.456.789 (IP elástica de tu instancia)
EC2_USER: ubuntu
EC2_SSH_KEY: -----BEGIN OPENSSH PRIVATE KEY-----
            tu_clave_privada_ssh_completa_aqui
            -----END OPENSSH PRIVATE KEY-----
```

#### **Base de Datos (Para tu aplicación)**
```
DB_NAME: coredb
MONGO_ROOT_USER: core_admin
MONGO_ROOT_PASSWORD: tu_password_mongo_super_seguro_123
```

#### **Aplicación (Para tu API)**
```
PORT: 8000
JWT_SECRET: tu_jwt_ultra_secreto_de_minimo_32_caracteres_aqui
FOLDER_ID: 1A2B3C4D5E6F7G8H9I0J
```

### Proceso de creación de cada secret:
1. Click en **New repository secret**
2. Ingresar el **Name** (exactamente como se muestra arriba)
3. Ingresar el **Value** (el valor real de la variable)
4. Click en **Add secret**
5. Repetir para todos los secrets necesarios

---

## Creación de instancia EC2 en AWS
### Configuración del servidor donde se desplegará la aplicación

### Prerrequisitos:
* Cuenta de AWS activa
* Acceso a la consola de AWS

### Paso 1: Acceder al servicio EC2
* Iniciar sesión en AWS Console
* Buscar **EC2** en los servicios
* Click en **EC2 Dashboard**

### Paso 2: Lanzar nueva instancia
* Click en **Launch Instance** (Lanzar instancia)
* Configurar los siguientes parámetros:

#### **Nombre de la instancia:**
```
Nombre: api-production-server
```

#### **Imagen del sistema operativo (AMI):**
```
Ubuntu Server 22.04 LTS (HVM), SSD Volume Type
Arquitectura: 64-bit (x86)
```

#### **Tipo de instancia:**
```
Tipo: t2.micro (elegible para nivel gratuito)
vCPUs: 1
Memoria: 1 GiB
```

#### **Par de claves (Key pair):**
* Click en **Create new key pair**
* Nombre: `mi-api-keypair`
* Tipo: **RSA**
* Formato: **.pem** (para usar con OpenSSH)
* Click en **Create key pair**
* **IMPORTANTE:** Guarda el archivo `.pem` descargado en lugar seguro

### Paso 3: Configurar grupos de seguridad (Security Groups)
* Click en **Edit** en Network settings
* Agregar las siguientes reglas:

#### **Reglas de entrada (Inbound rules):**
```
Tipo: SSH
Puerto: 22
Origen: Mi IP (0.0.0.0/0 para acceso desde cualquier IP)

Tipo: HTTP
Puerto: 80  
Origen: 0.0.0.0/0 (acceso público)

Tipo: Custom TCP
Puerto: 8000 (puerto de tu API)
Origen: 0.0.0.0/0 (acceso público)

Tipo: HTTPS
Puerto: 443
Origen: 0.0.0.0/0 (acceso público)
```

### Paso 4: Configurar almacenamiento
```
Tipo: gp3 (General Purpose SSD)
Tamaño: 8 GiB (suficiente para la aplicación)
```

### Paso 5: Lanzar la instancia
* Revisar toda la configuración
* Click en **Launch Instance**
* Esperar a que el estado cambie a **Running**

---

## Asignación de IP Elástica
### Configurar una IP fija para la instancia EC2

Las IPs elásticas permiten que tu instancia mantenga la misma dirección IP pública incluso si se reinicia.

### Paso 1: Asignar IP Elástica
* En el EC2 Dashboard, ir a **Network & Security**
* Click en **Elastic IPs**
* Click en **Allocate Elastic IP address**
* Región: Seleccionar la misma región donde está tu instancia
* Click en **Allocate**

### Paso 2: Asociar IP a la instancia
* Seleccionar la IP elástica recién creada
* Click en **Actions** → **Associate Elastic IP address**
* **Instance:** Seleccionar tu instancia
* **Private IP address:** Dejar automático
* Click en **Associate**

### Paso 3: Verificar asociación
* La IP elástica ahora aparece en **Associated instance**
* Esta será la IP que uses en el secret `EC2_HOST`

---

## Obtención de SSH Key
### Configurar acceso seguro a la instancia EC2

### Opción A: Usar la clave .pem descargada

#### **Convertir .pem a formato OpenSSH:**
```bash
# En tu máquina local (Linux/Mac/WSL):
chmod 400 mi-api-keypair.pem
ssh-keygen -p -m OpenSSH -f mi-api-keypair.pem
```

#### **Ver contenido de la clave privada:**
```bash
cat mi-api-keypair.pem
```

#### **Resultado esperado:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAA...
(múltiples líneas)
-----END OPENSSH PRIVATE KEY-----
```

### Opción B: Crear nuevas claves SSH

#### **Generar nuevo par de claves:**
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy"
```

#### **Copiar clave pública a EC2:**
```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@TU_IP_ELASTICA
```

### Probar conectividad SSH:
```bash
ssh -i mi-api-keypair.pem ubuntu@TU_IP_ELASTICA
```

Si la conexión es exitosa, copia todo el contenido de la clave privada al secret `EC2_SSH_KEY`.

---

## Instalación de Docker y Docker Compose en EC2
### Preparar el entorno de ejecución en el servidor

### Paso 1: Conectarse a la instancia
```bash
ssh -i mi-api-keypair.pem ubuntu@TU_IP_ELASTICA
```

### Paso 2: Actualizar el sistema
```bash
sudo apt update
sudo apt upgrade -y
```

### Paso 3: Instalar Docker
```bash
# Instalar paquetes necesarios
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Agregar clave GPG oficial de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Agregar repositorio de Docker
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Actualizar e instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
```

### Paso 4: Configurar permisos de Docker
```bash
# Agregar usuario ubuntu al grupo docker
sudo usermod -aG docker ubuntu

# Reiniciar servicio docker
sudo systemctl restart docker

# Habilitar Docker para que inicie automáticamente
sudo systemctl enable docker

# IMPORTANTE: Cerrar sesión SSH y volver a conectarse
exit
```

### Paso 5: Volver a conectarse y verificar Docker
```bash
ssh -i mi-api-keypair.pem ubuntu@TU_IP_ELASTICA

# Verificar que Docker funciona sin sudo
docker --version
docker run hello-world
```

### Paso 6: Instalar Docker Compose
```bash
# Descargar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker-compose --version
```

### Paso 7: Verificación final
```bash
# Verificar que ambos funcionan
docker --version
docker-compose --version
docker ps
```

### Resultado esperado:
```
Docker version 24.0.x, build xxxxx
Docker Compose version 2.x.x
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

---

## Pipeline de GitHub Actions
### Configuración del flujo de CI/CD automatizado

### Crear archivo de workflow:
* En tu proyecto, crear la carpeta `.github/workflows/`
* Crear archivo `deploy.yml` con el pipeline completo
* El pipeline incluye 4 jobs:
  1. **Build & Test:** Compilar TypeScript y crear imagen Docker
  2. **Push to Docker Hub:** Subir imagen al registro de contenedores
  3. **Deploy to EC2:** Desplegar aplicación en el servidor
  4. **Database Migrations:** Configurar base de datos y crear índices

### Flujo del pipeline:
```
Pull Request → Solo validación (Job 1)
Push to develop → Deploy completo (Jobs 1, 2, 3, 4)
```

---

## Verificación del deployment
### Confirmar que la aplicación funciona correctamente

### Después del deployment exitoso:

#### **Verificar contenedores en EC2:**
```bash
ssh -i mi-api-keypair.pem ubuntu@TU_IP_ELASTICA
cd ~/api-hello-world-app
docker-compose ps
docker-compose logs api
```

#### **Probar la API:**
```bash
# Health check
curl http://TU_IP_ELASTICA:8000/health

# Endpoints de tu API
curl http://TU_IP_ELASTICA:8000/api/users
```

#### **Verificar base de datos:**
```bash
docker-compose exec mongodb mongosh
use coredb
show collections
db.users.getIndexes()
```

---

## Troubleshooting
### Solución de problemas comunes

#### **Pipeline falla en push a Docker Hub:**
* Verificar secrets `DOCKER_USERNAME` y `DOCKER_PASSWORD`
* Asegurar que la imagen se construye correctamente

#### **No se puede conectar a EC2:**
* Verificar que la IP elástica está asociada
* Verificar que el grupo de seguridad permite SSH (puerto 22)
* Verificar que la clave SSH es correcta

#### **Contenedores no inician:**
* SSH a EC2 y revisar logs: `docker-compose logs`
* Verificar que las variables de entorno están correctas
* Verificar que Docker tiene permisos suficientes

#### **API no responde:**
* Verificar que el puerto 8000 está abierto en el grupo de seguridad
* Verificar que la aplicación está ejecutándose: `docker-compose ps`
* Revisar logs de la aplicación: `docker-compose logs api`

---

## Conclusiones
### Aprendizajes del proyecto de automatización CI/CD

La implementación de un pipeline de CI/CD con Docker y AWS proporciona:

1. **Automatización completa:** Desde commit hasta producción sin intervención manual
2. **Consistencia:** El mismo entorno en desarrollo, testing y producción
3. **Escalabilidad:** Fácil replicación en múltiples servidores
4. **Seguridad:** Manejo seguro de credenciales mediante GitHub Secrets
5. **Monitoreo:** Logs y verificaciones automáticas del estado del deployment
6. **Rollback:** Posibilidad de volver a versiones anteriores rápidamente

### Beneficios de usar contenedores:
* **Portabilidad:** La aplicación funciona igual en cualquier entorno
* **Aislamiento:** Dependencias encapsuladas sin conflictos
* **Eficiencia:** Uso optimizado de recursos del servidor
* **Mantenimiento:** Actualizaciones y despliegues simplificados

### Mejoras futuras posibles:
* Implementar múltiples entornos (staging, production)
* Agregar pruebas automatizadas más robustas
* Configurar monitoreo con CloudWatch
* Implementar auto-scaling con ECS o Kubernetes
* Agregar notificaciones de deployment via Slack/email