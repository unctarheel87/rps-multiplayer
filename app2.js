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
  const playersRef = database.ref('/players/');

  $('#add-player').on('click', function(e) {
    e.preventDefault()
    let userId = $('#name').val().trim();
    $('#user').text(userId);
    playersRef.transaction(function(players) {
      if(!players) {
        players = { one: {name: userId,
                          wins: 0,
                          losses: 0}
                  }

        const playerOneRef = database.ref('/players/one')
        playerOneRef.onDisconnect().remove();              
      } else if (players.hasOwnProperty('one') && players.hasOwnProperty('two')) {
        alert('game is full');
        return players
      } else if (players.hasOwnProperty('one')) {
        players = { ...players, 
                  two: {name: userId,
                    wins: 0,
                    losses: 0}
                  }
        database.ref().update({turn: 1})

        const playerTwoRef = database.ref('/players/two')
        playerTwoRef.onDisconnect().remove();  
      }            
      return players
    });
    if(database.ref('/player/two')) {
      $('.selections').hide();
    }
  });
  
  database.ref().on('value', function(snapshot) {
    if(snapshot.val().turn === 1) {
      const selections = $('<div>');
      $('#player-one').append(selections).addClass('is-turn');
      selections.addClass('selections').html(`
                      <i data-name="rock" class="fas fa-hand-rock fa-3x hand"></i>
                      <i data-name="paper" class="fas fa-hand-paper fa-3x hand"></i>
                      <i data-name="scissors" class="fas fa-hand-scissors fa-3x hand"></i>
                      `)
    }
  });

  playersRef.on('value', function(snapshot) {
    const players = snapshot.val();
    for(let player in players) {
      if(player === 'one') {
        $('#player-one').text(players[player].name);
      } else {
        $('#player-two').text(players[player].name);
      }
    }
});

$(document).on('click', '.hand', function() {
  const choice = $(this).attr('data-name');
  $('.selections').html(`<h2>${choice}</h2>`)
})
