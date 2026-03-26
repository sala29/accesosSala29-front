const API_BASE = "https://accesossala29-8vdj.onrender.com";
const userId = localStorage.getItem('userId');
const token = localStorage.getItem('token');

// Elementos DOM
const mensajeFinal = document.querySelector('.mensaje');
const editarContainer = document.getElementById('editarContainer');
const nuevoValorInput = document.getElementById('nuevoValor');
let campoActual = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar si está logueado
    if (!token || !userId) {
        window.location.href = '../login/index.html';
        return;
    }

    // 2. Cargar datos del usuario
    try {
        const res = await fetch(`${API_BASE}/usuario/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const user = await res.json();
            document.getElementById('nombreUsuario').textContent = user.nombre;
            document.getElementById('dniUsuario').textContent = user.dni;
            document.getElementById('emailUsuario').textContent = user.email;
            document.getElementById('telefonoUsuario').textContent = user.telefono || 'No indicado';
            
            // Formatear fecha
            if (user.fecha_nacimiento) {
                const date = new Date(user.fecha_nacimiento);
                document.getElementById('fechaUsuario').textContent = date.toLocaleDateString('es-ES');
            } else {
                document.getElementById('fechaUsuario').textContent = 'No indicada';
            }

            // Cargar foto si tiene, si no poner una por defecto
            const imgPerfil = document.getElementById('perfilFoto');
            imgPerfil.src = user.foto || 'https://via.placeholder.com/120/0f2538/2aa3ff?text=S29';

        } else {
            // Token inválido o caducado
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = '../login/index.html';
        }
    } catch (err) {
        mensajeFinal.style.color = 'red';
        mensajeFinal.textContent = 'Error al cargar los datos. Revisa tu conexión.';
    }
});

// 3. Lógica para editar (Email y Teléfono)
document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', (e) => {
        campoActual = e.target.dataset.campo;
        nuevoValorInput.placeholder = `Nuevo ${campoActual}`;
        nuevoValorInput.value = '';
        editarContainer.style.display = 'block';
        nuevoValorInput.focus();
    });
});

document.getElementById('btnGuardarEdicion').addEventListener('click', async () => {
    const nuevoValor = nuevoValorInput.value.trim();
    if (!nuevoValor) return alert('El valor no puede estar vacío');

    try {
        const res = await fetch(`${API_BASE}/usuario/${userId}`, {
            method: 'PUT', // Asegúrate de que tu backend soporta PUT en /usuario/:id
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ [campoActual]: nuevoValor })
        });

        if (res.ok) {
            document.getElementById(`${campoActual}Usuario`).textContent = nuevoValor;
            editarContainer.style.display = 'none';
            campoActual = null;
            mensajeFinal.style.color = '#5dff8f';
            mensajeFinal.textContent = 'Actualizado con éxito';
            setTimeout(() => mensajeFinal.textContent = '', 3000);
        } else {
            const data = await res.json();
            mensajeFinal.style.color = 'red';
            mensajeFinal.textContent = data.error || 'Error al actualizar';
        }
    } catch (err) {
        mensajeFinal.style.color = 'red';
        mensajeFinal.textContent = 'Error de conexión';
    }
});

// 4. Lógica de volver
document.getElementById('btnVolverEventos').addEventListener('click', () => {
    window.location.href = '../eventos/index.html';
});

// ==========================================
// 5. LÓGICA DE FOTO DE PERFIL
// ==========================================
const imgPerfil = document.getElementById('perfilFoto');
const fotoUpload = document.getElementById('fotoUpload');
const fotoControles = document.getElementById('fotoControlesFlotantes');
const btnGuardarFoto = document.getElementById('btnGuardarFotoFlotante');
const btnCancelarFoto = document.getElementById('btnCancelarFotoFlotante');

let fotoOriginalSrc = '';
let nuevaFotoBase64 = null;

// 1. Al hacer clic en la foto, abrimos el selector de archivos
imgPerfil.addEventListener('click', () => {
    // Solo lo abrimos si no hay cambios pendientes de guardar
    if (!fotoControles.classList.contains('active')) {
        fotoUpload.click();
    }
});

// 2. Cuando el usuario selecciona una imagen de su móvil/PC
fotoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validación de seguridad (máx 2MB para no saturar tu base de datos)
    if (file.size > 2 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Por favor, elige una de menos de 2MB.');
        fotoUpload.value = '';
        return;
    }

    // Leemos la imagen y la convertimos a Base64
    const reader = new FileReader();
    reader.onload = (event) => {
        if (!fotoOriginalSrc) fotoOriginalSrc = imgPerfil.src; // Guardamos la foto anterior por si cancela
        nuevaFotoBase64 = event.target.result;
        
        // Previsualizamos la foto y mostramos los botones flotantes
        imgPerfil.src = nuevaFotoBase64;
        fotoControles.classList.add('active');
    };
    reader.readAsDataURL(file);
});

// 3. Botón "X" (Cancelar)
btnCancelarFoto.addEventListener('click', () => {
    imgPerfil.src = fotoOriginalSrc; // Restauramos la imagen anterior
    nuevaFotoBase64 = null;
    fotoControles.classList.remove('active');
    fotoUpload.value = ''; // Limpiamos el input
});

// 4. Botón "Guardar"
btnGuardarFoto.addEventListener('click', async () => {
    if (!nuevaFotoBase64) return;

    // Estado de carga en el botón
    btnGuardarFoto.disabled = true;
    btnGuardarFoto.textContent = '...';

    try {
        const res = await fetch(`${API_BASE}/usuario/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ foto: nuevaFotoBase64 }) // Enviamos la foto al servidor
        });

        if (res.ok) {
            fotoOriginalSrc = nuevaFotoBase64; // Si va bien, esta es la nueva foto oficial
            fotoControles.classList.remove('active');
            
            mensajeFinal.style.color = '#5dff8f';
            mensajeFinal.textContent = 'Foto actualizada con éxito';
            setTimeout(() => mensajeFinal.textContent = '', 3000);
        } else {
            const data = await res.json();
            mensajeFinal.style.color = 'red';
            mensajeFinal.textContent = data.error || 'Error al guardar la foto';
        }
    } catch (err) {
        mensajeFinal.style.color = 'red';
        mensajeFinal.textContent = 'Error de conexión al subir la foto';
    } finally {
        // Restauramos el botón
        btnGuardarFoto.disabled = false;
        btnGuardarFoto.textContent = 'Guardar';
        fotoUpload.value = '';
    }
});