const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para registrar la telemetría del visitante
app.post('/log-visitor', (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const timestamp = new Date().toISOString();
    
    const { userAgent, language, screenResolution, platform, timezone } = req.body;

    const logEntry = `[${timestamp}] 
IP: ${clientIp} 
Navegador/OS: ${userAgent} 
Plataforma: ${platform} 
Idioma: ${language} 
Resolución: ${screenResolution} 
Zona horaria: ${timezone}
----------------------------------------\n`;

    fs.appendFile('visitas.txt', logEntry, (err) => {
        if (err) console.error('Error al guardar los datos en visitas.txt', err);
    });

    console.log(`[LOG] Nueva visita registrada desde IP: ${clientIp}`);
    res.status(200).send({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});