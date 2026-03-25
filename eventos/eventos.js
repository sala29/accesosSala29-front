// 1. Configuración de las credenciales
const SUPABASE_URL = 'https://mzkibvrmdegbtvpnzcvr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16a2lidnJtZGVnYnR2cG56Y3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjA0NzAsImV4cCI6MjA4NzMzNjQ3MH0.eudQq75zR-ZecHz5ay9nD8K9cv6NT4-C2jQTiYRlmD4';

// 2. Inicializar el cliente de Supabase (el script del CDN ya nos da el objeto 'supabase')
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const eventsGrid = document.getElementById('events-grid');

// 3. Función principal para obtener datos
async function fetchEvents() {
    try {
        const { data: events, error } = await _supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;

        renderEvents(events);
    } catch (err) {
        console.error('Error cargando eventos:', err);
        eventsGrid.innerHTML = '<p class="error">Error al conectar con la base de datos.</p>';
    }
}

// 4. Función para "pintar" el HTML (Sustituye al .map de React)
function renderEvents(events) {
    if (!events || events.length === 0) {
        eventsGrid.innerHTML = '<div class="empty-state">No hay eventos próximos por ahora.</div>';
        return;
    }

    eventsGrid.innerHTML = events.map(event => {
        // Formateo de fecha idéntico al que tenías en TSX
        const dateFormatted = new Date(event.date).toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
            timeZone: 'Europe/Madrid'
        });

        return `
            <a href="/eventos/detalle.html?id=${event.id}" class="event-card">
                ${event.photo_url 
                    ? `<img src="${event.photo_url}" alt="${event.title}" class="event-card-img">` 
                    : `<div class="event-card-no-img">🎸</div>`
                }
                <div class="event-card-body">
                    <div class="event-card-title">${event.title}</div>
                    <div class="event-card-date">📅 ${dateFormatted}</div>
                    <div class="event-card-desc">${event.description}</div>
                    <div class="event-card-price">
                        ${event.price === 0 ? 'Entrada gratuita' : `Donación ${event.price} €`}
                    </div>
                </div>
            </a>
        `;
    }).join('');
}

// 5. Detectar cuando el usuario vuelve a la pestaña (Visibility Change)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') fetchEvents();
});

// Ejecución inicial
fetchEvents();