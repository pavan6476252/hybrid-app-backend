const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        quantityAvailable: {
            type: Number,
            required: true,
            min: 0,
        },
        imageUrls: [
            {
                type: String,
                trim: true,
            },
        ],
        category: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        }],
        offers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Offer',
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;