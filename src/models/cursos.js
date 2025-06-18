const mongoose = require('mongoose');

const CursoSchema = new mongoose.Schema({

  grado: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
    // Este campo puede ser útil si necesitas separar entre primaria o secundaria
  },
  nivel: {
    type: String,
    required: true,
    enum: ['primaria', 'secundaria'] // Define si el curso es de primaria o secundaria
  },
  division: {
    type: String,
    required: true,
    match: [/^[a-zA-Z0-9]$/, 'La división debe ser una única letra (A-Z) o un número (0-9)'] // Valida una letra o número
  },
  turno: { 
    type: String, 
    enum: ['maniana', 'tarde']
  },
  materias: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Materia', // Cada curso puede tener varias materias
  }],

  estudiantes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', // Relaciona a los estudiantes que están inscritos en este curso//controlar hasta 30 por curso
   /* validate: {
      validator: function (v) {
        return v.length <= 30;
      },
      message: 'El curso no puede tener más de 30 estudiantes'
    }*/
  }]
});

const Curso = mongoose.model('Curso', CursoSchema);

module.exports = Curso;



