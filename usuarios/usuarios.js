/* =========================
   ELEMENTOS COMUNES
   ========================= */
const mensajeFinalConfirmacion = document.getElementById('mensajeFinalConfirmación'); // screenConfirmacion
const mensajeFinalPerfil = document.querySelector('#screenPerfil .mensaje'); // screenPerfil
const API_BASE = "https://accesossala29.onrender.com";

/* =========================
   SCREENS
   ========================= */
const screens = {
    inicio: document.getElementById('screenInicio'),
    login: document.getElementById('screenLogin'),
    registro: document.getElementById('screenRegistro'),
    confirmacion: document.getElementById('screenConfirmacion'),
    perfil: document.getElementById('screenPerfil')
};

function mostrar(id) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[id].classList.add('active');
}

/* =========================
   NAVEGACIÓN
   ========================= */
document.getElementById('btnRegistro').onclick = () => mostrar('registro');
document.getElementById('btnVerQr').onclick = () => mostrar('login');
document.getElementById('volverInicio1').onclick = () => mostrar('inicio');
document.getElementById('volverRegistro').onclick = () => mostrar('registro');
document.getElementById('volverInicioLogin').onclick = () => mostrar('inicio');

/* =========================
   REGISTRO – INPUTS
   ========================= */
const nombreInput = document.getElementById('nombre');
const dniInput = document.getElementById('dni');
const emailInput = document.getElementById('email');
const telefonoInput = document.getElementById('telefono');
const fechaNacimientoInput = document.getElementById('fechaNacimiento');

dniInput.addEventListener('input', () => {
    dniInput.value = dniInput.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 9);
});

telefonoInput.addEventListener('input', () => {
    telefonoInput.value = telefonoInput.value.replace(/\D/g, '').slice(0, 9);
});

function validarEdadMinima(fecha) {
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    const limite = new Date(hoy.getFullYear() - 5, hoy.getMonth(), hoy.getDate());
    return nacimiento <= limite;
}

/* =========================
   DATOS TEMPORALES Y TOKEN
   ========================= */
let datosRegistro = {};
let userId = null;
let userToken = null;

const cNombre = document.getElementById('cNombre');
const cDni = document.getElementById('cDni');
const cEmail = document.getElementById('cEmail');
const cFecha = document.getElementById('cFecha');

/* =========================
   CONTINUAR REGISTRO
   ========================= */
document.getElementById('registroForm').addEventListener('submit', e => {
    e.preventDefault();

    const nombre = nombreInput.value.trim();
    const dni = dniInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const telefono = telefonoInput.value.trim();
    const fechaNacimiento = fechaNacimientoInput.value;

    if (!nombre || !dni || !email || !fechaNacimiento) {
        alert('Debes rellenar todos los campos obligatorios');
        return;
    }

    if (dni.length !== 9) {
        alert('El DNI debe tener 9 caracteres');
        return;
    }

    if (telefono && telefono.length !== 9) {
        alert('El teléfono debe tener 9 dígitos');
        return;
    }

    if (!validarEdadMinima(fechaNacimiento)) {
        alert('El usuario debe tener al menos 5 años');
        return;
    }

    datosRegistro = {
        nombre,
        dni,
        email,
        telefono,
        fecha_nacimiento: fechaNacimiento
    };

    cNombre.innerText = nombre;
    cDni.innerText = dni;
    cEmail.innerText = email;
    cFecha.innerText = fechaNacimiento;

    mostrar('confirmacion');
});

/* =========================
   CONFIRMAR REGISTRO
   ========================= */
