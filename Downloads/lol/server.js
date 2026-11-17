const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const visitasPath = path.join(__dirname, 'visitas.txt');

// Middleware para procesar JSON y servir archivos estáticos (tu página web normal)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint privado en segundo plano: Registra la IP y datos del visitante sin mostrárselos al público
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
-------------------------\n`;

    // Guarda los datos en el archivo de texto en el servidor
    fs.appendFile(visitasPath, logEntry, (err) => {
        if (err) {
            console.error('Error al guardar los datos en visitas.txt:', err);
            return res.status(500).send({ status: 'error' });
        }
    });

    console.log(`[LOG] Nueva visita registrada desde IP: ${clientIp}`);
    res.status(200).send({ status: 'ok' });
});

// Ruta privada exclusiva para ti: Al entrar aquí verás las IPs y registros (el público no los ve)
app.get('/ver-visitas', (req, res) => {
    if (!fs.existsSync(visitasPath)) {
        return res.send('Aún no hay visitas registradas.');
    }
    const logs = fs.readFileSync(visitasPath, 'utf8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(logs);
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});