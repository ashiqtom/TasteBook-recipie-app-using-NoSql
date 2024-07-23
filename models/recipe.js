const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  ingredients: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
    required: true,
  },
  cookingTime: {
    type: Number,
    required: true,
  },
  servings: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String, // Store image URL or path
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Pre-hook to handle cascading delete
recipeSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  const recipeId = this._id;
  try {
    // Delete associated comments
    await mongoose.model('Comment').deleteMany({ recipeId });
    // Delete associated likes
    await mongoose.model('Like').deleteMany({ recipeId });
    // Remove recipe from user's recipes array
    await mongoose.model('User').updateMany({}, { $pull: { recipes: recipeId } });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);