document.getElementById('confirmarRegistro').onclick = async (e) => {
    const btn = e.target;

    mensajeFinalConfirmacion.innerText = '';
    btn.disabled = true;
    btn.innerText = "Registrando...";

    try {
        const res = await fetch(`${API_BASE}/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosRegistro)
        });

        const data = await res.json();

        if (res.ok) {

            mensajeFinalConfirmacion.style.color = '#5dff8f';
            mensajeFinalConfirmacion.innerText =
                'Registro completado con éxito.';

            userId = data.userId;
            userToken = data.token;

            localStorage.setItem('userId', userId);
            localStorage.setItem('token', userToken);

            await mostrarPerfilUsuario(userId);

        } else {
            mensajeFinalConfirmacion.style.color = 'red';
            mensajeFinalConfirmacion.innerText = data.error || 'Error en el registro';
            btn.disabled = false;
            btn.innerText = "Confirmar registro";
        }

    } catch (err) {
        mensajeFinalConfirmacion.style.color = 'red';
        mensajeFinalConfirmacion.innerText = 'Error de conexión';
        btn.disabled = false;
        btn.innerText = "Confirmar registro";
    }
};



/* =========================
   LOGIN USUARIO
   ========================= */
document.getElementById('btnLoginPerfil').onclick = async () => {
    mensajeFinalPerfil.innerText = '';

    const dni = document.getElementById('loginDni').value.trim().toUpperCase();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const telefono = document.getElementById('loginTelefono').value.trim();
    const fechaNacimiento = document.getElementById('loginFecha').value;

    if (!dni) {
        mensajeFinalPerfil.style.color = 'red';
        mensajeFinalPerfil.innerText = 'El DNI es obligatorio';
        return;
    }

    if (!email && !telefono && !fechaNacimiento) {
        mensajeFinalPerfil.style.color = 'red';
        mensajeFinalPerfil.innerText =
            'Introduce al menos un dato adicional (email, teléfono o fecha)';
        return;
    }

    const payload = { dni };
    if (email) payload.email = email;
    if (telefono) payload.telefono = telefono;
    if (fechaNacimiento) payload.fecha_nacimiento = fechaNacimiento;

    try {
        const res = await fetch(`${API_BASE}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            userId = data.id;
            userToken = data.token || null;
            localStorage.setItem('userId', userId);
            if (userToken) localStorage.setItem('token', userToken);

            mostrarPerfilUsuario(userId);
        } else {
            mensajeFinalPerfil.style.color = 'red';
            mensajeFinalPerfil.innerText = data.error || 'No se pudo acceder al perfil';
        }
    } catch (err) {
        mensajeFinalPerfil.style.color = 'red';
        mensajeFinalPerfil.innerText = 'Error de conexión';
    }
};

/* =========================
   PERFIL USUARIO
   ========================= */
