const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, userController.getUserProfile);
router.post('/signup', userController.signupUser);
router.post('/login/:email/:password',userController.loginUser);

module.exports = router;