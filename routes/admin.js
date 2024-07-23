const express = require('express');
const router = express.Router();
const {deleteRecipe,getUsers,deleteUser,getRecipes} = require('../controllers/admin');
const { authenticate } = require('../middleware/auth');

router.get('/users',authenticate,getUsers );

// Delete user by ID (example)
router.delete('/users/:userId', authenticate,deleteUser);

// Fetch all recipes (example)
router.get('/recipes',authenticate,getRecipes);

// Delete recipe by ID (example)
router.delete('/recipes/:recipeId',authenticate,deleteRecipe);

module.exports = router;
