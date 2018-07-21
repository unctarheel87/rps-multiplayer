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
  
  let wins = 0;
  let losses = 0;
  
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
                          losses: 0}
                  }
        //set disconnect listener
        playerOneRef.onDisconnect().remove();
  
        $('#user').html(`${userId} <p>You are Player 1</p>`).data({name: userId, player: 1});
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
        $('#user').html(`${userId} <p>You are Player 2</p>`).data({name: userId, player: 2});
        //hide player1 selections
        $('.selections').hide();
        //set disconnect listener
        playerTwoRef.onDisconnect().remove();  
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
        $('#player-one .body').empty();
        $('#player-one').addClass('is-turn');
        $('#player-one .body').append(selections);
        selections.addClass('selections').html(`
                        <i data-name="rock" class="fas fa-hand-rock fa-3x hand"></i>
                        <i data-name="paper" class="fas fa-hand-paper fa-3x hand"></i>
                        <i data-name="scissors" class="fas fa-hand-scissors fa-3x hand"></i>
                        `)                
      } else if ((snapshot.val() === 2)) {
        const selections = $('<div>');
        $('#player-one').removeClass('is-turn');
        $('#player-two .body').empty();
        $('#player-two').addClass('is-turn')
        $('#player-two .body').append(selections);
        selections.addClass('selections').html(`
                        <i data-name="rock" class="fas fa-hand-rock fa-3x hand"></i>
                        <i data-name="paper" class="fas fa-hand-paper fa-3x hand"></i>
                        <i data-name="scissors" class="fas fa-hand-scissors fa-3x hand"></i>
                        `)
      }
    }
  });

//display players and enable chat
playersRef.on('value', function(snapshot) {
    if(!snapshot.val()) {
      return false;
    } else {
      $('.player-name').text('Waiting for Player');
      $('#player-one .wins').text("Wins: 0");
      $('#player-one .losses').text("Losses: 0");
      const players = snapshot.val();
      for(let player in players) {
        if(player === 'one') {
          const p = $('<h2>')
          $('#player-one .player-name').text(players[player].name).data({name:players[player].name});
          $('#player-one .wins').text("Wins: " + players[player].wins);
          $('#player-one .losses').text("Losses: " + players[player].losses);
          
          if($('#chat-btn').prop('disabled') === false) {
            const p = $('<p>');
            $('#chat .card').append(p);
            p.text($('#player-two .player-name').data('name') + ' has disconnected.');
            setTimeout(function() {
              $('#chat .chat-body').empty();
            }, 5000);
          }
        } else {
          const p = $('<h2>')
          $('#player-two .player-name').text(players[player].name).data({name:players[player].name});
          $('#player-two .wins').text("Wins: " + players[player].wins);
          $('#player-two .losses').text("Losses: " + players[player].losses);

          if($('#chat-btn').prop('disabled') === false) {
            const p = $('<p>');
            $('#chat .chat-body').append(p);
            p.text($('#player-one .player-name').data('name')+ ' has disconnected.');
            setTimeout(function() {
              $('#chat .card').empty();
            }, 5000);
          }
        }
      }
      if(players.one && players.two) {
        $('#chat-btn').prop('disabled', false);
      } 
    }
}); 

$(document).on('click', '#player-one .hand', function() {
  const choice = $(this).attr('data-name');
  $('#player-one .selections').html(`<h2>${choice}</h2>`)
  playerOneRef.update({choice})
  database.ref().update({turn: 2})
  $('#player-two .selections').hide();
});

$(document).on('click', '#player-two .hand', function() {
  const choice = $(this).attr('data-name');
  $('#player-two .selections').html(`<h2>${choice}</h2>`)
  playerTwoRef.update({choice})
  $('.selections').hide();
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
    $('#outcome').html(`<h1>${winner.winner} Wins!</h1>`);
    if(winner.winner === 'Tie') {
      $('#outcome').html(`<h1>${winner.winner}</h1>`);
    }
    $('#player-one .body').html(`<h2>${winner.playerOneChoice}</h2>`);
    $('#player-two .body').html(`<h2>${winner.playerTwoChoice}</h2>`);

    setTimeout(function() {
      database.ref().update({turn: 1});
      $('#player-two .body').empty();
      $('#outcome').empty();
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
  $('#chat .chat-body').prepend(p);
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
  wins++
  losses++
  if(playerOneChoice === playerTwoChoice) {
    winnerRef.set({winner: 'Tie', playerOneChoice, playerTwoChoice});
  } else if ((playerOneChoice === 'rock' && playerTwoChoice === 'scissors') || +
            (playerOneChoice === 'paper' && playerTwoChoice === 'rock') || +
            (playerOneChoice === 'scissors' && playerTwoChoice === 'paper')) {
    winnerRef.set({winner: playerOne, playerOneChoice, playerTwoChoice});
    playerOneRef.update({wins})
    playerTwoRef.update({losses})
  } else {
    winnerRef.set({winner: playerTwo, playerOneChoice, playerTwoChoice});
    playerOneRef.update({losses})
    playerTwoRef.update({wins})
  }
}  
