const API_BASE = "https://accesossala29-8vdj.onrender.com";
const mensajeLogin = document.getElementById('mensajeLogin');
const modalNoSocio = document.getElementById('modalNoSocio');
const btnLogin = document.getElementById('btnLoginPerfil'); // Capturamos el botón

// ==========================================
// NUEVO: SALTO AUTOMÁTICO EN LA FECHA
// ==========================================
const loginDia = document.getElementById('loginDia');
const loginMes = document.getElementById('loginMes');
const loginAnio = document.getElementById('loginAnio');

loginDia.addEventListener('input', function() {
    if (this.value.length === 2) loginMes.focus();
});
loginMes.addEventListener('input', function() {
    if (this.value.length === 2) loginAnio.focus();
});

// ==========================================
// EVENTO PRINCIPAL DE LOGIN
// ==========================================
btnLogin.onclick = async () => {
    const dni = document.getElementById('loginDni').value.trim().toUpperCase();
    const email = document.getElementById('loginEmail').value.trim();
    const telefono = document.getElementById('loginTelefono').value.trim();
    
    // Capturamos los campos de fecha
    const dia = loginDia.value.trim();
    const mes = loginMes.value.trim();
    const anio = loginAnio.value.trim();
    let fechaFinal = "";

    // Validamos y construimos la fecha si el usuario ha escrito algo
    if (dia || mes || anio) {
        if (!dia || !mes || !anio || dia.length < 1 || mes.length < 1 || anio.length !== 4) {
            return mostrarError("La fecha de nacimiento está incompleta.");
        }
        // Formato para la BD: AAAA-MM-DD
        const padDia = dia.padStart(2, '0');
        const padMes = mes.padStart(2, '0');
        fechaFinal = `${anio}-${padMes}-${padDia}`;
    }

    if (!dni) return mostrarError("El DNI es obligatorio");

    // Preparamos el payload
    const loginData = { dni };
    if (email) loginData.email = email;
    if (telefono) loginData.telefono = telefono;
    if (fechaFinal) loginData.fecha_nacimiento = fechaFinal; // Mandamos la fecha formateada

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
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        const data = await res.json();

        if (res.ok) {
            // Guardamos sesión
            localStorage.setItem('token', data.token);
            if (data.user) {
                localStorage.setItem('userId', data.user.id);
            }
            // Redirigimos al perfil (ajusta la ruta si es necesario)
            window.location.href = '../usuarios/usuarios.html'; 
        } else {
            // Restaurar botón si hay error
            btnLogin.innerText = textoOriginal;
            btnLogin.disabled = false;
            btnLogin.style.opacity = "1";

            // Mostrar modal si el usuario no existe, o error genérico
            if (res.status === 404 || (data.error && data.error.toLowerCase().includes('no encontrad'))) {
                abrirModal();
            } else {
                mostrarError(data.error || "Datos incorrectos");
            }
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