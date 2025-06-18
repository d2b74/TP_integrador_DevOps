const express = require('express');
const usuariosRouter = require('./usuarios');
const profesorRouter = require('./profesor')
const sesionRouter = require('./sesion')
const materiasRouter= require('./materiasRoutes');
const cursoRouter= require('./cursosRoutes');
const router = express.Router();
const verificarRol = require('../middleware/verificarRol')
const {verNotas} = require('../controllers/historiaAcademica')
const {obtEstudianteTutor, verNotas1} = require('../controllers/historiaAcademica')
const autenticarJWT = require('../middleware/autenticarJWT')
const agregarUsuarioAVista = require('../middleware/sessionData')
//Renderiza pagina home 
router.get('/', (req, res, next) => {res.render('home')})
router.get('/home2',autenticarJWT,agregarUsuarioAVista, verificarRol(['administrativo','tutor','profesor','estudiante']), (req, res, next) => {res.render('home2')})
// Renderiza pagina formulario de registro solo se admite al administrativo
router.get('/registro',autenticarJWT,agregarUsuarioAVista, verificarRol(['administrativo']),(req, res, next) => {res.render("registro")})
router.get('/materias',autenticarJWT,agregarUsuarioAVista,verificarRol(['administrativo']),(req, res, next) => {res.render('gest-materias')})
router.get('/usuarios',autenticarJWT,agregarUsuarioAVista,verificarRol(['administrativo']),(req, res, next) => {res.render('gestionUsuarios')})


// Llama al router de materias
router.use('/usuarios', autenticarJWT,agregarUsuarioAVista,verificarRol(['administrativo']),materiasRouter);
router.use('/usuarios', autenticarJWT,agregarUsuarioAVista,verificarRol(['administrativo']),cursoRouter);
// Llama al router de profesor
router.use('/profesor',autenticarJWT,agregarUsuarioAVista,verificarRol(['profesor']),profesorRouter)
//  Llama al router de usuarios
router.use('/usuarios', autenticarJWT,agregarUsuarioAVista, usuariosRouter);
//  Llama al router de usuarios
router.use('/login', sesionRouter);
// visualiza las notas de 1 estudiante
router.get('/notas',autenticarJWT,verificarRol(['estudiante','tutor']),verNotas);
//rutas para tutor 
//visualiza los estudiantes relacionados con el tutor
router.get('/tutor',autenticarJWT,verificarRol(['tutor']), obtEstudianteTutor);
//visualiza las notas de un estudiantes relacionados con el tutor
router.get('/tutor/:dni',autenticarJWT,verificarRol(['tutor']), verNotas1); 


//visualiza 404 con cualquier ruta no definida
router.use((req, res, next) => {
  return res.status(404).render('404', { title: 'Página no encontrada' });
});
module.exports = router;