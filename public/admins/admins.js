window.removeRecipe = async (recipeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/adminPower/recipes/${recipeId}`,{headers: {'Authorization': token}});
      alert('Recipe removed successfully');
      getRecipes(); // Refresh recipe list
    } catch (err) {
      console.error('Error removing recipe:', err);
    }
  };

  window.deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/adminPower/users/${userId}`,{headers: {'Authorization': token}});
      alert('User deleted successfully');
      getUsers(); // Refresh user list
    } catch (err) {
      console.error('Error deleting user:', err.response.data);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const navUserManagement = document.getElementById('navUserManagement');
    const navRecipeManagement = document.getElementById('navRecipeManagement');
    const navLogout = document.getElementById('navLogout');
    const userManagementSection = document.getElementById('userManagementSection');
    const recipeManagementSection = document.getElementById('recipeManagementSection');
    const userListDiv = document.getElementById('userList');
    const recipeListDiv = document.getElementById('recipeList');

    const showPage = (page) => {
      userManagementSection.style.display = 'none';
      recipeManagementSection.style.display = 'none';

      if (page === 'userManagement') {
        userManagementSection.style.display = 'block';
        getUsers();
      } else if (page === 'recipeManagement') {
        recipeManagementSection.style.display = 'block';
        getRecipes();
      }
    };

    navUserManagement.addEventListener('click', (e) => {
      e.preventDefault();
      showPage('userManagement');
    });

    navRecipeManagement.addEventListener('click', (e) => {
      e.preventDefault();
      showPage('recipeManagement');
    });

    navLogout.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });

    window.getUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/adminPower/users',{headers: {'Authorization': token}});
        const users = response.data;
        userListDiv.innerHTML = '';
        users.forEach(user => displayUser(user));
      } catch (err) {
        console.error('Error fetching users:', err.response.data);
        alert(err.response.data.message)
      }
    };

    window.getRecipes  = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/adminPower/recipes', { headers: { 'authorization': token } });
        const recipes = response.data;
        recipeListDiv.innerHTML = '';
        recipes.forEach(recipe => displayRecipe(recipe));
      } catch (err) {
        console.error('Error fetching recipes:', err.response.data);
        alert(err.response.data.message)
      }
    };

    const displayUser = (user) => {
      const userDiv = document.createElement('div');
      userDiv.classList.add('user');
      userDiv.innerHTML = `
        <p><strong>Name:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <button onclick="deleteUser('${user._id}')">Delete User</button>
      `;
      userListDiv.appendChild(userDiv);
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
        ${recipe.imageUrl ? `<img src="/${recipe.imageUrl}" alt="${recipe.title}" width="100">` : ''}
        <button onclick="removeRecipe('${recipe._id}')">Remove Recipe</button>
      `;
      recipeListDiv.appendChild(recipeDiv);
    };

    const logout = () => {
      localStorage.removeItem('token');
      window.location.href = '../login/login.html'; // Redirect to admin login page
    };

    // Initial page load
    showPage('userManagement');
  });