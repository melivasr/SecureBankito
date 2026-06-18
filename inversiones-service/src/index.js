require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initDb = require('./infrastructure/initDb');
const activoRoutes = require('./interfaces/http/routes/activoRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/activos-vip', activoRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'inversiones-service' }));

const PORT = process.env.PORT || 3003;

initDb()
  .then(() => app.listen(PORT, () => console.log(`inversiones-service corriendo en puerto ${PORT}`)))
  .catch((err) => { console.error('Error iniciando DB:', err); process.exit(1); });