async function mostrarPerfilUsuario(id) {
    mensajeFinalPerfil.innerText = '';

    try {
        const token = localStorage.getItem('token');

        // 1️⃣ Pedir datos del usuario
        const res = await fetch(`${API_BASE}/usuario/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });

        const u = await res.json();

        if (!res.ok) {
            mensajeFinalPerfil.style.color = 'red';
            mensajeFinalPerfil.innerText = u.error || 'Error al cargar usuario';
            return;
        }

        mostrar('perfil');

        document.getElementById('nombreUsuario').innerText = u.nombre || '—';
        document.getElementById('dniUsuario').innerText = u.dni || '—';
        document.getElementById('idUsuario').innerText = u.id;
        document.getElementById('verificadoUsuario').innerText =
            u.verificado ? '✔ Verificado' : '⚠ No verificado';
        document.getElementById('emailUsuario').innerText = u.email || '—';
        document.getElementById('telefonoUsuario').innerText = u.telefono || '—';
        document.getElementById('fotoUsuario').src = u.foto || 'icon-persona.png';

        document.getElementById("volverInicioPerfil").onclick = () => mostrar("inicio");

        // 2️⃣ PEDIR QR
        const qrRes = await fetch(`${API_BASE}/usuario/${u.id}/qr`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!qrRes.ok) throw new Error('No se pudo cargar el QR');

        const qrBlob = await qrRes.blob();
        const qrUrl = URL.createObjectURL(qrBlob);

        document.getElementById('qrUsuario').src = qrUrl;

    } catch (err) {
        mensajeFinalPerfil.style.color = 'red';
        mensajeFinalPerfil.innerText = err.message || 'Error de conexión al cargar perfil';
    }
}

/* =========================
   PERFIL – EDICIÓN DE CAMPOS
   ========================= */
const editarLinks = document.querySelectorAll('.editar-link');
const editarContainer = document.getElementById('editarContainer');
let campoActual = null;

editarLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        campoActual = link.dataset.campo;

        if (campoActual === 'foto') {
            editarContainer.innerHTML = `
                <div class="editar-foto-container">
                    <button id="subirGaleria">📁 Abrir galería</button>
                    <button id="tomarFoto">📸 Tomar foto</button>
                    <input type="url" id="urlFoto" placeholder="O pega una URL">
                    <div class="editar-btns">
                        <button id="guardarEditar">✔</button>
                        <button id="cancelarEditar">✖</button>
                    </div>
                </div>
            `;
            editarContainer.style.display = 'block';

            // Subir desde galería
            document.getElementById('subirGaleria').addEventListener('click', () => {
                const inputFile = document.createElement('input');
                inputFile.type = 'file';
                inputFile.accept = 'image/*';
                inputFile.onchange = e => {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = () => document.getElementById('urlFoto').value = reader.result;
                    reader.readAsDataURL(file);
                };
                inputFile.click();
            });

            // Tomar foto
            document.getElementById('tomarFoto').addEventListener('click', async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    const video = document.createElement('video');
                    video.srcObject = stream;
                    video.play();

                    const modal = document.createElement('div');
                    modal.className = 'modal-video';
                    modal.appendChild(video);

                    const snapBtn = document.createElement('button');
                    snapBtn.innerText = '📸 Tomar foto';
                    modal.appendChild(snapBtn);

                    document.body.appendChild(modal);

                    snapBtn.onclick = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        canvas.getContext('2d').drawImage(video, 0, 0);
                        const dataURL = canvas.toDataURL('image/png');
                        document.getElementById('urlFoto').value = dataURL;

                        stream.getTracks().forEach(track => track.stop());
                        modal.remove();
                    };
                } catch (err) { alert('No se pudo acceder a la cámara'); }
            });

            document.getElementById('cancelarEditar').addEventListener('click', () => {
                editarContainer.style.display = 'none';
                campoActual = null;
            });

            document.getElementById('guardarEditar').addEventListener('click', async () => {
                const nuevoValor = document.getElementById('urlFoto').value.trim();
                if (!nuevoValor) return alert('Debes subir o pegar una foto');

                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_BASE}/usuarios/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token ? 'Bearer ' + token : ''
                        },
                        body: JSON.stringify({ foto: nuevoValor })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        document.getElementById('fotoUsuario').src = nuevoValor;
                        editarContainer.style.display = 'none';
                        campoActual = null;
                        mensajeFinalPerfil.style.color = '#5dff8f';
                        mensajeFinalPerfil.innerText = 'Foto actualizada con éxito';
                    } else {
                        mensajeFinalPerfil.style.color = 'red';
                        mensajeFinalPerfil.innerText = data.error || 'Error al actualizar';
                    }
                } catch (err) {
                    mensajeFinalPerfil.style.color = 'red';
                    mensajeFinalPerfil.innerText = 'Error de conexión al actualizar';
                }
            });

        } else {
            const valorActual = document.getElementById(campoActual + 'Usuario').innerText;
            editarContainer.innerHTML = `
                <input type="text" id="campoEditar" placeholder="Editar ${campoActual}" value="${valorActual==='—'?'':valorActual}">
                <div class="editar-btns">
                    <button id="guardarEditar">✔</button>
                    <button id="cancelarEditar">✖</button>
                </div>`;
            editarContainer.style.display = 'block';

            document.getElementById('cancelarEditar').addEventListener('click', () => {
                campoActual = null;
                editarContainer.style.display = 'none';
            });

            document.getElementById('guardarEditar').addEventListener('click', async () => {
                const campoEditarInput = document.getElementById('campoEditar');
                const nuevoValor = campoEditarInput.value.trim();
                if (!nuevoValor) return alert('El valor no puede estar vacío');

                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_BASE}/usuarios/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token ? 'Bearer ' + token : ''
                        },
                        body: JSON.stringify({ [campoActual]: nuevoValor })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        document.getElementById(campoActual + 'Usuario').innerText = nuevoValor;
                        editarContainer.style.display = 'none';
                        campoActual = null;
                        mensajeFinalPerfil.style.color = '#5dff8f';
                        mensajeFinalPerfil.innerText = 'Campo actualizado con éxito';
                    } else {
                        mensajeFinalPerfil.style.color = 'red';
                        mensajeFinalPerfil.innerText = data.error || 'Error al actualizar';
                    }
                } catch {
                    mensajeFinalPerfil.style.color = 'red';
                    mensajeFinalPerfil.innerText = 'Error de conexión al actualizar';
                }
            });
        }
    });
});
