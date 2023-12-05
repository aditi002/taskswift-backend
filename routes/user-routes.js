const express = require('express');
const router = express.Router();
const multer = require('multer');
const UserController = require('../controllers/user-controller');
const { verifyUser } = require('../middlewares/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
    }
  });
  
  const upload = multer({ storage: storage });
  
// Register user
router.post('/register', UserController.register);

// Login user
router.post('/login', UserController.login);

// Get user profile
router.get('/profile', verifyUser, UserController.getUserProfile);

// Update user profile
router.put('/profile/:userId', verifyUser, UserController.updateUserProfile);

// Update user profile picture
router.put('/profile/picture', verifyUser, upload.single('profilePicture'),UserController.updateUserProfilePicture);

module.exports = router;
