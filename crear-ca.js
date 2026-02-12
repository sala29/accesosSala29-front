const form = document.getElementById('crearCaForm');
const mensaje = document.getElementById('mensaje');
const API_BASE = "https://accesossala29.onrender.com";


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    try {
        // 1️⃣ Registrar CA
        const resRegistro = await fetch(`${API_BASE}/registro-ca`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });

        const dataRegistro = await resRegistro.json();

        if (!resRegistro.ok) {
            mensaje.style.color = 'red';
            mensaje.innerText = dataRegistro.error || 'Error al crear usuario';
            return;
        }

        // 2️⃣ Login automático
        const resLogin = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });

        const dataLogin = await resLogin.json();

        if (!resLogin.ok) {
            mensaje.style.color = 'red';
            mensaje.innerText = 'Usuario creado, pero error al iniciar sesión';
            return;
        }

        // 3️⃣ Guardar token y redirigir
        localStorage.setItem('token', dataLogin.token);

        mensaje.style.color = 'green';
        mensaje.innerText = 'Usuario CA creado. Accediendo...';

        setTimeout(() => {
            window.location.href = 'ca/dashboard.html';
        }, 1000);

    } catch (err) {
        console.error(err);
        mensaje.style.color = 'red';
        mensaje.innerText = 'Error de conexión con el servidor';
    }
});
