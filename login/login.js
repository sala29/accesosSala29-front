const API_BASE = "https://accesossala29-8vdj.onrender.com";
const mensajeLogin = document.getElementById('mensajeLogin');
const modalNoSocio = document.getElementById('modalNoSocio');
const btnLogin = document.getElementById('btnLoginPerfil');

// Salto automático entre campos de fecha
const inputsFecha = [document.getElementById('loginDia'), document.getElementById('loginMes'), document.getElementById('loginAnio')];
inputsFecha.forEach((input, index) => {
    input.addEventListener('input', () => {
        if (input.value.length === input.maxLength && index < inputsFecha.length - 1) {
            inputsFecha[index + 1].focus();
        }
    });
});

btnLogin.onclick = async () => {
    const dni = document.getElementById('loginDni').value.trim().toUpperCase();
    const email = document.getElementById('loginEmail').value.trim();
    const telefono = document.getElementById('loginTelefono').value.trim();
    
    // Captura y formato de fecha
    const d = document.getElementById('loginDia').value.trim();
    const m = document.getElementById('loginMes').value.trim();
    const a = document.getElementById('loginAnio').value.trim();
    
    let fechaFinal = "";
    if (d && m && a) {
        // Aseguramos formato YYYY-MM-DD
        fechaFinal = `${a}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    if (!dni) return mostrarError("El DNI es obligatorio");

    const loginData = { dni };
    if (email) loginData.email = email;
    if (telefono) loginData.telefono = telefono;
    if (fechaFinal) loginData.fecha_nacimiento = fechaFinal;

    if (Object.keys(loginData).length < 2) {
        return mostrarError("Introduce DNI y al menos otro dato");
    }

    // Estado de carga
    mensajeLogin.innerText = "";
    const textoOriginal = btnLogin.innerText;
    btnLogin.innerText = "Comprobando...";
    btnLogin.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        const data = await res.json();
        
        btnLogin.innerText = textoOriginal;
        btnLogin.disabled = false;

        if (res.status === 404) {
            abrirModal();
            return;
        }

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.id);
            
            mensajeLogin.style.color = "#5dff8f";
            mensajeLogin.innerText = "¡Bienvenido/a!";
            
            setTimeout(() => {
                window.location.href = '../eventos/index.html';
            }, 800);
        } else {
            mostrarError(data.error || "Datos incorrectos");
        }
    } catch (err) {
        btnLogin.innerText = textoOriginal;
        btnLogin.disabled = false;
        mostrarError("Error de conexión al servidor");
    }
};

function mostrarError(txt) {
    mensajeLogin.style.color = "#ff4d4d";
    mensajeLogin.innerText = txt;
}

function abrirModal() {
    modalNoSocio.style.display = 'flex';
    setTimeout(() => { modalNoSocio.classList.add('open'); }, 10);
}

function cerrarModal() {
    modalNoSocio.classList.remove('open');
    setTimeout(() => { modalNoSocio.style.display = 'none'; }, 300);
}

document.getElementById('btnCerrarModal').onclick = cerrarModal;
document.getElementById('btnCerrarModalX').onclick = cerrarModal;
document.getElementById('btnVolver').onclick = () => window.location.href = '../eventos/index.html';
document.getElementById('btnGoRegistro').onclick = () => window.location.href = '../usuarios/usuarios.html';