
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
const $last_move_list = document.getElementById('last_move_list');

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
        draw_avatars();
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

        // user_list = "";
        // for (var i = 0; i < users.length; i++) {
        //         user_list += '<tr><td>'+(i+1).toString()+'</td><td>'+users[i].username+'</td><td>'+'0'+'</td><td>'+'0'+'</td></tr>';
        // }


        // $score_board_list.innerHTML = user_list;
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

var images = {};

function draw_avatars() {
        var players = [];
        for (var i = 0; i < game_data["users"].length; i++) {
                players.push(game_data["users"][i].username);
        }

        var startAngle = -Math.PI / (players.length);
        var arc = Math.PI / (players.length / 2);

        var ctx;

        var center = 500;

        var AVATAR_BASE_URL = "https://avatars.dicebear.com/api/avataaars/";

        for (var i = 0; i < players.length; i++) {
                var uri = AVATAR_BASE_URL + players[i] + ".svg";
                images[i] = new Image();
                images[i].src = uri;
        }

        var canvas = document.getElementById("canvas");
        if (canvas.getContext) {
                var imgRadius = 425;
                var textRadius = imgRadius + 0;

                ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, 1000, 1000);

                ctx.font = 'bold 16px Athiti, Arial';

                for (var i = 0; i < players.length; i++) {
                        var angle = startAngle + i * arc + (3 * Math.PI / 180);

                        ctx.save();

                        ctx.shadowOffsetX = -1;
                        ctx.shadowOffsetY = -1;
                        ctx.shadowBlur = 0;
                        ctx.shadowColor = "rgb(220,220,220)";
                        ctx.fillStyle = "black";
                        ctx.translate(center + Math.cos(angle + arc / 2) * textRadius,
                                center + Math.sin(angle + arc / 2) * textRadius);
                        var text = players[i];
                        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);

                        var img = new Image();
                        angle -= 6 * Math.PI / 180;
                        img.setAtX = center + Math.cos(angle + arc / 2) * imgRadius - 30;
                        img.setAtY = center + Math.sin(angle + arc / 2) * imgRadius - 30;
                        img.onload = function () {
                                ctx.drawImage(this, this.setAtX, this.setAtY, 60, 60);
                        };
                        var uri = AVATAR_BASE_URL + text + ".svg";
                        img.src = uri;
                        
                        ctx.restore();
                }
        }

}


function highlight_current_player(turn) {
        var players = [];
        for (var i = 0; i < game_data["users"].length; i++) {
                players.push(game_data["users"][i].username);
        }

        var startAngle = -Math.PI / (players.length);
        var arc = Math.PI / (players.length / 2);

        var ctx;

        var center = 500;

        var AVATAR_BASE_URL = "https://avatars.dicebear.com/api/avataaars/";

        for (var i = 0; i < players.length; i++) {
                var uri = AVATAR_BASE_URL + players[i] + ".svg";
                images[i] = new Image();
                images[i].src = uri;
        }

        var canvas = document.getElementById("canvas");
        if (canvas.getContext) {
                var imgRadius = 425;
                var textRadius = imgRadius + 0;

                ctx = canvas.getContext("2d");
                // ctx.clearRect(0, 0, 1000, 1000);

                ctx.font = 'bold 16px Athiti, Arial';

                for (var i = 0; i < players.length; i++) {
                        var angle = startAngle + i * arc + (3 * Math.PI / 180);

                        ctx.save();

                        ctx.shadowOffsetX = -1;
                        ctx.shadowOffsetY = -1;
                        ctx.shadowBlur = 0;
                        ctx.shadowColor = "rgb(220,220,220)";
                        if (i == turn) {
                                ctx.fillStyle = "red";
                        } else {
                                ctx.fillStyle = "black";
                        }
                        ctx.translate(center + Math.cos(angle + arc / 2) * textRadius,
                                center + Math.sin(angle + arc / 2) * textRadius);
                        var text = players[i];
                        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);

                        var img = new Image();
                        angle -= 6 * Math.PI / 180;
                        img.setAtX = center + Math.cos(angle + arc / 2) * imgRadius - 30;
                        img.setAtY = center + Math.sin(angle + arc / 2) * imgRadius - 30;
                        img.onload = function () {
                                ctx.drawImage(this, this.setAtX, this.setAtY, 60, 60);
                        };
                        var uri = AVATAR_BASE_URL + text + ".svg";
                        img.src = uri;
                        
                        ctx.restore();
                }
        }
}



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

