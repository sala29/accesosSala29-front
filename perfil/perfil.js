const API_BASE = "https://accesossala29-8vdj.onrender.com";
const userId = localStorage.getItem('userId');
const token = localStorage.getItem('token');
const mensajeFinalPerfil = document.getElementById('mensajeFinalPerfil');
const editarContainer = document.getElementById('editarContainer');
let campoActual = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!token || !userId) return window.location.href = '../login/index.html';

    try {
        const res = await fetch(`${API_BASE}/usuario/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const u = await res.json();
            document.getElementById('nombreUsuario').innerText = u.nombre;
            document.getElementById('dniUsuario').innerText = u.dni;
            document.getElementById('emailUsuario').innerText = u.email;
            document.getElementById('telefonoUsuario').innerText = u.telefono || 'No indicado';
            if (u.foto) document.getElementById('fotoUsuario').src = u.foto;
        } else {
            window.location.href = '../login/index.html';
        }
    } catch (err) {
        mensajeFinalPerfil.style.color = 'red';
        mensajeFinalPerfil.innerText = 'Error al cargar los datos.';
    }
});

// Lógica idéntica de tu usuarios.js original
document.querySelectorAll('.editar-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        campoActual = link.dataset.campo;
        
        if (campoActual === 'foto') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (ev) => {
                const file = ev.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const base64 = event.target.result;
                    document.getElementById('fotoUsuario').src = base64;
                    await guardarCambio('foto', base64);
                };
                reader.readAsDataURL(file);
            };
            input.click();
            return;
        }

        const valorActual = document.getElementById(campoActual + 'Usuario').innerText;
        editarContainer.style.display = 'flex';
        editarContainer.innerHTML = `
            <input type="text" id="inputEditar" value="${valorActual === 'No indicado' ? '' : valorActual}" placeholder="Nuevo ${campoActual}">
            <div class="editar-btns">
                <button class="secondary" id="btnCancelarEdicion">Cancelar</button>
                <button class="primary" id="btnGuardarEdicion">Guardar</button>
            </div>
        `;

        document.getElementById('btnCancelarEdicion').onclick = () => {
            editarContainer.style.display = 'none';
        };

        document.getElementById('btnGuardarEdicion').onclick = () => {
            const nuevoValor = document.getElementById('inputEditar').value.trim();
            if (!nuevoValor) return alert('El valor no puede estar vacío');
            guardarCambio(campoActual, nuevoValor);
        };
    });
});

async function guardarCambio(campo, valor) {
    try {
        const res = await fetch(`${API_BASE}/usuario/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ [campo]: valor })
        });
        
        if (res.ok) {
            if (campo !== 'foto') document.getElementById(campo + 'Usuario').innerText = valor;
            editarContainer.style.display = 'none';
            mensajeFinalPerfil.style.color = '#5dff8f';
            mensajeFinalPerfil.innerText = 'Actualizado con éxito';
            setTimeout(() => mensajeFinalPerfil.innerText = '', 3000);
        } else {
            mensajeFinalPerfil.style.color = 'red';
            mensajeFinalPerfil.innerText = 'Error al actualizar';
        }
    } catch {
        mensajeFinalPerfil.style.color = 'red';
        mensajeFinalPerfil.innerText = 'Error de conexión';
    }
}

document.getElementById('volverInicioPerfil').addEventListener('click', () => {
    window.location.href = '../eventos/index.html';
});