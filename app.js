const express = require('express');
const client = require('prom-client');
const app = express();
const path = require('path'); 
const conectarDB = require('./src/config/db.js'); // Importar la función de conexión a la base de datos
const router = require('./src/routers/indexRoutes.js');// importa Archivo de rutas principal
const sessionData = require('./src/middleware/sessionData.js');
const authRoutes = require('./src/routers/authRoutes.js');
const cookieParser = require('cookie-parser');
// Conectar a la base de datos
conectarDB();
// Configurar Pug como motor de vistas
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'src/views')); // Carpeta donde estarán las vistas Pug
app.use(express.static('public'));

// Inicializa el registro de métricas
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// Endpoint para Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Middleware para manejar JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware para analizar cookies
app.use(cookieParser());
// Usa el middleware de sessionData antes de las rutas
//app.use(sessionData);
// Rutas de autenticación
app.use('/api/auth', authRoutes);//esto que es ?? 
// Usa el archivo router que incluye la ruta de estudiantes
app.use(router);
/*const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/ 

module.exports=app;



// Middleware de Express (para parsear JSON, etc.)
/* app.use(express.json()); */
