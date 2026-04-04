/* =========================
   ELEMENTOS COMUNES
   ========================= */
const mensajeFinalConfirmacion = document.getElementById('mensajeFinalConfirmacion'); // screenConfirmacion
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
document.getElementById('btnVerQr').onclick = () => {
    // Redirige a login
    window.location.href = '../login/index.html';
};
document.getElementById('btnProximosEventos').addEventListener('click', () => {
    window.location.href = '../eventos/index.html';
});
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

(function() {
  const dd   = document.getElementById('segDd');
  const mm   = document.getElementById('segMm');
  const aaaa = document.getElementById('segAaaa');
  const hidden = document.getElementById('fechaNacimiento');

  function updateHidden() {
    const d = dd.value.padStart(2,'0');
    const m = mm.value.padStart(2,'0');
    const y = aaaa.value;
    hidden.value = (dd.value && mm.value && y.length === 4) ? `${y}-${m}-${d}` : '';
  }
  function markEmpty(el) { el.dataset.empty = el.value === '' ? 'true' : 'false'; }
  function clamp(val, min, max) {
    const n = parseInt(val, 10);
    return isNaN(n) ? '' : String(Math.min(Math.max(n, min), max));
  }
  function handleInput(el, min, max, next) {
    let v = el.value.replace(/\D/g, '');
    const maxLen = el === aaaa ? 4 : 2;
    if (v.length > maxLen) v = v.slice(-maxLen);
    if (el !== aaaa && v.length === 1 && parseInt(v[0],10) > (el === dd ? 3 : 1)) {
      el.value = clamp('0'+v, min, max); markEmpty(el); updateHidden();
      if (next) { next.focus(); next.select(); } return;
    }
    el.value = v; markEmpty(el);
    if (v.length === maxLen) {
      el.value = clamp(v, min, max); markEmpty(el); updateHidden();
      if (next) { next.focus(); next.select(); }
    } else { updateHidden(); }
  }
  dd.addEventListener('input', () => handleInput(dd, 1, 31, mm));
  mm.addEventListener('input', () => handleInput(mm, 1, 12, aaaa));
  aaaa.addEventListener('input', () => {
    aaaa.value = aaaa.value.replace(/\D/g,'').slice(0,4);
    markEmpty(aaaa); updateHidden();
  });
  function handleKeydown(e, prev, next) {
    if (e.key==='Backspace' && e.target.value==='' && prev) { e.preventDefault(); prev.focus(); prev.select(); }
    if (e.key==='ArrowLeft' && e.target.selectionStart===0 && prev) { e.preventDefault(); prev.focus(); prev.select(); }
    if (e.key==='ArrowRight' && e.target.selectionStart===e.target.value.length && next) { e.preventDefault(); next.focus(); next.select(); }
    if (e.key==='/') { e.preventDefault(); if (next) { next.focus(); next.select(); } }
  }
  dd.addEventListener('keydown',   e => handleKeydown(e, null, mm));
  mm.addEventListener('keydown',   e => handleKeydown(e, dd, aaaa));
  aaaa.addEventListener('keydown', e => handleKeydown(e, mm, null));
  [dd, mm, aaaa].forEach(el => {
    el.addEventListener('focus', () => el.select());
    el.addEventListener('blur', () => {
      if (el !== aaaa && el.value.length === 1) el.value = el.value.padStart(2,'0');
      markEmpty(el); updateHidden();
    });
  });
  document.getElementById('fechaWrapper').addEventListener('click', e => {
    if (e.target === document.getElementById('fechaWrapper')) dd.focus();
  });
})();

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

