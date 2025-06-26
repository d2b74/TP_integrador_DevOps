# Trabajo Práctico Integrador de DevOps

## Objetivo

Aplicar prácticas y herramientas clave de DevOps para desarrollar, contenerizar, automatizar, testear y desplegar una aplicación real en un entorno CI/CD.

---

## Descripción del Proyecto

Este proyecto es un sistema de gestión de estudiantes desarrollado en Node.js, con conexión a MongoDB Atlas.  
Incluye monitoreo con Prometheus y Grafana, automatización de tests, CI/CD con GitHub Actions y despliegue automatizado en Railway.  
Todo el ciclo de vida DevOps está documentado y automatizado.

---

## 1. Desarrollo de la aplicación

- **Backend:** Node.js + Express
- **Base de datos:** MongoDB Atlas (en la nube)
- **Frontend:** Opcional (puedes agregar HTML/CSS/JS o framework si lo deseas)
- **Pruebas:** Jest para unitarias y de integración

---

## 2. Control de versiones con Git

- Repositorio en GitHub: [URL_DEL_REPO]
- Branches principales:
  - `main`: rama estable y de producción
  - `develop`: rama de desarrollo
  - `feature/*`: ramas para nuevas funcionalidades

---

## 3. Dockerización

- **Dockerfile** para contenerizar la app Node.js
- **docker-compose.yml** para levantar la app, Prometheus y Grafana juntos
- Persistencia de dashboards de Grafana mediante volúmenes

---

## 4. Automatización de tests

- Pruebas unitarias y de integración con Jest
- Los tests se ejecutan automáticamente en la pipeline de CI/CD

---

## 5. CI/CD

- **GitHub Actions**:
  - Build de la app
  - Ejecución de tests
  - Build y push de imagen Docker a Docker Hub
  - Despliegue automático en Railway

**Diagrama del pipeline DevOps:**

![pipeline](ruta/a/tu/diagrama_pipeline.png)

---

## 6. Infraestructura como Código (IaC) - Despliegue Automatizado en Railway

Cualquier colaborador puede levantar la infraestructura y desplegar la app siguiendo estos pasos:

1. **Clonar el repositorio**
   ```bash
   git clone <URL_DEL_REPO>
   cd TP_integrador_DevOps
   ```

2. **Instalar Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

3. **Iniciar sesión en Railway**
   ```bash
   railway login
   ```

4. **Vincular el proyecto local a Railway**
   ```bash
   railway link
   ```
   Seleccionar el proyecto correspondiente.

5. **Cargar variables de entorno**
   (En la web de Railway, sección Variables, agregar por ejemplo `MONGO_URL`).

6. **Desplegar la aplicación**
   ```bash
   railway up
   ```
   o
   ```bash
   ./deploy.sh
   ```

7. **Verificar el despliegue**
   Railway mostrará la URL y los logs del build.

---

## 7. Monitoreo: Prometheus + Grafana

La aplicación expone métricas en `/metrics` usando `prom-client`.  
Prometheus recolecta estas métricas y Grafana permite visualizarlas en dashboards personalizados.

### ¿Cómo probar el monitoreo localmente?

1. **Levanta los servicios:**
   ```bash
   sudo docker-compose up
   ```

2. **Accede a los servicios:**
   - **App:** [http://localhost:3000](http://localhost:3000)
   - **Métricas:** [http://localhost:3000/metrics](http://localhost:3000/metrics)
   - **Prometheus:** [http://localhost:9090](http://localhost:9090)
   - **Grafana:** [http://localhost:3001](http://localhost:3001) (usuario/contraseña: admin/admin)

3. **Verifica en Prometheus:**
   - Ve a **Status > Targets** y asegúrate de que `app:3000` esté "UP".

4. **Agrega Prometheus como fuente de datos en Grafana:**
   - Menú izquierdo → ⚙️ **Data Sources** → **Add data source**
   - Selecciona **Prometheus**
   - En **URL** pon: `http://prometheus:9090`
   - Haz clic en **Save & Test**

5. **Crea un dashboard en Grafana:**
   - Menú izquierdo → **+ (Create) > Dashboard**
   - Haz clic en **Add visualization**
   - En el campo de consulta, escribe una métrica, por ejemplo:
     - `process_cpu_user_seconds_total`
     - `process_resident_memory_bytes`
     - `nodejs_eventloop_lag_seconds`
     - `nodejs_heap_size_used_bytes`
     - `nodejs_active_handles_total`
   - Haz clic en **Run query** y luego en **Apply** para guardar el panel.
   - Puedes agregar más paneles con otras métricas.

6. **Toma capturas de pantalla** de:
   - `/metrics` en tu app
   - Targets en Prometheus
   - Dashboard en Grafana mostrando al menos una métrica

### Ejemplo de métricas útiles para mostrar en Grafana

- `process_cpu_user_seconds_total` (CPU de usuario)
- `process_resident_memory_bytes` (Memoria RAM usada)
- `nodejs_eventloop_lag_seconds` (Lag del event loop)
- `nodejs_heap_size_used_bytes` (Heap de memoria usado)
- `nodejs_active_handles_total` (Handles activos)

### Capturas de ejemplo

![metrics](ruta/a/tu/captura_metrics.png)
![prometheus](ruta/a/tu/captura_prometheus.png)
![grafana](ruta/a/tu/captura_grafana.png)

---

## 8. Persistencia de dashboards en Grafana

El archivo `docker-compose.yml` incluye un volumen para Grafana, lo que permite que los dashboards y configuraciones se mantengan aunque reinicies los contenedores.

---

## 9. Conclusiones y roles del equipo

- **Automatización:** Todo el ciclo DevOps está automatizado, desde el desarrollo hasta el monitoreo.
- **Reproducibilidad:** Cualquier colaborador puede levantar el entorno y desplegar la app fácilmente.
- **Monitoreo:** El monitoreo en tiempo real permite detectar problemas de performance y recursos.
- **Roles:**  
  - [Nombre 1]: Backend y Dockerización  
  - [Nombre 2]: CI/CD y monitoreo  
  - [Nombre 3]: Documentación y testing

---

## 10. Extras

- **Infraestructura como Código (IaC):** Railway para despliegue automatizado.
- **Monitoreo:** Prometheus + Grafana.
- **Tests automatizados:** Con Jest.

---

## 11. Instrucciones rápidas para correr localmente con Docker

1. Configura el archivo `.env` con tu cadena de conexión a MongoDB Atlas.
2. Ejecuta:
   ```bash
   sudo docker-compose up --build
   ```
3. Accede a los servicios en los puertos indicados.

---

