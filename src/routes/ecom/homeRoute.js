const express = require('express')
const authCheck = require('../../middleware/checkAuth');
const Category = require('../../schema/ecom/categoryModel');
const Offer = require('../../schema/ecom/offerModel');
const Product = require('../../schema/ecom/productModel');

const { faker } = require('@faker-js/faker');
const User = require('../../schema/userSchema');

const router = express.Router()

router.get('/store', async (req, res) => {

    try {



        const allOffers = await Offer.find();
        const allCategories = await Category.find();
        const popularProducts = await Product.find().limit(10);


        // if (req.user) {
        //     // recomended logic 

        // }else{

        // }
        res.status(200).json({
            offers: allOffers,
            recomended: [],
            categories: allCategories,
            popular: popularProducts
        })

    } catch (e) {
        res.status(500).json({ message: "Internal server error", error: e })
    }
})


// Route to create 10 fake categories
router.get('/store/create-fake-categories', async (req, res) => {
    try {
        const fakeCategories = Array.from({ length: 10 }, () => ({
            name: faker.commerce.department(),
            description: faker.lorem.sentence(),
            image: faker.image.image(),
        }));
        const data = await Category.insertMany(fakeCategories);
        res.status(200).json({ message: 'Fake categories created successfully', data: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/store/create-fake-offers', async (req, res) => {
    try {
        const fakeOffers = Array.from({ length: 10 }, () => ({
            name: faker.commerce.productName(),
            description: faker.lorem.sentence(),
            image: faker.image.urlPlaceholder(),
            discountPercentage: faker.number.int({ min: 5, max: 50 }),
            startDate: faker.date.future(),
            endDate: faker.date.future({}),
        }));

        const data = await Offer.insertMany(fakeOffers);

        res.status(200).json({ message: 'Fake offers created successfully', data: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/store/update-fake-products', async (req, res) => {
    try {
        await Product.deleteMany();

        const users = await User.find();
        const categories = await Category.find();
        const offers = await Offer.find();

        const fakeProducts = Array.from({ length: 10 }, () => ({
            author: users[faker.number.int({ max: users.length-1, min: 0 })]._id,
            name: faker.commerce.productName(),
            description: faker.lorem.sentence(),
            price: faker.number.int({ min: 10, max: 100 }),
            quantityAvailable: faker.number.int({ min: 1, max: 100 }),
            imageUrls: [faker.image.urlPicsumPhotos()],
            category: categories[faker.number.int({ max: categories.length-1, min: 0 })]._id,
            offers:offers[faker.number.int({ max: offers.length-1, min: 0 })]._id,
        }));

        const data = await Product.insertMany(fakeProducts);

        res.status(200).json({ message: 'Fake products created successfully', data:data});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
module.exports = router;


module.exports = router;