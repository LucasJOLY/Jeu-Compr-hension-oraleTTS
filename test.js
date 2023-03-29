const apiKey = "ec5610fa43mshc1c44a22c93b222p13a94fjsn3de10044e83b"; // remplacer par votre clé API WordsAPI
const wordUrl = "https://wordsapiv1.p.rapidapi.com/words"; // URL de l'API WordsAPI

const audioPlayer = document.getElementById("audioPlayer");
const wordSelect = document.getElementById("wordSelect");
const playButton = document.getElementById("playButton");

wordSelect.addEventListener("change", () => {
  const selectedWord = wordSelect.value;
  getWordPronunciation(selectedWord);
});

async function getWordPronunciation(word) {
  const response = await fetch(`${wordUrl}/${word}/pronunciation`, {
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
    },
  });

  const data = await response.json();

  if (data.pronunciation) {
    const audioFileUrl = `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${word}--_gb_1.mp3`;
    audioPlayer.src = audioFileUrl;
    playButton.disabled = false;
  } else {
    console.log("Aucune prononciation disponible pour le mot " + word);
    audioPlayer.src = "";
    playButton.disabled = true;
  }
}

playButton.addEventListener("click", () => {
  audioPlayer.play();
});
