const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  recipes: [{
    type: Schema.Types.ObjectId,
    ref: 'Recipe'
  }]
});

// Pre-hook to handle cascading delete
userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  const userId = this._id;
  try {
    // Delete associated recipes
    const recipes = await mongoose.model('Recipe').find({ userId });
    for (const recipe of recipes) {
      await recipe.deleteOne(); // This will trigger the pre-hook in recipeSchema
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);
