// 1. Configuración de las credenciales
const SUPABASE_URL = 'https://mzkibvrmdegbtvpnzcvr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16a2lidnJtZGVnYnR2cG56Y3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjA0NzAsImV4cCI6MjA4NzMzNjQ3MH0.eudQq75zR-ZecHz5ay9nD8K9cv6NT4-C2jQTiYRlmD4';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- PROTECCIÓN DE RUTA ---
async function checkAuth() {
    const { data: { session } } = await _supabase.auth.getSession();
    const path = window.location.pathname;
    const isLoginPage = path.includes('index.html') || path.endsWith('/admin/');
    
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

    // Traemos eventos y asistentes (usando el nombre exacto de tu tabla de relación)
    const { data: events, error } = await _supabase
        .from('events')
        .select('*, asistentes_eventos(user_id)') 
        .order('date', { ascending: true });

    if (error) {
        listContainer.innerHTML = `<p style="color: #ff4d4d;">Error al cargar eventos: ${error.message}</p>`;
        return;
    }

    const now = new Date();
    const futuros = events.filter(e => new Date(e.date) >= now);
    const pasados = events.filter(e => new Date(e.date) < now).reverse();

    let html = '<h3 style="margin-bottom: 20px;">📅 Próximos Eventos</h3>';
    html += renderSection(futuros);
    
    html += '<h3 style="margin-top: 40px; margin-bottom: 20px; opacity: 0.6;">⌛ Eventos Pasados</h3>';
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
        
        // Escapamos los IDs para evitar errores en el alert de JS
        const idsList = asistentes.map(a => a.user_id).join(', ');

        return `
            <div class="admin-event-card ${isPast ? 'event-past' : ''}" style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1);">
                
                <div style="margin-bottom: 18px;">
                    <h4 style="margin: 0 0 6px 0; font-size: 1.15rem; color: ${isPast ? '#999' : '#fff'};">${event.title}</h4>
                    <small style="color: #1a6cff; font-size: 0.95rem;">${dateFormatted}</small>
                </div>
                
                <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                    
                    <button onclick="alert('IDs de asistentes: ${count > 0 ? idsList : 'Nadie apuntado aún'}')" 
                            style="background: ${count > 0 ? '#5dff8f22' : 'transparent'}; color: ${count > 0 ? '#5dff8f' : '#666'}; border: 1px solid ${count > 0 ? '#5dff8f' : '#444'}; padding: 8px 16px; border-radius: 8px; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        👥 ${count} socio${count !== 1 ? 's' : ''}
                    </button>
                    
                    <a href="editar.html?id=${event.id}" class="btn btn-secondary btn-sm" style="padding: 8px 16px; font-size: 0.95rem; text-decoration: none; border-radius: 8px;">✏️ Editar</a>
                    
                    <button onclick="deleteEvent('${event.id}')" style="padding: 8px 16px; font-size: 0.95rem; background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid #ff4d4d; border-radius: 8px; cursor: pointer;">🗑️ Borrar</button>
                    
                </div>
            </div>
        `;
    }).join('');
}

// Función para borrar un evento
window.deleteEvent = async function(id) {
    if (!confirm('¿Estás seguro de que quieres borrar este evento? Se borrará también la lista de asistentes.')) return;
    
    // 1. Borrar asistentes primero para evitar errores de integridad (si no tienes cascada en Supabase)
    await _supabase.from('asistentes_eventos').delete().eq('event_id', id);
    
    // 2. Borrar el evento
    const { error } = await _supabase.from('events').delete().eq('id', id);
    
    if (error) {
        alert('Error al borrar: ' + error.message);
    } else {
        loadDashboardEvents();
    }
};

// --- GESTIÓN DE FOTOS ---
function initPhotoUploader() {
    const fileInput = document.getElementById('file-input');
    const photoPreview = document.getElementById('photo-preview');
    const photoUrlHidden = document.getElementById('photo-url-hidden');
    const statusText = document.getElementById('upload-status');

    if (!fileInput) return;

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const originalText = statusText.innerText;
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
        
        if (photoUrlHidden) photoUrlHidden.value = data.publicUrl;
        if (photoPreview) {
            photoPreview.src = data.publicUrl;
            photoPreview.style.display = 'block';
        }
        statusText.innerText = '📷 Cambiar foto';
    });
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    
    const path = window.location.pathname;
    
    if (path.includes('dashboard')) {
        loadDashboardEvents();
    }
    
    if (path.includes('nuevo') || path.includes('editar')) {
        initPhotoUploader();
    }
});