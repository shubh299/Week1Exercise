//game configs
const playfield_rows = 2;
const playfield_columns = 3;
const timer = 20;
const min_moles = 1;
const max_moles = 4;
const mole_out_frequency = 900; //in ms

//variables for game
let cur_player_name = "player";
let timer_shown = timer;
let cur_score = 0;
let timer_interval;
let mole_pop_interval;

class Score {
    constructor(name, score, time) {
        this.name = name;
        this.score = score;
        this.time = time;
    }
}

//sorts the scores in decreasing order of score and then increasing order of time
function score_compare(score1, score2){
    if(score1.score > score2.score){
        return -1;
    }
    if(score1.score == score2.score){
        if(score1.time > score2.time){
            return 1;
        }
        if(score1.time < score2.time){
            return -1;
        }
    }
    return 1;
}

$("#new-game-btn").click(new_game);

//function to setup a new game
function new_game(){
    $(".user-details").css("display","flex");
    $(".user-details").css("justify-content","center");
    $(".leaderboard-container").css("display","none");
    $(".game-page").css("display","none");
    $("#leaderboard-table").remove();
}

//generate and display leaderboard
function show_leaderboard(){
    clearTimeout(timer_interval);
    clearTimeout(mole_pop_interval);

    $(".user-details").css("display","none");
    $(".leaderboard-container").css("display","flex");
    $(".game-page").css("display","none");

    var current_leaderboard = JSON.parse(localStorage.getItem('score_leaderboard'));
    var new_Score = new Score(cur_player_name, cur_score, timer);
    if(current_leaderboard === null){
        current_leaderboard = [];
    }


    //updating leaderboard
    current_leaderboard.push(new_Score);
    current_leaderboard.sort(score_compare);
    let top5_scores = current_leaderboard.slice(0,5); 

    // localStorage.setItem('score_leaderboard',JSON.stringify(current_leaderboard));
    localStorage.setItem('score_leaderboard',JSON.stringify(top5_scores)); //comment this line and uncomment above line to store all scores

    //creating leaderboard table
    var leaderboard_table = $(`<table id='leaderboard-table'>\
    <tr><th colspan="4">LEADERBOARD</th></tr>\
    <tr><th>Rank</th>\
    <th>Player</th><th>Score</th><th>Time</th></tr></table>`);
    for(let i = 0; i < top5_scores.length ; i++){
        let new_row = $(`<tr><td>${i+1}</td>\
        <td>${top5_scores[i].name}</td>\
        <td>${top5_scores[i].score}</td>\
        <td>${top5_scores[i].time}</td></tr>`);
        leaderboard_table.append(new_row);
    }
    leaderboard_table.css('text-align','center');   
    $(".leaderboard-container").append(leaderboard_table);
    $("#playfield").empty();
}

//revert to original background after changing color
const reset_background = () => {
    $("body").css("background-color","rgb(26 171 79)");
}

//to update ui and background data based on whacking mole
function mole_whack(event){
    let clicked_id = $(event.currentTarget).attr('id');

    $("body").css("background-color","red");
    setTimeout(reset_background,100);
    cur_score += 1;
    $("#current-score").text(cur_score);
    let pit_number = clicked_id.substring(4);
    $(`#mole${pit_number}`).remove();

    $(`#${clicked_id}`).off();
}

function remove_all_moles(pit_numbers){
    pit_numbers.forEach(pit =>{
        $(`#mole${pit}`).remove();
        $(`#dirt${pit}`).off();
    });
}

function pop_mole(){
    /**
     * add maths for number of moles
     **/
    let no_of_moles_slots = max_moles - min_moles + 1;
    let slot_number = (timer - timer_shown)/timer;
    let number_of_moles = min_moles + Math.floor(slot_number*no_of_moles_slots);
    
    //generating random dirt numbers
    let mole_pits = new Set();
    while(mole_pits.size != number_of_moles){
        let new_pit = Math.floor(Math.random()*(playfield_columns*playfield_rows));
        mole_pits.add(new_pit);
    }
    mole_pits.forEach(pit =>{
        let mole = $(`<img id="mole${pit}" src = "mole.svg"/>`);
        mole.css("width",`60%`);
        mole.css("height","auto");
        mole.css("position","absolute");
        mole.css("bottom","10px");
        $(`#dirt${pit}`).append(mole);
        $(`#dirt${pit}`).on("click",mole_whack);
    });

    setTimeout(remove_all_moles.bind(null,mole_pits),mole_out_frequency-200);
    
}

const update_timer = () => {
    timer_shown = timer_shown - 1;
    $("#time-left").text(timer_shown);
}

function create_playfield(rows, columns){

    //creating dirtpits in playfield
    for(let i = 0; i < rows*columns; i++){
        let dirt = $(`<img src = "dirt.svg"/>`);
        dirt.css("width",`100%`);
        dirt.css("height","auto");

        var pits = $(`<div id="dirt${i}"></div>`);
        pits.css("width",`${100/columns-6}%`);
        // pits.css("width",`fit-content`);
        pits.css("height","auto");
        pits.css("display","flex");
        pits.css("justify-content","center");
        pits.css("margin-top",`100px`);
        pits.css("margin-left","3%");
        pits.css("margin-right","3%");
        pits.css("position",`relative`);
        pits.append(dirt);
        
        $("#playfield").append(pits);
    }
}

function start_game(){
    $(".user-details").css("display","none");
    $(".leaderboard-container").css("display","none");
    $(".game-page").css("display","flex");
    $(".game-page").css("justify-content","center");
    $(".game-page").css("flex-direction","column");


    $("#time-left").text(timer_shown);
    cur_score = 0;
    $("#current-score").text(cur_score);

    create_playfield(playfield_rows,playfield_columns);

    document.getElementById("playfield").scrollIntoView(true);
    
    timer_interval = setInterval(update_timer,1000);
    setTimeout(show_leaderboard,timer*1000);
    
    mole_pop_interval = setInterval(pop_mole,mole_out_frequency);
}

//handles user name
$("#player-name").val(cur_player_name)

$("#start-btn").on('click',function(){
    cur_player_name = $("#player-name").val();
    if(cur_player_name.trim()==""){
        alert("Enter name");
    }
    else{
        timer_shown = timer;
        start_game();
    }
});
