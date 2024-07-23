const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const data={username,email,password}

    try {
        const response = await axios.post(`/user/signup`, data);
        alert(response.data.message)
        window.location.href = "../login/login.html";

    } catch (error) {
        console.error('Error registering:', error);
    }
});