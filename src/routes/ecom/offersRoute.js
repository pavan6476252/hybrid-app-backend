
const express = require('express');
const multer = require('multer')

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

const offerController = require('../../controllers/ecom/offersController');

router.get('/offers', offerController.getAllOffers);
router.get('/offers/:id', offerController.getOfferById);

router.post('/offers', upload.single('offer'), offerController.createOffer);
router.put('/offers/:id', upload.single('offer'), offerController.updateOffer);

router.delete('/offers/:id', offerController.deleteOffer);

module.exports = router;
