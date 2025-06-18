const express = require('express');
const verificarRol = require('../middleware/verificarRol')//para protejer la ruta
const usuarioController = require('../controllers/usuario');
//const {obtEstudianteTutor, verNotas1} = require('../controllers/historiaAcademica')
const usuarioRouter = express.Router();
const autenticarJWT = require('../middleware/autenticarJWT')
const agregarUsuarioAVista = require('../middleware/sessionData')
//hacer un enrutador para tutor 

/* //rutas para tutor 
//visualiza los estudiantes relacionados con el tutor
usuarioRouter.get('/tutor',verificarRol(['tutor']), obtEstudianteTutor);
//visualiza las notas de un estudiantes relacionados con el tutor
usuarioRouter.get('/tutor/:dni',verificarRol(['tutor']), verNotas1);  */

//rutas para usuarios
// Crear usuario
usuarioRouter.post('/registro',autenticarJWT,agregarUsuarioAVista,verificarRol(['administrativo']), usuarioController.registro); 
// Listar todos los usuarios
usuarioRouter.get('/listar',verificarRol(['administrativo']),usuarioController.listar);
// Listar todos los estudiantes
usuarioRouter.get('/estudiantes',verificarRol(['administrativo']),usuarioController.filtrarEstudiantes);
// Actualizar usuario
usuarioRouter.put('/:dni',verificarRol(['administrativo']),usuarioController.actualizar);
// visualiza la pagina de Actualizar usuario
usuarioRouter.get('/:dni/editar', verificarRol(['administrativo']),usuarioController.editar);
// Eliminar usuario 
usuarioRouter.delete('/:dni',verificarRol(['administrativo']), usuarioController.eliminar); 



//funciones que no se utilizan por el momento
// Obtener usuario por dni
//usuarioRouter.get('/dni/:dni', usuarioController.buscarPorDni);

module.exports = usuarioRouter;