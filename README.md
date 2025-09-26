# Automatización del flujo de CI/CD con Docker y AWS en la rama develop

[... tu contenido existente hasta Docker Compose ...]

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