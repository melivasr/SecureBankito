const bcrypt = require('bcryptjs');

class LoginUseCase {
  constructor(userRepository, tokenService) {
    this._userRepository = userRepository;
    this._tokenService = tokenService;
  }

  async execute({ username, password }) {
    const user = await this._userRepository.findByUsername(username);
    if (!user) {
      const err = new Error('Credenciales invalidas');
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const valid = await bcrypt.compare(password, user.credenciales.passwordHash);
    if (!valid) {
      const err = new Error('Credenciales invalidas');
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const securityToken = this._tokenService.emitirToken(user);

    return {
      token: securityToken.jwtString,
      clearance: securityToken.clearance.value,
      integrity: securityToken.integrity.value,
    };
  }
}

module.exports = LoginUseCase;
