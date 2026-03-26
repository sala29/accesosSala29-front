const API_BASE = "https://accesossala29-8vdj.onrender.com";
const mensajeLogin = document.getElementById('mensajeLogin');
const modalNoSocio = document.getElementById('modalNoSocio');
const btnLogin = document.getElementById('btnLoginPerfil'); // Capturamos el botón

btnLogin.onclick = async () => {
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

    // ==========================================
    // 1. ESTADO DE CARGA (Para que no parezca que tarda)
    // ==========================================
    mensajeLogin.innerText = ""; // Limpiamos errores previos
    const textoOriginal = btnLogin.innerText;
    btnLogin.innerText = "Comprobando...";
    btnLogin.disabled = true;
    btnLogin.style.opacity = "0.7";

    try {
        const res = await fetch(`${API_BASE}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        // ==========================================
        // 2. RESTAURAR BOTÓN AL TERMINAR LA CARGA
        // ==========================================
        btnLogin.innerText = textoOriginal;
        btnLogin.disabled = false;
        btnLogin.style.opacity = "1";

        if (res.status === 404) {
            abrirModal();
            return;
        }

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.id);
            
            mensajeLogin.style.color = "#5dff8f";
            mensajeLogin.innerText = "¡Bienvenido/a!";
            
            // Reducimos el tiempo de espera aquí también (de 1500 a 800ms) para que sea más ágil
            setTimeout(() => {
                window.location.href = '../eventos/index.html';
            }, 800);
        } else {
            mostrarError(data.error || "Datos incorrectos");
        }
    } catch (err) {
        // Restaurar botón si hay error de red
        btnLogin.innerText = textoOriginal;
        btnLogin.disabled = false;
        btnLogin.style.opacity = "1";
        mostrarError("Error de conexión al servidor");
    }
};

// ================= ERRORES Y VOLVER =================
document.getElementById('btnVolver').onclick = () => window.location.href = '../eventos/index.html';

function mostrarError(txt) {
    mensajeLogin.style.color = "#ff4d4d";
    mensajeLogin.innerText = txt;
}

// ================= ANIMACIÓN DEL MODAL =================
function abrirModal() {
    // Al forzar un pequeño micro-retraso (10ms), obligamos al navegador a 
    // dibujar primero el fondo y luego hacer la animación suave hacia arriba.
    modalNoSocio.style.display = 'flex';
    modalNoSocio.style.opacity = '0';
    
    setTimeout(() => {
        modalNoSocio.style.opacity = '1';
        modalNoSocio.classList.add('open');
    }, 10);
}

function cerrarModal() {
    modalNoSocio.classList.remove('open');
    setTimeout(() => {
        modalNoSocio.style.display = 'none';
    }, 300); // Espera a que termine la animación de bajada antes de ocultarlo
}

document.getElementById('btnCerrarModal').onclick = cerrarModal;
document.getElementById('btnCerrarModalX').onclick = cerrarModal;

document.getElementById('btnGoRegistro').onclick = () => {
    window.location.href = '../usuarios/usuarios.html';
};