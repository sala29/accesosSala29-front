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
if (window.location.pathname.includes('nuevo.html') || window.location.pathname.includes('editar.html')) {
    setupPhotoUploader();
}

// Inicialización automática al cargar
checkAuth().then(() => {
    if (window.location.pathname.includes('dashboard.html')) {
        loadAdminEvents();
    }
});

