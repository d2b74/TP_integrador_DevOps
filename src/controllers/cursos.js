const Materia = require('../models/materias');
const Usuario = require('../models/usuarios');
const Curso = require('../models/cursos');
const mongoose = require('mongoose');

const CursoController = {

    obtenerCursos: async (req, res) => {
        try {
          // Obtener todos los cursos con sus materias relacionadas (si aplica)
          const cursos = await Curso.find().populate('materias'); // Ajusta según tu modelo
          res.render('cargarCursos', { cursos });
        } catch (error) {
          console.error('Error al obtener los cursos:', error);
          res.status(500).json({ error: 'Error al obtener los cursos.' });
        }
      },
    obtenerCursoPorId: async (req, res) => {
        try {
          const { id } = req.params;
          const curso = await Curso.findById(id).populate('materias');
      
          if (!curso) {
            return res.status(404).json({ error: 'Curso no encontrado.' });
          }
      
          res.render('cursoId', { curso });
        } catch (error) {
          console.error('Error al obtener el curso:', error);
          res.status(500).json({ error: 'Error al obtener el curso.' });
        }
      },
};


module.exports = CursoController;
