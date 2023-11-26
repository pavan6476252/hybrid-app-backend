const Product = require('../../schema/ecom/productModel');
const User = require('../../schema/userSchema');



// Add a new product
exports.addProduct = async (req, res) => {
    const { name, description, price, quantityAvailable, category, } = req.body;


    const uploadedImages = await Promise.all(
        req.files.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'products',
            });
            return result.secure_url;
        })
    );

    const newProduct = new Product({
        name,
        description,
        price,
        quantityAvailable,
        imageUrls: uploadedImages,
        category,
        offers
    });

    newProduct
        .save()
        .then((product) => res.json(product))
        .catch((err) => res.status(500).json({ error: 'Internal Server Error' }));
};


// Get all products
exports.getAllProducts = (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const sort = req.query.sort == 'desc' ? -1 : 1;

    Product.find()
        .select(['-_id'])
        .limit(limit)
        .sort({ id: sort }).skip((page - 1) * 10)
        .then((products) => {
            res.json(products);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error' }));
};

// Get a specific product by id
exports.getProduct = (req, res) => {
    const id = req.params.id;

    Product.findOne({
        id,
    })
        .select(['-_id'])
        .then((product) => {
            res.json(product);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error' }));
};

// Get distinct product categories
// exports.getProductCategories = (req, res) => {
//     Product.distinct('category')
//         .then((categories) => {
//             res.json(categories);
//         })
//         .catch((err) => res.status(500).json({ error: 'Internal Server Error' }));
// };

// Get products in a specific category
exports.getProductsInCategory =async (req, res) => {
    const categories = req.params.category.split(',');
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const sort = req.query.sort == 'desc' ? -1 : 1;
    try {
        const products = await Product.find({
            category: { $in: categories },
        })
            .select(['-_id'])
            .limit(limit).skip((page - 1) * 10)
            .sort({ id: sort })


        return res.status(201).json(products);


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Edit a product
exports.editProduct = async (req, res) => {
    const { productId } = req.params;

    const { name, description, price, quantityAvailable, imageUrls, category, offers } = req.body;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'product not found' });
        }
        const user = await User.findOne({ uid: req.user.uid });

        if (product.author !== user.uid) {
            return res.status(403).json({ message: 'Unauthorized: User does not own the post' });
        }

        const updatedProduct = Product.findOneAndUpdate(
            { id: productId, author: user._id },
            {
                name,
                description,
                price,
                quantityAvailable,
                imageUrls,
                category,
                offers,
            },
            { new: true }
        )
            .select(['-_id'])
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Post not found' });
        }

        return res.status(201).json(updatedProduct);


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    const { productId } = req.params;



    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'product not found' });
        }
        const user = await User.findOne({ uid: req.user.uid });

        if (product.author !== user.uid) {
            return res.status(403).json({ message: 'Unauthorized: User does not own the product' });
        }

        const updatedProduct = Product.findOneAndDelete({ _id: productId, author: user._id })
        if (!updatedProduct) {
            return res.status(404).json({ message: 'product not found' });
        }

        return res.status(200).json(updatedProduct);


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};