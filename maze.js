// —— Config ——
const COLS = 20, ROWS = 20;
const FPS  = 60;
const CELL_SIZE = Math.min(
  window.innerWidth / COLS,
  window.innerHeight / ROWS
);

// —— Canvas Setup ——
const canvas = document.getElementById('maze');
document.getElementById('skipMaze')
  .addEventListener('click', finishMaze);
canvas.width  = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;
const ctx = canvas.getContext('2d');

// —— Player Element ——
const playerEl = document.getElementById('player');
playerEl.style.width  = `${CELL_SIZE - 8}px`;
playerEl.style.height = `${CELL_SIZE - 8}px`;

// —— Build Grid ——
class Cell {
  constructor(x,y) {
    this.x = x; this.y = y;
    this.walls   = [true,true,true,true]; // top, right, bottom, left
    this.visited = false;
  }
}
const grid = [];
for (let y = 0; y < ROWS; y++)
  for (let x = 0; x < COLS; x++)
    grid.push(new Cell(x,y));

function idx(x,y) {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return -1;
  return x + y * COLS;
}

// —— Recursive Backtracker ——
let stack   = [];
let current = grid[0];
current.visited = true;

function removeWalls(a,b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  if (dx === 1)      { a.walls[3] = false; b.walls[1] = false; }
  else if (dx === -1){ a.walls[1] = false; b.walls[3] = false; }
  else if (dy === 1) { a.walls[0] = false; b.walls[2] = false; }
  else if (dy === -1){ a.walls[2] = false; b.walls[0] = false; }
}

function stepGeneration() {
  // pick random unvisited neighbor
  const {x,y} = current;
  const neighbors = [
    [0,-1],[1,0],[0,1],[-1,0]
  ].map(([dx,dy]) => grid[idx(x+dx,y+dy)])
   .filter(n => n && !n.visited);

  if (neighbors.length > 0) {
    const next = neighbors[Math.floor(Math.random()*neighbors.length)];
    stack.push(current);
    removeWalls(current,next);
    current = next;
    current.visited = true;
  } else if (stack.length > 0) {
    current = stack.pop();
  } else {
    // generation complete
    clearInterval(genInterval);
    // DRAW final maze
    drawMaze();
    // now allow player to move!
    initPlayer();
    return;
  }

  drawMaze();
}

function drawMaze() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // fill visited cells
  grid.forEach(cell => {
    if (cell.visited) {
      ctx.fillStyle = '#ddd';
      ctx.fillRect(
        cell.x * CELL_SIZE,
        cell.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  });

  // stroke walls
  ctx.lineWidth   = 4;
  ctx.strokeStyle = '#333';
  grid.forEach(cell => {
    const X = cell.x * CELL_SIZE, Y = cell.y * CELL_SIZE;
    if (cell.walls[0]) drawLine(X, Y, X+CELL_SIZE, Y);
    if (cell.walls[1]) drawLine(X+CELL_SIZE, Y, X+CELL_SIZE, Y+CELL_SIZE);
    if (cell.walls[2]) drawLine(X+CELL_SIZE, Y+CELL_SIZE, X, Y+CELL_SIZE);
    if (cell.walls[3]) drawLine(X, Y+CELL_SIZE, X, Y);
  });
}

function drawLine(x1,y1,x2,y2) {
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
}

// —— Start generation loop ——  
const genInterval = setInterval(stepGeneration, 1000 / FPS);

// —— Player Movement ——  
let player = { x: 0, y: 0 };
function initPlayer() {
  // position sprite at start
  gsap.set(playerEl, { x: 2, y: 2 });

  // show instructions
  document.getElementById('maze-instructions').textContent =
    'Use ← ↑ → ↓ to escape!';

  window.addEventListener('keydown', e => {
    const cell = grid[idx(player.x, player.y)];
    let moved = false;

    if (e.key === 'ArrowUp'    && !cell.walls[0]) { player.y--; moved = true; }
    if (e.key === 'ArrowRight' && !cell.walls[1]) { player.x++; moved = true; }
    if (e.key === 'ArrowDown'  && !cell.walls[2]) { player.y++; moved = true; }
    if (e.key === 'ArrowLeft'  && !cell.walls[3]) { player.x--; moved = true; }

    if (!moved) return;

    // animate sprite to new cell
    gsap.to(playerEl, {
      x: player.x * CELL_SIZE + 2,
      y: player.y * CELL_SIZE + 2,
      duration: 0.4,
      ease: 'bounce.out'
    });

    // check for exit
    if (player.x === COLS - 1 && player.y === ROWS - 1) {
      finishMaze();
    }
  });
}

// —— Finish Maze & Reveal Site ——  
function finishMaze() {
  // simple pop animation
  gsap.to(canvas, { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 });
  setTimeout(() => {
    document.getElementById('maze-container').remove();
    document.getElementById('main-content').style.display = 'block';
    initAnimations(); // kick off your GSAP page transitions
  }, 500);
}
