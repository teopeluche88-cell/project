const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const app = express();

const PORT = process.env.PORT || 3000;
const visitasPath = path.join(__dirname, 'visitas.txt');

// Tu URL única de Webhook.site configurada
const WEBHOOK_SITE_URL = 'https://webhook.site/b6f83f1e-215d-4d0e-85cb-ba9b6bbcaab8';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/log-visitor', (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const timestamp = new Date().toISOString();
    const { userAgent, language, screenResolution, platform, timezone } = req.body;

    const logEntry = `[${timestamp}] IP: ${clientIp} | SO/Nav: ${userAgent}\n`;

    // 1. Guardar en el archivo local de Render por seguridad
    fs.appendFile(visitasPath, logEntry, (err) => {
        if (err) console.error('Error al guardar visitas.txt', err);
    });

    // 2. Enviar los datos del visitante a tu Webhook.site para verlos al instante
    const datosVisita = {
        mensaje: "¡Nueva visita en tu web!",
        ip: clientIp,
        hora: timestamp,
        dispositivo: platform,
        navegador: userAgent,
        zonaHoraria: timezone
    };

    const urlObj = new URL(WEBHOOK_SITE_URL);
    const data = JSON.stringify(datosVisita);

    const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const reqWebhook = https.request(options, (resWebhook) => {
        // Petición enviada correctamente
    });
    
    reqWebhook.on('error', (err) => {
        console.error('Error al enviar datos a Webhook.site:', err);
    });
    
    reqWebhook.write(data);
    reqWebhook.end();

    res.status(200).send({ status: 'ok' });
});

app.get('/ver-visitas', (req, res) => {
    if (!fs.existsSync(visitasPath)) return res.send('Aún no hay visitas.');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(fs.readFileSync(visitasPath, 'utf8'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});