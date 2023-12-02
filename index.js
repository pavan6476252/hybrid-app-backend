require('./src/config/firebase_config')
require('./src/config/mongodb_config')
require('./src/config/cloudnary_config')

const express = require('express')
const multer = require('multer');
const path = require('path');

const bodyParser = require('body-parser');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger_conf')

const app = express()
const cors = require('cors')

app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));




const port = process.env.PORT || 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())


//import routes
const userRoutes = require('./src/routes/users')
const postRoutes = require('./src/routes/posts')
const likesRoutes = require('./src/routes/likes')



const storeHome = require('./src/routes/ecom/homeRoute')
const productRoute = require('./src/routes/ecom/productRoute')
const categoryRoute = require('./src/routes/ecom/categoryRoute')
const cartRoute = require('./src/routes/ecom/cartRoute')
const offersRoute = require('./src/routes/ecom/offersRoute')
const reviewsRoute = require('./src/routes/ecom/reviewsRoute')

// use routes

app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', likesRoutes);


app.use('/api', storeHome);
app.use('/api', productRoute);
app.use('/api', categoryRoute);
app.use('/api', cartRoute);
app.use('/api', offersRoute);
app.use('/api', reviewsRoute);







const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const extArray = file.mimetype.split('/');
        const extension = extArray[extArray.length - 1];
        cb(null, `${file.fieldname}-${Date.now()}.${extension}`);
    },
});
const upload = multer({ storage: storage });

// Define the storage for uploaded files
app.post('/upload', upload.single('image'), async (req, res) => {
    const uploadedFile = req.file;

    if (!uploadedFile) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const { filename, mimetype, size } = uploadedFile;

    const relativePath = `/static/${filename}`;

    console.log({ filename, mimetype, size, location: relativePath })

    return res.status(201).json({ filename, mimetype, size, location: relativePath });
});

app.use('/static', express.static(path.resolve('./uploads')));



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})