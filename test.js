function getInCsv(data, line, beginningChar, endChar) {
  var beginningIndex = data.indexOf(line);
  while (data.at(beginningIndex) != beginningChar) {
    beginningIndex++;
  }
  beginningIndex++; // Indice de la première lettre de l'information recherchée

  var endingIndex = beginningIndex;
  while (data.at(endingIndex) != endChar) { //Jusqu'à ce qu'on arrive à la fin de l'information recherchée
    endingIndex++; //Indice de la dernière lettre de l'information recherchée
  }
  return data.substring(beginningIndex, endingIndex); //Sous-chaîne contenant l'information voulue
}
//Constantes csv (délimiteurs utlisés)
const betweenIdAndUrl = ':';
const betweenUrlAndName = ';';
const betweenNameAndDesc = '=';
const endOfLineChar = '\\';

//Main
var data;
const xhttp = new XMLHttpRequest();
const numLesson =  1//localStorage.getItem("numLesson");
var playedSound = []; //Tableau qui contiendra les cartes qui ont déjà été jouées


var idJeu;
if (numLesson == 1) { //Voca
    idJeu = 14;
} else if (numLesson == 2){ //Grammaire
    idJeu = 24;
} else { //Culture 
    idJeu = 34;
}
initializationOfGame(numLesson);

// loadCsv();
const nbLines = countNbLines(); //Nombre d'entrées dans le csv

var nbPlayedSound = 0; //Nombre de cartes jouées
const nbSounds = 5; //Nombre de cartes dans un jeu
var currentSoundId = Math.floor(Math.random() * (nbLines)); //Choisit une carte aléatoirement
playedSound.push(currentSoundId);
let hasWin = false;

var nbCorrect = 0;
var points = 0; //A la fin du jeu, points = nbCorrect * 1000 - lostPoints
var lostPoints = 0;
var nbStars = 0;
var time;
document.getElementById("confirm").onclick = checkAnswer;
document.getElementById("classement_button").onclick = showLeaderboard;
document.getElementById("come_back_button").onclick = come_back_score;

document.querySelector("#retour").onclick = function (){
    if (numLesson == 1){
        location.href = "../php/Vocabulary/vocabulary.php";
    }
    if (numLesson == 2){
        location.href = "../php/Grammar/grammar.php";
    }
    if (numLesson == 3) {
        location.href = "../php/Culture/culture.php";
    }
};

//Action au clic du bouton de retour
document.querySelector("#returnGameButton").onclick = function(){
    returnGamePage(numLesson);
}

//Pour faire en sorte que appuyer sur entrée valide la réponse
document.getElementById("guess").addEventListener("keydown", function(event) {
    if (event.code == "Enter") {
        checkAnswer();
    }
})

rule_button.onclick = start; //Le bouton "j'ai compris lance le jeu"
let loader = document.querySelector('.loader') // Transition de depart
window.onload = function() {
    loader.classList.remove('loader--active'); // On enlève le loader au depart 
};

let restart_button = document.getElementById("restart_button");
restart_button.onclick = restart;

/**
 * Augmente de 1 seconde tout les 1000 ticks,
 * Augmente seulement si win est "false",
 * Affecte les points,
 *
 * @class Timer
 * @extends React.js
 */
 class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { seconds: 0 };
    }
    tick() {
        if(document.getElementById("timer").style.display == "flex"){
            if(hasWin == false){
                this.setState(state => ({
                    seconds: state.seconds + 1,
                }));
                if(this.state.seconds > 45){
                    lostPoints += 5;
                }
            }
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return React.createElement(
            'div',
            null,
            'Time : ',
            this.state.seconds
            ,' seconds !'
        );
    }
}

/**
 * Augmente de 1 seconde tout les 1 tant que ce n'est pas égal a la variable "points",
 * Affiche dynamiquement les points et les etoiles.
 * @class Compteur
 * @extends React.js
 */
class Compteur extends React.Component { // On fait une classe avec React pour un timer
    constructor(props) { // Constructeur de base
        super(props);
        this.state = { score: 0 }; // Les atats du composant react sont : une variable seconde intialisé à 0
    }

