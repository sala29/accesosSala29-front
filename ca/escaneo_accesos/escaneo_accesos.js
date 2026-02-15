const token = localStorage.getItem('token');
const API_BASE = "https://accesossala29.onrender.com";

let html5QrCode = null;
let escaneando = false;


if (!token) {
    alert('No estás logueado');
    window.location.href = '../../index.html';
}

/* =========================
   EVENT ID
========================= */
const params = new URLSearchParams(window.location.search);
const eventId = params.get('eventId');
const nombreEvento = params.get('nombre');


if (!eventId) {
    alert('Evento no especificado');
    window.location.href = '../dashboard.html';
}

if (nombreEvento) {
    document.getElementById('nombreEvento').innerText = nombreEvento;
}


/* =========================
   BOTTOM SHEET
========================= */
const overlay = document.getElementById('sheetOverlay');
const sheet = document.getElementById('userSheet');

function abrirSheet() {
    overlay.style.display = 'block';
    sheet.classList.add('open');
}

function cerrarSheet() {
    sheet.classList.remove('open');
    setTimeout(() => {
        overlay.style.display = 'none';
        usuarioActual = null;

        document.getElementById('dniInput').value = '';
        document.getElementById('idInput').value = '';
    }, 300);
}

overlay.addEventListener('click', cerrarSheet);

/* Drag para cerrar (móvil) */
let startY = 0;
let currentY = 0;

sheet.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
});

sheet.addEventListener('touchmove', e => {
    currentY = e.touches[0].clientY - startY;
    if (currentY > 0) {
        sheet.style.transform = `translateY(${currentY}px)`;
    }
});

sheet.addEventListener('touchend', () => {
    if (currentY > 120) {
        cerrarSheet();
    } else {
        sheet.style.transform = '';
    }
    currentY = 0;
});

/* =========================
   SALIR
========================= */
document.getElementById('salirBtn').addEventListener('click', () => {
    window.location.href = '../dashboard.html';
});

/* =========================
   BUSCAR POR DNI
========================= */
let usuarioActual = null;

document.getElementById('buscarDniBtn').addEventListener('click', async () => {
    const input = document.getElementById('dniInput');
    const dni = input.value.trim().toUpperCase();
    if (!dni) return alert('Introduce un DNI');

    input.value = ''; // 👈 LIMPIAR CAMPO

    try {
        const res = await fetch(`${API_BASE}/usuario/dni/${dni}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const u = await res.json();
        if (!res.ok) {
            alert(u.error || 'Usuario no encontrado');
            return;
        }

        usuarioActual = u;
        renderUsuario(u);
        abrirSheet();

    } catch (err) {
        console.error(err);
        alert('Error de conexión');
    }
});


/* =========================
   BUSCAR POR ID
========================= */
document.getElementById('idInput').addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, ''); // elimina todo menos dígitos
});

document.getElementById('buscarIdBtn').addEventListener('click', async () => {
    const input = document.getElementById('idInput');
    const id = input.value.trim();
    if (!/^\d+$/.test(id)) return alert('Introduce un ID válido');


    input.value = ''; // 👈 LIMPIAR CAMPO

    try {
        const res = await fetch(`${API_BASE}/usuario/${id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const u = await res.json();
        if (!res.ok) {
            alert(u.error || 'Usuario no encontrado');
            return;
        }

        usuarioActual = u;
        renderUsuario(u);
        abrirSheet();

    } catch (err) {
        console.error(err);
        alert('Error de conexión');
    }
});

document.getElementById('dniInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        document.getElementById('buscarDniBtn').click();
    }
});

document.getElementById('idInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        document.getElementById('buscarIdBtn').click();
    }
});





/* =========================
   ESCANEAR QR
========================= */

document.getElementById('scanBtn').addEventListener('click', abrirEscanerQR);

function abrirEscanerQR() {
    const qrScreen = document.getElementById('qrScreen');
    qrScreen.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    html5QrCode = new Html5Qrcode("qr-reader");

    Html5Qrcode.getCameras().then(cameras => {
        if (!cameras.length) {
            alert('No se encontró cámara');
            return;
        }

        html5QrCode.start(
            { facingMode: "environment" }, // cámara trasera
            { fps: 10, qrbox: { width: 300, height: 300 } },       // tamaño y velocidad
            onQrSuccess,
            onQrError
        );

        escaneando = true;
    }).catch(err => {
        console.error(err);
        alert('Permiso de cámara denegado');
    });
}

async function onQrSuccess(text) {
    if (!escaneando) return;
    escaneando = false;

    // 👇 FEEDBACK VISUAL inmediato
    const reader = document.getElementById('qr-reader');
    reader.style.opacity = '0.4';
    const h2 = document.querySelector('.qr-header h2');
    h2.innerText = '✅ QR leído: ' + text;

    console.log('QR leído:', text); // también en consola
    const id = parseInt(text.trim(), 10);
    if (isNaN(id)) {
        alert('QR inválido');
        return;
    }

    await cerrarEscanerQR(); // ✅ espera a que la cámara pare
    buscarUsuarioPorId(id);
}

