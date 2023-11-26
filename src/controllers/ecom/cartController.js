const Cart = require('../../schema/ecom/cartModel');

// Get all carts
exports.getAllCarts = (req, res) => {
    Cart.find()
        .then((carts) => {
            res.json(carts);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error' ,err:err}));
};

// Get a cart by ID
exports.getCartById = (req, res) => {
    const cartId = req.params.id;

    Cart.findById(cartId)
        .then((cart) => {
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }
            res.json(cart);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error' ,err:err}));
};

// Create a new cart
exports.createCart = (req, res) => {
    const { user, products } = req.body;

    const newCart = new Cart({
        user,
        products,
    });

    newCart
        .save()
        .then((cart) => res.json(cart))
        .catch((err) => res.status(500).json({ error: 'Internal Server Error' ,err:err}));
};

// Update a cart
exports.updateCart = (req, res) => {
    const cartId = req.params.id;
    const { user, products } = req.body;

    Cart.findByIdAndUpdate(
        cartId,
        { user, products },
        { new: true }
    )
        .then((updatedCart) => {
            if (!updatedCart) {
                return res.status(404).json({ error: 'Cart not found' });
            }
            res.json(updatedCart);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error' ,err:err}));
};

// Delete a cart
exports.deleteCart = (req, res) => {
    const cartId = req.params.id;

    Cart.findByIdAndDelete(cartId)
        .then((deletedCart) => {
            if (!deletedCart) {
                return res.status(404).json({ error: 'Cart not found' });
            }
            res.json(deletedCart);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error',err:err }));
};