    tick() {
        if (points != this.state.score) {
            this.setState(state => ({
                score: state.score + 5,
            }));

            if (this.state.score >= 1000) {
                document.getElementById("star1").classList.add("allumer"); //Met l'étoile correspondante en jaune
            }
            if (this.state.score >= 2000) {
                document.getElementById("star2").classList.add("allumer");
            }
            if (this.state.score >= 3000) {
                document.getElementById("star3").classList.add("allumer");
            }
            if (this.state.score >= 4000) {
                document.getElementById("star4").classList.add("allumer");
            }
            if (this.state.score >= 4900) {
                document.getElementById("star5").classList.add("allumer");
            }
        }
    }

    componentDidMount() { // On met l'intervalle entre chaque incrémentation
        this.interval = setInterval(() => this.tick(), 1);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {  // La fonction du rendu
        return React.createElement(
            'span',
            null,
            this.state.score
            ,' Points !'
        );
    }
}

/**
 * Démarre le jeu une fois que l'utilisateur a lu les règles
 */
function start() {
    loader.classList.add('loader--active'); // On met la transition

    currentSoundId = Math.floor(Math.random() * (nbLines));
    playedSound.push(currentSoundId);
    document.getElementById("button_speak").onclick = speak; //met le bon son sur le bouton play
    let question = getQuestionOf(currentSoundId);
    document.getElementById("guessLabel").innerHTML = question;

    window.setTimeout(function () { // On affiche un peu avant que la transition finisse afin de ne pas avoir de latence
        //On enlève l'affichage des règles
        document.getElementById("container_rule").style.display = "none";

        // On affiche (actuellement en none) toutes les divs requises avec des display flex  

        document.getElementById("imgFlash").style.display = "block";
        const inner = document.getElementsByClassName("flash-card-inner");
        inner[0].style.display = "block";
        const card = document.getElementsByClassName("flash-card");
        card[0].style.display = "block";

        document.getElementById("guessLabel").style.display = "block";
        document.getElementById("guess").style.display = "block";
        document.getElementById("confirm").style.display = "block";

        document.getElementById("timer").style.display = "flex";
        document.getElementById('main_container').style.background = 'white';

        const hiddenElem = document.getElementsByClassName("hide");
        for (let i = 0; i < hiddenElem.length; ++i) {
            hiddenElem[i].style.display = "block";
        }
    }, 1500);

    window.setTimeout(function () {
        loader.classList.remove('loader--active'); // On retire la transition 
        time = ReactDOM.render( React.createElement( Timer, null), document.getElementById('timer'));
    }, 3000);

}

/**
 * Initialise les flashcartes de vocabulaire, grammaire ou culture selon numLesson
 * @param {number} numLesson 
 */
function initializationOfGame(numLesson) {
  //Textes à changer
  let rules = "";
  let title = "";
  let subtitle = "";
  console.log(document.getElementById("p1_rules").value);
  if (numLesson == 1) { //Vocabulary
      rules = "Listen to the word and find the translation in french";
      title = "Vocabulary";
      subtitle = "English - French Translation";

  } else if (numLesson == 2) { //Grammar 
    rules = "Translate in english the phrases that you hear";
      title = "Grammar";
      subtitle = "Translation French-English";

  } 
  else  { //Culture, aussi par défaut
    rules = "Listen to the description of these monuments and find their names";
      title = "English culture";
      subtitle = "UK-US landmarks";
}
    document.querySelector("#p1_rules").innerHTML = rules;
  document.getElementById("title").innerHTML = title;
  document.getElementById("subtitle").innerHTML = subtitle;
  loadCsv(numLesson);
}

/**
 * Lit le csv et le met dans une String
 * @param {number} numLesson
 */
function loadCsv(numLesson) {
    xhttp.onload = function () {
        data = this.responseText;
        return data;
    }

    if (numLesson == 1) { //Vocabulary
        xhttp.open("GET", "soundVoc.csv", false); 
    } else if (numLesson == 2) { //Grammar
        xhttp.open("GET", "soundGrammar.csv", false); //Modifier pour Grammaire
    } else { //Culture
        xhttp.open("GET", "soundCult.csv", false);
    }
    xhttp.send();
}


/**
 * Vérifie la réponse du joueur et lui montre la bonne réponse 
 */
function checkAnswer() {
    let guess = document.getElementById("guess").value; //La réponse du joueur
    let resultText = document.getElementById("result");
    document.getElementById("result").style.display = "block";
    let scoreText = document.getElementById("score");

    if (guess != '') {
        nbPlayedSound += 1;
        document.getElementById("confirm").value = 'Next Question'; //On cache le bouton de validation
        document.getElementById("confirm").onclick = changeSound;

        if (guess.toLowerCase() == (getSoundAnswerOf(currentSoundId).toLowerCase())) { //Compare la réponse du joueur avec la solution
            resultText.innerHTML = 'Good answer!';
            resultText.style.color = "green";
            nbCorrect++;
            document.getElementById("guess").value = "";
        }
        else {
            resultText.innerHTML = 'Wrong answer';
            resultText.style.color = "red";
        }
        document.getElementById("guessLabel").style.display = "none";
        document.getElementById("guess").style.display = "none";
    }
    else { //Si le joueur n'a pas donné de réponse
        // resultText.style.color = "black";
        resultText.innerHTML = "Make a guess";

    }
    if (nbPlayedSound == nbSounds) { //Si toutes les cartes ont été jouées
        resultText.innerHTML += "<br/> You finished the game!";
        document.getElementById("confirm").value = 'Finish';
        scoreText.style.display = 'block';
        points = nbCorrect * 1000 - lostPoints;
        if (points < 0) {
            points = 0;
        }
        scoreText.innerHTML = 'Your score: ' + points; // Affiche le score à chaque tour
        //Aller vers l'affichage des résultats
        document.getElementById("confirm").onclick = win;

    }
    else {
        if (guess != '') {
            scoreText.style.display = 'block';
            points = nbCorrect * 1000 - lostPoints;
            if (points < 0) {
                points = 0;
            }
            scoreText.innerHTML = 'Your score: ' + points;// Affiche le score à chaque tour
        }
    }
}

/**
 * Passe à la carte suivante
 */
function changeSound() {
    document.getElementById("guessLabel").style.display = "block";
    document.getElementById("guess").style.display = "block";
    document.getElementById("result").innerHTML = '';
    document.getElementById("guess").value = '';
    while (playedSound.includes(currentSoundId)) {
        currentSoundId = Math.floor(Math.random() * (nbLines)); //Choisit une carte aléatoirement
    }
    playedSound.push(currentSoundId);
    document.getElementById("button_speak").onclick = speak;
    document.getElementById("confirm").value = 'Confirm'; //Réaffiche le bouton valider
    document.getElementById("confirm").onclick = checkAnswer; //Réaffiche le bouton valider
}

/**
 * Compte le nombre de cartes dans le csv
 * @returns {number}: le nombre de cartes
 */
function countNbLines() {
    var count = 0;
    for (let i = 0; i < data.length; ++i) {
        if (data.at(i) == endOfLineChar) {
            count++;
        }
    }
    return (count-1);
}

/**
 * Affiche les résultats finaux
 */
function win() {
    hasWin = true;

    // Attribution du nombre d'etoile en fonction du nombre de cartes devinees et du temps mis
    points = nbCorrect * 1000 - lostPoints;

    if (points >= 4900) {nbStars = 5;}
    else if (points >= 4000) {nbStars = 4;}
    else if (points >= 3000) {nbStars = 3;}
    else if (points >= 2000) {nbStars = 2;}
    else if (points >= 1000) {nbStars = 1;}
    else {
        if(nbCorrect > 0) {
            nbStars = 1;
            points = 500;
        } else {
            nbStars = 0;
            points = 0;
        }
    } 

    //sendResult(idJeu, points, nbStars);

    document.getElementById("timer").style.display = "none";

    document.getElementById("titre_win").style.display = "block";
    document.getElementById("restart_button").style.display = "block";
    document.getElementById("returnGameButton").style.display = "block";
    document.getElementById("classement_button").style.display = "block";
    document.getElementById("container_win").style.display = "flex";
    document.getElementById("rating_star").style.display = "flex";

    hideElements();

    document.getElementById("titre_win").innerHTML = "Congratulations!";
    document.getElementById("p1_win").style.display = "flex";
    document.getElementById("p2_win").style.display = "flex";
    document.getElementById("username").style.display = "flex";
    document.getElementById("username").style.zIndex = '1';
    

    document.getElementById("p1_win").innerHTML = "You got " + points + " points!";
    ReactDOM.render(React.createElement(Compteur, null), document.getElementById('p1_win'));
    document.getElementById("p2_win").innerHTML = "You finished in " + time.state.seconds + " seconds !";

}

/**
 * Cache les éléments nécessaires pour pouvoir afficher les scores finaux
 */
function hideElements() {
    document.getElementById("imgFlash").style.display = "none";
    const inner = document.getElementsByClassName("flash-card-inner");
    inner[0].style.display = "none";
    const card = document.getElementsByClassName("flash-card");
    card[0].style.display = "none";

    document.getElementById("guessLabel").style.display = "none";
    document.getElementById("guess").style.display = "none";
    document.getElementById("confirm").style.display = "none";
    document.getElementById("score").style.display = "none";
    document.getElementById("result").style.display = "none";
    document.getElementById('main_container').style.background = "transparent";

    const hiddenElem = document.getElementsByClassName("hide");
    for (let i = 0; i < hiddenElem.length; ++i) {
        hiddenElem[i].style.display = "none";
    }
    
}

/**
 * Reinitialise le jeu et le relance
 */
function restart() {
    hasWin = false;
    // On arrete le timer
    ReactDOM.unmountComponentAtNode(document.getElementById('timer'));
    ReactDOM.unmountComponentAtNode(document.getElementById('p1_win'));
    // On le remet en place à 0
    ReactDOM.render(React.createElement(Timer, null), document.getElementById('timer'));

    //Remet les étoiles en gris
    //turnOffStars(nbStars);
    
    //Réinitialise les variables
    nbPlayedSound = 0;
    playedSound.length = 0;
    nbCorrect = 0;
    nbStars = 0;
    points = 0;

    //Gère l'affichage
    document.getElementById("titre_win").style.display = "none";
    document.getElementById("restart_button").style.display = "none";
    document.getElementById("returnGameButton").style.display = "none";
    document.getElementById("classement_button").style.display = "none";
    document.getElementById("rating_star").style.display = "none";
    document.getElementById("container_win").style.display = "none";
    document.getElementById("p2_win").style.display = "none";

    document.getElementById("guess").value = '';

    document.getElementById("confirm").value = 'Confirm';
    document.getElementById("confirm").onclick = checkAnswer;
    start();
}

/*
 * Affiche le classement du jeu
 */
function showLeaderboard() {
    console.log("test"); // a faire !!!!!!!!!!!!!!!!!!!!!!!
}
/**
 * Gère l'affichage pour passer du classement à l'écran des résultats
 */
function come_back_score() {
    document.getElementById("username").style.display = "flex";
    document.getElementById("container_win").style.display = "flex";
    document.getElementById("container_leaderboard").style.display = "none";
}


function countNbLines() {
  var count = 0;
  for (let i = 0; i < data.length; ++i) {
      if (data.at(i) == endOfLineChar) {
          count++;
      }
  }
  return (count-1);
}

function getQuestionOf(soundID) {
  return getInCsv(data, soundID, betweenUrlAndName, betweenNameAndDesc);
}

/**
* Trouve la description d'une image à partir de son ID
* @param {number} soundID 
* @returns {string} : Chaine contenant la description de l'image (Qui sera au dos de la flashcard)
*/
function getSoundAnswerOf(soundID) {
  return getInCsv(data, soundID, betweenNameAndDesc, endOfLineChar);
}

/**
* Trouve le chemin d'une image à partir de son ID
* @param {number} soundID L'id de l'image qui nous interesse (=id de la ligne)
* @returns {string} : Chaine contenant le chemin de l'image
*/
function getTTSOf(soundID) {
  return getInCsv(data, soundID, betweenIdAndUrl, betweenUrlAndName);
}


function speak() {
  responsiveVoice.speak(getTTSOf(currentSoundId), "UK English Male");
}