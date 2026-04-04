const token = localStorage.getItem('token');
const API_BASE = "https://accesossala29.onrender.com";

if (!token) {
    alert('No estás logueado');
    window.location.href = '../index.html';
}

document.getElementById('cerrarSesion').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '../index.html';
});

const crearBtn = document.getElementById('crearEventoBtn');
const crearForm = document.getElementById('crearEventoForm');
const cancelarCrear = document.getElementById('cancelarCrear');

crearBtn.addEventListener('click', () => {
    crearForm.style.display = 'flex';
});

cancelarCrear.addEventListener('click', () => {
    crearForm.style.display = 'none';
});

document.getElementById('guardarEvento').addEventListener('click', async () => {
    const nombre = document.getElementById('nuevoNombre').value.trim();
    const password = document.getElementById('nuevoPassword').value.trim();

    if (!nombre || !password) {
        alert('Nombre y contraseña obligatorios');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/eventos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ nombre, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Error al crear evento');
            return;
        }

        window.location.href =
            `escaneo_accesos/escaneo_accesos.html?eventId=${data.id}&nombre=${encodeURIComponent(nombre)}`;

    } catch (err) {
        alert('Error de conexión');
    }
});

/* ================= BOTTOM SHEET CONTROL ================= */

const overlay = document.getElementById('overlay');
const bottomSheet = document.getElementById('bottomSheet');
const sheetTitulo = document.getElementById('sheetTitulo');
const sheetPassword = document.getElementById('sheetPassword');
const sheetEscanear = document.getElementById('sheetEscanear');
const cerrarSheet = document.getElementById('cerrarSheet');

let eventoActual = null;

function abrirSheet(evento) {
    eventoActual = evento;
    sheetTitulo.textContent = evento.nombre;
    sheetPassword.value = '';

    overlay.classList.add('active');
    bottomSheet.classList.add('active');

    setTimeout(() => {
        sheetPassword.focus();
        sheetPassword.setSelectionRange(0, 0);
    }, 200);
}

function cerrarSheetFunc() {
    eventoActual = null;
    overlay.classList.remove('active');
    bottomSheet.classList.remove('active');
}

overlay.addEventListener('click', cerrarSheetFunc);
cerrarSheet.addEventListener('click', cerrarSheetFunc);

sheetEscanear.addEventListener('click', async () => {

    if (!eventoActual) return;

    const password = sheetPassword.value.trim();

    if (!password) {
        alert('Introduce la contraseña del evento');
        return;
    }

    try {
        const res = await fetch(
            `${API_BASE}/eventos/${eventoActual.id}/validar`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ password })
            }
        );

        const data = await res.json();

        if (!res.ok || !data.valido) {
            alert('Contraseña incorrecta');
            return;
        }

        window.location.href =
            `escaneo_accesos/escaneo_accesos.html?eventId=${eventoActual.id}&nombre=${encodeURIComponent(eventoActual.nombre)}`;

    } catch (err) {
        alert('Error validando la contraseña');
    }
});

/* ================= CARGAR EVENTOS ================= */

async function cargarEventos() {

    const lista = document.getElementById('listaEventos');
    lista.innerHTML = '';

    try {
        const res = await fetch(`${API_BASE}/eventos`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const eventos = await res.json();

        eventos.forEach(evento => {

            evento.activo = evento.activo === true || evento.activo === 1 || evento.activo === "true";

            const div = document.createElement('div');
            div.className = 'evento';

            div.innerHTML = `
                <div class="evento-info">
                    <div class="status-circle ${evento.activo ? 'activo' : 'inactivo'}"></div>
                    <div class="nombreEvento">${evento.nombre}</div>
                    <div class="candado">${evento.activo ? '🔓' : '🔒'}</div>
                </div>
            `;

            div.addEventListener('click', () => {
                if (!evento.activo) return;

                if (eventoActual && eventoActual.id === evento.id) {
                    cerrarSheetFunc();
                } else {
                    abrirSheet(evento);
                }
            });

            lista.appendChild(div);
        });

    } catch (err) {
        alert('Error al cargar eventos');
    }
}

cargarEventos();
