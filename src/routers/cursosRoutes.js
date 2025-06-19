const express = require('express');
const verificarRol = require('../middleware/verificarRol')//para protejer la ruta

const cursoRouter = express.Router();
const CursoController = require('../controllers/cursos');

cursoRouter.get('/cursos',verificarRol(['administrativo']),CursoController.obtenerCursos);
cursoRouter.get('/cursos/:id',verificarRol(['administrativo']),CursoController.obtenerCursoPorId);

module.exports = cursoRouter;