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

camera.x = player.x + player.size / 2 - canvas.width / 2;
camera.y = player.y + player.size / 2 - canvas.height / 2;

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

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    for(let chunk of world.chunks.values()){
        
        for(let cell of chunk.maze.cells){

            let x = chunk.chunkX * mazeWidth * tileSize + cell.x * tileSize;
            let y = chunk.chunkY * mazeHeight * tileSize + cell.y * tileSize;

            ctx.beginPath();

        if(cell.walls.top){
            ctx.moveTo(x, y);
            ctx.lineTo(x + tileSize, y);
        }

        if(cell.walls.right){
            ctx.moveTo(x + tileSize, y);
            ctx.lineTo(x + tileSize, y + tileSize);
        }

        if(cell.walls.bottom){
            ctx.moveTo(x + tileSize, y + tileSize);
            ctx.lineTo(x, y + tileSize);
        }

        if(cell.walls.left){
            ctx.moveTo(x, y + tileSize);
            ctx.lineTo(x, y);
        }

        ctx.stroke();
        }
    }

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

//Maze

const tileSize = 40;
const mazeWidth = 15;
const mazeHeight = 15;

class Cell {

    constructor(x, y){

        this.x = x;
        this.y = y;

        this.visited = false;

        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true
        };
    }

}

class Maze {

    constructor(width, height){
        this.width = width;
        this.height = height;
        this.cells = [];

        for(let y = 0; y < height; y++){
            for(let x = 0; x < width; x++){
                this.cells.push(
                    new Cell(x, y)
                );
            }
        }
        this.generate();
    }

    getCell(x, y){

        if(x < 0 || y < 0 || x>= this.width || y >= this.height){
            return null;
        }

        return this.cells[y * this.width + x];

    }

    generate(){

        let stack = [];
        let current = this.cells[0];
        current.visited = true;

        while(true){
            let neighbors = this.getUnvisitedNeighbors(current);

            if(neighbors.length > 0){
                let next = neighbors[Math.floor(Math.random() * neighbors.length)];

                this.removeWalls(current, next);
                stack.push(current);

                current = next;
                current.visited = true;
            } else if (stack.length > 0){
                current = stack.pop();
            } else {
                break;
            }
        }
    }
    getUnvisitedNeighbors(cell){

        let neighbors = [];
        let directions = [

            this.getCell(
                cell.x,
                cell.y - 1
            ),

            this.getCell(
                cell.x + 1,
                cell.y
            ),

            this.getCell(
                cell.x,
                cell.y + 1
            ),

            this.getCell(
                cell.x - 1,
                cell.y
            )
        ];

        for(let neighbor of directions){

            if(neighbor && !neighbor.visited){
                neighbors.push(neighbor);
            }
        }
        return neighbors;
    }

    removeWalls(a, b){
        let dx = a.x - b.x;
        let dy = a.y - b.y;

        if(dx === 1){
            a.walls.left = false;
            b.walls.right = false;
        }

        if(dx === -1){
            a.walls.right = false;
            b.walls.left = false;
        }

        if(dy === 1){
            a.walls.top = false;
            b.walls.bottom = false;
        }

        if(dy === -1){
            a.walls.bottom = false;
            b.walls.top = false;
        }
    }
}

class MazeChunk{
    constructor(chunkX, chunkY){
        this.chunkX = chunkX;
        this.chunkY = chunkY;
        this.maze = new Maze(mazeWidth, mazeHeight);
    }
}

class World {
    constructor(){
        this.chunks = new Map();
    }

    getKey(chunkX, chunkY){
        return `${chunkX},${chunkY}`;
    }

    hasChunk(chunkX, chunkY){
        return this.chunks.has(this.getKey(chunkX, chunkY));
    }

    getChunk(chunkX, chunkY){
        return this.chunks.get(this.getKey(chunkX, chunkY));
    }

    generateChunk(chunkX, chunkY){
        if(this.hasChunk(chunkX, chunkY)){
            return;
        }

        const chunk = new MazeChunk(chunkX, chunkY);

        this.chunks.set(
            this.getKey(chunkX, chunkY),
            chunk
        );
    }
}

const world = new World();
world.generateChunk(0, 0);

function gameLoop(){

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();