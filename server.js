const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mqtt = require('mqtt');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Connexion au broker MQTT
const mqttClient = mqtt.connect('mqtt://broker.emqx.io');

mqttClient.on('connect', () => {
    console.log('Connecté au broker MQTT');
});

let flagCaptures = {
    red: 0,
    blue: 0
};

let activeCaptures = {}; // Stocke les timestamps de capture { flagId: { team, timestamp } }
let gameActive = false;
let gameTimer = null;

io.on('connection', (socket) => {
    console.log('Un joueur est connecté');

    socket.on('start_game', () => {
        if (!gameActive) {
            gameActive = true;
            flagCaptures = { red: 0, blue: 0 };
            activeCaptures = {};
            io.emit('game_started', { message: "La partie a commencé!" });
            console.log("La partie a commencé!");
            
            // Envoi du message MQTT
            mqttClient.publish('game/status', 'Game Started');

            gameTimer = setTimeout(() => {
                gameActive = false;
                io.emit('game_over', { message: "La partie est terminée!", scores: flagCaptures });
                console.log("La partie est terminée!");
                
                // Envoi du message MQTT
                mqttClient.publish('game/status', 'Game Over');
            }, 30000); // 30 secondes
        }
    });

    socket.on('flag_captured', ({ flagId, team }) => {
        if (gameActive && !activeCaptures[flagId]) {
            activeCaptures[flagId] = { team, timestamp: Date.now() };
            console.log(`Drapeau ${flagId} capturé par ${team}`);
        }
    });

    socket.on('flag_released', ({ flagId }) => {
        if (gameActive && activeCaptures[flagId]) {
            const { team, timestamp } = activeCaptures[flagId];
            const duration = ((Date.now() - timestamp) / 1000).toFixed(2); // en secondes
            flagCaptures[team] = (flagCaptures[team] || 0) + parseFloat(duration);
            delete activeCaptures[flagId];
            console.log(`Drapeau ${flagId} relâché par ${team} après ${duration}s`);
            io.emit('score_update', { red: flagCaptures.red.toFixed(2), blue: flagCaptures.blue.toFixed(2) });
        }
    });

    socket.on('get_winner', () => {
        const winner = flagCaptures.red > flagCaptures.blue ? 'red' : flagCaptures.blue > flagCaptures.red ? 'blue' : 'égalité';
        io.emit('game_result', { winner, scores: { red: flagCaptures.red.toFixed(2), blue: flagCaptures.blue.toFixed(2) } });
    });
});

server.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});
