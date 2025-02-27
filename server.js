const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let flagCaptures = {
    red: 0,
    blue: 0
};

let activeCaptures = {}; // Stocke les timestamps de capture { flagId: { team, timestamp } }

io.on('connection', (socket) => {
    console.log('Un joueur est connecté');

    socket.on('flag_captured', ({ flagId, team }) => {
        if (!activeCaptures[flagId]) {
            activeCaptures[flagId] = { team, timestamp: Date.now() };
            console.log(`Drapeau ${flagId} capturé par ${team}`);
        }
    });

    socket.on('flag_released', ({ flagId }) => {
        if (activeCaptures[flagId]) {
            const { team, timestamp } = activeCaptures[flagId];
            const duration = ((Date.now() - timestamp) / 1000).toFixed(2); // en secondes
            flagCaptures[team] = (flagCaptures[team] || 0) + parseInt(duration);
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
