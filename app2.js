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

  //refs
  const database = firebase.database();
  const playersRef = database.ref('/players/');
  const playerOneRef = database.ref('/players/one');
  const playerTwoRef = database.ref('/players/two');
  const winnerRef = database.ref('/winner');
  const turnRef = database.ref('/turn');
  const messagesRef = database.ref('/messages');
  
  let player1wins = 0;
  let player1losses = 0;
  let player2wins = 0;
  let player2losses = 0;
  let games = 0;
  
  turnRef.onDisconnect().remove();
  messagesRef.onDisconnect().remove();
  winnerRef.onDisconnect().remove();

  //player login
  $('#add-player').on('click', function(e) {
    e.preventDefault();
    let userId = $('#name').val().trim();
    $('#add-player').prop('disabled', true);
    playersRef.transaction(function(players) {
      if(!players) {
        players = { one: {name: userId,
                          wins: 0,
                          losses: 0},
                   }
        //set disconnect listener
        playerOneRef.onDisconnect().remove();
  
        $('#user').html(`<h3>Welcome ${userId}. You are Player 1.</h3>`).data({name: userId, player: 1});
        $('#player .form-group').empty();
      } else if (players.hasOwnProperty('one') && players.hasOwnProperty('two')) {
        $('#user').text('Sorry game is full...try again later.')
        return players
      } else if (players.hasOwnProperty('one')) {
        players = { ...players, 
                  two: {name: userId,
                    wins: 0,
                    losses: 0}
                  }
        database.ref().update({turn: 1})
        $('#user').html(`<h3>Welcome ${userId}. You are Player 2.<h3>`).data({name: userId, player: 2}).append(`<h4>Waiting for ${players.one.name} to choose...</h4>`);
        $('#player .form-group').empty();
        //set disconnect listener
        playerTwoRef.onDisconnect().remove();  
      } else if(players.hasOwnProperty('two')) {
        players = { one: {name: userId,
                          wins: 0,
                          losses: 0},
                   ...players }

        $('#user').html(`<h3>Welcome ${userId}. You are Player 1.</h3>`).data({name: userId, player: 1});
        //set disconnect listener
        playerOneRef.onDisconnect().remove();

        setTimeout(function() {
          database.ref().update({turn: 1})
        }, 2000);
        $('#player .form-group').empty(); 
      }                        
      return players;
    });
  });
  
  //turn logic
  turnRef.on('value', function(snapshot) {
    if(!snapshot.val()) {
      return false 
    } else {
      if(snapshot.val() === 1) {
        const selections = $('<div>');
        $('#player-two').removeClass('is-turn');
        $('#user h4').empty();
        if($('#user').data('player') === 1) {
          $('#user').append(`<h4>It's your turn.</h4>`)
        } else {
          $('#user').append(`<h4>Waiting for ${$('#player-one .player-name').data('name')} to choose...</h4>`)
        }
        $('#player-one .body').empty();
        $('#player-one').addClass('is-turn');
        $('#player-one .body').append(selections);
        if($('#user').data('player') === 1) {
        selections.addClass('selections').html(`
                        <i data-name="rock" class="fas fa-hand-rock fa-3x hand"></i>
                        <i data-name="paper" class="fas fa-hand-paper fa-3x hand"></i>
                        <i data-name="scissors" class="fas fa-hand-scissors fa-3x hand"></i>
                        `)
        }                                
      } else if ((snapshot.val() === 2)) {
        const selections = $('<div>');
        $('#player-one').removeClass('is-turn');
        $('#user h4').empty();
        if($('#user').data('player') === 2) {
          $('#user').append(`<h4>It's your turn.</h4>`)
        } else {
          $('#user').append(`<h4>Waiting for ${$('#player-two .player-name').data('name')} to choose...</h4>`)
        }
        $('#player-two .body').empty();
        $('#player-two').addClass('is-turn')
        $('#player-two .body').append(selections);
        if($('#user').data('player') === 2) {
        selections.addClass('selections').html(`
                        <i data-name="rock" class="fas fa-hand-rock fa-3x hand"></i>
                        <i data-name="paper" class="fas fa-hand-paper fa-3x hand"></i>
                        <i data-name="scissors" class="fas fa-hand-scissors fa-3x hand"></i>
                        `)
        }                
      }
    }
  });

