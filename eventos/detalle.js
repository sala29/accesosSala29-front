// 1. Configuración de credenciales y variables
const SUPABASE_URL = 'https://mzkibvrmdegbtvpnzcvr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16a2lidnJtZGVnYnR2cG56Y3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjA0NzAsImV4cCI6MjA4NzMzNjQ3MH0.eudQq75zR-ZecHz5ay9nD8K9cv6NT4-C2jQTiYRlmD4';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API_BASE_USERS = "https://accesossala29-8vdj.onrender.com";
const userId = localStorage.getItem('userId');
const token = localStorage.getItem('token');
let userData = null; // Guardaremos aquí los datos del usuario logueado
let currentEvent = null; // Guardamos el evento para poder usar sus datos en los mensajes

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

    currentEvent = event; // Guardamos el evento de forma global

    // Dibujar datos del evento
    document.getElementById('event-title').innerText = event.title;
    document.getElementById('event-desc').innerText = event.description || 'Sin descripción';
    document.getElementById('event-price').innerText = event.price === 0 ? 'Entrada gratuita' : `Donación ${event.price} €`;

    const dateFormatted = new Date(event.date).toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid'
    });
    document.getElementById('event-date').innerText = `📅 ${dateFormatted}`;

    const imgContainer = document.getElementById('event-image-container');
    if (event.photo_url) {
        imgContainer.innerHTML = `<img src="${event.photo_url}" alt="Foto" class="detail-img">`;
    }

    // Ocultar loader y mostrar contenido
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('event-content').style.display = 'block';

    // Ahora comprobamos la sesión para pintar los botones correctos
    await checkAuthAndRenderActions();
}

async function checkAuthAndRenderActions() {
    const container = document.getElementById('action-container');

    // 1. Si no hay sesión iniciada, mostramos el banner de registro
    if (!token || !userId) {
        container.innerHTML = `
            <div class="register-banner" style="display: flex;">
                <div class="register-banner-icon">🎫</div>
                <div class="register-banner-text">
                    <strong>¿Quieres apuntarte a este evento?</strong>
                    <span>Regístrate para poder acceder a Sala 29 el día del evento.</span>
                </div>
                <a href="https://accesossala29-front.onrender.com/usuarios/usuarios.html" target="_blank" rel="noopener noreferrer" class="btn btn-primary register-banner-btn">
                    Registrarse
                </a>
            </div>
        `;
        return;
    }

    // 2. Si hay sesión, obtenemos sus datos y comprobamos si ya está apuntado
    container.innerHTML = '<div style="text-align: center;"><div class="loader-spinner" style="width: 30px; height: 30px; border-width: 3px; margin: 0 auto;"></div></div>';

    try {
        // Pedimos al backend los datos del socio
        const res = await fetch(`${API_BASE_USERS}/usuario/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            userData = await res.json();

            // Comprobamos en Supabase si este usuario ya está en la lista de este evento
            const { data: signup, error } = await _supabase
                .from('asistentes_eventos')
                .select('id')
                .eq('event_id', eventId)
                .eq('user_id', userId)
                .maybeSingle();

            if (signup) {
                // Extraemos día y hora para el mensaje personalizado
                const eventDateObj = new Date(currentEvent.date);
                const dayMonth = eventDateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' });
                const time = eventDateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });

                // Ya está apuntado
                container.innerHTML = `
                    <div class="signup-box" style="text-align: center; background: rgba(93, 255, 143, 0.1); border-color: rgba(93, 255, 143, 0.3);">
                        <h3 style="color: #5dff8f; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            ✅ Ya estás en la lista
                        </h3>
                        <p style="color: #ccc; margin-top: 10px; font-size: 0.95rem;">
                            Te esperamos el día <strong>${dayMonth}</strong> a las <strong>${time}</strong> en Sala 29 para la live session de <strong>${currentEvent.title}</strong>.
                        </p>
                        <a href="../mi-qr/index.html" class="btn btn-secondary" style="width: 100%; margin-top: 16px; border-color: #5dff8f; color: #5dff8f;">Ver mi QR</a>
                    </div>
                `;
            } else {
                // Está logueado pero no apuntado
                container.innerHTML = `
                    <div class="signup-box" style="text-align: center;">
                        <h3 style="margin-top: 0; color: #fff;">Apuntarse a la lista</h3>
                        <p style="color: #ccc; margin-bottom: 15px; font-size: 0.9rem;">Reserva tu acceso garantizado enseñando tu QR en puerta.</p>
                        <button class="btn btn-primary" style="width: 100%;" onclick="openModal()">Apuntarme ahora</button>
                    </div>
                `;
            }
        } else {
            throw new Error("Sesión inválida");
        }
    } catch (err) {
        console.error("Error comprobando usuario:", err);
        container.innerHTML = `<p style="color: #ff4d4d; text-align: center;">Error al cargar la sesión. Recarga la página.</p>`;
    }
}

// --- LÓGICA DEL MODAL ---
window.openModal = function() {
    const eventTitle = document.getElementById('event-title').innerText;
    // Construimos el texto con los datos reales del usuario
    document.getElementById('confirm-text').innerHTML = `
        ¿Listo para la sesión de <strong>${eventTitle}</strong>, ${userData.nombre}? ¡No dejes que te lo cuenten!
    `;
    document.getElementById('confirm-modal').classList.remove('hidden');
};

window.closeModal = function() {
    document.getElementById('confirm-modal').classList.add('hidden');
};

document.getElementById('btn-confirm-signup').addEventListener('click', async () => {
    const btn = document.getElementById('btn-confirm-signup');
    btn.disabled = true;
    btn.innerText = 'Apuntando...';

    // Insertamos el registro en la nueva tabla
    const { error } = await _supabase
        .from('asistentes_eventos')
        .insert({ event_id: eventId, user_id: userId });

    if (error) {
        console.error(error);
        alert("Hubo un error al apuntarte. Por favor, inténtalo de nuevo.");
        btn.disabled = false;
        btn.innerText = 'Sí, apuntarme';
    } else {
        closeModal();
        // Recargamos las acciones para que ahora salga el mensaje de "Ya estás apuntado"
        await checkAuthAndRenderActions();
    }
});

// Arrancar al cargar
document.addEventListener('DOMContentLoaded', fetchEventDetail);