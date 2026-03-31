// 1. Configuración de las credenciales
const SUPABASE_URL = 'https://mzkibvrmdegbtvpnzcvr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16a2lidnJtZGVnYnR2cG56Y3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjA0NzAsImV4cCI6MjA4NzMzNjQ3MH0.eudQq75zR-ZecHz5ay9nD8K9cv6NT4-C2jQTiYRlmD4';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- PROTECCIÓN DE RUTA ---
async function checkAuth() {
    const { data: { session } } = await _supabase.auth.getSession();
    const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/admin/');
    
    if (!session && !isLoginPage) {
        window.location.href = 'index.html';
    } else if (session && isLoginPage) {
        window.location.href = 'dashboard.html';
    } else if (session) {
        const checkDiv = document.getElementById('checking-session');
        const contentDiv = document.getElementById('admin-content');
        if (checkDiv) checkDiv.style.display = 'none';
        if (contentDiv) contentDiv.style.display = 'block';
    }
}

// --- DASHBOARD: LISTAR EVENTOS ---
async function loadAdminEvents() {
    const listContainer = document.getElementById('admin-events-list');
    if (!listContainer) return;

    const { data: events } = await _supabase
        .from('events')
        .select('*, event_signups(count)')
        .order('date', { ascending: true });

    if (!events || events.length === 0) {
        listContainer.innerHTML = '<p style="color: #9cc8f0; text-align: center; margin-top: 60px;">No hay eventos todavía.</p>';
        return;
    }

    listContainer.innerHTML = events.map(event => `
        <div class="admin-event-card">
            <div class="admin-event-info">
                <h3>${event.title}</h3>
                <p class="date">📅 ${new Date(event.date).toLocaleString('es-ES')}</p>
                <p class="count">👥 ${event.event_signups?.[0]?.count ?? 0} asistentes</p>
            </div>
            <div class="admin-event-actions">
                <a href="editar.html?id=${event.id}" class="btn btn-secondary btn-sm">Editar</a>
                <button onclick="handleDelete('${event.id}')" class="btn btn-danger btn-sm">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// --- ACCIONES ---
async function handleDelete(id) {
    if (!confirm('¿Seguro?')) return;
    await _supabase.from('events').delete().eq('id', id);
    loadAdminEvents();
}

async function handleLogout() {
    await _supabase.auth.signOut();
    window.location.href = '../index.html';
}

// Función para manejar la subida de fotos a Supabase Storage
async function setupPhotoUploader() {
    const fileInput = document.getElementById('file-input');
    const photoPreview = document.getElementById('photo-preview');
    const photoUrlHidden = document.getElementById('photo-url-hidden');
    const statusText = document.getElementById('upload-status');

    if (!fileInput) return;

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        statusText.innerText = 'Subiendo...';
        
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}.${ext}`;

        // 1. Subir a Storage
        const { error } = await _supabase.storage
            .from('eventos-fotos')
            .upload(fileName, file);

        if (error) {
            alert('Error al subir la foto: ' + error.message);
            statusText.innerText = '📷 Reintentar subida';
            return;
        }

        // 2. Obtener URL pública
        const { data } = _supabase.storage
            .from('eventos-fotos')
            .getPublicUrl(fileName);

        // 3. Actualizar UI
        photoUrlHidden.value = data.publicUrl;
        photoPreview.src = data.publicUrl;
        photoPreview.style.display = 'block';
        statusText.innerText = '📷 Cambiar foto';
    });
}

// Llama a esta función cuando se cargue la página de nuevo/editar
if (window.location.pathname.includes('nuevo') || window.location.pathname.includes('editar')) {
    setupPhotoUploader();
}

// Inicialización automática al cargar
checkAuth().then(() => {
    if (window.location.pathname.includes('dashboard.html')) {
        loadAdminEvents();
    }
});

/* =======================================================
   CARGAR EVENTOS EN EL DASHBOARD
   ======================================================= */
async function loadDashboardEvents() {
    const eventsList = document.getElementById('admin-events-list');
    
    // Si no estamos en la página del dashboard, no hacemos nada
    if (!eventsList) return; 

    eventsList.innerHTML = '<p>Cargando eventos...</p>';

    // Pedimos los eventos a Supabase
    const { data: events, error } = await _supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

    if (error) {
        eventsList.innerHTML = '<p style="color:#ff4d4d;">Error al cargar los eventos desde la base de datos.</p>';
        return;
    }

    if (!events || events.length === 0) {
        eventsList.innerHTML = '<p>No hay eventos creados todavía.</p>';
        return;
    }

    // Dibujamos cada evento con su botón de Editar y Borrar
    eventsList.innerHTML = events.map(event => {
        const dateObj = new Date(event.date);
        const dateStr = dateObj.toLocaleDateString('es-ES') + ' a las ' + dateObj.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
        
        return `
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h3 style="margin: 0 0 5px 0; color: #2aa3ff;">${event.title}</h3>
                    <p style="margin: 0; font-size: 0.9em; color: #ccc;">📅 ${dateStr} | 💰 ${event.price === 0 ? 'Gratis' : event.price + ' €'}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <a href="editar.html?id=${event.id}" class="btn btn-secondary btn-sm" style="padding: 8px 16px; font-size: 0.9em; border-radius: 8px;">✏️ Editar</a>
                    <button onclick="deleteEvent('${event.id}')" style="padding: 8px 16px; font-size: 0.9em; background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid #ff4d4d; border-radius: 8px; cursor: pointer; transition: 0.3s;">🗑️ Borrar</button>
                </div>
            </div>
        `;
    }).join('');
}

// Función para borrar un evento
window.deleteEvent = async function(id) {
    if (!confirm('¿Estás seguro de que quieres borrar este evento para siempre?')) return;
    
    const { error } = await _supabase.from('events').delete().eq('id', id);
    
    if (error) {
        alert('Error al borrar el evento: ' + error.message);
    } else {
        // Si se borra bien, recargamos la lista
        loadDashboardEvents(); 
    }
};

/* =======================================================
   EJECUCIÓN AL CARGAR LA PÁGINA
   ======================================================= */
// Asegurarnos de que checkAuth termine y luego cargar los eventos si estamos en el dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Si tienes una función checkAuth(), asegúrate de que se ejecuta aquí
    if (typeof checkAuth === 'function') {
        await checkAuth();
    }
    
    // Cargamos los eventos (solo hará efecto si existe el div admin-events-list)
    loadDashboardEvents();
});