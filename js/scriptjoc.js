/* Obtener los elementos del HTML */

const gameTitle = document.getElementById("game-title");
const currentPlayerText = document.getElementById("current-player");
const scoreText = document.getElementById("score");
const errorsText = document.getElementById("errors");

const secretWordInput = document.getElementById("secret-word");
const toggleWordButton = document.getElementById("toggle-word");
const startGameButton = document.getElementById("start-game");

const hiddenWordText = document.getElementById("hidden-word");
const letterButtonsContainer = document.getElementById("letter-buttons");
const gameMessage = document.getElementById("game-message");

const errorDialog = document.getElementById("error-dialog");
const errorMessage = document.getElementById("error-message");
const closeDialogButton = document.getElementById("close-dialog");

const backButton = document.getElementById("back-button");
const instructionsButton = document.getElementById("instructions-button");


/* Recuperar los datos guardados en la pantalla inicial */

const browserData = JSON.parse(sessionStorage.getItem("browserObject"));

const playerOne = getCookie("player1");
const playerTwo = getCookie("player2");

const numberOfPlayers = Number(sessionStorage.getItem("players")) || 1;


/* Crear el array de jugadores y sus puntuaciones */

const players = [
    {
        name: playerOne,
        points: 0,
        wins: 0
    }
];

/* Añadir el segundo jugador si se ha seleccionado el modo multijugador */

if (numberOfPlayers === 2 && playerTwo !== "") {
    players.push({
        name: playerTwo,
        points: 0,
        wins: 0
    });
}

/* LETRAS */
/* Preparar las variables de la partida */

let currentPlayerIndex = 0;
let secretWord = "";
let guessedLetters = [];
let errors = 0;
let streak = 0;
let gameStarted = false;

const LETTERS_EN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LETTERS_ESP = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
const LETTERS_CA = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

let letters = LETTERS_EN;

if (browserData !== null) {
    if (browserData.idioma.startsWith("ca")) {
        letters = LETTERS_CA;
    } else if (browserData.idioma.startsWith("es")) {
        letters = LETTERS_ESP;
    }
}

/* COOKIE */
/* Recuperar una cookie por su nombre */

function getCookie(name) {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();

        if (cookie.startsWith(name + "=")) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }

    return "";
}


/* Mostrar el título y el jugador */

function updatePlayerInfo() {
    const player = players[currentPlayerIndex];

    currentPlayerText.textContent = player.name;
    scoreText.textContent = player.points;

    gameTitle.textContent = player.name + " (" + player.wins + ")";
}


/* Mostrar una ventana de error */

function showError(message) {
    errorMessage.textContent = message;
    errorDialog.showModal();
}


/* Cerrar la ventana de error */

closeDialogButton.addEventListener("click", function() {
    errorDialog.close();
});


/* Mostrar u ocultar la palabra secreta */

toggleWordButton.addEventListener("click", function() {
    if (secretWordInput.type === "password") {
        secretWordInput.type = "text";
        toggleWordButton.textContent = "Amagar paraula";
    } else {
        secretWordInput.type = "password";
        toggleWordButton.textContent = "Mostrar paraula";
    }
});

/* LETRAS */
/* Crear dinámicamente los botones de letras */

function createLetterButtons() {
    letterButtonsContainer.replaceChildren();

    for (let i = 0; i < letters.length; i++) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = letters[i];
        button.disabled = true;
        button.style.color = "red";

        button.addEventListener("click", function() {
            guessLetter(letters[i], button);
        });

        letterButtonsContainer.appendChild(button);
    }
}


/* Activar los botones de letras al comenzar la partida */

function enableLetterButtons() {
    const buttons = letterButtonsContainer.querySelectorAll("button");

    buttons.forEach(function(button) {
        button.disabled = false;
        button.style.color = "black";
    });
}


/* Desactivar todos los botones de letras */

function disableLetterButtons() {
    const buttons = letterButtonsContainer.querySelectorAll("button");

    buttons.forEach(function(button) {
        button.disabled = true;
        button.style.color = "red";
    });
}


/* Comprobar que la palabra secreta es válida */

