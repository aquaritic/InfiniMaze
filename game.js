const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//Objects

const player = {
    x: 0,
    y: 0,
    size: 30,
    speed: 5
};

const camera = {
    x: 0,
    y: 0
};

//Controls

const keys = {};

window.addEventListener("keydown", e => {
    keys[e.key] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key] = false;
});

//Canvas

function update(){

if(keys["w"]){
    player.y -= player.speed;
}

if(keys["a"]){
    player.x -= player.speed;
}

if(keys["s"]){
    player.y += player.speed;
}

if(keys["d"]){
    player.x += player.speed;
}

camera.x = player.x - canvas.width / 2;
camera.y = player.y - canvas.height / 2;

}

function draw(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.save();

    ctx.translate(
        -camera.x,
        -camera.y
    );

    //player
    ctx.fillStyle = "skyblue";
    ctx.fillRect(
        player.x,
        player.y,
        player.size,
        player.size
    );

    ctx.restore();

}

function gameLoop(){

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();