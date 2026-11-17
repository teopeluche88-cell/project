const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const app = express();

// ¡Clave para plataformas en la nube como Render! Permite leer la IP real del cliente detrás del proxy
app.set('trust proxy', true);

const PORT = process.env.PORT || 3000;
const visitasPath = path.join(__dirname, 'visitas.txt');

const WEBHOOK_SITE_URL = 'https://webhook.site/b6f83f1e-215d-4d0e-85cb-ba9b6bbcaab8';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/log-visitor', (req, res) => {
    // Con 'trust proxy' activado, req.ip obtendrá directamente la IP limpia del visitante
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'Desconocida';
    
    const timestamp = new Date().toISOString();
    const { userAgent, language, screenResolution, platform, timezone } = req.body;

    const logEntry = `[${timestamp}] IP: ${clientIp} | SO/Nav: ${userAgent}\n`;

    fs.appendFile(visitasPath, logEntry, (err) => {
        if (err) console.error('Error al guardar visitas.txt', err);
    });

    const datosVisita = {
        mensaje: "¡Nueva visita en tu web!",
        ipReal: clientIp,
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

    const reqWebhook = https.request(options, (resWebhook) => {});
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