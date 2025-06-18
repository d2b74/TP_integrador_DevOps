const app = require('./app');
const conectarDB = require('./src/config/db.js'); // Función para conectar a la base de datos

// Conectar a la base de datos
//conectarDB();

// Iniciar servidor en modo desarrollo
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
