const Recipe = require('../models/recipe');
const Comment = require('../models/comment');
const Like = require('../models/like');
const User = require('../models/user');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const multer = require('multer');

exports.deleteRecipe = async (req, res) => {
  const { recipeId } = req.params;
  console.log(req.params);

  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user is authorized to delete this recipe
    if (recipe.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }

    // Delete the recipe (this will trigger the pre-hook for cascading delete)
    await recipe.deleteOne();

    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Middleware for handling file uploads (Multer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// S3 upload function
const uploadToS3 = async (data, filename) => {
  try {
    const BUCKET_NAME = process.env.s3bucketName;
    const IAM_USER_KEY = process.env.s3Accesskey;
    const IAM_USER_SECRET = process.env.s3Secretaccesskey;

    const s3bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET
    });

    const params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: data,
      ACL: 'public-read'
    };

    const response = await s3bucket.upload(params).promise();
    return response;
  } catch (error) {
    console.log('Upload error', error);
    throw error;
  }
};

// Search recipes
exports.searchRecipes = async (req, res) => {
  const searchTerm = req.query.term;
  try {
    const results = await Recipe.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { ingredients: { $regex: searchTerm, $options: 'i' } },
        { instructions: { $regex: searchTerm, $options: 'i' } }
      ]
    });
    res.json(results);
  } catch (err) {
    console.error('Error searching recipes:', err);
    res.status(500).json({ error: 'Error searching recipes' });
  }
};

// Get comments for a recipe
exports.getComments = async (req, res) => {
  const recipeId = req.params.id;
  try {
    const comments = await Comment.find({ recipeId }).populate('userId', 'username');
    
    // Format the response to include only username and comment text
    const formattedComments = comments.map(comment => ({
      username: comment.userId.username,
      text: comment.text
    }));
    
    res.status(200).json(formattedComments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Like a recipe
exports.likeRecipe = async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user._id;
  try {
    const existingLike = await Like.findOne({ recipeId, userId });
    if (existingLike) {
      return res.status(400).json({ message: 'Recipe already liked' });
    }
    const like = new Like({ recipeId, userId });
    await like.save();
    res.status(201).json({ message: 'Recipe liked!', like });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// Get liked recipes for a user
exports.getLikedRecipes = async (req, res) => { 
  const userId = req.user._id;
  try {
    const likes = await Like.find({ userId }).populate('recipeId');
    const likedRecipes = likes.map(like => like.recipeId);
    res.status(200).json(likedRecipes);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// Add a comment to a recipe
exports.addComment = async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user._id;
  const { text } = req.body;
  try {
    const comment = new Comment({ text, recipeId, userId });
    await comment.save();
    res.status(201).json({ message: 'Comment added!', comment });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// Create a new recipe
exports.createRecipe = async (req, res) => {
  const { title, ingredients, instructions, cookingTime, servings } = req.body;
  const file = req.file;
  let imageUrl = '';

  if (file) {
    const uploadedFile = await uploadToS3(file.buffer, file.originalname);
    imageUrl = uploadedFile.Location;
  }

  try {
    const newRecipe = new Recipe({
      title,
      ingredients,
      instructions,
      cookingTime,
      servings,
      imageUrl,
      userId: req.user._id
    });
    await newRecipe.save();
    // Update the user to include the new recipe
    await User.findByIdAndUpdate(req.user._id, {
      $push: { recipes: newRecipe._id }
    });
    res.status(201).json({ message: 'Recipe created successfully' });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all recipes
exports.getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error getting recipes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a recipe for editing
exports.getEditRecipe = async (req, res) => {
  const { recipeId } = req.params;
  try {
    const recipe = await Recipe.findById(recipeId);
    res.status(200).json(recipe);
  } catch (error) {
    console.error('Error editing recipe:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Edit a recipe
exports.editRecipe =async (req, res) => {
  const { recipeId } = req.params;
  const { title, ingredients, instructions, cookingTime, servings } = req.body;
  const file = req.file;
  let imageUrl = '';

  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user is authorized to edit this recipe
    if (recipe.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this recipe' });
    }

    // Update recipe details
    recipe.title = title;
    recipe.ingredients = ingredients;
    recipe.instructions = instructions;
    recipe.cookingTime = cookingTime;
    recipe.servings = servings;
    if (file) {
      const uploadedFile = await uploadToS3(file.buffer, file.originalname);
      imageUrl = uploadedFile.Location;
      recipe.imageUrl = imageUrl;
    }

    await recipe.save();
    res.status(200).json({ message: 'Recipe updated successfully' });
  } catch (error) {
    console.error('Error editing recipe:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
