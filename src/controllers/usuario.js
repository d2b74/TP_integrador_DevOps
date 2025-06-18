const { encriptarPass} = require('../utils/bcrypt')
const { model } = require("mongoose");
const Usuario = require('../models/usuarios'); // Importa el esquema base
const Curso = require('../models/cursos');
const { registrarEstudiante, registrarTutor, registrarProfesor, registrarAdministrador, asignarEstudiantesACurso } = require('./funciones/registroRoles');
const { validationResult } = require('express-validator');

const UsuarioController = {
  registro: async (req, res) => {

    const { rol, ...usuarioData } = req.body;

    console.log('Contraseña recibida:', usuarioData.password);
    try {
      
      
      console.log('Datos procesados:', usuarioData);
      const passEncriptado = await encriptarPass(usuarioData.password);
      console.log('Contraseña encriptada:', passEncriptado);
      usuarioData.password = passEncriptado; // Reemplaza el valor del password
      
      let nuevoUsuario;
  
      // Se maneja el rol para registrar el usuario correcto
      switch (rol) {
        case 'estudiante':
          nuevoUsuario = await registrarEstudiante(usuarioData);
          break;
        case 'tutor':
          nuevoUsuario = await registrarTutor(usuarioData);
          break;
        case 'profesor':
          nuevoUsuario = await registrarProfesor(usuarioData);
          break;
        case 'administrativo':
          nuevoUsuario = await registrarAdministrador(usuarioData);
          break;
        default:
          // Rol no válido, lanzar un error que será capturado por el middleware
          const error = new Error('Rol no válido');
          error.statusCode = 400;
          throw error;
      }

      // Enviar respuesta de éxito al cliente
      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: nuevoUsuario, // Opcional: enviar información del usuario registrado
      });
    } catch (error) {
      // Pasar el error al middleware de gestión de errores
      next(error);
    }
  },
  

  listar: async (req, res) => {
    try {
      const usuarios = await Usuario.find();
      //res.status(200).json(usuarios);
      // Renderizar la vista Pug 'listar' pasando la lista de usuarios
      res.render('listar', { usuarios });
    } catch (error) {
      res.status(500).json({ message: 'Error al listar los usuarios', error: error.message });
    }
  },

  buscarPorDni: async (req, res) => {
    try {
      const dni = req.params.dni;
      const usuario = await Usuario.findOne({ dni })
        .populate('tutores', 'nombres apellidos dni') // Poblar tutores
        .populate('estudiantes', 'nombres apellidos dni') // Poblar estudiantes
        .exec();

      // Si el usuario se encuentra
      if (usuario) {
        // Actualizar relaciones si es estudiante y tiene tutores asociados
        if (usuario.rol === 'estudiante' && usuario.dniTutor.length > 0) {
          const tutores = await Usuario.find({ dni: { $in: usuario.dniTutor }, rol: 'tutor' });

          // Asignar los tutores al estudiante si no están ya relacionados
          if (!usuario.tutores.length) {
            usuario.tutores = tutores.map(tutor => tutor._id);
            await usuario.save();

            // Actualizar los tutores para incluir el estudiante
            await Usuario.updateMany(
              { _id: { $in: tutores.map(tutor => tutor._id) } },
              { $addToSet: { estudiantes: usuario._id } }
            );
          }
        }

        // Actualizar relaciones si es tutor y tiene estudiantes asociados
        if (usuario.rol === 'tutor' && usuario.dniEstudiantes.length > 0) {
          const estudiantes = await Usuario.find({ dni: { $in: usuario.dniEstudiantes }, rol: 'estudiante' });

          // Asignar los estudiantes al tutor si no están ya relacionados
          if (!usuario.estudiantes.length) {
            usuario.estudiantes = estudiantes.map(estudiante => estudiante._id);
            await usuario.save();

            // Actualizar los estudiantes para incluir el tutor
            await Usuario.updateMany(
              { _id: { $in: estudiantes.map(estudiante => estudiante._id) } },
              { $addToSet: { tutores: usuario._id } }
            );
          }
        }

        //console.log(usuario);
        return res.status(200).json(usuario);
      } else {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
    }
  },


  filtrarEstudiantes: async (req, res) => {
    try {
      const { grado, nivel, division, turno } = req.query;
  
      // Crear un objeto de filtros
      const filtros = {};
      
      // Filtro para el curso asignado
      if (grado || nivel || division) {
        const cursoFiltro = {};
        if (grado) cursoFiltro.grado = grado;
        if (nivel) cursoFiltro.nivel = nivel;
        if (division) cursoFiltro.division = division;
  
        // Buscar cursos que coincidan con el filtro
        const cursos = await Curso.find(cursoFiltro).select('_id');
        const cursoIds = cursos.map(curso => curso._id);
  
        // Agregar filtro para cursoAsignado en el filtro de estudiantes
        filtros.cursoAsignado = { $in: cursoIds };
      }
  
      // Agregar el filtro para turno si es necesario
      if (turno) filtros.turno = turno; // Asegúrate de que 'turno' está en el esquema de Usuario o Curso
  
      const estudiantes = await Usuario.find({ rol: 'estudiante', ...filtros })
        .populate('cursoAsignado'); // Asegúrate de que 'cursoAsignado' está siendo populado
  
      const cursos = await Curso.find({}).select('grado nivel division');
      const grados = [...new Set(cursos.map(curso => curso.grado))];
      const niveles = [...new Set(cursos.map(curso => curso.nivel))];
      const divisiones = [...new Set(cursos.map(curso => curso.division))];
  
      res.render('cursos', {
        estudiantes,
        grados,
        niveles,
        divisiones
      });
    } catch (error) {
      console.error('Error al filtrar estudiantes:', error);
      return res.status(500).json({ message: 'Error al filtrar estudiantes' });
    }
  },
  
  
  

  actualizar: async (req, res) => {
    try {
      const datosAActualizar = {}; // Objeto para los datos a actualizar
      // Recorremos los campos de req.body
      for (const [campo, valor] of Object.entries(req.body)) {
        if (valor !== undefined) {
          // Si el campo es password, encriptamos la contraseña
          if (campo === 'password') {
            const passEncriptado = await encriptarPass(valor);
            datosAActualizar[campo] = passEncriptado;
          } else {
            datosAActualizar[campo] = valor; // Agregar otros campos tal cual
          }
        }
      }
     
      // Buscamos y actualizamos por DNI
      const usuarioActualizado = await Usuario.findOneAndUpdate(
        { dni: req.params.dni },
        { $set: datosAActualizar }, // Solo actualizamos los campos enviados
        { new: true } // Devolvemos el documento actualizado
      );

      if (!usuarioActualizado) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.status(200).json({ message: 'Usuario actualizado exitosamente', usuario: usuarioActualizado });
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar el usuario', error: error.message });
    }
  },

  editar: async (req, res) => {
    try {
      const usuario = await Usuario.findOne({ dni: req.params.dni });

      if (!usuario) {
        return res.status(404).render('404', { message: 'Usuario no encontrado' });
      }

      // Renderiza la vista de edición con los datos del usuario
      res.render('editarUsuario', { usuario });
    } catch (error) {
      res.status(500).send('Error al cargar el formulario de edición');
    }
  },

  eliminar: async (req, res) => {
    try {
      const usuarioEliminado = await Usuario.findOneAndDelete({ dni: req.params.dni });
      if (!usuarioEliminado) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
    }
  },
  asignacionCurso: async (req, res) => {
    try {
      const { rol, ...datosAsignacion } = req.body;

      let resultado;

      switch (rol) {
        case 'estudiante':
          resultado = await asignarEstudiantesACurso(datosAsignacion);
          break;

        case 'profesor':
          resultado = await asignarProfesoresACurso(datosAsignacion); // En caso de implementar más adelante
          break;

        default:
          return res.status(400).json({ message: 'Rol no válido' });
      }

      return res.status(201).json(resultado);
    } catch (error) {
      console.error('Error en la asignación de curso:', error);
      return res.status(400).json({ message: 'Error en la asignación de curso', error: error.message });
    }
  },



};


module.exports = UsuarioController;
