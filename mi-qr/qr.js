const API_BASE = "https://accesossala29-8vdj.onrender.com";
const userId = localStorage.getItem('userId');
const token = localStorage.getItem('token');
const imgQr = document.getElementById('qrCodeImg');

document.addEventListener('DOMContentLoaded', async () => {
    if (!token || !userId) return window.location.href = '../login/index.html';

    // 1. Pedimos los datos del usuario (para el nombre)
    try {
        const res = await fetch(`${API_BASE}/usuario/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const u = await res.json();
            document.getElementById('nombreUsuario').innerText = u.nombre;
            
            // Si el backend te devuelve el QR dentro de los datos del usuario (ej: u.qr),
            // descomenta la siguiente línea y borra el paso 2:
            // if(u.qr) { imgQr.src = u.qr; imgQr.style.display = 'block'; }
        }
    } catch (err) {
        console.error("Error al cargar usuario", err);
    }

    // 2. Pedimos el QR a su endpoint específico
    try {
        const resQr = await fetch(`${API_BASE}/usuario/${userId}/qr`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (resQr.ok) {
            // Recibimos la imagen, la convertimos en un objeto visible para el navegador
            const blob = await resQr.blob();
            imgQr.src = URL.createObjectURL(blob);
            imgQr.style.display = 'block';
        } else {
            document.getElementById('nombreUsuario').innerText = "Error al cargar el QR";
        }
    } catch (err) {
        console.error("Error al obtener el QR del backend", err);
    }
});

// Lógica de navegación
document.getElementById('volverInicioPerfil').addEventListener('click', () => {
    window.location.href = '../eventos/index.html';
});

// Lógica para descargar
document.getElementById('btnDownloadQR').addEventListener('click', () => {
    if (!imgQr.src || imgQr.style.display === 'none') return;
    const link = document.createElement('a');
    link.href = imgQr.src;
    link.download = `QR_Sala29_${userId}.png`;
    link.click();
});

// Lógica para copiar
document.getElementById('btnCopyQR').addEventListener('click', async () => {
    if (!imgQr.src || imgQr.style.display === 'none') return;
    try {
        const response = await fetch(imgQr.src);
        const blob = await response.blob();
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        
        const btn = document.getElementById('btnCopyQR');
        btn.innerHTML = '✅ Copiado';
        setTimeout(() => btn.innerHTML = '📋 Copiar', 2000);
    } catch (err) {
        alert("Tu navegador no permite copiar la imagen directamente. Usa el botón Descargar.");
    }
});