const express = require('express');
const router = express.Router();

const jwtVerify = require('../../../infrastructure/middlewares/jwtVerify');
const CuentaRepository = require('../../../infrastructure/repositories/CuentaRepository');
const TransaccionRepository = require('../../../infrastructure/repositories/TransaccionRepository');
const CrearCuentaUseCase = require('../../../application/useCases/CrearCuentaUseCase');
const CuentaController = require('../controllers/CuentaController');

const cuentaRepository = new CuentaRepository();
const transaccionRepository = new TransaccionRepository();
const crearCuentaUseCase = new CrearCuentaUseCase(cuentaRepository);
const controller = new CuentaController(crearCuentaUseCase, cuentaRepository, transaccionRepository);

router.post('/', jwtVerify, (req, res) => controller.crear(req, res));
router.get('/', jwtVerify, (req, res) => controller.listar(req, res));
router.get('/:cuentaId', jwtVerify, (req, res) => controller.obtener(req, res));
router.get('/:cuentaId/transacciones', jwtVerify, (req, res) => controller.listarTransacciones(req, res));

module.exports = router;
