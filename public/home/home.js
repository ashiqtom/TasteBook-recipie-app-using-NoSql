document.addEventListener('DOMContentLoaded', () => {
  const navRecipes = document.getElementById('navRecipes');
  const navCreateRecipe = document.getElementById('navCreateRecipe');
  const navProfile = document.getElementById('navProfile');
  const navFavorites = document.getElementById('navFavorites');
  const recipesSection = document.getElementById('recipesSection');
  const createRecipeSection = document.getElementById('createRecipeSection');
  const profileSection = document.getElementById('profileSection');
  const favoritesSection = document.getElementById('favoritesSection');
  const createRecipeForm = document.getElementById('createRecipeForm');
  const recipesDiv = document.getElementById('recipes');
  const userDetailsDiv = document.getElementById('userDetails');
  const userRecipesDiv = document.getElementById('userRecipes');
  const favoritesDiv = document.getElementById('favorites');

  const showPage = (page) => {
    recipesSection.style.display = 'none';
    createRecipeSection.style.display = 'none';
    profileSection.style.display = 'none';
    favoritesSection.style.display = 'none';

    if (page === 'recipes') {
      recipesSection.style.display = 'block';
      getRecipes();
    } else if (page === 'createRecipe') {
      createRecipeSection.style.display = 'block';
    } else if (page === 'profile') {
      profileSection.style.display = 'block';
      getUserProfile();
    } else if (page === 'favorites') {
      favoritesSection.style.display = 'block';
      getFavorites();
    }
  };

  navRecipes.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('recipes');
  });

  navCreateRecipe.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('createRecipe');
  });

  navProfile.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('profile');
  });

  navFavorites.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('favorites');
  });

  // Function to fetch recipes and display them
  const getRecipes = async () => {
    try {
      const response = await axios.get('/recipes');
      const recipes = response.data;
      recipesDiv.innerHTML = '';
      recipes.forEach(recipe => displayRecipe(recipe));
    } catch (err) {
      console.error('Error getting recipes:', err.response.data);
    }
  };

  const displayRecipe = (recipe) => {
    const recipeDiv = document.createElement('div');
    recipeDiv.classList.add('recipe');
    recipeDiv.innerHTML = `
      <h3>${recipe.title}</h3>
      <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
      <p><strong>Instructions:</strong> ${recipe.instructions}</p>
      <p><strong>Cooking Time:</strong> ${recipe.cookingTime} minutes</p>
      <p><strong>Servings:</strong> ${recipe.servings}</p>
      ${recipe.imageUrl ? `<img src="${recipe.imageUrl}" alt="${recipe.title}" width="100">` : ''}
      <button onclick="likeRecipe('${recipe._id}')">Like</button>
      <button onclick="showComments('${recipe._id}')">Comments</button>
      <div id="comments_${recipe._id}" style="display:none;">
        <textarea id="commentText_${recipe._id}" placeholder="Add a comment"></textarea>
        <button onclick="addComment('${recipe._id}')">Add Comment</button>
        <div id="commentsList_${recipe._id}"></div>
      </div>
    `;
    recipesDiv.appendChild(recipeDiv);

    // Fetch and display comments for each recipe
    fetchComments(recipe._id);
  };
  
  window.likeRecipe = async (recipeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/recipes/like/${recipeId}`, {}, {
        headers: { 'Authorization': token }
      });
      alert('Recipe liked successfully');
    } catch (err) {
      console.error('Error liking recipe:', err.response.data);
      alert('Error liking recipe');
    }
  };

  window.showComments = (recipeId) => {
    const commentsDiv = document.getElementById(`comments_${recipeId}`);
    commentsDiv.style.display = commentsDiv.style.display === 'none' ? 'block' : 'none';
  };

  window.addComment = async (recipeId) => {
    const commentText = document.getElementById(`commentText_${recipeId}`).value;
    if (!commentText) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/recipes/comments/${recipeId}`, { text: commentText }, {
        headers: { 'Authorization': token }
      });
      alert('Comment added successfully');
      document.getElementById(`commentText_${recipeId}`).value = '';
      fetchComments(recipeId);
    } catch (err) {
      console.error('Error adding comment:', err.response.data);
      alert('Error adding comment');
    }
  };


   // Search form and functionality
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm === '') {
      alert('Please enter a search term');
      return;
    }

    try {
      const response = await axios.get(`/recipes/search?term=${encodeURIComponent(searchTerm)}`);
      const searchResults = response.data;
      recipesDiv.innerHTML = '';
      searchResults.forEach(recipe => displayRecipe(recipe));
    } catch (err) {
      console.error('Error searching recipes:', err.response ? err.response.data : err);
      alert('Error searching recipes');
    }
  });
  
  createRecipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('recipeTitle').value;
    const ingredients = document.getElementById('recipeIngredients').value;
    const instructions = document.getElementById('recipeInstructions').value;
    const cookingTime = document.getElementById('cookingTime').value;
    const servings = document.getElementById('servings').value;
    const image = document.getElementById('recipeImage').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('ingredients', ingredients);
    formData.append('instructions', instructions);
    formData.append('cookingTime', cookingTime);
    formData.append('servings', servings);
    if (image) {
      formData.append('image', image);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/recipes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token
        }
      });
      alert('Recipe created successfully');
      showPage('recipes');
    } catch (err) {
      console.error('Error creating recipe:', err.response ? err.response.data : err);
      alert('Error creating recipe');
    }
  });
  
  

  // Function to fetch comments for a specific recipe
  const fetchComments = async (recipeId) => {
    try {
      const response = await axios.get(`/recipes/comments/${recipeId}`);
      const comments = response.data;
      const commentsListDiv = document.getElementById(`commentsList_${recipeId}`);
      commentsListDiv.innerHTML = '';
      comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');
        commentDiv.innerHTML = `
          <p><strong>${comment.username}:</strong> ${comment.text}</p>
        `;
        commentsListDiv.appendChild(commentDiv);
      });
    } catch (err) {
      console.error(`Error fetching comments for recipe ${recipeId}:`, err);
    }
  };

  const getFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/recipes/liked', {
        headers: {
          'Authorization': token
        }
      });
      const favorites = response.data;
      favoritesDiv.innerHTML = '';
      favorites.forEach(recipe => {
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');
        recipeDiv.innerHTML = `
          <h3>${recipe.title}</h3>
          <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
          <p><strong>Instructions:</strong> ${recipe.instructions}</p>
          <p><strong>Cooking Time:</strong> ${recipe.cookingTime} minutes</p>
          <p><strong>Servings:</strong> ${recipe.servings}</p>
          ${recipe.imageUrl ? `<img src="/${recipe.imageUrl}" alt="${recipe.title}" width="100">` : ''}
        `;
        favoritesDiv.appendChild(recipeDiv);
      });
    } catch (err) {
      console.error('Error getting favorites:', err);
    }
  };
  
  const getUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const response = await axios.get('/user/profile', {
        headers: { 'Authorization': `${token}` }
      });
      
      const user = response.data.user;
      const userRecipes = response.data.recipes;

      userDetailsDiv.innerHTML = `
        <p><strong>Name:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
      `;

      userRecipesDiv.innerHTML = '';
      userRecipes.forEach(recipe => {
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');
        recipeDiv.innerHTML = `
          <h3>${recipe.title}</h3>
          <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
          <p><strong>Instructions:</strong> ${recipe.instructions}</p>
          <p><strong>Cooking Time:</strong> ${recipe.cookingTime} minutes</p>
          <p><strong>Servings:</strong> ${recipe.servings}</p>
          ${recipe.imageUrl ? `<img src="/${recipe.imageUrl}" alt="${recipe.title}" width="100">` : ''}
          <button onclick="editRecipeInline('${recipe._id}')">Edit</button>
          <button onclick="deleteRecipe('${recipe._id}')">Delete</button>
        `;
        userRecipesDiv.appendChild(recipeDiv);
      });

    } catch (err) {
      console.error('Error getting profile:', err.message);
    }
  };

  window.editRecipeInline = async (recipeId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const response = await axios.get(`/recipes/${recipeId}`, {
        headers: { 'Authorization': `${token}` }
      });
      const recipe = response.data;

      let recipeDiv = document.getElementById(`recipe_${recipeId}`);
      if (!recipeDiv) {
        recipeDiv = document.createElement('div');
        recipeDiv.id = `recipe_${recipeId}`;
        recipeDiv.classList.add('recipe');
        userRecipesDiv.appendChild(recipeDiv);
      }
      recipeDiv.innerHTML = `
        <form id="editForm_${recipeId}" onsubmit="window.submitEdit('${recipeId}'); return false;">
          <input type="text" id="editTitle_${recipeId}" value="${recipe.title}" required>
          <textarea id="editIngredients_${recipeId}" required>${recipe.ingredients}</textarea>
          <textarea id="editInstructions_${recipeId}" required>${recipe.instructions}</textarea>
          <input type="number" id="editCookingTime_${recipeId}" value="${recipe.cookingTime}" required>
          <input type="number" id="editServings_${recipeId}" value="${recipe.servings}" required>
          <button type="submit">Save</button>
        </form>
      `;
    } catch (err) {
      console.error(`Error fetching recipe ${recipeId} for editing:`, err.message);
      alert('Error fetching recipe for editing');
    }
  };

  window.submitEdit = async (recipeId) => {
    const editTitle = document.getElementById(`editTitle_${recipeId}`).value;
    const editIngredients = document.getElementById(`editIngredients_${recipeId}`).value;
    const editInstructions = document.getElementById(`editInstructions_${recipeId}`).value;
    const editCookingTime = document.getElementById(`editCookingTime_${recipeId}`).value;
    const editServings = document.getElementById(`editServings_${recipeId}`).value;
    // const editImage = document.getElementById(`editImage_${recipeId}`).files[0];

    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('ingredients', editIngredients);
    formData.append('instructions', editInstructions);
    formData.append('cookingTime', editCookingTime);
    formData.append('servings', editServings);
    // if (editImage==null) {
    //   formData.append('file', editImage);
    // }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const response = await axios.put(`/recipes/${recipeId}`, formData, {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Recipe updated successfully');
      getUserProfile(); // Refresh profile to reflect updated recipe
    } catch (err) {
      console.error('Error updating recipe:', err.response ? err.response.data : err.message);
      alert('Error updating recipe');
    }
  };

  window.deleteRecipe = async (recipeId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const response = await axios.delete(`/recipes/${recipeId}`, {
        headers: { 'Authorization': `${token}` }
      });
      alert('Recipe deleted successfully');
      getUserProfile(); // Refresh profile to reflect deleted recipe
    } catch (err) {
      console.error('Error deleting recipe:', err.response ? err.response.data : err.message);
      alert('Error deleting recipe');
    }
  };      
});