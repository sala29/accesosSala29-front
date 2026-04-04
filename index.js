const loginForm = document.getElementById('loginForm');
const mensajeDiv = document.getElementById('loginError'); // id correcto

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // evita que la página se recargue al enviar

    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('https://accesossala29.onrender.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario, password })
        });

        const data = await res.json();

        if(res.ok){
            // Guardamos el token en localStorage
            localStorage.setItem('token', data.token);
            mensajeDiv.style.color = 'green';
            mensajeDiv.innerText = 'Login correcto! Redirigiendo...';

            // Redirigir según rol
            setTimeout(() => {
                if(data.rol === 'admin'){
                    window.location.href = 'admin/dashboard.html';
                } else if(data.rol === 'ca'){
                    window.location.href = 'ca/dashboard.html';
                } else {
                    alert('Rol desconocido');
                }
            }, 1000);

        } else {
            mensajeDiv.style.color = 'red';
            mensajeDiv.innerText = data.error || 'Error al iniciar sesión';
        }
    } catch (err) {
        mensajeDiv.style.color = 'red';
        mensajeDiv.innerText = 'Error de conexión con el servidor';
        console.error(err);
    }
});