// Gameplay Buttons....
var $bet = document.createElement('button')
var $raise = document.createElement('button')
var $sideShow = document.createElement('button')
var $show = document.createElement('button')
var $fold = document.createElement('button')
// Gameplay Buttons....

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


// TextContent Set of gameplay buttons.....
$bet.textContent = 'Bet'
$raise.textContent = 'Raise'
$sideShow.textContent = 'Side Show'
$show.textContent = 'Show'
$fold.textContent = 'Fold'
// TextContent Set of gameplay buttons.....


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
var gamePlayData = {};
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

// Gameplay Events....
// Make bet...
$bet.addEventListener('click', function() {
        socket.emit('make bet',current_user.room_id,current_user.client_id);
        console.log("Make bet");
})
// Make bet...

// Raise bet...
$raise.addEventListener('click', function() {
        socket.emit('raise bet',current_user.room_id,current_user.client_id);
})
// Raise bet...

// request side show...
$sideShow.addEventListener('click', function() {
        socket.emit('request side show',current_user.room_id,current_user.client_id);
})
// request side show...

// request show...
$show.addEventListener('click', function() {
        socket.emit('request show',current_user.room_id,current_user.client_id);
})
// request show...

// fold...
$fold.addEventListener('click', function() {
        socket.emit('fold',current_user.room_id,current_user.client_id);
})
// fold...
// Gameplay Events....

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
socket.on('distribution done', (data,gamePlayDataServer)=>{
        
        gamePlayData=gamePlayDataServer;
       
        // invalidate all data
        for(let i=0; i<deck.cards.length; i++){
                deck.cards[i].i = JOKER_ID;
                deck.cards[i].pos = -1;
                deck.cards[i].rank = -1;
                deck.cards[i].suit = -1;
        }
        
        // distribute cards to respective position
        deck.queue(animate_distribution);

        // Gameplay addition....
        $topbar.appendChild($bet);
        $topbar.appendChild($raise);
        $topbar.appendChild($sideShow);
        $topbar.appendChild($show);
        $topbar.appendChild($fold);
        // Gameplay addition....

        highlight_current_player(0);
        update_score_board(gamePlayData);
})

function update_score_board(gamePlayData){

        // if(!gamePlayData  || !gamePlayData.user){
        //         return ;
        // }
        console.log("Score board")
        console.log(gamePlayData);

        var users_obj = gamePlayData.user;

        var users = Object.keys(users_obj).map((key)=>{
                return users_obj[key];
        });


        users.sort((a,b)=>{
                return b.value - a.value;

        });

        user_list = "";
        for (var i = 0; i < users.length; i++) {
                user_list += '<tr><td>'+(i+1).toString()+'</td><td>'+users[i].username+'</td><td>'+users[i].currentBet.toString()+'</td><td>'+users[i].value.toString()+'</td></tr>';
        }

        $score_board_list.innerHTML = user_list;

};

/*
the player with index "idx" is sent to the position at an angle of 
theta = idx * 360 / N;
where N is number of players
idx = index in the stored array of server 
i.e index in users[room_id]
 */
