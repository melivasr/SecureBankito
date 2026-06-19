require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initDb = require('./infrastructure/initDb');
const cuentaRoutes = require('./interfaces/http/routes/cuentaRoutes');
const transferenciaRoutes = require('./interfaces/http/routes/transferenciaRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/cuentas', cuentaRoutes);
app.use('/transferencias', transferenciaRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'corebancario-service' }));

const PORT = process.env.PORT || 3002;

initDb()
  .then(() => app.listen(PORT, () => console.log(`corebancario-service corriendo en puerto ${PORT}`)))
  .catch((err) => { console.error('Error iniciando DB:', err); process.exit(1); });
