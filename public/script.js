const socket = io();
let currentFlag = null;

// Capturer un drapeau
function captureFlag(team) {
    if (!currentFlag) {
        currentFlag = Math.floor(Math.random() * 1000); // Identifiant unique pour chaque capture
        socket.emit('flag_captured', { flagId: currentFlag, team });
        console.log(`Drapeau ${currentFlag} capturé par ${team}`);
    }
}

// Relâcher le drapeau
function releaseFlag() {
    if (currentFlag !== null) {
        socket.emit('flag_released', { flagId: currentFlag });
        console.log(`Drapeau ${currentFlag} relâché`);
        currentFlag = null;
    }
}

// Demander le gagnant
function getWinner() {
    socket.emit('get_winner');
}

// Mise à jour des scores
// socket.on('score_update', (scores) => {
//     document.getElementById("score_red").innerText = `Rouge: ${scores.red.toFixed(2)}s`;
//     document.getElementById("score_blue").innerText = `Bleu: ${scores.blue.toFixed(2)}s`;
// });

// Écoute des mises à jour des scores envoyées par le serveur
socket.on('score_update', (scores) => {
    console.log('Scores reçus:', scores);  // Ajoute ceci pour voir les logs dans la console du navigateur
    document.getElementById("score_red").innerText = `Rouge: ${scores.red}s`;
    document.getElementById("score_blue").innerText = `Bleu: ${scores.blue}s`;
});


// Afficher le gagnant
socket.on('game_result', (result) => {
    document.getElementById("result").innerText = `Résultat : ${result.winner.toUpperCase()} gagne !`;
});
