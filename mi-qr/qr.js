const API_BASE = "https://accesossala29-8vdj.onrender.com";
const userId = localStorage.getItem('userId');
const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Redirigir si no está logueado
    if (!token || !userId) {
        window.location.href = '../login/index.html';
        return;
    }

    // 2. Generar el QR
    // Generamos el QR con el ID del usuario (o el string que necesites que lea tu escáner)
    const qrText = `SALA29_USER_${userId}`; 
    
    new QRCode(document.getElementById("qrCode"), {
        text: qrText,
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    // 3. Obtener el nombre del usuario para mostrarlo bonito en la tarjeta
    try {
        const res = await fetch(`${API_BASE}/usuario/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const user = await res.json();
            document.getElementById('qrNombre').textContent = user.nombre;
        } else {
            document.getElementById('qrNombre').textContent = "Socio Sala 29";
        }
    } catch (err) {
        document.getElementById('qrNombre').textContent = "Socio Sala 29";
    }
});

// Botón volver
document.getElementById('btnVolverEventos').addEventListener('click', () => {
    window.location.href = '../eventos/index.html';
});

// ==========================================
// 4. LÓGICA DE DESCARGA Y COPIA DEL QR
// ==========================================

// Función auxiliar para extraer la imagen que genera la librería
function getQRImageSrc() {
    const img = document.querySelector('#qrCode img');
    if (img && img.src) return img.src;
    
    // Fallback por si el navegador usó el <canvas> en su lugar
    const canvas = document.querySelector('#qrCode canvas');
    if (canvas) return canvas.toDataURL("image/png");
    
    return null;
}

// Evento: Descargar QR
document.getElementById('btnDownloadQR').addEventListener('click', () => {
    const imgSrc = getQRImageSrc();
    if (!imgSrc) return alert("El QR aún se está generando, espera un segundo.");

    // Creamos un enlace invisible, le ponemos la imagen y simulamos un clic
    const link = document.createElement('a');
    link.href = imgSrc;
    link.download = `Acceso_Sala29_${userId}.png`; // Nombre del archivo que se descargará
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Evento: Copiar QR al portapapeles
document.getElementById('btnCopyQR').addEventListener('click', async () => {
    const imgSrc = getQRImageSrc();
    if (!imgSrc) return alert("El QR aún se está generando, espera un segundo.");

    const btn = document.getElementById('btnCopyQR');
    const originalText = btn.innerHTML;

    try {
        // Transformamos la imagen base64 a un objeto "Blob" que el portapapeles pueda entender
        const response = await fetch(imgSrc);
        const blob = await response.blob();
        
        // Usamos la API moderna del portapapeles
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
        ]);
        
        // Feedback visual temporal
        btn.innerHTML = '✅ Copiado';
        btn.style.background = '#5dff8f';
        btn.style.color = '#000';
        btn.style.borderColor = '#5dff8f';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
        }, 2000);

    } catch (err) {
        console.error("Error al copiar al portapapeles:", err);
        alert("Tu navegador no soporta copiar imágenes directamente. Usa el botón de descargar.");
    }
});