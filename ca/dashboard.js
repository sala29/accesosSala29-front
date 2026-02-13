const token = localStorage.getItem('token');
const API_BASE = "https://accesossala29.onrender.com";

if (!token) {
    alert('No estás logueado');
    window.location.href = '../index.html';
}

// ===============================
// CERRAR SESIÓN
// ===============================
document.getElementById('cerrarSesion').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '../index.html';
});

// ===============================
// CREAR EVENTO (DESPLEGABLE)
// ===============================
const crearBtn = document.getElementById('crearEventoBtn');
const crearForm = document.getElementById('crearEventoForm');
const cancelarCrear = document.getElementById('cancelarCrear');

crearBtn.addEventListener('click', () => {
    crearForm.style.display = 'flex';
});

cancelarCrear.addEventListener('click', () => {
    crearForm.style.display = 'none';
});

// ===============================
// GUARDAR NUEVO EVENTO
// ===============================
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

        // Redirigir directamente al escaneo
        window.location.href =
            `escaneo_accesos/escaneo_accesos.html?eventId=${data.id}&nombre=${encodeURIComponent(nombre)}`;

    } catch (err) {
        console.error(err);
        alert('Error de conexión');
    }
});

// ===============================
// CARGAR EVENTOS
// ===============================
async function cargarEventos() {
    const lista = document.getElementById('listaEventos');
    lista.innerHTML = '';

    try {
        const res = await fetch(`${API_BASE}/eventos`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

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

                <div class="desplegable">
                    <input 
                        type="password" 
                        placeholder="Contraseña del evento"
                        ${evento.activo ? '' : 'disabled'}
                    >
                    <button ${evento.activo ? '' : 'disabled'}>
                        Escanear accesos
                    </button>
                </div>
            `;

            lista.appendChild(div);

            const desplegable = div.querySelector('.desplegable');
            const inputPass = desplegable.querySelector('input');
            const botonEscanear = desplegable.querySelector('button');

            inputPass.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            // ===============================
            // ABRIR / CERRAR DESPLEGABLE (VERSIÓN PRO)
            // ===============================
            div.addEventListener('pointerup', function (e) {

                // Si clicas dentro del desplegable (input o botón), no hacer toggle
                if (e.target.closest('.desplegable')) return;

                if (!evento.activo) return;

                const estaAbierto = desplegable.style.display === 'flex';

                // Cerrar todos los desplegables
                document.querySelectorAll('.desplegable').forEach(d => {
                    d.style.display = 'none';
                });

                // Foco inmediato (clave en móvil)
                inputPass.focus();

                // Truco extra para iOS
                inputPass.setSelectionRange(
                    inputPass.value.length,
                    inputPass.value.length
                );
            });

            
            // -------------------------------
            // VALIDAR CONTRASEÑA AL PULSAR
            // -------------------------------
            botonEscanear.addEventListener('click', async (e) => {
                e.stopPropagation();
                const password = inputPass.value.trim();

                if (!password) {
                    alert('Introduce la contraseña del evento');
                    return;
                }

                try {
                    const res = await fetch(
                        `${API_BASE}/eventos/${evento.id}/validar`,
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

                    // Contraseña correcta → ir al escáner
                    window.location.href =
                        `escaneo_accesos/escaneo_accesos.html?eventId=${evento.id}&nombre=${encodeURIComponent(evento.nombre)}`;

                } catch (err) {
                    console.error(err);
                    alert('Error validando la contraseña');
                }
            });
        });


    } catch (err) {
        console.error(err);
        alert('Error al cargar eventos');
    }
}

// ===============================
// INIT
// ===============================
cargarEventos();
