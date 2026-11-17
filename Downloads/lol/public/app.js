/**
 * GLOBAL NEWS NETWORK - SCRIPT PRINCIPAL (FRONTEND)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTelemetry();
    initNewsModal();
    initWorldClock();
    initNumberGuessingGame();
});

// 1. Envío de telemetría al servidor Node.js
function initTelemetry() {
    const visitorData = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    fetch('/log-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitorData)
    })
    .then(response => {
        if (response.ok) {
            console.log('[Telemetry] Datos del dispositivo registrados correctamente.');
        }
    })
    .catch(() => {
        // Manejo silencioso en caso de entorno local sin conexión
    });
}

// 2. Lógica interactiva para la ventana modal (Más información de las noticias)
function initNewsModal() {
    const cards = document.querySelectorAll('.news-card');
    const modal = document.getElementById('newsModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDate = document.getElementById('modalDate');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');

    if (!modal) return;

    cards.forEach(card => {
        card.addEventListener('click', () => {
            modalTitle.textContent = card.getAttribute('data-title');
            modalDate.textContent = card.getAttribute('data-date');
            modalBody.textContent = card.getAttribute('data-content');
            modal.style.display = 'flex';
        });
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cierra el modal al hacer clic fuera del cuadro blanco
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// 3. Reloj Mundial en Vivo (UTC / Hora local)
function initWorldClock() {
    const clockElement = document.getElementById('worldClock');
    if (!clockElement) return;

    function updateClock() {
        const now = new Date();
        clockElement.textContent = `🌍 ${now.toLocaleTimeString()}`;
    }

    setInterval(updateClock, 1000);
    updateClock();
}

// 4. Minijuego: Adivina el Número (Con soporte para tecla Enter)
function initNumberGuessingGame() {
    let secretNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;

    const guessBtn = document.getElementById('guessBtn');
    const userGuess = document.getElementById('userGuess');
    const gameMessage = document.getElementById('gameMessage');

    if (!guessBtn || !userGuess || !gameMessage) return;

    function processGuess() {
        const guess = parseInt(userGuess.value);

        if (isNaN(guess) || guess < 1 || guess > 100) {
            gameMessage.textContent = '⚠️ Ingresa un número del 1 al 100.';
            gameMessage.style.color = '#d97706'; // Naranja advertencia
            return;
        }

        attempts++;

        if (guess === secretNumber) {
            gameMessage.textContent = `🎉 ¡Ganaste! Era el ${secretNumber} en ${attempts} intentos.`;
            gameMessage.style.color = '#16a34a'; // Verde éxito
            
            // Deshabilitar temporalmente y reiniciar juego a los 5 segundos
            userGuess.disabled = true;
            guessBtn.disabled = true;

            setTimeout(() => {
                secretNumber = Math.floor(Math.random() * 100) + 1;
                attempts = 0;
                userGuess.value = '';
                userGuess.disabled = false;
                guessBtn.disabled = false;
                gameMessage.style.color = 'var(--accent)';
                gameMessage.textContent = '¡Nuevo número generado! Adivina otra vez.';
            }, 5000);

        } else if (guess < secretNumber) {
            gameMessage.textContent = `📈 Muy bajo. Prueba con uno más alto.`;
            gameMessage.style.color = '#2563eb'; // Azul pista
        } else {
            gameMessage.textContent = `📉 Muy alto. Prueba con uno más bajo.`;
            gameMessage.style.color = '#dc2626'; // Rojo pista
        }

        userGuess.focus();
        userGuess.select();
    }

    // Evento al hacer clic en el botón
    guessBtn.addEventListener('click', processGuess);

    // Evento al presionar la tecla "Enter" dentro del input
    userGuess.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processGuess();
        }
    });
}