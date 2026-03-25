const SUPABASE_URL = 'TU_URL_DE_SUPABASE';
const SUPABASE_KEY = 'TU_ANON_KEY';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Obtener ID de la URL (?id=...)
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

async function fetchEventDetail() {
    if (!eventId) {
        window.location.href = 'index.html';
        return;
    }

    const { data: event, error } = await _supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (error || !event) {
        console.error("Error al cargar el evento:", error);
        return;
    }

    renderDetail(event);
}

function renderDetail(event) {
    // Ocultar loading, mostrar contenido
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('event-content').style.display = 'block';

    // Rellenar datos básicos
    document.getElementById('event-title').innerText = event.title;
    document.getElementById('event-desc').innerText = event.description || '';
    
    // Imagen
    if (event.photo_url) {
        document.getElementById('event-image-container').innerHTML = 
            `<img src="${event.photo_url}" alt="${event.title}" class="detail-img">`;
    }

    // Fecha
    const dateFormatted = new Date(event.date).toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    document.getElementById('event-date').innerText = `📅 ${dateFormatted}`;

    // Precio
    document.getElementById('event-price').innerText = 
        event.price === 0 ? 'Entrada gratuita' : `Donación ${event.price} €`;

    // Lógica del formulario de registro
    const signupBox = document.getElementById('signup-box-content');
    const eventoTerminado = new Date(event.date) < new Date();

    if (eventoTerminado) {
        signupBox.innerHTML = `<p class="event-closed">Este evento ya ha comenzado. No es posible apuntarse.</p>`;
    } else {
        signupBox.innerHTML = `
            <h2>Apuntarse a la lista</h2>
            <form id="signup-form">
                <input type="text" id="dni-input" placeholder="DNI (ej: 12345678A)" required />
                <button type="submit" id="btn-submit" class="btn btn-primary" style="width: 100%">Apuntarme</button>
            </form>
            <div id="mensaje-container"></div>
        `;

        document.getElementById('signup-form').addEventListener('submit', handleSignup);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const dniInput = document.getElementById('dni-input');
    const btn = document.getElementById('btn-submit');
    const msgContainer = document.getElementById('mensaje-container');
    
    const dniLimpio = dniInput.value.trim().toUpperCase();
    const dniRegex = /^\d{8}[A-Z]$/;

    // Limpiar mensajes previos
    msgContainer.innerHTML = '';

    if (!dniRegex.test(dniLimpio)) {
        showMensaje('DNI no válido. Formato: 8 números y una letra.', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerText = 'Enviando...';

    const { error } = await _supabase
        .from('event_signups')
        .insert({ event_id: eventId, dni: dniLimpio });

    if (error) {
        if (error.code === '23505') {
            showMensaje('Este DNI ya está apuntado a este evento.', 'error');
        } else {
            showMensaje('Error al apuntarse. Inténtalo de nuevo.', 'error');
        }
    } else {
        showMensaje('✅ ¡Apuntado correctamente!', 'ok');
        dniInput.value = '';
    }

    btn.disabled = false;
    btn.innerText = 'Apuntarme';
}

function showMensaje(texto, tipo) {
    const msgContainer = document.getElementById('mensaje-container');
    const clase = tipo === 'ok' ? 'signup-msg-ok' : 'signup-msg-error';
    msgContainer.innerHTML = `<p class="${clase}">${texto}</p>`;
}

// Inicializar
fetchEventDetail();

// Recargar al volver a la pestaña
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') fetchEventDetail();
});