const express = require('express');
const router = express.Router();

const jwtVerify = require('../../../infrastructure/middlewares/jwtVerify');
const ActivoRepository = require('../../../infrastructure/repositories/ActivoRepository');
const AccesoAuditRepository = require('../../../infrastructure/repositories/AccesoAuditRepository');
const ListarActivosUseCase = require('../../../application/useCases/ListarActivosUseCase');
const ObtenerActivoUseCase = require('../../../application/useCases/ObtenerActivoUseCase');
const CrearActivoUseCase = require('../../../application/useCases/CrearActivoUseCase');
const ActivoController = require('../controllers/ActivoController');

const activoRepository = new ActivoRepository();
const auditRepository = new AccesoAuditRepository();
const controller = new ActivoController(
  new ListarActivosUseCase(activoRepository, auditRepository),
  new ObtenerActivoUseCase(activoRepository, auditRepository),
  new CrearActivoUseCase(activoRepository, auditRepository)
);

router.get('/', jwtVerify, (req, res) => controller.listar(req, res));
router.get('/:activoId', jwtVerify, (req, res) => controller.obtener(req, res));
router.post('/', jwtVerify, (req, res) => controller.crear(req, res));

module.exports = router;
