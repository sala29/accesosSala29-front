const token = localStorage.getItem('token');
const API_BASE = "https://accesossala29.onrender.com";


if (!token) {
    alert('No estás logueado');
    window.location.href = 'index.html';
}

// Cerrar sesión
document.getElementById('cerrarSesion').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '../index.html';
});

// Cargar usuarios
async function cargarUsuarios() {
    const tbody = document.querySelector('#tablaUsuarios tbody');
    tbody.innerHTML = '';

    try {
        const res = await fetch('${API_BASE}/usuarios', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        
        if (!res.ok) {
            throw new Error(await res.text());
        }
        
        const usuarios = await res.json();

        usuarios.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.nombre}</td>
                <td>${user.email}</td>
                <td>${user.dni}</td>
                <td>${user.telefono || ''}</td>
                <td>${user.verificado ? 'Sí' : 'No'}</td>
                <td>${user.bloqueado ? 'Sí' : 'No'}</td>
                <td>
                    ${!user.verificado ? `<button onclick="verificar(${user.id})">Verificar</button>` : ''}
                    ${user.bloqueado ? `<button onclick="desbloquear(${user.id})">Desbloquear</button>` : `<button onclick="bloquear(${user.id})">Bloquear</button>`}
                    <button onclick="editarUsuario(${user.id})">Editar</button>
                    <button onclick="eliminarUsuario(${user.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        alert('Error al cargar usuarios');
    }
}