(function () {
    const modal        = document.getElementById('modalTerminos');
    const btnCerrar    = document.getElementById('btnCerrarModal');
    const btnAceptar   = document.getElementById('btnAceptarDesdeModal');
    const checkbox     = document.getElementById('aceptaTerminos');
    const btnContinuar = document.getElementById('btnContinuar');
    const termsLinks   = document.querySelectorAll('.terms-link');
    const tabBtns      = document.querySelectorAll('.tab-btn');
    const tabContents  = document.querySelectorAll('.tab-content');

    // ── Abrir modal ──────────────────────────────────────────
    function abrirModal(tab) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        cambiarTab(tab || 'terminos');
    }

    // ── Cerrar modal ─────────────────────────────────────────
    function cerrarModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ── Cambiar pestaña ──────────────────────────────────────
    function cambiarTab(tabId) {
        tabBtns.forEach(btn => {
            const active = btn.dataset.tab === tabId;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active);
        });
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === 'tab-' + tabId);
        });
    }

    // ── Eventos pestañas ─────────────────────────────────────
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => cambiarTab(btn.dataset.tab));
    });

    // ── Abrir desde enlace del checkbox ──────────────────────
    termsLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            abrirModal(link.dataset.tab);
        });
    });

    // ── Cerrar con X ─────────────────────────────────────────
    btnCerrar.addEventListener('click', cerrarModal);

    // ── Aceptar desde modal → marca checkbox automáticamente ─
    btnAceptar.addEventListener('click', () => {
        if (checkbox) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));
        }
        cerrarModal();
    });

    // ── Cerrar al hacer clic en el overlay (fuera del box) ───
    modal.addEventListener('click', e => {
        if (e.target === modal) cerrarModal();
    });

    // ── Cerrar con Escape ────────────────────────────────────
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('open')) cerrarModal();
    });

    // ── Habilitar/deshabilitar botón Continuar ───────────────
    if (checkbox && btnContinuar) {
        checkbox.addEventListener('change', () => {
            btnContinuar.disabled = !checkbox.checked;
        });
    }
})();

/* =========================
   DATOS TEMPORALES Y TOKEN
   ========================= */
let datosRegistro = {};
let userId = null;
let userToken = null;
let fotoRegistroUrl = null;

/* =========================
   FOTO EN REGISTRO
   ========================= */
async function subirFotoRegistroACloudinary(archivo) {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', 'sala29_fotos');

    const estado = document.getElementById('estadoFotoRegistro');
    estado.style.color = '#aaa';
    estado.innerText = 'Subiendo foto...';

    try {
        const res = await fetch('https://api.cloudinary.com/v1_1/dx3qrpzfi/image/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (data.secure_url) {
            fotoRegistroUrl = data.secure_url;
            estado.style.color = '#5dff8f';
            estado.innerText = '✔ Foto lista';
        } else {
            estado.style.color = 'red';
            estado.innerText = 'Error al subir la foto';
        }
    } catch (err) {
        estado.style.color = 'red';
        estado.innerText = 'Error de conexión con Cloudinary';
    }
}

// Galería
document.getElementById('btnFotoGaleria').addEventListener('click', () => {
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = 'image/png, image/jpeg, image/jpg, image/webp, image/heic';
    inputFile.onchange = e => {
        const file = e.target.files[0];
        if (file) subirFotoRegistroACloudinary(file);
    };
    inputFile.click();
});

// Cámara
document.getElementById('btnFotoCamara').addEventListener('click', () => {
    abrirCamaraProfesional(blob => subirFotoRegistroACloudinary(blob));
});

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
        fecha_nacimiento: fechaNacimiento,
        foto: fotoRegistroUrl || null
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
   CÁMARA PROFESIONAL
   ========================= */
