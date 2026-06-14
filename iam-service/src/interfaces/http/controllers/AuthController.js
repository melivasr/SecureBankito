class AuthController {
  constructor(registerUserUseCase, loginUseCase) {
    this._registerUserUseCase = registerUserUseCase;
    this._loginUseCase = loginUseCase;
  }

  async register(req, res) {
    try {
      const result = await this._registerUserUseCase.execute(req.body);
      return res.status(201).json(result);
    } catch (err) {
      if (err.code === 'USER_ALREADY_EXISTS') {
        return res.status(409).json({ error: 'USER_ALREADY_EXISTS', message: err.message });
      }
      if (err.message.includes('invalido') || err.message.includes('requerido')) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: err.message });
      }
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async login(req, res) {
    try {
      const result = await this._loginUseCase.execute(req.body);
      return res.status(200).json(result);
    } catch (err) {
      if (err.code === 'INVALID_CREDENTIALS') {
        return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: err.message });
      }
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  validate(req, res) {
    return res.status(200).json({
      valid: true,
      userId: req.user.userId,
      username: req.user.username,
      clearance: req.user.clearance,
      integrity: req.user.integrity,
    });
  }
}

module.exports = AuthController;
