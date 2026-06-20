const pool = require('../db');
const User = require('../../domain/agregate/User');
const ClearanceLevel = require('../../domain/valueObjects/ClearanceLevel');
const IntegrityLevel = require('../../domain/valueObjects/IntegrityLevel');
const Credenciales = require('../../domain/valueObjects/Credenciales');

class UserRepository {
  _toUser(row) {
    return new User({
      userId: row.user_id,
      username: row.username,
      mail: row.mail,
      clearanceLevel: new ClearanceLevel(row.clearance),
      integrityLevel: new IntegrityLevel(row.integrity_level),
      credenciales: new Credenciales(row.password_hash),
    });
  }

  async findByUsername(username) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1', [username]
    );
    return rows[0] ? this._toUser(rows[0]) : null;
  }

  async findById(userId) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE user_id = $1', [userId]
    );
    return rows[0] ? this._toUser(rows[0]) : null;
  }

  async save(user) {
    await pool.query(
      `INSERT INTO users (user_id, username, mail, password_hash, clearance, integrity_level)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.userId, user.username, user.mail, user.credenciales.passwordHash,
       user.clearanceLevel.value, user.integrityLevel.value]
    );
  }
}

module.exports = UserRepository;
