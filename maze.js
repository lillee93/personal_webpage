// —— Configuration ——
const COLS = 20, ROWS = 20;
const FPS = 60;
let stepCount = 0;

// —— Compute cell size to fit viewport ——
const CELL_SIZE = Math.min(
  window.innerWidth  / COLS,
  window.innerHeight / ROWS
);

// —— Canvas Setup ——
const canvas = document.getElementById('maze');
canvas.width  = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;
const ctx = canvas.getContext('2d');

// —— Player DOM Element ——
const playerEl = document.getElementById('player');
playerEl.style.width  = `${CELL_SIZE - 8}px`;
playerEl.style.height = `${CELL_SIZE - 8}px`;
playerEl.style.top    = `2px`;
playerEl.style.left   = `2px`;

// —— Cell & Grid ——
class Cell {
  constructor(x,y) {
    this.x = x; this.y = y;
    this.walls = [true,true,true,true]; // top, right, bottom, left
    this.visited = false;
  }
}
const grid = [];
for (let y=0; y<ROWS; y++)
  for (let x=0; x<COLS; x++)
    grid.push(new Cell(x,y));

function idx(x,y) {
  return x<0||y<0||x>=COLS||y>=ROWS ? -1 : x + y*COLS;
}

// —— Maze Generation: Recursive Backtracker ——
let stack = [], current = grid[0];
current.visited = true;

function removeWalls(a,b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  if (dx===1)      { a.walls[3]=false; b.walls[1]=false; }
  else if (dx===-1){ a.walls[1]=false; b.walls[3]=false; }
  else if (dy===1) { a.walls[0]=false; b.walls[2]=false; }
  else if (dy===-1){ a.walls[2]=false; b.walls[0]=false; }
}

function stepGen() {
  stepCount++;
  const {x,y} = current;
  // get unvisited neighbors
  const neighbors = [[0,-1],[1,0],[0,1],[-1,0]]
    .map(([dx,dy]) => grid[idx(x+dx,y+dy)])
    .filter(n => n && !n.visited);

  if (neighbors.length) {
    const next = neighbors[Math.floor(Math.random()*neighbors.length)];
    stack.push(current);
    removeWalls(current,next);
    current = next;
    current.visited = true;
  } else if (stack.length) {
    current = stack.pop();
  } else {
    clearInterval(genInterval);
    initPlayer();
  }
}

// —— Draw Maze with Cartoon Style ——
function drawMaze() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // 1) fill visited cells with pastel rainbow
  grid.forEach(cell => {
    if (cell.visited) {
      const hue = (cell.x*15 + cell.y*10 + stepCount*3) % 360;
      ctx.fillStyle = `hsl(${hue},80%,85%)`;
      ctx.fillRect(
        cell.x * CELL_SIZE,
        cell.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  });

  // 2) draw thick, rounded walls
  ctx.lineWidth   = 6;
  ctx.lineCap     = 'round';
  ctx.strokeStyle = '#333';

  grid.forEach(cell => {
    const x = cell.x * CELL_SIZE, y = cell.y * CELL_SIZE;
    // top
    if (cell.walls[0]) {
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.lineTo(x+CELL_SIZE,y);
      ctx.stroke();
    }
    // right
    if (cell.walls[1]) {
      ctx.beginPath();
      ctx.moveTo(x+CELL_SIZE,y);
      ctx.lineTo(x+CELL_SIZE,y+CELL_SIZE);
      ctx.stroke();
    }
    // bottom
    if (cell.walls[2]) {
      ctx.beginPath();
      ctx.moveTo(x+CELL_SIZE,y+CELL_SIZE);
      ctx.lineTo(x,y+CELL_SIZE);
      ctx.stroke();
    }
    // left
    if (cell.walls[3]) {
      ctx.beginPath();
      ctx.moveTo(x,y+CELL_SIZE);
      ctx.lineTo(x,y);
      ctx.stroke();
    }
  });
}

// —— Generation Loop ——
const genInterval = setInterval(() => {
  stepGen();
  drawMaze();
}, 1000 / FPS);

// —— Player Logic & Bouncy Movement ——  
let player = { x:0, y:0 };
function initPlayer() {
  window.addEventListener('keydown', e => {
    const c = grid[idx(player.x, player.y)];
    let moved = false;
    if (e.key==='ArrowUp'    && !c.walls[0]) { player.y--; moved=true; }
    if (e.key==='ArrowRight' && !c.walls[1]) { player.x++; moved=true; }
    if (e.key==='ArrowDown'  && !c.walls[2]) { player.y++; moved=true; }
    if (e.key==='ArrowLeft'  && !c.walls[3]) { player.x--; moved=true; }

    if (moved) {
      // Animate the sprite to bounce into new cell
      gsap.to(playerEl, {
        x: player.x * CELL_SIZE + 2,
        y: player.y * CELL_SIZE + 2,
        duration: 0.4,
        ease: "bounce.out"
      });
    }

    // Win condition: bottom-right exit
    if (player.x === COLS-1 && player.y === ROWS-1) {
      finishMaze();
    }
  });

  // place sprite at start
  gsap.set(playerEl, { x:2, y:2 });
}

// —— Finish: Confetti & Reveal Site ——  
function finishMaze() {
  // little burst of cartoon confetti
  confetti({
    particleCount: 120,
    spread:  eighty,
    origin: { y: 0.6 }
  });

  // pop animation
  canvas.style.transition      = 'transform 0.6s ease-out';
  canvas.style.transform       = 'scale(1.2) rotate(8deg)';

  setTimeout(() => {
    document.getElementById('maze-container').remove();
    document.getElementById('main-content').style.display = 'block';
    // kick off the rest of your GSAP page animations
    initAnimations();
  }, 800);
}
