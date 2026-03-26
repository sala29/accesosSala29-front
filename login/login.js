const API_BASE = "https://accesossala29-8vdj.onrender.com";
const mensajeLogin = document.getElementById('mensajeLogin');
const modalNoSocio = document.getElementById('modalNoSocio');

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
                abrirModal();
            } else {
                mostrarError(data.error || "Datos incorrectos");
            }
        }
    } catch (err) {
        mostrarError("Error de conexión");
    }
};

// ================= ERRORES Y VOLVER =================
document.getElementById('btnVolver').onclick = () => window.location.href = '../eventos/index.html';

function mostrarError(txt) {
    mensajeLogin.style.color = "#ff4d4d";
    mensajeLogin.innerText = txt;
}

// ================= ANIMACIÓN DEL MODAL (Igual que el tuyo) =================
function abrirModal() {
    modalNoSocio.classList.add('active');
    setTimeout(() => {
        modalNoSocio.querySelector('.modal-box').style.transform = 'translateY(0)';
    }, 10);
}

function cerrarModal() {
    modalNoSocio.querySelector('.modal-box').style.transform = 'translateY(100%)';
    setTimeout(() => {
        modalNoSocio.classList.remove('active');
    }, 300);
}

document.getElementById('btnCerrarModal').onclick = cerrarModal;
document.getElementById('btnCerrarModalX').onclick = cerrarModal;

document.getElementById('btnGoRegistro').onclick = () => {
    window.location.href = '../usuarios/usuarios.html';
};