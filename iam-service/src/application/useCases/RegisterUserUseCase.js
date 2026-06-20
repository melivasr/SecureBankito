const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../../domain/agregate/User');
const ClearanceLevel = require('../../domain/valueObjects/ClearanceLevel');
const IntegrityLevel = require('../../domain/valueObjects/IntegrityLevel');
const Credenciales = require('../../domain/valueObjects/Credenciales');

class RegisterUserUseCase {
  constructor(userRepository) {
    this._userRepository = userRepository;
  }

  async execute({ username, mail, password, clearance, integrity }) {
    const existing = await this._userRepository.findByUsername(username);
    if (existing) {
      const err = new Error('Usuario ya existe');
      err.code = 'USER_ALREADY_EXISTS';
      throw err;
    }

    const clearanceLevel = new ClearanceLevel(clearance);
    const integrityLevel = new IntegrityLevel(integrity);
    const passwordHash = await bcrypt.hash(password, 10);
    const credenciales = new Credenciales(passwordHash);

    const user = new User({
      userId: uuidv4(),
      username,
      mail,
      clearanceLevel,
      integrityLevel,
      credenciales,
    });

    await this._userRepository.save(user);

    return {
      userId: user.userId,
      username: user.username,
      mail: user.mail,
      clearance: user.clearanceLevel.value,
      integrity: user.integrityLevel.value,
    };
  }
}

module.exports = RegisterUserUseCase;
