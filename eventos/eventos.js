// 1. Configuración de las credenciales
const SUPABASE_URL = 'https://mzkibvrmdegbtvpnzcvr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16a2lidnJtZGVnYnR2cG56Y3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjA0NzAsImV4cCI6MjA4NzMzNjQ3MH0.eudQq75zR-ZecHz5ay9nD8K9cv6NT4-C2jQTiYRlmD4';

// 2. Inicializar el cliente de Supabase (el script del CDN ya nos da el objeto 'supabase')
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const eventsGrid = document.getElementById('events-grid');

// --- LÓGICA DE AUTENTICACIÓN Y MENÚ ---
const API_BASE_USERS = "https://accesossala29-8vdj.onrender.com";
const authNav = document.getElementById('auth-nav');

async function initAuth() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // 1. Si no hay token, mostramos botón de Login y MOSTRAMOS BANNERS
    if (!token || !userId) {
        renderLoginButton();
        toggleBanners(false); 
        return;
    }

    try {
        const res = await fetch(`${API_BASE_USERS}/usuario/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const userData = await res.json();
            const primerNombre = userData.nombre.split(' ')[0];
            
            renderUserMenu(primerNombre);
            toggleBanners(true); // 

        } else {
            console.warn("Sesión inválida o caducada. Código:", res.status);
            cerrarSesionLocal(); 
            // Al cerrar sesión se recarga la web y volverá a entrar por el "if (!token)", mostrando los banners.
        }
    } catch (err) {
        console.error("Error al verificar usuario:", err);
        renderUserMenu("Socio");
        toggleBanners(true); 
    }
}

function renderLoginButton() {
    authNav.innerHTML = `
        <a href="../login/index.html" class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 20px;">Iniciar sesión</a>
    `;
}

function renderUserMenu(nombre) {
    authNav.innerHTML = `
        <div class="user-menu-container">
            <button class="user-dropdown-btn" id="btnUserDropdown">
                Hola, ${nombre} <span style="font-size: 0.7em;">▼</span>
            </button>
            <div class="dropdown-menu" id="userDropdownMenu">
                <a href="#" class="dropdown-item">🎫 Ver QR acceso</a>
                <a href="#" class="dropdown-item">✏️ Editar datos</a>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" id="btnLogout" style="color: #ff4d4d;">🚪 Cerrar sesión</button>
            </div>
        </div>
    `;

    // Lógica para abrir/cerrar el desplegable
    const btnDropdown = document.getElementById('btnUserDropdown');
    const menu = document.getElementById('userDropdownMenu');

    btnDropdown.onclick = (e) => {
        e.stopPropagation(); // Evita que se cierre instantáneamente
        menu.classList.toggle('show');
    };

    // Cerrar al hacer clic en cualquier otro sitio de la pantalla
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== btnDropdown) {
            menu.classList.remove('show');
        }
    });

    // Acción de cerrar sesión
    document.getElementById('btnLogout').onclick = () => {
        cerrarSesionLocal();
    };
}

// NUEVA FUNCIÓN: Ocultar o mostrar los banners de registro
function toggleBanners(isLogged) {
    // Buscamos todos los elementos que tengan la clase .register-banner
    const banners = document.querySelectorAll('.register-banner');
    
    banners.forEach(banner => {
        // Si está logueado, lo ocultamos ('none'). Si no, lo mostramos ('flex')
        banner.style.display = isLogged ? 'none' : 'flex';
        
        // El banner de abajo está dentro de un div contenedor para centrarlo.
        // Si no ocultamos también ese div padre, se quedará un margen en blanco feo abajo.
        if (banner.parentElement && banner.parentElement.style.maxWidth === '1100px') {
            banner.parentElement.style.display = isLogged ? 'none' : 'block';
        }
    });
}

function cerrarSesionLocal() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.reload(); // Recarga la página para mostrar el botón de Iniciar sesión
}

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
    if (document.visibilityState === 'visible') {
        initAuth();    // Comprobamos si la sesión sigue activa
        fetchEvents(); // Recargamos los eventos por si hay novedades
    }
});

// Ejecución inicial cuando el HTML ha terminado de cargar
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    fetchEvents();
});