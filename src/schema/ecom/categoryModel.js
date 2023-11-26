const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        image: String

    },
    {
        timestamps: true,
    }
);

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;