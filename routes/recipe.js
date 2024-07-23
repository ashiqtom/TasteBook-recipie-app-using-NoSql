const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const {searchRecipes,createRecipe,getRecipes,editRecipe,deleteRecipe,getEditRecipe,likeRecipe,getLikedRecipes,addComment,getComments} = require('../controllers/recipe');
const { authenticate } = require('../middleware/auth');


router.get('/search',searchRecipes)
router.post('/comments/:id', authenticate, addComment);
router.get('/comments/:id', getComments);

router.post('/like/:id', authenticate,likeRecipe);
router.get('/liked', authenticate, getLikedRecipes);
router.post('/', authenticate, upload.single('image'), createRecipe);
router.get('/', getRecipes);
router.get('/:recipeId', authenticate,getEditRecipe);
router.put('/:recipeId', authenticate, upload.single('image'),editRecipe);
router.delete('/:recipeId', authenticate,deleteRecipe);

module.exports = router;
