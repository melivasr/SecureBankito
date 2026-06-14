const express = require('express');
const router = express.Router();

const jwtVerify = require('../../../infrastructure/middlewares/jwtVerify');
const CuentaRepository = require('../../../infrastructure/repositories/CuentaRepository');
const TransaccionRepository = require('../../../infrastructure/repositories/TransaccionRepository');
const EjecutarTransferenciaUseCase = require('../../../application/useCases/EjecutarTransferenciaUseCase');
const TransferenciaController = require('../controllers/TransferenciaController');

const cuentaRepository = new CuentaRepository();
const transaccionRepository = new TransaccionRepository();
const ejecutarTransferenciaUseCase = new EjecutarTransferenciaUseCase(cuentaRepository, transaccionRepository);
const controller = new TransferenciaController(ejecutarTransferenciaUseCase);

router.post('/', jwtVerify, (req, res) => controller.ejecutar(req, res));

module.exports = router;
