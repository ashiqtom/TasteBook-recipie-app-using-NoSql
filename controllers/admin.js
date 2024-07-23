const Recipe = require('../models/recipe');
const User=require('../models/user');

exports.deleteRecipe =async (req, res, next) => {
    const { recipeId } = req.params;
    try {
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }
      await recipe.deleteOne(); // This will trigger the pre-hook in recipeSchema
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

exports.getRecipes= async (req, res, next) => {
    try {
      const recipes = await Recipe.find();
      console.log(recipes)
      res.json(recipes);
    } catch (error) {
      next(error);
    }
  }

exports.deleteUser=async (req, res, next) => {
    const { userId } = req.params;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      await user.deleteOne(); // This will trigger the pre-hook in userSchema
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
exports.getUsers=async (req, res, next) => {
    try {
      const users = await User.find({ isAdmin: false });
      res.json(users);
    } catch (error) {
      next(error);
    }
  }