function onQrError(err) {
    // No hacemos nada, se ejecuta muchas veces mientras la cámara está activa
}

async function cerrarEscanerQR() {
    const qrScreen = document.getElementById('qrScreen');
    qrScreen.style.display = 'none';
    document.body.style.overflow = '';

    if (html5QrCode) {
        await html5QrCode.stop();
        html5QrCode.clear();
        html5QrCode = null;
    }
}

document.getElementById('cancelarQrBtn').addEventListener('click', cerrarEscanerQR);

async function buscarUsuarioPorId(id) {
    try {
        const res = await fetch(`${API_BASE}/usuario/${id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const u = await res.json();
        if (!res.ok) {
            alert(u.error || 'Usuario no encontrado');
            return;
        }

        usuarioActual = u;
        renderUsuario(u);
        abrirSheet();

    } catch (err) {
        console.error(err);
        alert('Error de conexión');
    }
}


/* =================================
   RENDER USUARIO Y DAR ACCESO
================================= */
function renderUsuario(u) {
    document.getElementById('uNombre').innerText = u.nombre || '—';
    document.getElementById('uDni').innerText = u.dni || '—';

    const verificado = document.getElementById('estadoVerificado');
    const bloqueado = document.getElementById('estadoBloqueado');

    verificado.innerText = u.verificado ? '✔ Verificado' : '⚠ No verificado';
    verificado.className = u.verificado ? 'ok' : 'warn';

    bloqueado.innerText = u.bloqueado ? '🔒 Bloqueado' : '🔓 Activo';
    bloqueado.className = u.bloqueado ? 'bad' : 'ok';

    document.getElementById('uId').innerText = u.id;
    document.getElementById('uNacimiento').innerText = u.fecha_nacimiento
        ? u.fecha_nacimiento.split('-').reverse().join('-')
        : '—';
    document.getElementById('uEmail').innerText = u.email || '—';
    document.getElementById('uTelefono').innerText = u.telefono || '—';

    const img = document.getElementById('uFoto');
    const placeholder = document.getElementById('fotoPlaceholder');

    if (u.foto) {
        img.src = u.foto;
        img.style.display = 'block';
        placeholder.style.display = 'none';
    } else {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
    }

    const accesoBtn = document.getElementById('accesoBtn');
    const verificarBtn = document.getElementById('verificarBtn');

    // Mostrar/ocultar botones según estado
    if (u.bloqueado) {
        accesoBtn.style.display = 'none';
        verificarBtn.style.display = 'none';
    } else if (!u.verificado) {
        accesoBtn.style.display = 'none';
        verificarBtn.style.display = 'block';
    } else {
        verificarBtn.style.display = 'none';
        accesoBtn.style.display = 'block';
    }

    // 🔹 Listener seguro para ACCESO (siempre actualizado)
    if (accesoBtn) {
        accesoBtn.onclick = async () => {
            if (!usuarioActual) return;

            try {
                const res = await fetch(
                    `${API_BASE}/eventos/${eventId}/acceso`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({ userId: usuarioActual.id })
                    }
                );

                const data = await res.json();

                if (data.permitido) {
                    mostrarFeedback(data.mensaje || 'Acceso concedido', 'ok');
                } else {
                    mostrarFeedback(data.motivo || 'Acceso denegado', 'bad');
                }

            } catch (err) {
                console.error(err);
                mostrarFeedback('Error de conexión', 'bad');
            }
        };
    }

    ocultarFeedback();
}


/* =========================
   FEEDBACK
========================= */
function mostrarFeedback(texto, tipo) {
    const fb = document.getElementById('feedback');
    fb.innerText = texto;
    fb.className = `feedback ${tipo}`;
    fb.style.display = 'block';
}

function ocultarFeedback() {
    const fb = document.getElementById('feedback');
    fb.style.display = 'none';
}

/* =========================
   VERIFICAR USUARIO
========================= */
document.getElementById('verificarBtn').addEventListener('click', async () => {
    if (!usuarioActual) return;

    const ok = confirm(
        '¿Confirmas que la identidad coincide con el DNI y la foto del usuario?'
    );
    if (!ok) return;

    try {
        const res = await fetch(
            `${API_BASE}/usuario/${usuarioActual.id}/verificar`,
            {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            }
        );

        if (!res.ok) {
            mostrarFeedback('Error al verificar usuario', 'bad');
            return;
        }

        usuarioActual.verificado = 1;
        renderUsuario(usuarioActual);
        mostrarFeedback('Usuario verificado correctamente', 'ok');

    } catch (err) {
        console.error(err);
        mostrarFeedback('Error de conexión', 'bad');
    }
});

