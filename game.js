const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//Objects

const player = {
    x: 0,
    y: 0,
    size: 20,
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

function rectanglesCollision(a, b){

    return(
        a.x < b.x + b.width &&
        a.x + a.size > b.x &&
        a.y < b.y + b.height &&
        a.y + a.size > b.y
    );

}

function movePlayer(){

    let dx = 0;
    let dy = 0;

    if(keys["w"]){
        dy -= player.speed;
    }
    if(keys["s"]){
        dy += player.speed;
    }
    if(keys["a"]){
        dx -= player.speed;
    }
    if(keys["d"]){
        dx += player.speed;
    }

    player.x += dx;
    for(let wall of world.getNearbyWalls(player)){
        if(rectanglesCollision(player, wall)){
            if(dx > 0){
                player.x = wall.x - player.size;
            }
            if(dx < 0){
                player.x = wall.x + wall.width;
            }
        }
    }

    player.y += dy;
    for(let wall of world.getNearbyWalls(player)){
        if(rectanglesCollision(player,wall)){
            if(dy > 0){
                player.y = wall.y - player.size;
            }
            if(dy < 0){
                player.y = wall.y + wall.height;
            }
        }
    }

}

function update(){
    world.loadAroundPlayer(player);
    movePlayer();

    camera.x = player.x + player.size / 2 - canvas.width / 2;
    camera.y = player.y + player.size / 2 - canvas.height / 2;

    world.unloadFarChunks(player);
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

            let x = chunk.chunkX * chunkWidth + cell.x * tileSize;
            let y = chunk.chunkY * chunkHeight + cell.y * tileSize;

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
const chunkWidth = mazeWidth * tileSize;
const chunkHeight = mazeHeight * tileSize;

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

        this.walls = [];
        this.buildWalls();
    }

    buildWalls(){
        this.walls = [];
        for(const cell of this.maze.cells){
            const worldX = this.chunkX * chunkWidth + cell.x * tileSize;
            const worldY = this.chunkY * chunkHeight + cell.y * tileSize;

            if(cell.walls.top){
                this.walls.push({
                    x: worldX,
                    y: worldY,
                    width: tileSize,
                    height: 3
                });
            }

            if(cell.walls.bottom){
                this.walls.push({
                    x: worldX,
                    y: worldY + tileSize - 3,
                    width: tileSize,
                    height: 3
                });
            }

            if(cell.walls.left){
                this.walls.push({
                    x: worldX,
                    y: worldY,
                    width: 3,
                    height: tileSize
                });
            }

            if(cell.walls.right){
                this.walls.push({
                    x: worldX + tileSize - 3,
                    y: worldY,
                    width: 3,
                    height: tileSize
                });
            }
        }
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

        this.connectChunk(chunkX, chunkY);
        this.connectChunk(chunkX - 1, chunkY);
        this.connectChunk(chunkX, chunkY - 1);
    }

    connectChunk(chunkX, chunkY){
        const current = this.getChunk(chunkX, chunkY);
        if(!current){return;}

        const right = this.getChunk(chunkX + 1, chunkY);
        if(right){
            let currentCell = current.maze.getCell(
                mazeWidth - 1, Math.floor(Math.random() * mazeHeight)
            );

            let rightCell = right.maze.getCell(0, currentCell.y);

            currentCell.walls.right = false;
            rightCell.walls.left = false;
            current.buildWalls();
            right.buildWalls();
        }

        const bottom = this.getChunk(chunkX, chunkY + 1);
        if(bottom){
            let currentCell = current.maze.getCell(
                Math.floor(Math.random() * mazeWidth),
                mazeHeight - 1
            );

            let bottomCell = bottom.maze.getCell(currentCell.x, 0);

            currentCell.walls.bottom = false;
            bottomCell.walls.top = false;
            current.buildWalls();
            bottom.buildWalls();
        }

    }

    getPlayerChunk(player){

        let chunkX = Math.floor(player.x / chunkWidth);
        let chunkY = Math.floor(player.y / chunkHeight);

        return{
            x: chunkX,
            y: chunkY
        };

    }

    getPlayerCell(player){

        const currentChunk = this.getPlayerChunk(player);
        const chunk = this.getChunk(currentChunk.x, currentChunk.y);

        if(!chunk){
            return null;
        }

        const localX = player.x - currentChunk.x * chunkWidth;
        const localY = player.y - currentChunk.y * chunkHeight;
        const cellX = Math.floor(localX / tileSize);
        const cellY = Math.floor(localY / tileSize);

        return{
            chunk,
            cell: chunk.maze.getCell(cellX, cellY),
            cellX,
            cellY,
            localX,
            localY
        };

    }

    loadAroundPlayer(player){
        let current = this.getPlayerChunk(player);

        for(let y = -1; y <= 1; y++){
            for(let x = -1; x <= 1; x++){
                this.generateChunk(
                    current.x + x,
                    current.y + y
                );
            }
        }
    }

    unloadFarChunks(player){
        const current = this.getPlayerChunk(player);

        for(const [key, chunk] of this.chunks){
            const dx = Math.abs(chunk.chunkX - current.x);
            const dy = Math.abs(chunk.chunkY - current.y);

            if(dx > 1 || dy > 1){
                this.chunks.delete(key);
            }
        }
    }

    getNearbyWalls(player){
        let walls = [];
        const current = this.getPlayerChunk(player);

        for(let y = -1;  y <= 1; y++){
            for(let x = -1; x <= 1; x++){
                const chunk = this.getChunk(current.x + x, current.y + y);
                if(!chunk){
                    continue;
                }

                walls.push(...chunk.walls);
                
            }
        }
        return walls;
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