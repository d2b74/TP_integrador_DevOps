#!/bin/bash

echo "=== Inicio del script restore.sh ==="

echo "Listando contenido de /backup/EscuelaItaliana:"
ls -la /backup/EscuelaItaliana

if [ $? -ne 0 ]; then
  echo "ERROR: No se encontró la carpeta /backup/EscuelaItaliana"
  exit 1
fi

echo "Ejecutando mongorestore con --drop para la base EscuelaItaliana..."
mongorestore --drop --db EscuelaItaliana /backup/EscuelaItaliana

if [ $? -eq 0 ]; then
  echo "Restauración finalizada correctamente ✅"
else
  echo "ERROR: Falló la restauración con mongorestore ❌"
  exit 1
fi

echo "=== Fin del script restore.sh ==="