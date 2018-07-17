  // Initialize Firebase
  const config = {
    apiKey: "AIzaSyD1cyxQfGrlakzTB9EQ8RY9UBj6RryPn-U",
    authDomain: "rps-m-cb810.firebaseapp.com",
    databaseURL: "https://rps-m-cb810.firebaseio.com",
    projectId: "rps-m-cb810",
    storageBucket: "",
    messagingSenderId: "959550115070"
  };
  firebase.initializeApp(config);

  const database = firebase.database();

  let playerChoice = '';
  let opponentChoice = '';
  let players = {
    playerOne: {
      isPlaying: false,
      name: '',
      choice: ''
    },
    playerTwo: {
      isPlaying: false,
      name: '',
      choice: ''
    }
  }

database.ref().on('value', function(snapshot) {
    if(snapshot.val().playerOne.isPlaying && snapshot.val().playerTwo.isPlaying) {
      players.playerTwo.isPlaying = true;
      players.playerTwo.name = snapshot.val().playerTwo.name;
    } else if(snapshot.val().playerOne.isPlaying) {
      players.playerOne.isPlaying = true;
      players.playerOne.name = snapshot.val().playerOne.name;
    }
  }, function(errorObj) {
    console.log('error code: ' + errorObj.code);
  }); 
 
$('#add-player').on('click', addPlayer);   
$(document).on('click', '.hand', chooseRPS);
$(document).on('click', '.hand', chooseRPS);
$('#reset').on('click', reset);



function chooseRPS() {
  switch($(this).attr('data-name')) {
    case 'rock':
      playerChoice = 'rock'  
      break;
    case 'paper':
      playerChoice = 'paper' 
      break;
    case 'scissors':
      playerChoice = 'scissors' 
      break;
  }
  return playerChoice 

  //game logic
  if(playerOneChoice === playerTwoChoice) {
    $('#outcome').html(`<h2>Tie!</h2>`);
  } else if ((playerOneChoice === 'rock' && playerTwoChoice === 'scissors') || +
            (playerOneChoice === 'paper' && playerTwoChoice === 'rock') || +
            (playerOneChoice === 'scissors' && oplayerTwoChoice === 'paper')) {
    $('#outcome').html(`<h2>Player Wins!</h2>`);
  } else {
    $('#outcome').html(`<h2>Opponent Wins!</h2>`);
  }
}  


function reset() {
  database.ref().set({
    playerOne: {
      isPlaying: false
    },
    playerTwo: {
      isPlaying: false
    }
  });
}  

function addPlayer(e) {
  e.preventDefault();
  console.log(players)
  const playerName = $('#name').val().trim();

  if(players.playerOne.isPlaying && players.playerTwo.isPlaying) {
    return false
  } else if(players.playerOne.isPlaying) {
    player = 'playerTwo'
  } else {
    player = 'playerOne'
  }              
  database.ref().update({
    [player]: {
      name: playerName,
      isPlaying: true
    }
  });
  console.log(player)
  const cardDiv = $('<div>').attr('id', 'selections');
  //player
  if(player === 'playerOne') {
    $('#player-one').append(cardDiv).css('border', '3px solid skyblue');
  } else {
    $('#player-two').append(cardDiv).css('border', '3px solid skyblue');
  }
  cardDiv.addClass('card-body').html(`<h1>${playerName}</h2>`);
  //game choices
  const selections = $('<div>');
  cardDiv.append(selections);
  selections.html(`
                  <i data-name="rock" class="fas fa-hand-rock fa-3x hand"></i>
                  <i data-name="paper" class="fas fa-hand-paper fa-3x hand"></i>
                  <i data-name="scissors" class="fas fa-hand-scissors fa-3x hand"></i>
                  `)
}  

