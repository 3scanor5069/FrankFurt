const mongoose = require('mongoose');

// Define el esquema para los productos del menú
const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Principales', 'Acompañamientos', 'Bebidas', 'Postres'] // Opcional, pero útil
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Activo', 'Inactivo']
  },
  image: {
    type: String,
    required: false // La URL de la imagen puede ser opcional
  }
}, {
  timestamps: true // Agrega campos de createdAt y updatedAt
});

// Crea el modelo a partir del esquema
const MenuItem = mongoose.model('MenuItem', menuSchema);

module.exports = MenuItem;