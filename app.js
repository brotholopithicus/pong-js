class Paddle {
  constructor(x, y, side, turn) {
    this.color = `#000`;
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 100;
    this.vY = 0;
    this.vx = 0; // always 0
    this.side = side;
    this.turn = turn;
    this.score = 0;
  }
  toggleTurn() {
    this.turn = !this.turn;
  }
  get face() {
    if (this.side === 'L') {
      return this.x + this.width;
    } else {
      return this.x;
    }
  }
  get back() {
    if (this.side === 'L') {
      return this.x;
    } else {
      return this.x + this.width;
    }
  }
  get bottom() {
    return this.y + this.height;
  }
  get center() {
    return {
      x: this.x + (this.width / 2),
      y: this.y + (this.height / 2)
    }
  }
}

class Ball {
  constructor(x, y) {
    this.color = `#000`;
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.vX = -200;
    this.vY = -200;
  }
  get center() {
    return {
      x: this.x + (this.width / 2),
      y: this.y + (this.height / 2)
    }
  }
}

class Game {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth * 0.8;
    this.canvas.height = window.innerHeight * 0.8;
    this.paddleA = new Paddle(50, 50, 'L', true);
    this.paddleB = new Paddle(this.canvas.width - 50, 50, 'R', false);
    this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2);
    this.keysDown = {};
    this.elements = [this.paddleA, this.paddleB, this.ball];
    this.time = Date.now();
    this.player = new Player(this.ball, this.paddleB, this.canvas);
    this.initialize();
    this.interval = setInterval(() => {
      this.mainLoop();
    }, 1000 / 60);
  }
  initialize() {
    document.body.appendChild(this.canvas);
    window.addEventListener('keydown', (e) => this.keysDown[e.keyCode] = true);
    window.addEventListener('keyup', (e) => delete this.keysDown[e.keyCode]);
  }
  drawRect(rect) {
    this.ctx.fillStyle = rect.color;
    this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#1a4266';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.lineWidth = 10;
    this.ctx.stroke();
    this.elements.forEach(el => this.drawRect(el));
    this.renderScore();
  }
  update(deltaNorm) {
    this.checkInput();
    this.checkCollisions();
    this.player.play();
    this.ball.x += this.ball.vX * deltaNorm;
    this.ball.y += this.ball.vY * deltaNorm;

    this.paddleA.y += this.paddleA.vY * deltaNorm;
    this.paddleB.y += this.paddleB.vY * deltaNorm;

  }
  checkInput() {
    // paddle A
    if (87 in this.keysDown) {
      if (this.paddleA.y > 0) {
        this.paddleA.vY = -400;
      } else {
        this.paddleA.vY = 0;
      }
    } else if (83 in this.keysDown) {
      if (this.paddleA.bottom < this.canvas.height) {
        this.paddleA.vY = 400;
      } else {
        this.paddleA.vY = 0;
      }
    } else {
      this.paddleA.vY = 0;
    }

    // paddle B
    if (38 in this.keysDown) {
      if (this.paddleB.y > 0) {
        this.paddleB.vY = -400;
      } else {
        this.paddleB.vY = 0;
      }
    } else if (40 in this.keysDown) {
      if (this.paddleB.bottom < this.canvas.height) {
        this.paddleB.vY = 400;
      } else {
        this.paddleB.vY = 0;
      }
    } else {
      this.paddleB.vY = 0;
    }
  }
  toggleTurns() {
    [this.paddleA, this.paddleB].forEach(paddle => paddle.toggleTurn());
  }
  checkCollisions() {
    // ball
    if (this.ball.y <= 0) {
      this.ball.vY *= -1;
    }
    if (this.ball.y >= this.canvas.height - this.ball.height) {
      this.ball.vY *= -1;
    }
    if (this.ball.x < -this.ball.width) {
      // this.ball.vX *= -1;
      this.score();
    }
    if (this.ball.x > this.canvas.width) {
      // this.ball.vX *= -1;
      this.score();

    }
    /* paddle */
    if (this.ball.y <= this.paddleA.bottom && this.ball.y >= this.paddleA.y && this.ball.x <= this.paddleA.face) {
      this.ball.vX *= -1;
      this.toggleTurns();
    }
    if (this.ball.y <= this.paddleB.bottom && this.ball.y >= this.paddleB.y && this.ball.x + this.ball.width >= this.paddleB.face) {
      this.ball.vX *= -1;
      this.toggleTurns();
    }
  }
  score() {
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height / 2;
    [this.paddleA, this.paddleB].forEach(paddle => {
      if (!paddle.turn) {
        paddle.score++;
      }
    })
  }
  renderScore() {
    this.ctx.font = '72px Verdana';
    this.ctx.fillStyle = '#000';
    [this.paddleA, this.paddleB].forEach(paddle => {
      const posX = paddle.x < this.canvas.width / 2 ? (this.canvas.width / 2) - 100 : (this.canvas.width / 2) + 55;
      this.ctx.fillText(paddle.score, posX, (this.canvas.height / 2) + 36);
    });
  }
  mainLoop() {
    let now = Date.now();
    let delta = now - this.time;
    this.update(delta / 1000);
    this.render();
    this.time = now;
  }
}

class Player {
  constructor(ball, paddle, canvas) {
    this.ball = ball;
    this.canvas = canvas;
    this.paddle = paddle;
  }
  play() {
    this.dontMakeItObvious();
  }
  dontMakeItObvious() {
    if (this.paddle.turn) {
      if (this.ball.center.y > this.paddle.center.y) {
        this.paddle.vY = 200;
      } else if (this.ball.center.y < this.paddle.center.y) {
        this.paddle.vY = -200;
      } else {
        this.paddle.vY = 0;
      }
    } else {
      if (this.ball.center.y > this.paddle.center.y) {
        this.paddle.vY = 50;
      } else if (this.ball.center.y < this.paddle.center.y) {
        this.paddle.vY = -50;
      } else {
        this.paddle.vY = 0;
      }
    }
  }
}

let game = new Game();
