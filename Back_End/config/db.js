// Back_end/config/db.js

const mysql = require('mysql2/promise');
// Carga las variables de entorno desde un archivo .env situado en la raíz del Back_End.
// Esto permite configurar la conexión a la base de datos sin hardcodear credenciales
// en el código fuente. Si alguna variable no está definida, se utilizan valores por defecto
// razonables para un entorno de desarrollo local.
require('dotenv').config();

// Crea un pool de conexiones a MySQL utilizando variables de entorno.
// Las siguientes variables pueden definirse en un archivo .env:
//   DB_HOST       - host de la base de datos (por defecto 'localhost')
//   DB_USER       - usuario de la base de datos (por defecto 'root')
//   DB_PASSWORD   - contraseña del usuario de la base de datos (por defecto '')
//   DB_NAME       - nombre de la base de datos (por defecto 'frank_furt')
//   DB_CONNECTION_LIMIT - número máximo de conexiones en el pool (por defecto 10)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'frank_furt',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0
});

module.exports = pool;
