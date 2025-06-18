const express = require('express');
const verificarRol = require('../middleware/verificarRol')//para protejer la ruta
const materiasRouter = express.Router();
const MateriaController = require('../controllers/materias');


//rutas para materias

materiasRouter.get('/materias',verificarRol(['administrativo']),MateriaController.mostrarMaterias);
materiasRouter.get('/materias/nueva',verificarRol(['administrativo']),MateriaController.cargarFormulario);
materiasRouter.post('/materias/nueva',verificarRol(['administrativo']),MateriaController.cargarMateria);
// Ruta para mostrar el formulario de edición
materiasRouter.get('/materias/editar/:id',verificarRol(['administrativo']),MateriaController.mostrarFormularioEdicion);
// Ruta para procesar la edición
materiasRouter.put('/materias/editar/:id',verificarRol(['administrativo']),MateriaController.editarMateria);
// Ruta para eliminar una materia
materiasRouter.delete('/materias/eliminar/:id',verificarRol(['administrativo']), MateriaController.eliminarMateria); 

module.exports = materiasRouter;