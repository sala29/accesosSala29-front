const API_BASE = "https://accesossala29-8vdj.onrender.com";
const mensajeLogin = document.getElementById('mensajeLogin');
const modal = document.getElementById('modalNoSocio');

document.getElementById('btnLoginPerfil').onclick = async () => {
    const dni = document.getElementById('loginDni').value.trim().toUpperCase();
    const email = document.getElementById('loginEmail').value.trim();
    const telefono = document.getElementById('loginTelefono').value.trim();
    const fecha = document.getElementById('loginFecha').value;

    if (!dni) return mostrarError("El DNI es obligatorio");

    const loginData = { dni };
    if (email) loginData.email = email;
    if (telefono) loginData.telefono = telefono;
    if (fecha) loginData.fecha_nacimiento = fecha;

    if (Object.keys(loginData).length < 2) {
        return mostrarError("Introduce DNI y al menos otro dato");
    }

    try {
        const res = await fetch(`${API_BASE}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.id);
            
            mensajeLogin.style.color = "#5dff8f";
            mensajeLogin.innerText = "¡Bienvenido/a!";
            
            setTimeout(() => {
                window.location.href = '../eventos/index.html';
            }, 1500);
        } else {
            if (data.error === "Usuario no encontrado") {
                modal.style.display = 'flex';
            } else {
                mostrarError(data.error || "Datos incorrectos");
            }
        }
    } catch (err) {
        mostrarError("Error de conexión");
    }
};

// Acciones del Modal y Volver
document.getElementById('btnCerrarModal').onclick = () => modal.style.display = 'none';
document.getElementById('btnGoRegistro').onclick = () => window.location.href = '../usuarios/usuarios.html';
document.getElementById('btnVolver').onclick = () => window.location.href = '../eventos/index.html';

function mostrarError(txt) {
    mensajeLogin.style.color = "#ff4d4d";
    mensajeLogin.innerText = txt;
}