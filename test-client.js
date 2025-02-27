const io = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connecté au serveur WebSocket');

    // Simulation : L'équipe rouge capture le drapeau 1
    socket.emit('flag_captured', { flagId: 1, team: 'red' });
    
    setTimeout(() => {
        // L'équipe rouge relâche le drapeau après 5 secondes
        socket.emit('flag_released', { flagId: 1 });

        setTimeout(() => {
            // Demande du vainqueur après la capture
            socket.emit('get_winner');
        }, 2000);
        
    }, 5000);
});

// Écoute des mises à jour des scores
socket.on('score_update', (scores) => {
    console.log('Mise à jour des scores:', scores);
});

// Écoute de l'annonce du gagnant
socket.on('game_result', (result) => {
    console.log(`Résultat du jeu : ${result.winner} gagne avec les scores :`, result.scores);
});
