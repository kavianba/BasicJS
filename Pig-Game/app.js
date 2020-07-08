/*
GAME RULES:

- The game has 2 players, playing in rounds
- In each turn, a player rolls a dice as many times as he whishes. Each result get added to his ROUND score
- BUT, if the player rolls a 1, all his ROUND score gets lost. After that, it's the next player's turn
- The player can choose to 'Hold', which means that his ROUND score gets added to his GLBAL score. After that, it's the next player's turn
- The first player to reach 100 points on GLOBAL score wins the game

*/

var scores, roundScore, currentPlayer, gamePlaying, previousScore;
var dice1Element = document.getElementById("dice-1");
var dice2Element = document.getElementById("dice-2");

init();

document.querySelector(".btn-roll").addEventListener('click', rollDice);
document.querySelector('.btn-hold').addEventListener('click', holdScore);
document.querySelector('.btn-new').addEventListener('click', init);

function rollDice(e) {
  if (gamePlaying) {
    var dice1 = Math.floor(Math.random() * 6) + 1;
    var dice2= Math.floor(Math.random() * 6) + 1;

    dice1Element.style.display = 'block';
    dice2Element.style.display = 'block';
    dice1Element.setAttribute("src", "dice-" + dice1 + ".png");
    dice2Element.setAttribute("src", "dice-" + dice2 + ".png");

    /*if (dice === 6 && previousScore === 6) {
      scores[currentPlayer] = 0;
      document.querySelector("#score-" + currentPlayer).textContent = scores[currentPlayer];
      resetPlayer();
    } else */if (dice1 !== 1 && dice2!== 1) {
      roundScore += dice1 + dice2;
      document.querySelector("#current-" + currentPlayer).textContent = roundScore;
    } else {
      resetPlayer();
    }
  }
}

function resetPlayer() {
  document.querySelector("#current-" + currentPlayer).textContent = 0;
  document.querySelector('.player-' + currentPlayer + '-panel').classList.remove('active');
  currentPlayer = currentPlayer === 0 ? 1 : 0;
  roundScore = 0;
  document.querySelector('.player-' + currentPlayer + '-panel').classList.add('active');
  dice1Element.style.display = 'none';
  dice2Element.style.display = 'none';
}


function holdScore() {
  if (gamePlaying) {
    scores[currentPlayer] = scores[currentPlayer] + roundScore;
    document.querySelector("#score-" + currentPlayer).textContent = scores[currentPlayer];
    var winningScore = document.getElementById("finalScore").value || 20;

    if (scores[currentPlayer] >= winningScore) {
      document.querySelector("#name-" + currentPlayer).textContent = "Winner!";
      document.querySelector('.player-' + currentPlayer + '-panel').classList.add('winner');
      document.querySelector('.player-' + currentPlayer + '-panel').classList.remove('active');
      dice1Element.style.display = 'none';
      dice2Element.style.display = 'none';
      gamePlaying = false;
    } else {
      resetPlayer();
    }
  }
}

function init() {
  scores = [0, 0];
  roundScore = 0;
  currentPlayer = 0;

  dice1Element.style.display = "none";
  dice2Element.style.display = "none";
  document.querySelector("#score-0").textContent = 0;
  document.querySelector("#score-1").textContent = 0;
  document.querySelector("#current-0").textContent = 0;
  document.querySelector("#current-1").textContent = 0;
  document.querySelector('.player-0-panel').classList.remove('winner');
  document.querySelector('.player-1-panel').classList.remove('winner');
  document.querySelector('.player-0-panel').classList.remove('active');
  document.querySelector('.player-1-panel').classList.remove('active');
  document.querySelector('.player-0-panel').classList.add('active');
  document.querySelector("#name-0").textContent = "Player 1";
  document.querySelector("#name-1").textContent = "Player 2";
  gamePlaying = true;
}