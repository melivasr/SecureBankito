class Credenciales {
  constructor(passwordHash) {
    if (!passwordHash) throw new Error('passwordHash es requerido');
    this.passwordHash = passwordHash;
    Object.freeze(this);
  }
}

module.exports = Credenciales;
