let usuariosAutenticado = null;

function setUsuarioAutenticado(usuario) {
    usuariosAutenticado = usuario;   
}

function getUsuarioAutenticado() {
    return usuariosAutenticado;
}

module.exports = { setUsuarioAutenticado, getUsuarioAutenticado };