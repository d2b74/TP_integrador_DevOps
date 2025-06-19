const Materia = require('../models/materias');
const Usuario = require('../models/usuarios');
const Curso = require('../models/cursos');
const mongoose = require('mongoose');

const MateriaController = {
    cargarMateria: async (req, res) => {
        const { nombre, nivel, grado, division, turno, profesor, horario } = req.body; 
        const gradoNumero = Number(grado);
        console.log('Criterios de búsqueda1:', { grado: gradoNumero, nivel, division, turno });
    
        try {
            // Buscar el curso por grado, nivel, división y turno
            const curso = await Curso.findOne({
                grado: gradoNumero,
                nivel: { $regex: new RegExp(`^${nivel}$`, 'i') },
                division,
                turno,
            });
            
            if (!curso) {
                return res.status(400).json({
                    error: 'No se encontró el curso especificado. Verifica los datos ingresados.',
                });
            }
    
            // Verificar si ya existe una materia con el mismo nombre para el mismo curso
            const materiaExistente = await Materia.findOne({
                nombre,
                curso: curso._id,
            });
    
            if (materiaExistente) {
                return res.status(400).json({
                    error: `La materia "${nombre}" ya está asignada al curso con nivel "${nivel}", grado "${grado}", división "${division}" y turno "${turno}".`,
                });
            }
    
            // Validar que el ID del profesor sea válido (si se proporciona)
            let profesorValido = null;
            if (profesor && mongoose.Types.ObjectId.isValid(profesor)) {
                profesorValido = profesor;
            }
    
            // Crear la nueva materia
            const nuevaMateriaData = {
                nombre,
                profesor: profesorValido || null, // Asociar profesor si es válido
                curso: curso._id, // Asociar la materia al curso
                horario: horario || null, // Si no se proporciona, dejar como null
            };
    
            const nuevaMateria = new Materia(nuevaMateriaData);
            await nuevaMateria.save();
    
            // **Actualizar el curso para incluir la materia**
            curso.materias.push(nuevaMateria._id);
            await curso.save();
    
            return res.status(201).json({
                mensaje: 'Materia creada exitosamente',
                materia: nuevaMateria,
            });
        } catch (error) {
            console.error('Error al crear materia:', error);
            return res.status(500).json({
                error: 'Error al crear la materia',
                detalles: error.message,
            });
        }
    },
    
    
    
    cargarFormulario: async (req, res) => {
        try {
            // Obtener materias para el datalist
            const materias = await Materia.find().select('nombre').lean();
    
            // Obtener niveles (puedes hacerlo estático o desde la BD si tienes un esquema para niveles)
            const niveles = ["Primaria", "Secundaria"]; // Ejemplo estático
    
            // Obtener grados únicos desde la colección de cursos
            const grados = await Curso.distinct('grado');
    
            // Obtener divisiones únicas desde la colección de cursos
            const divisiones = await Curso.distinct('division');
    
            // Obtener turnos únicos desde la colección de cursos
            const turnos = await Curso.distinct('turno');
    
            // Obtener profesores desde la colección de usuarios con rol "profesor"
            const profesores = await Usuario.find({ rol: "profesor" }).select('nombres apellidos _id').lean();
    
            // Renderizar la vista y pasar los datos
            res.render('cargarMaterias', { materias, niveles, grados, divisiones, turnos, profesores });
        } catch (error) {
            console.error('Error al cargar datos del formulario:', error);
            res.status(500).send('Error al cargar el formulario.');
        }
    },
    mostrarMaterias: async (req, res) => {
        try {
            // Obtener todas las materias con sus cursos y profesores
            const materias = await Materia.find()
                .populate('profesor', 'nombres apellidos') // Opcional, trae solo nombres y apellidos
                .populate('curso') // Trae todos los datos del curso
                .exec();
    
            // Renderizar la vista con las materias
            res.render('materias', { materias });
        } catch (error) {
            // Manejo de errores
            res.status(500).render('error', { 
                mensaje: 'Error al obtener las materias', 
                error: error.message 
            });
        }
    },
    
    mostrarFormularioEdicion: async (req, res) => {
        
        try {
            const { id } = req.params; // ID de la materia a editar
            // Obtener materias para el datalist
            const materia = await Materia.findById(id)
            .populate('profesor')
            .populate('curso', 'nivel grado division turno')
            .exec();
    
            // Obtener niveles (puedes hacerlo estático o desde la BD si tienes un esquema para niveles)
            const niveles = ["Primaria", "Secundaria"]; // Ejemplo estático
    
            // Obtener grados únicos desde la colección de cursos
            const grados = await Curso.distinct('grado');
    
            // Obtener divisiones únicas desde la colección de cursos
            const divisiones = await Curso.distinct('division');
    
            // Obtener turnos únicos desde la colección de cursos
            const turnos = await Curso.distinct('turno');
    
            // Obtener profesores desde la colección de usuarios con rol "profesor"
            const profesores = await Usuario.find({ rol: "profesor" }).select('nombres apellidos _id').lean();
    
            // Renderizar la vista y pasar los datos
            res.render('editar', { materia, niveles, grados, divisiones, turnos, profesores });
        } catch (error) {
            console.error('Error al cargar datos del formulario:', error);
            res.status(500).send('Error al cargar el formulario.');
        }
    },
     
    editarMateria: async (req, res) => {
        const { id } = req.params; // ID de la materia a editar
        const { nombre, nivel, grado, division, turno, profesor, horario } = req.body; 
        const gradoNumero = Number(grado);
    
        try {
            // Buscar la materia existente por ID
            const materiaExistente = await Materia.findById(id);
            if (!materiaExistente) {
                return res.status(404).json({
                    error: 'No se encontró la materia especificada.',
                });
            }
    
            // Buscar el curso relacionado (si cambian los datos del curso)
            const curso = await Curso.findOne({
                grado: gradoNumero,
                nivel: { $regex: new RegExp(`^${nivel}$`, 'i') },
                division,
                turno,
            });
    
            if (!curso) {
                return res.status(400).json({
                    error: 'No se encontró el curso especificado. Verifica los datos ingresados.',
                });
            }
    
            // Validar que el nombre sea único dentro del curso seleccionado
            const materiaDuplicada = await Materia.findOne({
                nombre,
                curso: curso._id,
                _id: { $ne: id }, // Excluir la materia actual al buscar duplicados
            });
    
            if (materiaDuplicada) {
                return res.status(400).json({
                    error: `La materia "${nombre}" ya está asignada al curso con nivel "${nivel}", grado "${grado}", división "${division}" y turno "${turno}".`,
                });
            }
    
            // Validar que el ID del profesor sea válido (si se proporciona)
            let profesorValido = null;
            if (profesor && mongoose.Types.ObjectId.isValid(profesor)) {
                profesorValido = profesor;
            }
    
            // Actualizar los datos de la materia
            const materiaActualizada = await Materia.findByIdAndUpdate(
                id,
                {
                    nombre,
                    profesor: profesorValido || null,
                    curso: curso._id,
                    horario: horario || null,
                },
                { new: true } // Retornar el documento actualizado
            );
    
            // **Actualizar relaciones en los cursos**
            // Si el curso cambió, eliminar la materia del curso anterior
            if (!materiaExistente.curso.equals(curso._id)) {
                const cursoAnterior = await Curso.findById(materiaExistente.curso);
                if (cursoAnterior) {
                    cursoAnterior.materias.pull(materiaExistente._id);
                    await cursoAnterior.save();
                }
            }
    
            // Agregar la materia al nuevo curso si aún no está incluida
            if (!curso.materias.includes(materiaActualizada._id)) {
                curso.materias.push(materiaActualizada._id);
                await curso.save();
            }
    
            return res.status(200).json({
                mensaje: 'Materia actualizada exitosamente',
                materia: materiaActualizada,
            });
        } catch (error) {
            console.error('Error al editar materia:', error);
            return res.status(500).json({
                error: 'Error al editar la materia',
                detalles: error.message,
            });
        }
    },
    
    
    eliminarMateria: async (req, res) => {
        try {
            const materiaId = req.params.id;
            console.log('ID recibido para eliminar:', materiaId);
    
            const materiaEliminada = await Materia.findByIdAndDelete(materiaId);
    
            if (!materiaEliminada) {
                return res.status(404).json({ message: 'Materia no encontrada' });
            }
    
            res.json({ message: 'Materia eliminada exitosamente' });
        } catch (error) {
            console.error('Error al eliminar la materia:', error);
            res.status(500).json({ message: 'Error al eliminar la materia' });
        }
    },

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


module.exports = MateriaController;