// Funciones usuario
async function verificar(id) {
    await fetch(`${API_BASE}/usuario/${id}/verificar`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    cargarUsuarios();
}

async function bloquear(id) {
    await fetch(`${API_BASE}/usuarios/${id}/bloquear`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    cargarUsuarios();
}

async function desbloquear(id) {
    await fetch(`${API_BASE}/usuarios/${id}/desbloquear`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    cargarUsuarios();
}

async function eliminarUsuario(id) {
    if(!confirm('¿Seguro que quieres eliminar este usuario?')) return;
    await fetch(`${API_BASE}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    cargarUsuarios();
}

// EDITAR USUARIO (modal completo)
function editarUsuario(id) {
    fetch(`${API_BASE}/usuario/${id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(u => {
        document.getElementById('userId').value = u.id;
        document.getElementById('nombre').value = u.nombre || '';
        document.getElementById('email').value = u.email || '';
        document.getElementById('dni').value = u.dni || '';
        document.getElementById('telefono').value = u.telefono || '';
        document.getElementById('fotoURL').value = u.foto || '';
        document.getElementById('fotoFile').value = '';
        document.getElementById('fotoPreview').src = u.foto || '';
        document.getElementById('editarUsuarioModal').style.display = 'flex';
    })
    .catch(err => { console.error(err); alert('Error al cargar usuario'); });
}

// Previsualizar foto cuando se sube archivo o cambia URL
document.getElementById('fotoFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(ev){
            document.getElementById('fotoPreview').src = ev.target.result;
        };
        reader.readAsDataURL(file);
        document.getElementById('fotoURL').value = '';
    }
});

document.getElementById('fotoURL').addEventListener('input', e => {
    document.getElementById('fotoPreview').src = e.target.value;
    document.getElementById('fotoFile').value = '';
});

// Cancelar
document.getElementById('cancelarEditar').addEventListener('click', () => {
    document.getElementById('editarUsuarioModal').style.display = 'none';
});

// Guardar cambios
document.getElementById('formEditarUsuario').addEventListener('submit', async e => {
    e.preventDefault();

    const id = document.getElementById('userId').value;
    const body = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        dni: document.getElementById('dni').value,
        telefono: document.getElementById('telefono').value
    };

    const fileInput = document.getElementById('fotoFile');
    const urlInput = document.getElementById('fotoURL');

    if(fileInput.files.length > 0){
        const reader = new FileReader();
        reader.onload = async function(e){
            body.foto = e.target.result;
            await enviarActualizacion(id, body);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        if(urlInput.value) body.foto = urlInput.value;
        await enviarActualizacion(id, body);
    }
});

async function enviarActualizacion(id, body){
    try {
        const res = await fetch(`${API_BASE}/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(body)
        });
        const r = await res.json();
        alert(r.mensaje || r.error);
        document.getElementById('editarUsuarioModal').style.display = 'none';
        cargarUsuarios();
    } catch (err) {
        console.error(err);
        alert('Error al actualizar usuario');
    }
}

// EVENTOS
async function cargarEventos() {
    const tbody = document.querySelector('#tablaEventos tbody');
    tbody.innerHTML = '';

    try {
        const res = await fetch('${API_BASE}/eventos', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const eventos = await res.json();

        eventos.forEach(evento => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${evento.id}</td>
                <td>${evento.nombre}</td>
                <td>${evento.activo ? 'Sí' : 'No'}</td>
                <td>
                    ${evento.activo ? `<button onclick="desactivarEvento(${evento.id})">Desactivar</button>` : `<button onclick="activarEvento(${evento.id})">Activar</button>`}
                    <button onclick="eliminarEvento(${evento.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        alert('Error al cargar eventos');
    }
}

async function activarEvento(id){
    await fetch(`${API_BASE}/eventos/${id}/activar`, {
        method:'POST',
        headers:{ 'Authorization':'Bearer '+token }
    });
    cargarEventos();
}

async function desactivarEvento(id){
    await fetch(`${API_BASE}/eventos/${id}/desactivar`, {
        method:'POST',
        headers:{ 'Authorization':'Bearer '+token }
    });
    cargarEventos();
}

async function eliminarEvento(id){
    if(!confirm('¿Seguro que quieres eliminar este evento?')) return;
    await fetch(`${API_BASE}/eventos/${id}`, {
        method:'DELETE',
        headers:{ 'Authorization':'Bearer '+token }
    });
    cargarEventos();
}

// ---------------- WIDGETS ----------------

// Abrir widget de eventos de un usuario
async function verEventosUsuario(userId){
    try {
        const res = await fetch(`${API_BASE}/usuarios/${userId}/accesos`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const eventos = await res.json();

        const tbody = document.querySelector('#userEventsWidget tbody');
        tbody.innerHTML = '';
        eventos.forEach(ev => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${ev.eventId}</td>
                <td>${ev.nombre}</td>
                <td>${new Date(ev.fecha_creacion).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('userEventsWidget').style.display = 'flex';
    } catch(err){
        console.error(err);
        alert('Error al cargar eventos del usuario');
    }
}

// Abrir widget de asistentes de un evento
async function verAsistentesEvento(eventId){
    try {
        const res = await fetch(`${API_BASE}/eventos/${eventId}/accesos`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const users = await res.json();

        const tbody = document.querySelector('#eventUsersWidget tbody');
        tbody.innerHTML = '';
        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.userId}</td>
                <td>${u.nombre}</td>
                <td>${u.dni}</td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('eventUsersWidget').style.display = 'flex';
    } catch(err){
        console.error(err);
        alert('Error al cargar asistentes del evento');
    }
}

// Cerrar cualquier widget
function cerrarWidget(widgetId){
    document.getElementById(widgetId).style.display = 'none';
}

// ---------------- Añadir botones a tablas ----------------
function agregarBotonesExtrasUsuarios(){
    const rows = document.querySelectorAll('#tablaUsuarios tbody tr');
    rows.forEach(row => {
        const userId = row.children[0].textContent;
        const acciones = row.children[7];
        const btn = document.createElement('button');
        btn.textContent = 'Ver eventos';
        btn.className = 'btn small ghost';
        btn.onclick = () => verEventosUsuario(userId);
        acciones.appendChild(btn);
    });
}

function agregarBotonesExtrasEventos(){
    const rows = document.querySelectorAll('#tablaEventos tbody tr');
    rows.forEach(row => {
        const eventId = row.children[0].textContent;
        const acciones = row.children[3];
        const btn = document.createElement('button');
        btn.textContent = 'Ver asistentes';
        btn.className = 'btn small ghost';
        btn.onclick = () => verAsistentesEvento(eventId);
        acciones.appendChild(btn);
    });
}

async function crearCA() {
    const usuario = document.getElementById('nuevoCaUsuario').value.trim();
    const password = document.getElementById('nuevoCaPassword').value.trim();

    if (!usuario || !password) {
        alert('Usuario y contraseña obligatorios');
        return;
    }

    try {
        const res = await fetch('${API_BASE}/registro-ca', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token // admin obligatorio
            },
            body: JSON.stringify({ usuario, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Error al crear CA');
            return;
        }

        cerrarModalCrearCA();
        cargarCA(); // refresca solo la tabla de CA

        alert(`CA "${data.usuario}" creado correctamente`);
    } catch (err) {
        console.error(err);
        alert('Error de conexión con el servidor');
    }
}


async function cargarCA() {
    const tbody = document.querySelector('#tablaCA tbody');
    tbody.innerHTML = '';

    try {
        const res = await fetch('${API_BASE}/ca', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const cas = await res.json();

        cas.forEach(ca => {
            const activo = Number(ca.activo);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${ca.id}</td>
                <td>${ca.usuario}</td>
                <td class="${ca.activo ? 'estado-verde' : 'estado-rojo'}">
                    ${ca.activo ? 'Activo' : 'Inactivo'}
                </td>
                <td>${new Date(ca.creado_en).toLocaleDateString()}</td>
                <td>
                    ${
                        ca.activo
                            ? `<button onclick="desactivarCA(${ca.id})">Desactivar</button>`
                            : `<button onclick="activarCA(${ca.id})">Activar</button>`
                    }
                    <button onclick="abrirModalPasswordCa(${ca.id})">
                        Cambiar contraseña
                    </button>
                    <button class="eliminar" onclick="eliminarCA(${ca.id})">
                        Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        alert('Error al cargar CA');
    }
}

async function activarCA(id) {
    await fetch(`${API_BASE}/ca/${id}/activar`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    cargarCA();
}

async function desactivarCA(id) {
    await fetch(`${API_BASE}/ca/${id}/desactivar`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    cargarCA();
}

async function eliminarCA(id) {
    if (!confirm('¿Eliminar definitivamente este CA?')) return;

    await fetch(`${API_BASE}/ca/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    cargarCA();
}

function abrirModalPasswordCa(id) {
    document.getElementById('caPasswordId').value = id;
    document.getElementById('caNewPassword').value = '';
    document.getElementById('passwordCaModal').style.display = 'flex';
}

function cerrarModalPasswordCa() {
    document.getElementById('passwordCaModal').style.display = 'none';
}

document.getElementById('guardarPasswordCa').addEventListener('click', async () => {
    const id = document.getElementById('caPasswordId').value;
    const password = document.getElementById('caNewPassword').value;

    if (!password) return alert('Introduce una contraseña');

    await fetch(`${API_BASE}/ca/${id}/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ password })
    });

    cerrarModalPasswordCa();
    cargarCA();
});

function abrirModalCrearCA() {
    document.getElementById('nuevoCaUsuario').value = '';
    document.getElementById('nuevoCaPassword').value = '';
    document.getElementById('crearCaModal').style.display = 'flex';
}

function cerrarModalCrearCA() {
    document.getElementById('crearCaModal').style.display = 'none';
}

/* **************************************
    ADMINS
******************************************  */
async function cargarAdmins(){
    const tbody = document.querySelector('#tablaAdmins tbody');
    tbody.innerHTML='';

    const res = await fetch('${API_BASE}/admins',{
        headers:{ 'Authorization':'Bearer '+token }
    });
    const admins = await res.json();

    admins.forEach(a=>{
        const activo = Number(a.activo);
        const tr = document.createElement('tr');
        tr.innerHTML=`
            <td>${a.id}</td>
            <td>${a.usuario}</td>
            <td class="${activo?'estado-verde':'estado-rojo'}">
                ${activo?'Activo':'Inactivo'}
            </td>
            <td>${new Date(a.creado_en).toLocaleDateString()}</td>
            <td>
                ${
                    activo
                        ? `<button onclick="desactivarAdmin(${a.id})">Desactivar</button>`
                        : `<button onclick="activarAdmin(${a.id})">Activar</button>`
                }
                <button onclick="abrirModalPasswordAdmin(${a.id})">Cambiar contraseña</button>
                <button class="eliminar" onclick="eliminarAdmin(${a.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function abrirModalCrearAdmin(){
    document.getElementById('crearAdminModal').style.display='flex';
}

function cerrarModalCrearAdmin(){
    document.getElementById('crearAdminModal').style.display='none';
    document.getElementById('adminUsuario').value='';
    document.getElementById('adminPassword').value='';
}

function abrirModalPasswordAdmin(id){
    document.getElementById('adminPasswordId').value=id;
    document.getElementById('adminNuevaPassword').value='';
    document.getElementById('passwordAdminModal').style.display='flex';
}

function cerrarModalPasswordAdmin(){
    document.getElementById('passwordAdminModal').style.display='none';
}

async function crearAdmin(){
    const usuario = adminUsuario.value.trim();
    const password = adminPassword.value.trim();
    if(!usuario || !password) return alert('Datos obligatorios');

    const res = await fetch('${API_BASE}/registro-admin',{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            'Authorization':'Bearer '+token
        },
        body:JSON.stringify({ usuario, password })
    });

    const data = await res.json();
    if(!res.ok) return alert(data.error);

    cerrarModalCrearAdmin();
    cargarAdmins();
}

async function activarAdmin(id){
    await fetch(`/admins/${id}/activar`,{
        method:'POST',
        headers:{ Authorization:'Bearer '+token }
    });
    cargarAdmins();
}

async function desactivarAdmin(id){
    await fetch(`/admins/${id}/desactivar`,{
        method:'POST',
        headers:{ Authorization:'Bearer '+token }
    });
    cargarAdmins();
}

async function eliminarAdmin(id){
    if(!confirm('¿Eliminar administrador?')) return;
    await fetch(`/admins/${id}`,{
        method:'DELETE',
        headers:{ Authorization:'Bearer '+token }
    });
    cargarAdmins();
}

async function guardarPasswordAdmin(){
    const id = adminPasswordId.value;
    const password = adminNuevaPassword.value;
    if(!password) return alert('Contraseña obligatoria');

    await fetch(`/admins/${id}/password`,{
        method:'PUT',
        headers:{
            'Content-Type':'application/json',
            'Authorization':'Bearer '+token
        },
        body:JSON.stringify({ password })
    });

    cerrarModalPasswordAdmin();
    cargarAdmins();
}



// Re-agregar botones extra después de cargar tablas
const observerUsuarios = new MutationObserver(agregarBotonesExtrasUsuarios);
observerUsuarios.observe(document.querySelector('#tablaUsuarios tbody'), { childList:true });

const observerEventos = new MutationObserver(agregarBotonesExtrasEventos);
observerEventos.observe(document.querySelector('#tablaEventos tbody'), { childList:true });


// Inicial
cargarUsuarios();
cargarEventos();
cargarCA();
cargarAdmins();