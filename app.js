const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

// Express app setup
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const recipeRoutes = require('./routes/recipe');
const auth = require('./middleware/auth');

app.use('/user', userRoutes);
app.use('/recipes', recipeRoutes);
app.use('/adminPower', auth.adminAuth);
app.use('/adminPower', adminRoutes);

// Serve static files
app.use((req, res) => {
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})
.catch((err) => {
  console.error('Unable to connect to MongoDB:', err);
});
