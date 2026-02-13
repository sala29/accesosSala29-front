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

const overlay = document.getElementById('overlay');
const bottomSheet = document.getElementById('bottomSheet');
const sheetTitulo = document.getElementById('sheetTitulo');
const sheetPassword = document.getElementById('sheetPassword');
const sheetEscanear = document.getElementById('sheetEscanear');
const cerrarSheet = document.getElementById('cerrarSheet');
const lista = document.getElementById('listaEventos');

let eventoActual = null;
let cardActual = null;

/* ================= HAPTIC ================= */

function vibrar() {
    if (navigator.vibrate) {
        navigator.vibrate(15);
    }
}

/* ================= OPEN ================= */

function abrirSheet(evento, card) {

    eventoActual = evento;
    cardActual = card;

    document.querySelectorAll('.evento').forEach(e => e.classList.remove('selected'));
    card.classList.add('selected');

    sheetTitulo.textContent = evento.nombre;
    sheetPassword.value = '';

    overlay.classList.add('active');
    bottomSheet.classList.add('active');

    vibrar();

    setTimeout(() => {
        sheetPassword.focus();
    }, 300);
}

/* ================= CLOSE ================= */

function cerrarSheetFunc() {

    eventoActual = null;

    overlay.classList.remove('active');
    bottomSheet.classList.remove('active');

    if (cardActual) {
        cardActual.classList.remove('selected');
    }

    cardActual = null;
}

overlay.addEventListener('click', cerrarSheetFunc);
cerrarSheet.addEventListener('click', cerrarSheetFunc);

/* ================= DRAG DOWN ================= */

let startY = 0;
let currentY = 0;
let dragging = false;

bottomSheet.addEventListener('pointerdown', (e) => {
    startY = e.clientY;
    dragging = true;
});

bottomSheet.addEventListener('pointermove', (e) => {
    if (!dragging) return;

    currentY = e.clientY;
    let diff = currentY - startY;

    if (diff > 0) {
        bottomSheet.style.transform = `translateY(${diff}px)`;
    }
});

bottomSheet.addEventListener('pointerup', () => {
    dragging = false;

    const diff = currentY - startY;

    bottomSheet.style.transform = '';

    if (diff > 120) {
        cerrarSheetFunc();
    }
});

/* ================= VALIDAR ================= */

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
            vibrar();
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
                    abrirSheet(evento, div);
                }

            });

            lista.appendChild(div);
        });

    } catch (err) {
        alert('Error al cargar eventos');
    }
}

cargarEventos();
