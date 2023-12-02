const express = require('express');
const User = require('../schema/userSchema');
const isAuthenticated = require('../middleware/firebase_mw');
const Following = require('../schema/followingModel');
const router = express.Router();


router.get('/user/profile', async (req, res) => {
  // const uid = req.user.uid;
  const { uid } = req.body;

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/user/profile', isAuthenticated, async (req, res) => {
  const uid = req.user.uid;
  const { name, picture } = req.body;

  try {
    // Update the user's profile in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { $set: { name, picture, } },
      { new: true } // Return the updated user data
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/user/register', isAuthenticated, async (req, res) => {
  const { uid, email, name, picture } = req.user;

  try {
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = new User({
      uid: uid,
      email: email,
      name: name,
      picture: picture,
    });

    const user = await newUser.save();

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// follow other  user , 
router.post('/user/follow/:currentUserId/:otherUserId', isAuthenticated, async (req, res) => {
  try {
    const { currentUserId, otherUserId } = req.params;

    // Check if the users exist
    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(otherUserId);

    if (!currentUser || !otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const isAlreadyFollowing = await Following.findOne({
      user: currentUserId,
      following: otherUserId,
    });

    if (isAlreadyFollowing) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Create a new following record
    const newFollowing = new Following({ following: otherUserId, user: currentUserId });
    await newFollowing.save();

    // Update the current user's following list
    await User.findByIdAndUpdate(currentUserId, { $push: { following: newFollowing._id } });

    res.status(201).json({ message: 'Successfully followed the user' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Unfollow a user
router.delete('/user/unfollow/:currentUserId/:otherUserId', isAuthenticated, async (req, res) => {
  try {
    const { currentUserId, otherUserId } = req.params;

    // Check if the users exist
    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(otherUserId);

    if (!currentUser || !otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const followingRecord = await Following.findOneAndRemove({
      user: currentUserId,
      following: otherUserId,
    });

    if (!followingRecord) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    // Update the current user's following list
    await User.findByIdAndUpdate(currentUserId, { $pull: { following: followingRecord._id } });

    res.json({ message: 'Successfully unfollowed the user' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API operations related to user profiles and interactions
 */

/**
* @swagger
* /api/profile:
*   get:
*     summary: Get user profile
*     description: Get the profile of the authenticated user.
*     tags: [Users]
*     parameters:
*       - in: body
*         name: uid
*         required: true
*         description: ID of the user
*         schema:
*           type: object
*           properties:
*             uid:
*               type: string
*     responses:
*       200:
*         description: Successful response
*         content:
*           application/json:
*             example:
*               uid: "user_id"
*               email: "user@example.com"
*               name: "John Doe"
*               picture: "https://example.com/profile.jpg"
*               createdAt: "2022-01-01T00:00:00.000Z"
*       404:
*         description: User profile not found
*         content:
*           application/json:
*             example:
*               message: "User profile not found"
*       500:
*         description: Internal Server Error
*         content:
*           application/json:
*             example:
*               error: "Internal Server Error"
*/

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the profile of the authenticated user.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               picture:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               uid: "user_id"
 *               email: "user@example.com"
 *               name: "Updated Name"
 *               picture: "https://example.com/updated_profile.jpg"
 *               createdAt: "2022-01-01T00:00:00.000Z"
 *       404:
 *         description: User profile not found
 *         content:
 *           application/json:
 *             example:
 *               message: "User profile not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user using Firebase authentication.
 *     tags: [Users]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example:
 *               uid: "user_id"
 *               email: "user@example.com"
 *               name: "John Doe"
 *               picture: "https://example.com/profile.jpg"
 *               createdAt: "2022-01-01T00:00:00.000Z"
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             example:
 *               message: "User already exists"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */

/**
 * @swagger
 * /follow/{currentUserId}/{otherUserId}:
 *   post:
 *     summary: Follow a user
 *     description: Follow another user by providing their user IDs.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: currentUserId
 *         required: true
 *         description: ID of the current user
 *         schema:
 *           type: string
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         description: ID of the user to follow
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Successfully followed the user
 *         content:
 *           application/json:
 *             example:
 *               message: "Successfully followed the user"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: "User not found"
 *       400:
 *         description: Already following this user
 *         content:
 *           application/json:
 *             example:
 *               error: "Already following this user"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */

/**
 * @swagger
 * /unfollow/{currentUserId}/{otherUserId}:
 *   delete:
 *     summary: Unfollow a user
 *     description: Unfollow a user by providing their user IDs.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: currentUserId
 *         required: true
 *         description: ID of the current user
 *         schema:
 *           type: string
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         description: ID of the user to unfollow
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully unfollowed the user
 *         content:
 *           application/json:
 *             example:
 *               message: "Successfully unfollowed the user"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: "User not found"
 *       400:
 *         description: Not following this user
 *         content:
 *           application/json:
 *             example:
 *               error: "Not following this user"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */

