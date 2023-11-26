const express = require('express')
const multer = require('multer')
const router = express.Router()
const category = require('../../controllers/ecom/categoryController')

const upload = multer({ dest: 'uploads/' });

router.post('/category', upload.single('image'), category.createCategory);
router.get('category/:id', category.getCategory);
router.get('/category', category.getAllCategory);


module.exports = router;