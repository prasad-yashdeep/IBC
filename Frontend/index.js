
const $container = document.getElementById('container');
const $home_page = document.getElementById('home_page');
const $name_input_create_game = document.getElementById('name_input_create_game');
const $create_game_div = document.getElementById('create_game_div');
const $name_input_join_game = document.getElementById('name_input_join_game');
const $room_id_input = document.getElementById('room_id_input');
const $join_game_div = document.getElementById('join_game_div');
const $start_page = document.getElementById('start_page');
const $room_id_display = document.getElementById('room_id_display');
const $active_users = document.getElementById('active_users');
const $start_game_div = document.getElementById('start_game_div');
const $game_content = document.getElementById('game_content');
const $table_container = document.getElementById('table_container');
const $topbar = document.getElementById('topbar');
const $chat_messages_display = document.getElementById('chat_messages_display');
const $chat_input = document.getElementById('chat_input');
const $score_board_list = document.getElementById('score_board_list');

var welcome_deck = undefined;
const JOKER_ID = 54;

const socket = io('http://localhost:3000');

const current_user = {
        name: "",
        room_id: "",
        client_id: "",
        admin:false
};


$create_game_div.addEventListener('click', (e) => {

        const name = $name_input_create_game.value;
        current_user.name = name;

        socket.emit('create new game', name);
        current_user.admin = true;
        $start_game_div.style.display='block';

        // options only for the person who created game.
        // $topbar.appendChild($flip);
        // $topbar.appendChild($shuffle);
        // $topbar.appendChild($bysuit);
        // $topbar.appendChild($fan);
        // $topbar.appendChild($sort);
        $topbar.appendChild($distribute);
});

$join_game_div.addEventListener('click', (e) => {

        const name = $name_input_join_game.value;
        const room_id = $room_id_input.value;
        current_user.name = name;

        socket.emit('join game', name, room_id);
});

$start_game_div.addEventListener('click', (e) => {

        socket.emit('start new game');
});

socket.on('start game for all users',(users)=>{

        welcome_deck.unmount($container);
        $start_page.style.display = "none";
        $game_content.style.display = "block";
        // add list of users to game data for avatar
        game_data["users"] = users;
        // game starts with the first user's turn
        game_data["turn"] = 0;
        game_start_animation();
});

socket.on('new room id', (room_id,client_id) => {

        $room_id_display.value = room_id;

        current_user.room_id = room_id;
        current_user.client_id = client_id;

        $home_page.style.display = "none";
        $start_page.style.display = "flex";
});

socket.on('new users', (users) => {

        var user_list = "";

        for (var i = 0; i < users.length; i++) {
                user_list += '<input value="' + users[i].username + '" class="input100" type="text" name="username" placeholder="Enter display name" readonly />';
        }

        $active_users.innerHTML = user_list;

        user_list = "";
        for (var i = 0; i < users.length; i++) {
                user_list += '<tr><td>'+(i+1).toString()+'</td><td>'+users[i].username+'</td><td>'+'0'+'</td><td>'+'0'+'</td></tr>';
        }


        $score_board_list.innerHTML = user_list;
});

socket.on('new message', (messages) => {

        if (messages === undefined || messages.length === 0) {
                return;
        }
        
        var msg_list = "";
        for (var i = 0; i < messages.length; i++) {
                if (i%2 === 0){
                        msg_list += '<div class="'+'msg-send'+'">' + '<b>' + messages[i].sender + ': ' + '</b>' + messages[i].message + '</div>';
                }
                else{
                        msg_list += '<div class="'+'msg-receive'+'">' + '<b>' + messages[i].sender + ': ' + '</b>' + messages[i].message + '</div>';
                }
                
        }

        $chat_messages_display.innerHTML = msg_list;
});

socket.on('room_id does not exist', () => {
        
        console.log("Invalid room id");
});

// Explosion JS ...........................
function welcome_animation() {

        // create Deck
        welcome_deck = Deck();

        // add to DOM
        welcome_deck.mount($container);

        var counter = 0;
        function finished() {
                counter++;
                if (counter === 52) {

                        // setTimeout(function(){ document.getElementById('home_page').style.display='none'; welcome_deck.unmount($container); }, 3000);
                        document.getElementById('home_page').style.display = 'flex';
                }

        };

        welcome_deck.cards.forEach(function (card, i) {
                card.setSide('front');

                // explode
                card.animateTo({
                        delay: 1000 + i * 2, // wait 1 second + i * 2 ms
                        duration: 500,
                        ease: 'quartOut',

                        x: Math.random() * window.innerWidth - window.innerWidth / 2,
                        y: Math.random() * window.innerHeight - window.innerHeight / 2,
                        onComplete: finished
                });
        });

}
// Explosion JS ...........................

welcome_animation();

// Chat Box JS..................
$(function () {

        var arrow = $('.chat-head img');
        var textarea = $('.chat-text textarea');

        arrow.on('click', function () {
                var src = arrow.attr('src');

                $('.chat-body').slideToggle('fast');
                if (src == 'https://maxcdn.icons8.com/windows10/PNG/16/Arrows/angle_down-16.png') {
                        arrow.attr('src', 'https://maxcdn.icons8.com/windows10/PNG/16/Arrows/angle_up-16.png');
                }
                else {
                        arrow.attr('src', 'https://maxcdn.icons8.com/windows10/PNG/16/Arrows/angle_down-16.png');
                }
        });

        textarea.keypress(function (event) {
                var $this = $(this);

                if (event.keyCode == 13) { // enter key

                        var msg = $this.val();
                        $this.val('');
                        const room_id = current_user.room_id;
                        const sender = current_user.name;

                        socket.emit('send message', msg, sender, room_id);
                        // $('.msg-insert').append("<div class='msg-send'>" + msg + "</div>");
                        return false;
                }
        });
});
// Chat Box Js ...................