function animate_distribution() {

        var counter2 = 0;

        let outer_radius = 325;
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

// Gameplay events....
socket.on('its not your turn',()=>{
        console.log("its not your turn");
})

socket.on('cannot show until exactly 2 players left',()=>{
        console.log("cannot show until exactly 2 players left");
})

socket.on('cannot request side show without more than 2 players',()=>{
        console.log("cannot request side show without more than 2 players");
})

socket.on('side show requested',()=>{
        console.log('side show requested');
})

socket.on('recieved final show data',(cards1,cards2) => {
        
        for(var j=0;j<3;j++){

                var i,rank,suit;

                i = cards1[j].card_idx;
                rank = i% 13 + 1;
                suit = i/ 13 | 0;

                deck.cards[cards1[j].deck_idx].i = i;
                deck.cards[cards1[j].deck_idx].rank = rank;
                deck.cards[cards1[j].deck_idx].suit = suit;
                deck.cards[cards1[j].deck_idx].enableDragging();
                deck.cards[cards1[j].deck_idx].setSide('front');

                i = cards2[j].card_idx;
                rank = i% 13 + 1;
                suit = i/ 13 | 0;

                deck.cards[cards2[j].deck_idx].i = i;
                deck.cards[cards2[j].deck_idx].rank = rank;
                deck.cards[cards2[j].deck_idx].suit = suit;
                deck.cards[cards2[j].deck_idx].enableDragging();
                deck.cards[cards2[j].deck_idx].setSide('front');

        }
})

socket.on('turn complete',(gamePlayDataServer,move)=>{
        
        let previousTurn = gamePlayData["turn"];
        
        gamePlayData = gamePlayDataServer;
        
        let currentTurn = gamePlayData["turn"];
        
        console.log('previousTurn : ' + previousTurn + "\n currentTurn : " + currentTurn);
        update_turn_ui(previousTurn, currentTurn);
        
        console.log('Move made : ' + move);
        display_move_ui(previousTurn, move);
        
        // move cards of player previousTurn to deck.
        if(move == 'fold')
                deck.queue(fold_cards_animation(previousTurn));
                /* 
                Note that when 2 players are left in the game, and one of them folds
                we don't show the cards of winning player, this is done to prevent others 
                from observing if the winning player was bluffing or not.
                */

        // request show data for p1, p2 and flip respective indexes
        else if(move == 'request show')
                socket.emit('request final show data',current_user.room_id,previousTurn,currentTurn);

})

socket.on('game completed',(gamePlayDataServer,win_indexes)=>{

        gamePlayData = gamePlayDataServer;
        for(let i=0; i<win_indexes.length ; i++)
                console.log("game won by : " + win_indexes[i]);
        
        // may be used for next round animation
        // for(let i=0; i<win_indexes.length ; i++)
        //         deck.queue(fold_cards_animation(win_indexes[i]));
        
        // for next round
        display_move_ui(-1,-1)
        refresh_game_ui();

});
// Gameplay events....

// Gameplay UI updates ...............

function update_turn_ui(previousTurn,currentTurn) 
{
        // change font colors according to turn
        highlight_current_player(currentTurn)
}

function display_move_ui(previousTurn,move) {
        // display move made by player previousTurn
        var last_move = "";

        if(previousTurn !== -1){
                var previousPlayerName = game_data["users"][previousTurn].username;
                last_move += "<tr><td style=\"text-align: left; font-size: 18px\">Previous move made by: " + previousPlayerName + "</td></tr>"
                last_move += "<tr><td style=\"text-align: left; font-size: 18px\">Move: " + move + "</td></tr>";
        }

        last_move += "<tr><td style=\"text-align: left; font-size: 18px\">Current Bet: " +'<b>'+ gamePlayData.betValue +'</b>'+"</td></tr>";
        last_move += "<tr><td style=\"text-align: left; font-size: 18px\">Pot Amount: " +'<b>'+ gamePlayData.pot +'</b>'+"</td></tr>";

        last_move_list.innerHTML = last_move;
        update_score_board(gamePlayData);
}

function refresh_game_ui()
{
        
        // change deck and other necessary things to start next round
        // Note : DO not animate cards until the next round is started
}
function fold_cards_animation(playerIdx)
{       
        let N = game_data["users"].length;
        for(let j = 0; j < 3; j++)
        {
                let card_idx = 51-(N*j+playerIdx);
                deck.cards[card_idx].setSide('back');
                deck.cards[card_idx].disableDragging();
                deck.cards[card_idx].animateTo({
        
                        delay: 500*j,
                        duration: 500,
                        ease: 'quartOut',
        
                        x: -0.25*card_idx,
                        y: -0.25*card_idx,
                        z: 0.25*(card_idx+1),
                        rot: 0
                });
        }
}

// Gameplay UI updates ...............
