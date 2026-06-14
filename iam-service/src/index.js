require('dotenv').config();
const express = require('express');
const initDb = require('./infrastructure/initDb');
const authRoutes = require('./interfaces/http/routes/authRoutes');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'iam-service' }));

const PORT = process.env.PORT || 3001;

initDb()
  .then(() => app.listen(PORT, () => console.log(`iam-service corriendo en puerto ${PORT}`)))
  .catch((err) => { console.error('Error iniciando DB:', err); process.exit(1); });
