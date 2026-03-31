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

async function handleLogout() {
    await _supabase.auth.signOut();
    window.location.href = 'index.html';
}

// --- LÓGICA DEL DASHBOARD ---
async function loadDashboardEvents() {
    const listContainer = document.getElementById('admin-events-list');
    if (!listContainer) return;

    // Traemos eventos y también los user_id de la tabla de asistentes
    const { data: events, error } = await _supabase
        .from('events')
        .select('*, asistentes_eventos(user_id)') 
        .order('date', { ascending: true });

    if (error) {
        listContainer.innerHTML = '<p>Error al cargar eventos.</p>';
        return;
    }

    const now = new Date();
    const futuros = events.filter(e => new Date(e.date) >= now);
    const pasados = events.filter(e => new Date(e.date) < now).reverse(); // Los pasados más recientes primero

    let html = '<h3>📅 Próximos Eventos</h3>';
    html += renderSection(futuros);
    
    html += '<h3 style="margin-top: 40px; opacity: 0.6;">⌛ Eventos Pasados</h3>';
    html += renderSection(pasados, true);

    listContainer.innerHTML = html;
}

function renderSection(eventList, isPast = false) {
    if (eventList.length === 0) return '<p style="opacity:0.5; padding: 20px;">No hay eventos en esta sección.</p>';

    return eventList.map(event => {
        const dateFormatted = new Date(event.date).toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        const asistentes = event.asistentes_eventos || [];
        const count = asistentes.length;
        // Creamos una cadena con los IDs para el alert
        const idsString = asistentes.map(a => a.user_id).join('\\n');

        return `
            <div class="admin-event-card ${isPast ? 'event-past' : ''}" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4 style="margin: 0; color: ${isPast ? '#999' : '#fff'};">${event.title}</h4>
                        <small style="color: #1a6cff;">${dateFormatted}</small>
                    </div>
                    <div style="text-align: right;">
                        <button onclick="alert('IDs de asistentes:\\n${count > 0 ? idsString : 'Nadie apuntado aún'}')" 
                                style="background: ${count > 0 ? '#5dff8f22' : 'transparent'}; color: ${count > 0 ? '#5dff8f' : '#666'}; border: 1px solid ${count > 0 ? '#5dff8f' : '#444'}; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; cursor: pointer;">
                            👥 ${count} socio${count !== 1 ? 's' : ''} en lista
                        </button>
                    </div>
                </div>
                
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <a href="editar.html?id=${event.id}" class="btn btn-secondary btn-sm" style="padding: 6px 12px; font-size: 0.85em;">✏️ Editar</a>
                    <button onclick="deleteEvent('${event.id}')" style="padding: 6px 12px; font-size: 0.85em; background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid #ff4d4d; border-radius: 8px; cursor: pointer;">🗑️ Borrar</button>
                </div>
            </div>
        `;
    }).join('');
}

// Función para borrar un evento
window.deleteEvent = async function(id) {
    if (!confirm('¿Estás seguro de que quieres borrar este evento? Se borrará también la lista de asistentes.')) return;
    
    // Primero borramos los asistentes (por integridad de la base de datos)
    await _supabase.from('asistentes_eventos').delete().eq('event_id', id);
    // Luego el evento
    const { error } = await _supabase.from('events').delete().eq('id', id);
    
    if (error) alert('Error al borrar: ' + error.message);
    else loadDashboardEvents();
};

// --- GESTIÓN DE FOTOS (NUEVO/EDITAR) ---
function initPhotoUploader() {
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

        const { error } = await _supabase.storage.from('eventos-fotos').upload(fileName, file);
        if (error) {
            alert('Error al subir: ' + error.message);
            statusText.innerText = '📷 Reintentar';
            return;
        }

        const { data } = _supabase.storage.from('eventos-fotos').getPublicUrl(fileName);
        photoUrlHidden.value = data.publicUrl;
        photoPreview.src = data.publicUrl;
        photoPreview.style.display = 'block';
        statusText.innerText = '📷 Cambiar foto';
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboardEvents();
    }
    if (window.location.pathname.includes('nuevo.html') || window.location.pathname.includes('editar.html')) {
        initPhotoUploader();
    }
});