const express = require('express');
const path = require('path');
const app = express();

// Necesario para que Render permita leer las cabeceras de red correctamente
app.set('trust proxy', true);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/log-visitor', (req, res) => {
    // Captura robusta buscando en todas las cabeceras posibles del proxy
    const cfConnectingIp = req.headers['cf-connecting-ip'];
    const realIp = req.headers['x-real-ip'];
    const xForwardedFor = req.headers['x-forwarded-for'];

    let clientIp = 'Desconocida';

    if (cfConnectingIp) {
        clientIp = cfConnectingIp;
    } else if (realIp) {
        clientIp = realIp;
    } else if (xForwardedFor) {
        // Extrae la primera IP real de la cadena de proxies
        clientIp = xForwardedFor.split(',')[0].trim();
    } else {
        clientIp = req.ip;
    }
    
    const timestamp = new Date().toISOString();
    const { platform } = req.body;

    // Esto imprimirá la IP real al instante en la pantalla de Logs de Render
    console.log(`----------------------------------------`);
    console.log(`🔥 [NUEVA VISITA DETECTADA]`);
    console.log(`🌍 IP REAL LIMPIA: ${clientIp}`);
    console.log(`⏰ HORA: ${timestamp}`);
    console.log(`📱 DISPOSITIVO: ${platform}`);
    console.log(`----------------------------------------`);

    res.status(200).send({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});