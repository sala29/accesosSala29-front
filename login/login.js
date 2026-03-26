const API_BASE = "https://accesossala29-8vdj.onrender.com";
const mensajeLogin = document.getElementById('mensajeLogin');
const modal = document.getElementById('modalNoSocio');

document.getElementById('btnLoginPerfil').onclick = async () => {
    const dni = document.getElementById('loginDni').value.trim().toUpperCase();
    const email = document.getElementById('loginEmail').value.trim();
    const telefono = document.getElementById('loginTelefono').value.trim();
    const fecha = document.getElementById('loginFecha').value;

    if (!dni) return mostrarError("El DNI es obligatorio");

    // Preparamos el cuerpo siguiendo tu backend: dni, email, telefono, fecha_nacimiento
    const loginData = { dni };
    if (email) loginData.email = email;
    if (telefono) loginData.telefono = telefono;
    if (fecha) loginData.fecha_nacimiento = fecha;

    // Validación: DNI + al menos uno más
    if (Object.keys(loginData).length < 2) {
        return mostrarError("Introduce DNI y al menos un dato adicional");
    }

    try {
        const res = await fetch(`${API_BASE}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        const data = await res.json();

        if (res.ok) {
            // Guardamos sesión
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.id); // Usamos data.id según tu backend
            
            mensajeLogin.style.color = "#5dff8f";
            mensajeLogin.innerText = "¡Acceso correcto! Entrando...";
            
            setTimeout(() => {
                window.location.href = '../eventos/index.html';
            }, 1500);
        } else {
            // DETECCIÓN SEGÚN TU BACKEND: "Usuario no encontrado"
            if (data.error === "Usuario no encontrado") {
                abrirModal();
            } else {
                mostrarError(data.error || "Datos incorrectos");
            }
        }
    } catch (err) {
        mostrarError("Error al conectar con el servidor");
    }
};

// --- FUNCIONES DEL MODAL ---
function abrirModal() {
    modal.style.display = 'flex';
}

document.getElementById('btnCerrarModal').onclick = () => {
    modal.style.display = 'none';
};

document.getElementById('btnGoRegistro').onclick = () => {
    // Redirige a la página principal de usuarios (donde está el registro)
    window.location.href = '../usuarios/usuarios.html';
};

function mostrarError(txt) {
    mensajeLogin.style.color = "#ff4d4d";
    mensajeLogin.innerText = txt;
}

document.getElementById('btnVolver').onclick = () => {
    window.location.href = '../eventos/index.html';
};