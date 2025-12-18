// File: api/index.js
// Description: Punto de entrada para Vercel. Exporta la app de Express como Function.
// Nota: Vercel enruta todas las peticiones a /api usando vercel.json.

const app = require('../server'); // Importa la app Express definida en server.js.

module.exports = app; // Exporta la app para que Vercel la ejecute como Serverless Function.
