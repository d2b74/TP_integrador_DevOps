const express = require('express');
const { cargarNota, obtenerCursosYMaterias,modificarNota} = require('../controllers/historiaAcademica')
const profesorRouter = express.Router();

//rutas de profesor 
//obtiene estudiantes del profesor 
profesorRouter.get('/',obtenerCursosYMaterias)
//carga la nota de un estudiante
profesorRouter.post('/',cargarNota)
//modifica la nota ya cargada de un estudiante 
profesorRouter.put('/',modificarNota)

module.exports = profesorRouter;