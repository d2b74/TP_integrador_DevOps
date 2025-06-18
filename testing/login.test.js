const request = require('supertest');
const app = require('../app');

describe('POST /login', () => {
  it('Debe iniciar sesión correctamente, establecer una cookie y redirigir a /home2', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        correo: 'profesormatematicas@example.com',
        password: 'prueba123',
      });

    expect(response.statusCode).toBe(302); // Redirección esperada
    expect(response.header['location']).toBe('/home2'); // Redirige correctamente
    expect(response.header['set-cookie']).toBeDefined(); // Cookie debería estar presente
  });

  it('Debe fallar con un código 400 si el usuario no existe', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        correo: 'usuarioinexistente@example.com',
        password: 'prueba123',
      });

    expect(response.statusCode).toBe(400); // Error esperado
    expect(response.body).toEqual({}); // Respuesta vacía según el log
  });

  it('Debe fallar con un código 400 si la contraseña es incorrecta', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        correo: 'profesormatematicas@example.com',
        password: 'contraseñaIncorrecta',
      });

    expect(response.statusCode).toBe(400); // Error esperado
    expect(response.body).toEqual({}); // Respuesta vacía según el log
  });

  it('Debe fallar con un código 500 si los datos están incompletos', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        correo: 'profesormatematicas@example.com',
        // Contraseña faltante
      });

    expect(response.statusCode).toBe(500); // Código según el log
    expect(response.body).toEqual({}); // Respuesta vacía según el log
  });
});