function validateSecretWord() {
    const word = secretWordInput.value.trim();

    if (word === "") {
        showError("Has d'afegir una paraula per poder començar a jugar");
        return false;
    }

    if (/[0-9]/.test(word)) {
        showError("La paraula no pot contenir números");
        return false;
    }

    if (word.length <= 3) {
        showError("La paraula ha de contenir més de 3 caràcters");
        return false;
    }

    secretWord = word.toUpperCase();
    return true;
}


/* Empezar una partida */

startGameButton.addEventListener("click", function() {
    if (gameStarted) {
        return;
    }

    if (!validateSecretWord()) {
        return;
    }

    guessedLetters = [];
    errors = 0;
    streak = 0;
    gameStarted = true;

    secretWordInput.value = "";
    secretWordInput.disabled = true;
    startGameButton.disabled = true;

    gameMessage.textContent = "Partida en curs!";
    errorsText.textContent = errors + " / 9";

    updateHiddenWord();
    enableLetterButtons();
});


/* Mostrar las letras acertadas y ocultar las restantes */

function updateHiddenWord() {
    let displayWord = "";

    for (let i = 0; i < secretWord.length; i++) {
        if (guessedLetters.includes(secretWord[i])) {
            displayWord += secretWord[i] + " ";
        } else {
            displayWord += "_ ";
        }
    }

    hiddenWordText.textContent = displayWord.trim();
}


/* Procesar una letra elegida */

function guessLetter(letter, button) {
    if (!gameStarted || button.disabled) {
        return;
    }

    button.disabled = true;
    button.style.color = "red";

    if (secretWord.includes(letter)) {
        guessedLetters.push(letter);

        /* Sumar puntos por acertar y aumentar la racha */
        streak++;
        players[currentPlayerIndex].points += streak;

        /* Multiplicar los puntos si la letra aparece varias veces */
        const occurrences = secretWord.split(letter).length - 1;

        if (occurrences > 1) {
            players[currentPlayerIndex].points += streak * (occurrences - 1);
        }

        button.style.color = "green";
        gameMessage.textContent = "Correcte!";
        updateHiddenWord();
    } else {
        /* Restar un punto por fallar sin bajar de cero */
        players[currentPlayerIndex].points = Math.max(0,players[currentPlayerIndex].points - 1);

        streak = 0;
        errors++;

        gameMessage.textContent = "Lletra incorrecta!";
        errorsText.textContent = errors + " / 9";

        /* Cambiar de jugador cuando hay un error en modo multijugador */
        if (players.length === 2) {
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
            updatePlayerInfo();
        }
    }

    scoreText.textContent = players[currentPlayerIndex].points;

    /* Comprobar si se ha ganado o perdido */
    if (secretWord.split("").every(function(character) {
        return guessedLetters.includes(character);
    })) {
        finishGame(true);
    } else if (errors >= 9) {
        finishGame(false);
    }
}


/* Finalizar la partida */

function finishGame(won) {
    gameStarted = false;

    disableLetterButtons();

    secretWordInput.disabled = false;
    startGameButton.disabled = false;

    if (won) {
        gameMessage.textContent = "Has guanyat!";
        document.body.style.background = "#b7efb7";

        players[currentPlayerIndex].wins++;
        updatePlayerInfo();
    } else {
        gameMessage.textContent = "Has perdut! La paraula era: " + secretWord;
        document.body.style.background = "#f3b3b3";
    }

    secretWordInput.value = "";
}


/* Volver al menú después de confirmar */

backButton.addEventListener("click", function() {
    const confirmBack = confirm("Estàs segur que vols deixar la partida?");

    if (confirmBack) {
        window.location.href = "index.html";
    }
});


/* Abrir las instrucciones */

instructionsButton.addEventListener("click", function() {
    window.open(
        "instruccions.html",
        "instruccions",
        "width=400,height=400"
    );
});


/* Aplicar el color de fondo guardado en la pantalla inicial */

if (browserData !== null) {
    document.body.style.background = browserData.color;
}


/* Crear los botones y mostrar el jugador inicial */

createLetterButtons();
updatePlayerInfo();