const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post(`/user/login/${email}/${password}`);
        localStorage.setItem('token',response.data.token)
        alert(response.data.message)
        window.location.href = "../home/home.html";
    } catch (error) {
        console.error('Error logging in:', error);
    }
});