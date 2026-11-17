const express = require('express');
const path = require('path');
const app = express();

// Necesario para que Render pase la IP real del cliente correctamente
app.set('trust proxy', true);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/log-visitor', (req, res) => {
    // Extrae limpiamente la IP real del visitante
    const xForwardedFor = req.headers['x-forwarded-for'];
    const clientIp = xForwardedFor ? xForwardedFor.split(',')[0].trim() : req.ip;
    
    const timestamp = new Date().toISOString();
    const { platform, userAgent } = req.body;

    // Esto imprimirá la IP al instante en los Logs de tu panel de Render
    console.log(`----------------------------------------`);
    console.log(`🔥 [NUEVA VISITA DETECTADA]`);
    console.log(`🌍 IP REAL: ${clientIp}`);
    console.log(`⏰ HORA: ${timestamp}`);
    console.log(`📱 DISPOSITIVO: ${platform}`);
    console.log(`----------------------------------------`);

    res.status(200).send({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});