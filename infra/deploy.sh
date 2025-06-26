#!/bin/bash

set -e

echo "Iniciando despliegue en Railway..."

# Vincula el proyecto local al proyecto Railway existente (solo la primera vez)
railway link

echo "Recuerda cargar tus variables de entorno manualmente en Railway si es necesario."

# Sube la app a Railway
railway up

echo "Despliegue completado."