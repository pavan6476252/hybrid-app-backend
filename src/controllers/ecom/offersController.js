
const Offer = require('../../schema/ecom/offerModel');
const cloudinary = require('../../config/cloudnary_config')
exports.getAllOffers = (req, res) => {
    Offer.find()
        .then((offers) => {
            res.json(offers);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error',err:err }));
};

// Get an offer by ID
exports.getOfferById = (req, res) => {
    const offerId = req.params.id;

    Offer.findById(offerId)
        .then((offer) => {
            if (!offer) {
                return res.status(404).json({ error: 'Offer not found' });
            }
            res.json(offer);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error' ,err:err }));
};

// Create a new offer
exports.createOffer = async (req, res) => {
    const { name, description, discountPercentage, startDate, endDate } = req.body;

    try {
        let uploadedImage;
        if (req.file) {
            uploadedImage = await cloudinary.uploader.upload(req.file.path, {
                folder: 'posts',
            });
        }

        const newOffer = await Offer.create({
            name,
            description,
            image: uploadedImage.secure_url,
            discountPercentage,
            startDate,
            endDate,
        });

        return res.json(newOffer);

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal Server Error',err:e  });
    }
};

// Update an offer
exports.updateOffer = async (req, res) => {
    const offerId = req.params.id;
    const { name, description, discountPercentage, startDate, endDate } = req.body;

    try {
        let uploadedImage;
        if (req.file) {
            uploadedImage = await cloudinary.uploader.upload(req.file.path, {
                folder: 'posts',
            });
        }

        const updatedOffer = await Offer.findByIdAndUpdate(
            offerId,
            {
                name,
                description,
                image: uploadedImage ? uploadedImage.secure_url : undefined,
                discountPercentage,
                startDate,
                endDate,
            },
            { new: true }
        );

        if (!updatedOffer) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        return res.json(updatedOffer);

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal Server Error',err:e });
    }
};

// Delete an offer
exports.deleteOffer = (req, res) => {
    const offerId = req.params.id;

    Offer.findByIdAndDelete(offerId)
        .then((deletedOffer) => {
            if (!deletedOffer) {
                return res.status(404).json({ error: 'Offer not found' });
            }
            res.json(deletedOffer);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error' ,err:err }));
};