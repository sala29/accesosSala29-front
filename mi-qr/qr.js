const API_BASE = "https://accesossala29-8vdj.onrender.com";
const userId = localStorage.getItem('userId');
const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', async () => {
    if (!token || !userId) return window.location.href = '../login/index.html';

    // Pedimos el nombre para ponerlo encima del QR
    try {
        const res = await fetch(`${API_BASE}/usuario/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const u = await res.json();
            document.getElementById('nombreUsuario').innerText = u.nombre;
        }
    } catch (err) {}

    // GENERACIÓN DEL QR CON LOS COLORES DE TU WEB
    // Para que no sea blanco y negro, usamos el azul de fondo y blanco para los puntos
    new QRCode(document.getElementById("qrCodeWrapper"), {
        text: `SALA29_USER_${userId}`,
        width: 180,
        height: 180,
        colorDark : "#ffffff", // Puntos blancos
        colorLight : "#002d54", // Fondo azul oscuro (clavado a tu CSS original)
        correctLevel : QRCode.CorrectLevel.H
    });
});

// Lógica Botones
document.getElementById('volverInicioPerfil').addEventListener('click', () => {
    window.location.href = '../eventos/index.html';
});

// Descargar
document.getElementById('btnDownloadQR').addEventListener('click', () => {
    const img = document.querySelector('#qrCodeWrapper img');
    const canvas = document.querySelector('#qrCodeWrapper canvas');
    const src = img && img.src ? img.src : (canvas ? canvas.toDataURL("image/png") : null);
    
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = `QR_Sala29_${userId}.png`;
    link.click();
});

// Copiar
document.getElementById('btnCopyQR').addEventListener('click', async () => {
    const canvas = document.querySelector('#qrCodeWrapper canvas');
    if (!canvas) return alert("Tu navegador no soporta copiar el QR directamente.");
    
    try {
        canvas.toBlob(async (blob) => {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            const btn = document.getElementById('btnCopyQR');
            btn.innerHTML = '✅ Copiado';
            setTimeout(() => btn.innerHTML = '📋 Copiar', 2000);
        });
    } catch (err) {
        alert("Error al copiar. Descarga la imagen.");
    }
});