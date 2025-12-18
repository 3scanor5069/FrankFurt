// models/Equipo.js
const mongoose = require('mongoose');

const equipoSchema = new mongoose.Schema({
  name: String,
  role: String,
  image: String,
  description: String
});

module.exports = mongoose.model('Equipo', equipoSchema, 'Equipo');
