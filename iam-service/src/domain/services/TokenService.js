const jwt = require('jsonwebtoken');
const SecurityToken = require('../valueObjects/SecurityToken');

class TokenService {
  constructor(secret) {
    if (!secret) throw new Error('TokenService: JWT secret es requerido');
    this._secret = secret;
  }

  // exp = 15 min 
  emitirToken(user) {
    const payload = {
      sub: user.userId,
      username: user.username,
      clearance: user.clearanceLevel.value,
      integrity: user.integrityLevel.value,
    };

    const jwtString = jwt.sign(payload, this._secret, { expiresIn: '15m' });

    return new SecurityToken(jwtString, user.clearanceLevel, user.integrityLevel);
  }
}

module.exports = TokenService;
