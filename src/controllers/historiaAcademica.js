const Nota = require('../models/notas');
const Usuario = require('../models/usuarios');
const Materia = require('../models/materias');
const Curso = require('../models/cursos');
const mongoose = require('mongoose');


async function nota(usuarioAutenticado) {
  try {
    // Verificar que el usuario está autenticado y tiene un ID válido
    if (!usuarioAutenticado || !usuarioAutenticado.id) {
      return res.status(401).send('Usuario no autenticado');
    }
    let estudianteId;
    // Si el usuario autenticado es un estudiante
    if (usuarioAutenticado.rol === 'estudiante') {
      estudianteId = usuarioAutenticado.id;
    }
    // Si el usuario autenticado es un tutor
    else if (usuarioAutenticado.rol === 'tutor') {
      const estudiante = await Usuario.findOne({ dniTutor: usuarioAutenticado.dni, rol: 'estudiante' });
      // Verificar si el tutor tiene un estudiante asociado
      if (!estudiante) {
        return res.status(404).send('No se encontraron estudiantes asociados a este tutor');
      }
      estudianteId = estudiante._id;
    } else {
      return res.status(403).send('No tienes permiso para ver las notas');
    }
    // Buscar las notas del estudiante
    const notas = await Nota.find({ estudiante: estudianteId })
      .populate('materia', 'nombre')  // Poblar el nombre de la materia
      .populate('profesor', 'nombres apellidos')  // Poblar el nombre del profesor
      .exec();
    return notas
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar las notas');
  }
}
//estudiante
async function verNotas(req, res) {
  const usuarioAutenticado = req.usuario
  try {
    const notas = await nota(usuarioAutenticado);
    res.render('historiaAcademica', { notas });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar las notas');
  }
}
//tutor
  async function verNotas1(req, res) {
    try {
      const usuarioAutenticado = await Usuario.findOne({dni:req.params.dni })
      const notas = await nota(usuarioAutenticado);
      res.render('historiaAcademica', { notas });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al cargar las notas');
    }
  }

  async function obtEstudianteTutor(req, res) {
    try {
      // Asumiendo que el tutor está logueado y su DNI está almacenado en req.user
      const tutor = req.usuario;  // O req.user._id si usas ObjectId
      const dniTutor = tutor.dni;
      // Busca a los estudiantes relacionados con este tutor
      const estudiantes = await Usuario.find({ dniTutor: dniTutor, rol: 'estudiante' });

      // Verifica si hay estudiantes
      if (estudiantes.length === 0) {
        return res.render('tutor', {
          estudiantes: [],
          errorMessage: 'No tienes estudiantes a tu cargo.'
        });      }

      // Devuelve la lista de estudiantes
      res.render('tutor', { estudiantes });
    } catch (error) {
      console.error('Error al obtener estudiantes del tutor:', error);
      return res.status(500).json({ mensaje: 'Hubo un error al obtener los estudiantes.' });
    }
  }

  async function obtenerCursosYMaterias(req, res) {
    try {
      const usuarioAutenticado = req.usuario;
  
      // Pipeline de agregación
      const pipeline = [
        {
          $match: { profesor: new mongoose.Types.ObjectId(usuarioAutenticado.id) }, // Asegurarse que sea ObjectId
        },
        {
          $lookup: {
            from: "cursos",
            localField: "_id", 
            foreignField: "materias",
            as: "cursos",
          },
        },
        {
          $unwind: "$cursos",
        },
        {
          $lookup: {
            from: "usuarios",
            localField: "cursos.estudiantes",
            foreignField: "_id",
            as: "estudiantes",
          },
        },
        {
          $unwind: "$estudiantes",
        },
        {
          $lookup: {
            from: "notas",
            let: { estudianteId: "$estudiantes._id", materiaId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$estudiante", "$$estudianteId"] }, 
                      { $eq: ["$materia", "$$materiaId"] },
                      { $eq: ["$profesor", new mongoose.Types.ObjectId(usuarioAutenticado.id)] }, // Comparar como ObjectId
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  calificacion: 1,
                  tipoEvaluacion: 1,
                },
              },
            ],
            as: "notas",
          },
        },
        {
          $project: {
            _id: 0,
            materiaId: "$_id",
            materia: "$nombre",
            curso: {
              $concat: [
                { $toString: "$cursos.grado" }, 
                " ",
                "$cursos.division",
              ],
            },
            estudiante: {
              _id: "$estudiantes._id",
              nombres: "$estudiantes.nombres",
              apellidos: "$estudiantes.apellidos",
              DNI: "$estudiantes.dni",
            },
            nota: {
              $ifNull: [
                { $arrayElemAt: ["$notas", 0] }, 
                null, // Devolver null si no hay nota
              ],
            },
          },
        },
      ];
  
      const resultados = await Materia.aggregate(pipeline);
  
      // Formatear los resultados finales
      const materias = resultados.map(result => ({
        materia: result.materia,
        materiaId: result.materiaId,
        curso: result.curso,
        estudiante: {
          _id: result.estudiante._id,
          nombres: result.estudiante.nombres,
          apellidos: result.estudiante.apellidos,
          DNI: result.estudiante.DNI,
        },
        calificacion: result.nota ? result.nota.calificacion : null,
        tipoEvaluacion: result.nota ? result.nota.tipoEvaluacion : null,
        notaid: result.nota ? result.nota._id : null,
      }));
      console.log(materias);
  
      res.render('profesores', { materias });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al obtener los cursos y materias del profesor");
    }
  }
  

  async function cargarNota(req, res) {
    try {
      const { estudianteId, materiaId, calificacion, tipoEvaluacion, observaciones } = req.body;
      const usuarioAutenticado = req.usuario;
      // Validar que la calificación esté en el rango permitido 
      if (calificacion < 1 || calificacion > 10) {
        return res.status(400).send('La calificación debe estar entre 1 y 10.');
      }

      // Crear una nueva nota
      const nuevaNota = new Nota({
        estudiante: estudianteId,
        materia: materiaId,
        profesor: usuarioAutenticado.id, // Suponiendo que tienes un método para obtener el profesor autenticado
        calificacion,
        tipoEvaluacion,
        observaciones
      });

      // Guardar la nota en la base de datos
      await nuevaNota.save();

      // Renderizar la vista con los datos actualizados
      // res.redirect('/profesor');// Cambia esto a la ruta correspondiente
      res.status(200).json({ success: true, nota: nuevaNota });

    } catch (error) {
      console.error(error);
      res.status(500).send('Error al cargar la nota.');
    }
  }

  async function modificarNota(req, res) {
    try {
      const { estudianteId, materiaId, calificacion, tipoEvaluacion, observaciones } = req.body;

      // Buscar la nota existente por estudiante y materia
      const notaExistente = await Nota.findOne({ estudiante: estudianteId, materia: materiaId });

      // Si no existe la nota, devolver un error
      if (!notaExistente) {
        return res.status(404).send('No se encontró la nota para este estudiante y materia.');
      }

      // Solo actualizar los campos que fueron proporcionados en la solicitud
      if (calificacion !== undefined) notaExistente.calificacion = calificacion;
      if (tipoEvaluacion !== undefined) notaExistente.tipoEvaluacion = tipoEvaluacion;
      if (observaciones !== undefined) notaExistente.observaciones = observaciones;

      // Validar que la calificación esté en el rango permitido, si es que se proporcionó
      if (notaExistente.calificacion < 0 || notaExistente.calificacion > 10) {
        return res.status(400).send('La calificación debe estar entre 0 y 10.');
      }

      // Guardar los cambios en la base de datos
      await notaExistente.save();

      // Responder con la nota actualizada
      res.status(200).json({ success: true, nota: notaExistente });

    } catch (error) {
      console.error(error);
      res.status(500).send('Error al modificar la nota.');
    }
  }



  module.exports = { verNotas, cargarNota, obtenerCursosYMaterias, modificarNota, obtEstudianteTutor, verNotas1 };
