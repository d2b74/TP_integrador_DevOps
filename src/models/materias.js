const mongoose = require('mongoose');

// Esquema para materias
const MateriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la materia es obligatorio'],
    validate: {
      validator: function (v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'El nombre de la materia solo puede contener letras y espacios'
    }
  },

  profesor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', // Relaciona la materia con el profesor que la dicta
  },
  curso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso', // La materia está vinculada a un curso
  },
  horario: {
    dia: {
      type: String,
      enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
     
    },
    horaInicio: {
      type: String,
      
    },
    horaFin: {
      type: String,
      
    }
  },
});

const Materia = mongoose.model('Materia', MateriaSchema.index({ nombre: 1, curso: 1 }, { unique: true }));
module.exports = Materia;



