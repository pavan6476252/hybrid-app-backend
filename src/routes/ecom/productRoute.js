const express = require('express')
const multer = require('multer')
const router = express.Router()
const product = require('../../controllers/ecom/productsController')

const upload = multer({ dest: 'uploads/' });

router.get("/product", product.getAllProducts);

// router.get("/categories", product.getProductCategories);

router.get("/product/:category", product.getProductsInCategory);

router.get("/product/:id", product.getProduct);

router.post("/product", upload.array('images', 5), product.addProduct);

router.put("/product/:id", product.editProduct);
router.patch("/product/:id", product.editProduct);
router.delete("/product/:id", product.deleteProduct);


module.exports = router;