function abrirCamaraProfesional(onFotoCapturada) {
    let stream = null;
    let facingMode = 'user'; // frontal por defecto
    let fotoBlob = null;

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'camara-overlay';

    overlay.innerHTML = `
        <div class="camara-box">
            <button class="btn-camara-cerrar" id="camaraCerrar">✕</button>
            <h3 id="camaraTitulo">📷 Tomar foto</h3>
            <div class="camara-visor" id="camaraVisor">
                <video id="camaraVideo" autoplay playsinline muted></video>
                <div class="camara-guia">
                    <div class="camara-guia-circulo"></div>
                </div>
            </div>
            <div class="camara-controles" id="camaraControles">
                <button class="btn-camara-secundario" id="camaraFlip" title="Cambiar cámara">🔄</button>
                <button class="btn-camara-accion" id="camaraDisparar">📷</button>
                <div style="width:44px"></div>
            </div>
            <div class="camara-preview-controles" id="camaraPreviewControles" style="display:none">
                <button class="btn-camara-repetir" id="camaraRepetir">🔁 Repetir</button>
                <button class="btn-camara-confirmar" id="camaraConfirmar">✔ Usar esta foto</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const video       = overlay.querySelector('#camaraVideo');
    const visor       = overlay.querySelector('#camaraVisor');
    const controles   = overlay.querySelector('#camaraControles');
    const previewCtrl = overlay.querySelector('#camaraPreviewControles');
    const titulo      = overlay.querySelector('#camaraTitulo');

    // ── Iniciar stream ───────────────────────────────────────
    async function iniciarStream() {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
        }
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode }
            });
            video.srcObject = stream;
        } catch (err) {
            alert('No se pudo acceder a la cámara');
            cerrar();
        }
    }

    // ── Cerrar y limpiar ─────────────────────────────────────
    function cerrar() {
        if (stream) stream.getTracks().forEach(t => t.stop());
        overlay.remove();
    }

    // ── Mostrar preview ──────────────────────────────────────
    function mostrarPreview(blob) {
        fotoBlob = blob;
        const url = URL.createObjectURL(blob);

        // Reemplazar video por imagen
        video.style.display = 'none';
        const preview = document.createElement('img');
        preview.id = 'camaraPreviewImg';
        preview.src = url;
        visor.appendChild(preview);

        // Ocultar guía
        visor.querySelector('.camara-guia').style.display = 'none';

        // Cambiar controles
        controles.style.display = 'none';
        previewCtrl.style.display = 'flex';
        titulo.innerText = '¿Usar esta foto?';
    }

    // ── Volver a cámara ──────────────────────────────────────
    function volverACamara() {
        fotoBlob = null;
        const img = overlay.querySelector('#camaraPreviewImg');
        if (img) img.remove();

        video.style.display = 'block';
        visor.querySelector('.camara-guia').style.display = 'flex';

        controles.style.display = 'flex';
        previewCtrl.style.display = 'none';
        titulo.innerText = '📷 Tomar foto';
    }

    // ── Eventos ──────────────────────────────────────────────
    overlay.querySelector('#camaraCerrar').onclick = cerrar;

    overlay.querySelector('#camaraFlip').onclick = () => {
        facingMode = facingMode === 'user' ? 'environment' : 'user';
        iniciarStream();
    };

    overlay.querySelector('#camaraDisparar').onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        canvas.toBlob(blob => mostrarPreview(blob), 'image/jpeg', 0.9);
    };

    overlay.querySelector('#camaraRepetir').onclick = volverACamara;

    overlay.querySelector('#camaraConfirmar').onclick = () => {
        cerrar();
        if (fotoBlob) onFotoCapturada(fotoBlob);
    };

    // Cerrar al hacer clic en el overlay fuera del box
    overlay.addEventListener('click', e => {
        if (e.target === overlay) cerrar();
    });

    // ── Iniciar ──────────────────────────────────────────────
    iniciarStream();
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

            // Crear modal profesional
            const fotoActual = document.getElementById('fotoUsuario').src;
            let urlSeleccionada = null;

            const overlay = document.createElement('div');
            overlay.className = 'foto-edit-overlay';
            overlay.innerHTML = `
                <div class="foto-edit-box">
                    <h3>✏️ Cambiar foto de perfil</h3>
                    <img class="foto-edit-preview" id="fotoEditPreview" src="${fotoActual}" alt="Preview">
                    <div class="foto-edit-opciones">
                        <button id="fotoEditGaleria">📁 Elegir de la galería</button>
                        <button id="fotoEditCamara">📸 Tomar foto</button>
                    </div>
                    <div class="foto-edit-estado" id="fotoEditEstado"></div>
                    <div class="foto-edit-acciones">
                        <button class="btn-foto-cancelar" id="fotoEditCancelar">Cancelar</button>
                        <button class="btn-foto-guardar" id="fotoEditGuardar" disabled>Guardar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const preview   = overlay.querySelector('#fotoEditPreview');
            const estado    = overlay.querySelector('#fotoEditEstado');
            const btnGuardar = overlay.querySelector('#fotoEditGuardar');

            // ── Subir a Cloudinary ───────────────────────────
            async function subirACloudinary(archivo) {
                estado.style.color = '#aaa';
                estado.innerText = 'Subiendo imagen...';
                btnGuardar.disabled = true;

                const formData = new FormData();
                formData.append('file', archivo);
                formData.append('upload_preset', 'sala29_fotos');

                try {
                    const res = await fetch('https://api.cloudinary.com/v1_1/dx3qrpzfi/image/upload', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await res.json();

                    if (data.secure_url) {
                        urlSeleccionada = data.secure_url;
                        preview.src = urlSeleccionada;
                        estado.style.color = '#5dff8f';
                        estado.innerText = '✔ Foto lista para guardar';
                        btnGuardar.disabled = false;
                    } else {
                        estado.style.color = 'red';
                        estado.innerText = 'Error al subir la foto';
                    }
                } catch (err) {
                    estado.style.color = 'red';
                    estado.innerText = 'Error de conexión con Cloudinary';
                }
            }

            // ── Galería ──────────────────────────────────────
            overlay.querySelector('#fotoEditGaleria').addEventListener('click', () => {
                const inputFile = document.createElement('input');
                inputFile.type = 'file';
                inputFile.accept = 'image/png, image/jpeg, image/jpg, image/webp, image/heic';
                inputFile.onchange = e => {
                    const file = e.target.files[0];
                    if (file) subirACloudinary(file);
                };
                inputFile.click();
            });

            // ── Cámara ───────────────────────────────────────
            overlay.querySelector('#fotoEditCamara').addEventListener('click', () => {
                abrirCamaraProfesional(blob => subirACloudinary(blob));
            });

            // ── Cancelar ─────────────────────────────────────
            overlay.querySelector('#fotoEditCancelar').addEventListener('click', () => {
                overlay.remove();
                campoActual = null;
            });

            // ── Cerrar al hacer clic fuera ───────────────────
            overlay.addEventListener('click', e => {
                if (e.target === overlay) {
                    overlay.remove();
                    campoActual = null;
                }
            });

            // ── Guardar ──────────────────────────────────────
            overlay.querySelector('#fotoEditGuardar').addEventListener('click', async () => {
                if (!urlSeleccionada) return;

                btnGuardar.disabled = true;
                btnGuardar.innerText = '⏳ Guardando...';

                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_BASE}/usuarios/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token ? 'Bearer ' + token : ''
                        },
                        body: JSON.stringify({ foto: urlSeleccionada })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        document.getElementById('fotoUsuario').src = urlSeleccionada;
                        overlay.remove();
                        campoActual = null;
                        mensajeFinalPerfil.style.color = '#5dff8f';
                        mensajeFinalPerfil.innerText = 'Foto actualizada con éxito';
                    } else {
                        estado.style.color = 'red';
                        estado.innerText = data.error || 'Error al guardar';
                        btnGuardar.disabled = false;
                        btnGuardar.innerText = 'Guardar';
                    }
                } catch (err) {
                    estado.style.color = 'red';
                    estado.innerText = 'Error de conexión al guardar';
                    btnGuardar.disabled = false;
                    btnGuardar.innerText = 'Guardar';
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
