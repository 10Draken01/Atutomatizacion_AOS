# API CRUD de Clientes

Esta es una API RESTful básica desarrollada para gestionar clientes. Implementa operaciones CRUD (Crear, Leer, Actualizar y Eliminar) sobre una base de datos MongoDB, utilizando JWT para autenticación y soporte opcional para subida de imágenes a AWS S3.

## Características

- Crear un nuevo cliente
- Obtener la lista de clientes o un cliente específico
- Actualizar información de un cliente
- Eliminar un cliente
- Autenticación mediante JWT
- Subida opcional de imágenes a AWS S3 (configurable)

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB (Mongoose)
- JSON Web Tokens (JWT)
- AWS SDK (para subir imágenes)
- dotenv

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu_usuario/tu_repo.git
   cd tu_repo
