/* Obtener todos los elementos del HTML */

const playerOptions = document.querySelectorAll('input[name="players"]');

const playerOneInput = document.getElementById("player-name");
const playerTwoInput = document.getElementById("player-two-name");

const playerOneMessage = document.getElementById("player-name-message");
const playerTwoMessage = document.getElementById("player-two-name-message");

const secondPlayerField = document.getElementById("second-player-field");

const browserInfo = document.getElementById("browser-info");
const languageInfo = document.getElementById("language-info");
const linkInfo = document.getElementById("link-info");

const highScore = document.getElementById("high-score");

const startButton = document.getElementById("start-button");
const clearScoreButton = document.getElementById("clear-score-button");


secondPlayerField.hidden = true;
playerOptions.forEach(function(option){

    option.addEventListener("change",function(){

        if(option.value==="2" && option.checked){
            secondPlayerField.hidden=false;
        }

        if(option.value==="1" && option.checked){
            secondPlayerField.hidden=true;
        }

    });

});


/* Detectar el navegador */

let browser="Altres";

if(navigator.userAgent.includes("Edg/")){
    browser="Edge";
}
else if(navigator.userAgent.includes("Firefox")){
    browser="Firefox";
}
else if(navigator.userAgent.includes("Chrome")){
    browser="Chrome";
}
else if(navigator.userAgent.includes("Safari")){
    browser="Safari";
}


/* Crear el objeto del navegador */

let browserObject={
    idioma:navigator.language,
    navegador:browser,
    url:location.origin+location.pathname,
    color:"#e5edf4"
};


/* Cambiar el color de fondo según el navegador */

if(browser==="Chrome"){
    browserObject.color="#e5edf4";
}
else if(browser==="Firefox"){
    browserObject.color="#f8ead7";
}
else if(browser==="Safari"){
    browserObject.color="#dff5df";
}
else if(browser==="Edge"){
    browserObject.color="#e5ddf5";
}
else{
    browserObject.color="#eeeeee";
}

document.body.style.background=browserObject.color;


/* Mostrar la información del navegador */

browserInfo.textContent=browserObject.navegador;
languageInfo.textContent=browserObject.idioma;
linkInfo.textContent=browserObject.url;


/* Guardar el objeto del navegador en sessionStorage */

sessionStorage.setItem("browserObject",JSON.stringify(browserObject));


/* Mostrar la puntuación más alta guardada */

let scoreSaved=localStorage.getItem("highScore");

if(scoreSaved!==null){

    let scoreObject=JSON.parse(scoreSaved);

    highScore.textContent=
        scoreObject.nom+
        " - "+
        scoreObject.punts+
        " punts - "+
        scoreObject.data;
}

/* VALIDACION */
/* Función para validar un nombre con expresión regular */

function validarNom(input,mensaje){

    let nombre=input.value.trim();

    let expresion=/^[A-Za-z0-9_]+$/;

    if(nombre===""){

        input.style.border="2px solid red";
        mensaje.style.color="red";
        mensaje.textContent="Has d'informar el nom d'un jugador";
        return false;
    }

    if(nombre.length<4){

        input.style.border="2px solid red";
        mensaje.style.color="red";
        mensaje.textContent="El nom ha de tenir més de 3 caràcters";
        return false;
    }

    if(nombre.length>14){

        input.style.border="2px solid red";
        mensaje.style.color="red";
        mensaje.textContent="El nom ha de tenir menys de 15 caràcters";
        return false;
    }

    if(!expresion.test(nombre)){

        input.style.border="2px solid red";
        mensaje.style.color="red";
        mensaje.textContent="Només es poden introduir lletres sense accents, números i _";
        return false;
    }

    input.style.border="2px solid green";
    mensaje.style.color="green";
    mensaje.textContent="Correcte";

    return true;
}


/* Validar el jugador 1 cuando cambia */

playerOneInput.addEventListener("change",function(){

    validarNom(playerOneInput,playerOneMessage);

});


/* Validar el jugador 2 cuando cambia */

playerTwoInput.addEventListener("change",function(){

    if(!secondPlayerField.hidden){
        validarNom(playerTwoInput,playerTwoMessage);
    }

});


/* Guardar una cookie */

function guardarCookie(nombre,valor){

    document.cookie=nombre+"="+encodeURIComponent(valor)+";path=/;max-age=2592000";

}


/* Obtener una cookie */

function obtenerCookie(nombre){

    let cookies=document.cookie.split(";");

    for(let i=0;i<cookies.length;i++){

        let cookie=cookies[i].trim();

        if(cookie.startsWith(nombre+"=")){
            return decodeURIComponent(cookie.substring(nombre.length+1));
        }

    }

    return "";

}


/* Recuperar los nombres guardados */

playerOneInput.value=obtenerCookie("player1");
playerTwoInput.value=obtenerCookie("player2");


/* Comprobar la validación antes de empezar */

startButton.addEventListener("click",function(){

    let jugador1Correcto=validarNom(playerOneInput,playerOneMessage);

    let dosJugadores=document.querySelector('input[name="players"]:checked').value==="2";

    let jugador2Correcto=true;

    if(dosJugadores){

        jugador2Correcto=validarNom(playerTwoInput,playerTwoMessage);

        if(
            jugador1Correcto &&
            jugador2Correcto &&
            playerOneInput.value.trim()===playerTwoInput.value.trim()
        ){

            playerTwoInput.style.border="2px solid red";
            playerTwoMessage.style.color="red";
            playerTwoMessage.textContent="Els noms dels jugadors han de ser diferents";

            jugador2Correcto=false;
        }
    }

    if(!jugador1Correcto || !jugador2Correcto){
        return;
    }

    guardarCookie("player1",playerOneInput.value.trim());

    if(dosJugadores){
        guardarCookie("player2",playerTwoInput.value.trim());
    }

    sessionStorage.setItem("players",dosJugadores?2:1);

    location.href="joc.html";

});


/* Borrar la puntuación del localStorage */

clearScoreButton.addEventListener("click",function(){

    let confirmar=confirm("Estàs segur que vols esborrar la informació de la puntuació?");

    if(confirmar){

        localStorage.removeItem("highScore");

        highScore.textContent="No hi ha puntuació actual";
    }

});