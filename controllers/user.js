const User = require('../models/user');
const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');
const Recipe = require('../models/recipe');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('id username email')
      .populate('recipes');  

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user, recipes: user.recipes });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('recipes');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const favorites = user.recipes;
    res.status(200).json(favorites);
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const stringValidate = (string) => {
  return string !== undefined && string.length > 0;
}

exports.signupUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!stringValidate(username) || !stringValidate(email) || !stringValidate(password)) {
      return res.status(400).json({ error: "Bad request, something is missing" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const saltrounds = Number(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltrounds);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Successfully created new user' });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.params;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ error: 'Invalid email' });
    }

    const passwordCompared = await bcrypt.compare(password, existingUser.password);

    if (passwordCompared) {
      const token = generateAccessToken(existingUser._id, existingUser.username);
      return res.status(200).json({ success: true, message: "User logged in successfully", userName: existingUser.username, token });
    } else {
      return res.status(400).json({ success: false, error: 'Password is incorrect' });
    }

  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ error: 'Internal server error', success: false });
  }
};

const generateAccessToken = (id, name) => {
  return jwt.sign({ userId: id, name: name }, process.env.JWT_SECRET_KEY);
};
