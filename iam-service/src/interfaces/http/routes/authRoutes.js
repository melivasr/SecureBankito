const express = require('express');
const router = express.Router();

const UserRepository = require('../../../infrastructure/repositories/UserRepository');
const jwtVerify = require('../../../infrastructure/middlewares/jwtVerify');
const TokenService = require('../../../domain/services/TokenService');
const RegisterUserUseCase = require('../../../application/useCases/RegisterUserUseCase');
const LoginUseCase = require('../../../application/useCases/LoginUseCase');
const AuthController = require('../controllers/AuthController');

const userRepository = new UserRepository();
const tokenService = new TokenService(process.env.JWT_SECRET);
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository, tokenService);
const authController = new AuthController(registerUserUseCase, loginUseCase);

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.get('/validate', jwtVerify, (req, res) => authController.validate(req, res));

module.exports = router;
