// routes/equipoRoutes.js
const express = require('express');
const router = express.Router();
const Equipo = require('../models/Equipo');

router.get('/equipo', async (req, res) => {
  try {
    const equipo = await Equipo.find(); // busca todos los miembros
    res.json(equipo);
  } catch (error) {
    console.error('Error al obtener el equipo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
