const mongoose = require('mongoose');

const NotaSchema = new mongoose.Schema({
  estudiante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', // Referencia al estudiante (usuario con rol "estudiante")
    required: true
  },
  materia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Materia', // Referencia a la materia para la cual se está asignando la nota
    required: true
  },
  profesor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', // Referencia al profesor que asignó la nota
    required: true
  },
  calificacion: {
    type: Number,
    required: true,
    min: [0, 'La calificación debe ser mayor o igual a 0'],
    max: [10, 'La calificación debe ser menor o igual a 10'] // Suponiendo que el rango de notas es de 0 a 10
  },
  fecha: {
    type: Date,
    default: Date.now, // Fecha en la que se asigna la nota
    required: true
  },
  tipoEvaluacion: {
    type: String,
    enum: ['Parcial', 'Final', 'Tarea', 'Examen', 'Otro'], // Tipos de evaluación posibles
    required: true
  },
  observaciones: {
    type: String,
    trim: true // Permite agregar comentarios o detalles adicionales opcionales
  }
});

const Nota = mongoose.model('Nota', NotaSchema);

module.exports = Nota;
