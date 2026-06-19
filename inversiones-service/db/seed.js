require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const activos = [
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', nombre: 'Fondo Reserva Oro Alpha', descripcion: 'Fondo exclusivo de alto rendimiento VIP', rendimientoAnual: 15.5, montoMin: 500000, rentabilidadPct: 15.5, rentabilidadMeses: 24 },
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', nombre: 'Bono Estructurado Oro B', descripcion: 'Instrumento de renta fija premium clasificado ORO', rendimientoAnual: 12.0, montoMin: 250000, rentabilidadPct: 12.0, rentabilidadMeses: 12 },
  { id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', nombre: 'Portafolio Platino VIP', descripcion: 'Cartera diversificada de nivel maximo', rendimientoAnual: 18.0, montoMin: 750000, rentabilidadPct: 18.0, rentabilidadMeses: 36 },
];

async function main() {
  for (const a of activos) {
    await pool.query(
      `INSERT INTO activos_inversion (activo_id, nombre, descripcion, rendimiento_anual, monto_min, clasificacion, rentabilidad_pct, rentabilidad_meses)
       VALUES ($1, $2, $3, $4, $5, 'ORO', $6, $7)
       ON CONFLICT DO NOTHING`,
      [a.id, a.nombre, a.descripcion, a.rendimientoAnual, a.montoMin, a.rentabilidadPct, a.rentabilidadMeses]
    );
    console.log(`Activo seed: ${a.nombre}`);
  }
}

main().catch(console.error).finally(() => pool.end());
