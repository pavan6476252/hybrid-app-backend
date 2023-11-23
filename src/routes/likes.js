const multer = require('multer');
const express = require('express');
const router = express.Router();
const Post = require('../schema/postModel');
const Comment = require('../schema/commentModel');
const Like = require('../schema/likeModel');
const cloudinary = require('../config/cloudnary_config')
const isAuthenticated = require('../middleware/firebase_mw');
const { isValidObjectId } = require('mongoose');


router.get('/posts/:postId/likedusers', async (req, res) => {
    try {
        const { postId } = req.params;

        const likedUserDetails = await Like.find({ post: postId }).populate('user');

        const modifiedLikedUserData = likedUserDetails.map(like => like.user)

        res.json(modifiedLikedUserData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;