//display players and enable chat
playersRef.on('value', function(snapshot) {
    if(!snapshot.val()) {
      $('.player-name').text('Waiting for Player');
      $('#player-one .wins').text("Wins: 0");
      $('#player-one .losses').text("Losses: 0");
      return false;
    } else {
      const players = snapshot.val();
      for(let player in players) {
        if(player === 'one') {
          const p = $('<h2>')
          $('#player-one .player-name').text(players[player].name).data({name:players[player].name});
          $('#player-one .wins').text("Wins: " + players[player].wins);
          $('#player-one .losses').text("Losses: " + players[player].losses);
        } else {
          const p = $('<h2>')
          $('#player-two .player-name').text(players[player].name).data({name:players[player].name});
          $('#player-two .wins').text("Wins: " + players[player].wins);
          $('#player-two .losses').text("Losses: " + players[player].losses);
        }
      }
      if(players.one && players.two) {
        $('#chat-btn').prop('disabled', false);
      }
      
      //disconnect logic
      if($('#chat-btn').prop('disabled') === false && !players.two) {
        const p = $('<p>');
        $('#chat .chat-body').append(p);
        p.text($('#player-two .player-name').data('name') + ' has disconnected.');
        $('#player-two').removeClass('is-turn');
        $('#player-one').removeClass('is-turn');
        $('#player-two .player-name').text('Waiting for Player');
        $('.selections').hide();
        $('#user h4').remove();
        setTimeout(function() {
          $('#chat .chat-body').empty();
          $('#chat-btn').prop('disabled', true);
        }, 5000);
      } else if($('#chat-btn').prop('disabled') === false && !players.one) {
        const p = $('<p>');
        $('#chat .chat-body').append(p);
        p.text($('#player-one .player-name').data('name') + ' has disconnected.');
        $('#player-one').removeClass('is-turn');
        $('#player-two').removeClass('is-turn');
        $('#player-one .player-name').text('Waiting for Player');
        $('#user h4').remove();
        $('.selections').hide();
        setTimeout(function() {
          $('#chat .chat-body').empty();
          $('#chat-btn').prop('disabled', true);
        }, 5000);
      }
    }
}); 

$(document).on('click', '#player-one .hand', function() {
  const choice = $(this).attr('data-name');
  $('#player-one .selections').html(`<h2>${choice}</h2>`).hide().fadeIn();
  playerOneRef.update({choice})
  database.ref().update({turn: 2})
});

$(document).on('click', '#player-two .hand', function() {
  const choice = $(this).attr('data-name');
  $('#player-two .selections').html(`<h2>${choice}</h2>`).hide().fadeIn();
  playerTwoRef.update({choice})
  playersRef.once('value', function(snapshot) {
    if(!snapshot.val()) {
      return false;
    } else {
      const playerOneChoice = snapshot.val().one.choice;
      const playerTwoChoice = snapshot.val().two.choice;
      const playerOne = snapshot.val().one.name;
      const playerTwo = snapshot.val().two.name;
      chooseRPS(playerOneChoice, playerTwoChoice, playerOne, playerTwo);
    }
  });
});

winnerRef.on('value', function(snapshot) {
  if(!snapshot.val()) {
    return false;
  } else {
    const winner = snapshot.val();
    const h1 = $('<h1>')
    $('#outcome').addClass('yellow').append(h1);
    h1.text(`${winner.winner} Wins!`).hide().fadeIn();
    if(winner.winner === 'Tie') {
      h1.text(`${winner.winner}!`).hide().fadeIn();
    }
    $('#player-one .body').html(`<h2>${winner.playerOneChoice}</h2>`).hide().fadeIn();
    $('#player-two .body').html(`<h2>${winner.playerTwoChoice}</h2>`).hide().fadeIn();
    $('#remove-player').prop('disabled', true);
    setTimeout(function() {
      database.ref().update({turn: 1});
      $('#player-two .body').empty();
      $('#outcome').empty().removeClass('yellow');
      $('#remove-player').prop('disabled', false);
      if($('#user').data('player') === 2) {
        $('.selections').hide();
      }
    }, 3000);
  }
});

// chat functionality
$('#chat-btn').on('click', addMsg)

messagesRef.on('child_added', function(snapshot) {
  const p = $('<p>');
  $('#chat .chat-body').append(p);
  p.text(snapshot.val().name + ': ' + snapshot.val().msg)
});

function addMsg(e) {
  e.preventDefault();
  const msg = $('#chat-input').val().trim();
  const name = $('#user').data('name');
  messagesRef.push({name, msg});
} 

//rps function
function chooseRPS(playerOneChoice, playerTwoChoice, playerOne, playerTwo) {
  //game logic
  games++
  if(playerOneChoice === playerTwoChoice) {
    winnerRef.set({winner: 'Tie', playerOneChoice, playerTwoChoice, games});
  } else if ((playerOneChoice === 'rock' && playerTwoChoice === 'scissors') || +
            (playerOneChoice === 'paper' && playerTwoChoice === 'rock') || +
            (playerOneChoice === 'scissors' && playerTwoChoice === 'paper')) {
    winnerRef.set({winner: playerOne, playerOneChoice, playerTwoChoice, games});
    player1wins++
    player2losses++
    playerOneRef.update({wins: player1wins})
    playerTwoRef.update({losses: player2losses})
  } else {
    winnerRef.set({winner: playerTwo, playerOneChoice, playerTwoChoice, games});
    player2wins++
    player1losses++
    playerOneRef.update({losses: player1losses})
    playerTwoRef.update({wins: player2wins})
  }
}  
