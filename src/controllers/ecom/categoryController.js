const Category = require("../../schema/ecom/categoryModel")
const Product = require("../../schema/ecom/productModel")
const cloudinary = require('../../config/cloudnary_config')
exports.createCategory = async (req, res) => {

    try {
        const { name,
            description,
        } = req.body;

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'categories',
        });

        const newCat = new Category({
            name,
            description,
            image: result.secure_url,
        })

        const data = await newCat.save();
        res.status(201).json(data);

    } catch (e) {
        res.status(500).json({ message: "Internal server error", error: e })
    }
}

exports.getCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id)
        res.status(200).json(category);

    } catch (e) {
        res.status(500).json({ message: "Internal server error", error: e })
    }
}
exports.getAllCategory = async (req, res) => {
    try {
        const categories = await Category.find()
        res.status(200).json(categories);

    } catch (e) {
        res.status(500).json({ message: "Internal server error", error: e })
    }
}