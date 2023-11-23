const multer = require('multer');
const express = require('express');
const router = express.Router();
const Post = require('../schema/postModel');
const Comment = require('../schema/commentModel');
const Like = require('../schema/likeModel');
const cloudinary = require('../config/cloudnary_config');
const isAuthenticated = require('../middleware/firebase_mw');
const { isValidObjectId } = require('mongoose');

const upload = multer({ dest: 'uploads/' });

router.post('/posts', isAuthenticated, upload.array('images', 5), async (req, res) => {
  try {
    const { author, description, items, isBuySell } = req.body;
    const parsedItems = JSON.parse(items);

    // Upload images to Cloudinary
    const uploadedImages = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'posts',
        });
        return result.secure_url;
      })
    );

    // Create a new post with the Cloudinary URLs
    const newPost = new Post({
      author,
      description,
      images: uploadedImages,
      parsedItems,
      isBuySell,
    });

    const post = await newPost.save();
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/posts', async (req, res) => {
  try {
    const { userId } = req.body;

    const posts = await Post.find().populate('author likes').exec();
    const modifiedPosts = posts.map(post => {
      const likeCount = post.likes.length;
      const isLikedByCurrentUser = post.likes.some(like => like.user.toString() === userId);

      const { _id, author, createdAt, description, images, isBuySell, updatedAt, items } = post.toObject();

      return {
        _id,
        author,
        createdAt,
        description,
        images,
        isBuySell,
        updatedAt,
        items,
        likeCount,
        isLikedByCurrentUser,
      };
    });

    res.json(modifiedPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/posts/:postId', isAuthenticated, async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId).populate('author');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/posts/:postId', isAuthenticated, async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.uid !== req.user.uid) {
      return res.status(403).json({ message: 'Unauthorized: User does not own the post' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: req.body },
      { new: true }
    ).populate('author comments likes');

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/posts/:postId', isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    const author = req.user.uid;

    const postToDelete = await Post.findOne({
      _id: postId,
      author: author,
    });

    if (!postToDelete) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    // Remove the post
    const deletedPost = await postToDelete.remove();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/posts/:postId/like', isAuthenticated, async (req, res) => {
  const { postId } = req.params;
  try {
    const { userId } = req.body;

    const existingLike = await Like.findOne({ post: postId, user: userId });

    if (existingLike) {
      return res.status(400).json({ message: 'User has already liked the post' });
    }

    const newLike = new Like({
      post: postId,
      user: userId,
    });

    const like = await newLike.save();

    // Update the post with the new like
    await Post.findByIdAndUpdate(
      postId,
      { $push: { likes: like._id } },
      { new: true }
    );

    res.status(201).json(like);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/posts/:postId/unlike/:likeId', isAuthenticated, async (req, res) => {
  const { postId, likeId } = req.params;
  try {
    await Like.findByIdAndRemove(likeId);

    await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: likeId } },
      { new: true }
    );

    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;


// doc 
/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API operations related to posts
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post with file uploads
 *     description: Create a new post with images and other details. Requires file uploads.
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               author:
 *                 type: string
 *               description:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *               isBuySell:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             example:
 *               _id: "post_id"
 *               author: "author_id"
 *               description: "Post description"
 *               images: ["image_url1", "image_url2"]
 *               items: [{ name: "Item 1", description: "Item description", price: 10 }]
 *               isBuySell: true
 *               createdAt: "2023-11-22T00:00:00.000Z"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     description: Get a list of all posts with author, comments, and likes details.
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               - _id: "post_id1"
 *                 author: "author_id1"
 *                 description: "Post 1 description"
 *                 images: ["image_url1_1", "image_url1_2"]
 *                 items: [{ name: "Item 1_1", description: "Item description 1_1", price: 10 }]
 *                 isBuySell: true
 *                 createdAt: "2023-11-22T00:00:00.000Z"
 *               - _id: "post_id2"
 *                 author: "author_id2"
 *                 description: "Post 2 description"
 *                 images: ["image_url2_1", "image_url2_2"]
 *                 items: [{ name: "Item 2_1", description: "Item description 2_1", price: 15 }]
 *                 isBuySell: false
 *                 createdAt: "2023-11-22T00:00:00.000Z"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */

/**
 * @swagger
 * /posts/{postId}:
 *   get:
 *     summary: Get a specific post
 *     description: Get details of a specific post by providing the post ID.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: ID of the post to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               _id: "post_id"
 *               author: "author_id"
 *               description: "Post description"
 *               images: ["image_url1", "image_url2"]
 *               items: [{ name: "Item 1", description: "Item description", price: 10 }]
 *               isBuySell: true
 *               createdAt: "2023-11-22T00:00:00.000Z"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Post not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 
 * @swagger
 * /posts/{postId}:
 *   put:
 *     summary: Update a post
 *     description: Update details of a specific post by providing the post ID.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: ID of the post to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               author:
 *                 type: string
 *               description:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *               isBuySell:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               _id: "post_id"
 *               author: "author_id"
 *               description: "Updated post description"
 *               images: ["updated_image_url1", "updated_image_url2"]
 *               items: [{ name: "Updated Item 1", description: "Updated Item description 1", price: 15 }]
 *               isBuySell: false
 *               createdAt: "2023-11-22T00:00:00.000Z"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Post not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */

/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     description: Delete a specific post by providing the post ID.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: ID of the post to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               _id: "deleted_post_id"
 *               author: "deleted_author_id"
 *               description: "Deleted post description"
 *               images: ["deleted_image_url1", "deleted_image_url2"]
 *               items: [{ name: "Deleted Item 1", description: "Deleted Item description 1", price: 20 }]
 *               isBuySell: true
 *               createdAt: "2023-11-22T00:00:00.000Z"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Post not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */

/**
 * @swagger
 * /posts/{postId}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     description: Add a new comment to a specific post by providing the post ID.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: ID of the post to add a comment to
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               author:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             example:
 *               _id: "comment_id"
 *               author: "comment_author_id"
 *               text: "Comment text"
 *               createdAt: "2023-11-22T00:00:00.000Z"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */

/**
 * @swagger
 * /posts/{postId}/like:
 *   post:
 *     summary: Like a post
 *     description: Like a specific post by providing the post ID.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: ID of the post to like
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post liked successfully
 *         content:
 *           application/json:
 *             example:
 *               _id: "like_id"
 *               post: "liked_post_id"
 *               user: "liking_user_id"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */

/**
 * @swagger
 * /posts/{postId}/unlike/{likeId}:
 *   delete:
 *     summary: Unlike a post
 *     description: Unlike a specific post by providing the post ID and like ID.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: ID of the post to unlike
 *         schema:
 *           type: string
 *       - in: path
 *         name: likeId
 *         required: true
 *         description: ID of the like to remove
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post unliked successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Post unliked successfully"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */

/**
 * @swagger
 * /posts/{postId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     description: Delete a specific comment from a post by providing the post ID and comment ID.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: ID of the post containing the comment
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: ID of the comment to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Comment deleted successfully"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */
