// bcryptUtils.js
const bcrypt = require('bcryptjs');

// Función para encriptar una contraseña
async function encriptarPass(contraseña) {
  const salt = await bcrypt.genSalt(10);  // Crear un salt de 10 rondas
  return await bcrypt.hash(contraseña, salt);  // Devolver la contraseña encriptada
}

// Función para comparar una contraseña con el hash guardado
async function compararPass(contraseña, hash) {
  return await bcrypt.compare(contraseña, hash);  // Devuelve un booleano
}

module.exports = { encriptarPass, compararPass };