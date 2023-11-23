const admin = require('firebase-admin');
const express = require('express');
const router = express.Router();
const User = require('../schema/userSchema');

router.use(
  isAuthenticated = async (req, res, next) => {
    console.log("called is authenticated");

    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tokens = req.headers.authorization.split(' ');

    if (tokens.length !== 2) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = tokens[1];
    console.log("tkn :", token);

    try {
      const decodeValue = await admin.auth().verifyIdToken(token);
      console.log('Decoded value:', decodeValue);
      
      if (decodeValue) {
        const existingUser = await User.findOne({ uid: decodeValue.uid });

        if (!existingUser) {
          const newUser = new User({
            uid: decodeValue.uid,
            email: decodeValue.email,
            name: decodeValue.name,
            picture: decodeValue.picture,
          });

          await newUser.save();
        }

        req.user = decodeValue;
        return next();
      }

      return res.status(401).json({ message: 'Unauthorized' });
    } catch (error) {
      console.error(error);
      
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ message: 'Token expired' });
      }
      
      return res.status(500).json({ message: 'Internal Error' });
    }
  }
);

module.exports = router;
