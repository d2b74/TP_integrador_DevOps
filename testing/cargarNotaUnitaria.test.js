const { Types } = require('mongoose');
const request = require('supertest');
const express = require('express');
const mockingoose = require('mockingoose');
const { cargarNota } = require('../src/controllers/historiaAcademica');
const Nota = require('../src/models/notas');
const { getUsuarioAutenticado } = require('../src/utils/session');

// Crea una instancia de Express
const app = express();
app.use(express.json());

// Middleware simulado para agregar el usuario autenticado al objeto req
app.use((req, res, next) => {
  req.usuario = { id: new Types.ObjectId().toString() }; // Simula un usuario autenticado
  next();
});

// Ruta de prueba
app.post('/cargarNota', cargarNota);

jest.mock('../src/utils/session', () => ({
  getUsuarioAutenticado: jest.fn(),
}));

describe('Pruebas para la función cargarNota', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Limpia los mocks después de cada prueba
    mockingoose.resetAll(); // Limpia los datos mockeados
  });

  test('Debería crear una nueva nota y devolverla si todo es correcto', async () => {
    const estudianteId = new Types.ObjectId();
    const materiaId = new Types.ObjectId();
    const profesorId = new Types.ObjectId();

    // Mockear el guardado de la nota
    mockingoose(Nota).toReturn(
      {
        _id: new Types.ObjectId(),
        estudiante: estudianteId.toString(),
        materia: materiaId.toString(),
        profesor: profesorId.toString(),
        calificacion: 8,
        tipoEvaluacion: 'Parcial',
        observaciones: 'Muy bien',
        fecha: new Date(),
      },
      'save'
    );

    const response = await request(app).post('/cargarNota').send({
      estudianteId: estudianteId.toString(),
      materiaId: materiaId.toString(),
      calificacion: 8,
      tipoEvaluacion: 'Parcial',
      observaciones: 'Muy bien',
    });

    // Verificar respuesta
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.nota).toMatchObject({
      estudiante: estudianteId.toString(),
      materia: materiaId.toString(),
      profesor: expect.any(String), // No sabemos exactamente el profesor, pero debe ser una string
      calificacion: 8,
      tipoEvaluacion: 'Parcial',
      observaciones: 'Muy bien',
    });
  });

  test('Debería devolver un error si la calificación está fuera del rango', async () => {
    const estudianteId = new Types.ObjectId();
    const materiaId = new Types.ObjectId();

    const response = await request(app)
      .post('/cargarNota')
      .send({
        estudianteId: estudianteId.toString(),
        materiaId: materiaId.toString(),
        calificacion: 11, // Fuera de rango
        tipoEvaluacion: 'Final',
        observaciones: 'Excelente',
      });

    expect(response.status).toBe(400);
    expect(response.text).toBe('La calificación debe estar entre 1 y 10.');
  });

  test('Debería devolver un error si ocurre un problema al guardar la nota', async () => {
    const estudianteId = new Types.ObjectId();
    const materiaId = new Types.ObjectId();

    const nuevaNota = {
      estudianteId: estudianteId.toString(),
      materiaId: materiaId.toString(),
      calificacion: 8,
      tipoEvaluacion: 'Final',
      observaciones: 'Muy bien',
    };

    // Simular error al guardar la nota
    mockingoose(Nota).toReturn(new Error('Error al guardar'), 'save');

    const response = await request(app)
      .post('/cargarNota')
      .send(nuevaNota);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error al cargar la nota.');
  });
});
