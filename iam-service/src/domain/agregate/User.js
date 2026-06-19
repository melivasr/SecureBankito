class User {
  constructor({ userId, username, mail, clearanceLevel, integrityLevel, credenciales }) {
    this.userId = userId;
    this.username = username;
    this.mail = mail;
    this.clearanceLevel = clearanceLevel;
    this.integrityLevel = integrityLevel;
    this.credenciales = credenciales;
  }
}

module.exports = User;
