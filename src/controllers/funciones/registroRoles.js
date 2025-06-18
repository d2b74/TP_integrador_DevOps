const mongoose = require('mongoose');
const { model } = require("mongoose");
const Usuario = require('../../models/usuarios');
const Curso = require('../../models/cursos'); 

async function registrarEstudiante(usuarioData) {
  const session = await mongoose.startSession();
  session.startTransaction(); // Iniciar la transacción
  try {
    const { dniTutores, grado, nivel, turno } = usuarioData; // Agregar turno

    // Crear el nuevo estudiante
    const nuevoEstudiante = new Usuario({
      ...usuarioData,
      rol: 'estudiante',
    });

    // Buscar los tutores por DNI y asignar sus IDs al estudiante
    if (dniTutores && dniTutores.length > 0) {
      const tutores = await Usuario.find({ dni: { $in: dniTutores }, rol: 'tutor' }).session(session);
      if (tutores.length > 0) {
        nuevoEstudiante.tutores = tutores.map(tutor => tutor._id);
      } else {
        throw new Error('No se encontraron tutores con esos DNIs');
      }
    }

    // Guardar el estudiante
    await nuevoEstudiante.save({ session });

    // Buscar un curso existente con el mismo grado, nivel y turno
    let cursoExistente = await Curso.findOne({ grado, nivel, turno }).session(session);

    if (cursoExistente && cursoExistente.estudiantes.length < 30) {
      // Agregar al estudiante al curso existente
      cursoExistente.estudiantes.push(nuevoEstudiante._id);
      await cursoExistente.save({ session });
      nuevoEstudiante.cursoAsignado = cursoExistente._id; // Asignar el curso al estudiante
    } else {
      // Si el curso no existe o está lleno, crear un nuevo curso
      const cantidadCursos = await Curso.countDocuments({ grado, nivel, turno }).session(session);
      const nuevaDivision = String.fromCharCode(65 + cantidadCursos); // Generar nueva división (A, B, C, ...)

      const nuevoCurso = new Curso({
        grado,
        nivel,
        division: nuevaDivision,
        turno, // Agregar turno al nuevo curso
        estudiantes: [nuevoEstudiante._id], // Agregar al estudiante al nuevo curso
      });

      await nuevoCurso.save({ session });
      nuevoEstudiante.cursoAsignado = nuevoCurso._id; // Asignar el curso al estudiante
    }

    // Actualizar los tutores para agregar al nuevo estudiante
    if (nuevoEstudiante.tutores && nuevoEstudiante.tutores.length > 0) {
      await Usuario.updateMany(
        { _id: { $in: nuevoEstudiante.tutores } },
        { $addToSet: { estudiantes: nuevoEstudiante._id } },
        { session }
      );
    }

    // Guardar los cambios en el estudiante (incluyendo el curso asignado)
    await nuevoEstudiante.save({ session });

    // Si todo va bien, confirmamos la transacción
    await session.commitTransaction();
    session.endSession();
    return nuevoEstudiante;

  } catch (error) {
    // Si ocurre algún error, revertimos todas las operaciones
    await session.abortTransaction();
    session.endSession();
    console.error('Error al registrar estudiante:', error);
    return { success: false, message: error.message }; // Devuelve un mensaje claro
  }
}


// Función para registrar tutores
async function registrarTutor(usuarioData) {
  const { dniEstudiantes } = usuarioData;

  // Crear el nuevo tutor
  const nuevoTutor = new Usuario({
    ...usuarioData,
    rol: 'tutor',
  });

  // Buscar los estudiantes por DNI y asignar sus IDs al tutor
  if (dniEstudiantes && dniEstudiantes.length > 0) {
    const estudiantes = await Usuario.find({ dni: { $in: dniEstudiantes }, rol: 'estudiante' });

    if (estudiantes.length > 0) {
      nuevoTutor.estudiantes = estudiantes.map(estudiante => estudiante._id);
    }
  }
  // Guardar el tutor
  await nuevoTutor.save();

  // Actualizar los estudiantes para agregar al tutor, solo si no están ya relacionados
  if (nuevoTutor.estudiantes && nuevoTutor.estudiantes.length > 0) {
    await Usuario.updateMany(
      { _id: { $in: nuevoTutor.estudiantes } },
      { $addToSet: { tutores: nuevoTutor._id } } // Añadir el tutor al estudiante sin duplicados
    );
  }

  return nuevoTutor;
}
// Función para registrar profesores
async function registrarProfesor(usuarioData) {
  const nuevoProfesor = new Usuario({
    ...usuarioData,
    rol: 'profesor',
  });
  
  await nuevoProfesor.save();
  return nuevoProfesor;
}

// Función para registrar administradores
async function registrarAdministrador(usuarioData) {
  const nuevoAdministrador = new Usuario({
    ...usuarioData,
    rol: 'administrativo',
  });
  
  await nuevoAdministrador.save();
  return nuevoAdministrador;
}

async function asignarEstudiantesACurso({ estudiantesIds, cursoId }) {
  // Validar si el curso existe
  const curso = await Curso.findById(cursoId);
  if (!curso) {
    throw new Error('Curso no encontrado');
  }

  // Buscar los estudiantes seleccionados por sus IDs
  if (estudiantesIds && estudiantesIds.length > 0) {
    const estudiantes = await Usuario.find({ _id: { $in: estudiantesIds }, rol: 'estudiante' });

    if (estudiantes.length > 0) {
      // Asignar estudiantes al curso
      curso.estudiantes.push(...estudiantes.map(est => est._id));
      await curso.save();

      // Actualizar los estudiantes para agregarles el curso
      await Usuario.updateMany(
        { _id: { $in: estudiantes.map(est => est._id) } },
        { $addToSet: { cursos: curso._id } }
      );

      return { message: 'Estudiantes asignados exitosamente al curso', curso };
    } else {
      throw new Error('No se encontraron estudiantes con esos IDs');
    }
  } else {
    throw new Error('Debes seleccionar al menos un estudiante');
  }
}

module.exports = {
  registrarEstudiante,
  registrarTutor,
  registrarProfesor,
  registrarAdministrador,
  asignarEstudiantesACurso
};