// Game Deck .....................
var prefix = Deck.prefix
var transform = prefix('transform')
var translate = Deck.translate

var $sort = document.createElement('button')
var $shuffle = document.createElement('button')
var $bysuit = document.createElement('button')
var $fan = document.createElement('button')
var $poker = document.createElement('button')
var $flip = document.createElement('button')
var $distribute = document.createElement('button')
var $view = document.createElement('button')

// $sort.disabled = true;
// $shuffle.disabled = true;
// $bysuit.disabled = true;
// $fan.disabled = true;
// $poker.disabled = true;
// $flip.disabled = true;
// $distribute.disabled = true;
$view.disabled = true;

$shuffle.textContent = 'Shuffle'
$sort.textContent = 'Sort'
$bysuit.textContent = 'By suit'
$fan.textContent = 'Fan'
$poker.textContent = 'Poker'
$flip.textContent = 'Flip'
$distribute.textContent = 'Distribute'
$view.textContent = 'View'

// $topbar.appendChild($flip)
// $topbar.appendChild($shuffle)
// $topbar.appendChild($bysuit)
// $topbar.appendChild($fan)
// $topbar.appendChild($poker)
// $topbar.appendChild($sort)
// $topbar.appendChild($distribute)
$topbar.appendChild($view)

// Game play Deck ............
var deck = Deck();
// stores all information about card distribution i.e which player has which cards
var game_data = {};
// Game play Deck ............

$shuffle.addEventListener('click', function () {
        deck.shuffle()
        deck.shuffle()
})
$sort.addEventListener('click', function () {
        deck.sort()
})
$bysuit.addEventListener('click', function () {
        deck.sort(true) // sort reversed
        deck.bysuit()
})
$fan.addEventListener('click', function () {
        deck.fan()
})
$flip.addEventListener('click', function () {
        deck.flip()
})
$poker.addEventListener('click', function () {
        deck.queue(function (next) {
                deck.cards.forEach(function (card, i) {
                        setTimeout(function () {
                                card.setSide('back')
                        }, i * 7.5)
                })
                next()
        })
        deck.shuffle()
        deck.shuffle()
        deck.poker()
})

$distribute.addEventListener('click', function () {
        
        
        deck.shuffle();

        console.log("deck sent =>");
        console.log(deck.cards);

        const room_id = current_user.room_id;
        const sender = current_user.name;
        socket.emit('distribute', deck.cards, sender, room_id);
})

$view.addEventListener('click', function () {
        socket.emit('request own card data',current_user.room_id,current_user.client_id);
})

deck.cards.forEach(function (card, i) {
        // card.enableFlipping();
        // card.enableDragging();
});

function game_start_animation() {
        deck.mount($container)
        deck.intro();
        deck.sort();
}

// Game Deck .....................


// Card distribution ..............

// when the server distributes all cards mount the new deck of cards recieved
socket.on('distribution done', (data)=>{
        
        if(!current_user.admin){
                deck.shuffle();
        }
        

        // invalidate all data
        for(let i=0; i<deck.cards.length; i++){
                deck.cards[i].i = JOKER_ID;
                deck.cards[i].pos = -1;
                deck.cards[i].rank = -1;
                deck.cards[i].suit = -1;
        }
        
        // distribute cards to respective position
        animate_distribution();
})

/*
the player with index "idx" is sent to the position at an angle of 
theta = idx * 360 / N;
where N is number of players
idx = index in the stored array of server 
i.e index in users[room_id]
 */
function animate_distribution() {

        var counter2 = 0;

        let outer_radius = 350;
        let inner_radius = outer_radius - 50;

        let delay = 0;
        let N = game_data["users"].length;
        let turn = game_data["turn"];
        
        let card_idx = 51;

        function distribution_complete() {

                if(counter2 === 3*N - 1){
                        console.log("Enable view button")
                        $view.disabled = false;
                }
                console.log(counter2);
                counter2++;
        }

        for (let j = 0; j < 3; j++) {
                
                // card distribution starts from the upper-most card i.e of index 51

                for(let i = 0; i < N; i++) {
                        
                        let idx = (turn + i) % N;
                        let rot = idx * 360 / N;
                        let radius = 0;
                        let card_rot = 0;
                        
                        delay = delay + 1;

                        if (j == 0)
                                radius = outer_radius;
                        else
                                radius = inner_radius;

                        if (j == 1)
                                card_rot = +5;
                        else if (j == 2)
                                card_rot = -5;

                        rot = rot + card_rot;

                        deck.cards[card_idx].animateTo({

                                delay: 500 * delay, // wait 1 second + i * 2 ms
                                duration: 500,
                                ease: 'quartOut',

                                x: Math.cos(rot*Math.PI/180) * radius,
                                y: Math.sin(rot*Math.PI/180) * radius,
                                rot: 720 + card_rot,
                                onComplete: distribution_complete
                        });

                        card_idx = card_idx - 1;
                
                }
        }
}
// Card distribution ...............

// View cards .........................
socket.on("view own cards",(data) => {

        console.log("View request")
        
        // modifying cards 
        var num_cards = data.length;
        for(var j=0;j<data.length;j++){

                var i = data[j].card_idx;
                var rank = i% 13 + 1;
                var suit = i/ 13 | 0;

                deck.cards[data[j].deck_idx].i = i;
                deck.cards[data[j].deck_idx].rank = rank;
                deck.cards[data[j].deck_idx].suit = suit;
                deck.cards[data[j].deck_idx].enableDragging();
                deck.cards[data[j].deck_idx].setSide('front');
        }

})
// View cards .........................
