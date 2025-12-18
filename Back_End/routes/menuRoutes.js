const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/',  menuController.getAllMenuItems);
router.get('/especiales', menuController.getEspecialesDelDia);
router.post('/',  menuController.createMenuItem);
router.put('/:id', menuController.updateMenuItem);
router.delete('/:id',  menuController.deleteMenuItem);

module.exports = router;