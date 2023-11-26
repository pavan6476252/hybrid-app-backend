const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/ecom/cartController');

router.get('/carts', cartController.getAllCarts);
router.get('/carts/:id', cartController.getCartById);
router.post('/carts', cartController.createCart);
router.put('/carts/:id', cartController.updateCart);
router.delete('/carts/:id', cartController.deleteCart);

module.exports = router;
