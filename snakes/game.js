class Snake {
  constructor() {
    this.segments = [{x: 10, y: 10}]; // Starting position
    this.direction = 'right';
    this.nextDirection = 'right';
    this.growing = false;
  }

  move() {
    const head = this.segments[0];
    let newHead = {x: head.x, y: head.y};

    switch(this.direction) {
      case 'up': newHead.y--; break;
      case 'down': newHead.y++; break;
      case 'left': newHead.x--; break;
      case 'right': newHead.x++; break;
    }

    this.segments.unshift(newHead);
    if (!this.growing) {
      this.segments.pop();
    }
    this.growing = false;
    this.direction = this.nextDirection;
  }

  grow() {
    this.growing = true;
  }

  checkCollision(width, height) {
    const head = this.segments[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
      return true;
    }
    
    // Self collision
    for (let i = 1; i < this.segments.length; i++) {
      if (head.x === this.segments[i].x && head.y === this.segments[i].y) {
        return true;
      }
    }
    
    return false;
  }
}

class Food {
  constructor() {
    this.position = {x: 0, y: 0};
    this.spawn();
  }

  spawn() {
    this.position.x = Math.floor(Math.random() * 20);
    this.position.y = Math.floor(Math.random() * 20);
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.snake = new Snake();
    this.food = new Food();
    this.score = 0;
    this.highScore = 0;
    this.gameLoop = null;
    this.cellSize = 20;
    this.isPaused = false;
    this.isGameOver = false;
    this.speed = 150; // Default speed (milliseconds)

    this.loadHighScore();
    this.setupEventListeners();
  }

  start() {
    if (this.gameLoop) return;
    
    this.snake = new Snake();
    this.food = new Food();
    this.score = 0;
    this.isGameOver = false;
    this.updateScore();
    this.gameLoop = setInterval(() => this.update(), this.speed);
  }

  pause() {
    if (this.isPaused) {
      this.gameLoop = setInterval(() => this.update(), this.speed);
    } else {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    this.isPaused = !this.isPaused;
  }

  update() {
    this.snake.move();

    // Check collision
    if (this.snake.checkCollision(20, 20)) {
      this.gameOver();
      return;
    }

    // Check food collision
    const head = this.snake.segments[0];
    if (head.x === this.food.position.x && head.y === this.food.position.y) {
      this.snake.grow();
      this.food.spawn();
      this.score += 10;
      this.updateScore();
      this.playEatSound();
    }

    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw snake
    this.snake.segments.forEach((segment, index) => {
      this.ctx.fillStyle = index === 0 ? '#4CAF50' : '#81C784';
      this.ctx.fillRect(
        segment.x * this.cellSize,
        segment.y * this.cellSize,
        this.cellSize - 1,
        this.cellSize - 1
      );
    });

    // Draw food
    this.ctx.fillStyle = '#F44336';
    this.ctx.fillRect(
      this.food.position.x * this.cellSize,
      this.food.position.y * this.cellSize,
      this.cellSize - 1,
      this.cellSize - 1
    );
  }

  gameOver() {
    clearInterval(this.gameLoop);
    this.gameLoop = null;
    this.isGameOver = true;
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '30px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2);
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 40);
  }

  updateScore() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('highScore').textContent = this.highScore;
  }

  loadHighScore() {
    chrome.storage.local.get(['highScore'], (result) => {
      this.highScore = result.highScore || 0;
      this.updateScore();
    });
  }

  saveHighScore() {
    chrome.storage.local.set({highScore: this.highScore});
  }

  setDifficulty(level) {
    switch(level) {
      case 'easy':
        this.speed = 150;
        break;
      case 'medium':
        this.speed = 100;
        break;
      case 'hard':
        this.speed = 70;
        break;
    }
    
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = setInterval(() => this.update(), this.speed);
    }
  }

  playEatSound() {
    const audio = new Audio('sounds/eat.mp3');
    audio.play().catch(() => {}); // Ignore errors if sound can't play
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowUp':
          if (this.snake.direction !== 'down') {
            this.snake.nextDirection = 'up';
          }
          break;
        case 'ArrowDown':
          if (this.snake.direction !== 'up') {
            this.snake.nextDirection = 'down';
          }
          break;
        case 'ArrowLeft':
          if (this.snake.direction !== 'right') {
            this.snake.nextDirection = 'left';
          }
          break;
        case 'ArrowRight':
          if (this.snake.direction !== 'left') {
            this.snake.nextDirection = 'right';
          }
          break;
        case ' ':
          if (!this.isGameOver) {
            this.pause();
          }
          break;
      }
    });

    document.getElementById('startBtn').addEventListener('click', () => {
      this.start();
    });

    document.getElementById('pauseBtn').addEventListener('click', () => {
      if (!this.isGameOver) {
        this.pause();
      }
    });

    document.getElementById('difficulty').addEventListener('change', (e) => {
      this.setDifficulty(e.target.value);
    });
  }
}

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
}); 