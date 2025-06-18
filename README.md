# TP Integrador DevOps

## Descripción del Proyecto

Aplicación web simple desarrollada como trabajo práctico integrador para la materia DevOps. El objetivo es aplicar prácticas y herramientas clave de DevOps: desarrollo, contenerización, automatización, testeo y despliegue automatizado en un entorno CI/CD.

## Tecnologías utilizadas

- **Backend:** Node.js + Express
- **Base de datos:** (Ejemplo: PostgreSQL / MongoDB / MySQL)
- **Contenerización:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **(Opcional) Infraestructura como Código:** Terraform / Ansible
- **(Opcional) Monitoreo:** Prometheus + Grafana

## Estructura del repositorio

```
TP_integrador_DevOps/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── routers/
│   └── app.js
├── tests/
├── Dockerfile
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── package.json
├── README.md
└── (infra/)   # Solo si usas Terraform/Ansible
```

## Instrucciones para correr localmente con Docker

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/d2b74/TP_integrador_DevOps.git
   cd TP_integrador_DevOps
   ```

2. **Copia el archivo de variables de entorno (si existe):**
   ```bash
   cp .env.example .env
   # Edita .env con tus valores
   ```

3. **Levanta los servicios:**
   ```bash
   docker-compose up --build
   ```

4. **Accede a la aplicación:**  
   - Backend: [http://localhost:3000](http://localhost:3000)
   - (Opcional) Grafana: [http://localhost:3001](http://localhost:3001)
   - (Opcional) Prometheus: [http://localhost:9090](http://localhost:9090)

## Pipeline DevOps

![Diagrama del pipeline](ruta/a/tu/diagrama.png)

1. **Push/Pull Request** en GitHub
2. **GitHub Actions** ejecuta:
   - Instalación de dependencias
   - Ejecución de tests automáticos
   - Build de imagen Docker
   - Push de imagen a Docker Hub
   - Despliegue automático en entorno de pruebas (Render, Railway, etc.)

## Scripts de CI/CD

El archivo `.github/workflows/ci-cd.yml` contiene la configuración de la pipeline.

## (Opcional) Infraestructura como Código

Si implementaste este punto, incluye aquí cómo levantar la infraestructura con Terraform o Ansible.

## (Opcional) Monitoreo

Si implementaste monitoreo, explica cómo acceder a Grafana y Prometheus, y qué métricas se exponen.

## Conclusiones

- Resumen de lo aprendido y dificultades encontradas.
- (Opcional) Roles del equipo.

## Autores

- Acosta, María Lis - [GitHub](https://github.com/Mentita04)
- Barrios, Dante - [GitHub](https://github.com/d2b74)
- Carmona, Eliana - [GitHub](https://github.com/Eli4118)
- Marcori, Jonathan - [GitHub](https://github.com/Jonyls62)
