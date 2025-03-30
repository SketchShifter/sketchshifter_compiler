// クラス不使用版ブロック崩しゲームサンプル

// グローバル変数
float ballX;
float ballY;            // ボールの位置
float ballSpeedX;
float ballSpeedY;  // ボールの速度
float ballRadius = 10;         // ボールの半径

float paddleX;                 // パドルのX座標（Yは固定）
float paddleWidth = 100;
float paddleHeight = 10;

int blocksPerRow = 5;          // 1行あたりのブロック数
int blockRows = 3;             // ブロックの行数
float blockWidth;
float blockHeight;
boolean[] blockActive;         // 各ブロックが生存しているか
float[] blockX;                // 各ブロックのX座標（中心）
float[] blockY;                // 各ブロックのY座標（中心）

int score = 0;
int lives = 3;
boolean gameOver = false;
boolean paused = false;

void setup() {
  size(600, 400);
  resetGame();
}

void resetGame() {
  // ボールの初期設定
  ballX = width/2;
  ballY = height - 50;
  ballSpeedX = random(-2, 2);
  ballSpeedY = -3;
  
  // パドルの初期設定
  paddleX = width/2;
  
  // ブロックの初期設定
  blockWidth = width / blocksPerRow;
  blockHeight = 30;
  int totalBlocks = blocksPerRow * blockRows;
  blockActive = new boolean[totalBlocks];
  blockX = new float[totalBlocks];
  blockY = new float[totalBlocks];
  
  for (int row = 0; row < blockRows; row++) {
    for (int col = 0; col < blocksPerRow; col++) {
      int index = row * blocksPerRow + col;
      blockActive[index] = true;
      blockX[index] = blockWidth * (col + 0.5);
      blockY[index] = 50 + row * (blockHeight + 10);
    }
  }
  
  score = 0;
  lives = 3;
  gameOver = false;
  paused = false;
}

void draw() {
  background(0);
  if (!paused && !gameOver) {
    updateGame();
  }
  displayGame();
}

void updateGame() {
  // ボールの更新
  ballX += ballSpeedX;
  ballY += ballSpeedY;
  
  // 壁との衝突判定
  if (ballX < ballRadius || ballX > width - ballRadius) {
    ballSpeedX *= -1;
  }
  if (ballY < ballRadius) {
    ballSpeedY *= -1;
  }
  
  // パドルとの衝突判定
  float paddleY = height - 20; // パドルのY座標は固定
  if (ballX + ballRadius >= paddleX - paddleWidth/2 &&
      ballX - ballRadius <= paddleX + paddleWidth/2 &&
      ballY + ballRadius >= paddleY - paddleHeight/2 &&
      ballY - ballRadius <= paddleY + paddleHeight/2) {
    ballSpeedY *= -1;
    // パドル上の衝突位置に応じてX方向の速度を調整
    float diff = ballX - paddleX;
    ballSpeedX = diff * 0.05;
  }
  
  // ブロックとの衝突判定
  for (int i = 0; i < blockActive.length; i++) {
    if (blockActive[i]) {
      if (ballX + ballRadius >= blockX[i] - blockWidth/2 &&
          ballX - ballRadius <= blockX[i] + blockWidth/2 &&
          ballY + ballRadius >= blockY[i] - blockHeight/2 &&
          ballY - ballRadius <= blockY[i] + blockHeight/2) {
        blockActive[i] = false;
        score += 10;
        ballSpeedY *= -1;
        break; // 1フレームに複数のブロックと衝突する可能性を避ける
      }
    }
  }
  
  // 画面下にボールが落ちた場合
  if (ballY > height + ballRadius) {
    lives--;
    if (lives <= 0) {
      gameOver = true;
    } else {
      ballX = width/2;
      ballY = height - 50;
      ballSpeedX = random(-2, 2);
      ballSpeedY = -3;
    }
  }
  
  // 全ブロックが破壊されたかのチェック
  boolean allDestroyed = true;
  for (int i = 0; i < blockActive.length; i++) {
    if (blockActive[i]) {
      allDestroyed = false;
      break;
    }
  }
  if (allDestroyed) {
    gameOver = true;
  }
}

void displayGame() {
  // ボールの描画
  fill(255);
  ellipse(ballX, ballY, ballRadius*2, ballRadius*2);
  
  // パドルの描画
  float paddleY = height - 20;
  paddleX = mouseX;
  // パドルが画面外に出ないように制限
  if (paddleX < paddleWidth/2) {
    paddleX = paddleWidth/2;
  }
  if (paddleX > width - paddleWidth/2) {
    paddleX = width - paddleWidth/2;
  }
  fill(255);
  rectMode(CENTER);
  rect(paddleX, paddleY, paddleWidth, paddleHeight);
  
  // ブロックの描画
  for (int i = 0; i < blockActive.length; i++) {
    if (blockActive[i]) {
      // 行ごとに色を変える例
      int row = i / blocksPerRow;
      if (row % 3 == 0) {
        fill(255, 0, 0);
      } else if (row % 3 == 1) {
        fill(0, 255, 0);
      } else {
        fill(0, 0, 255);
      }
      rect(blockX[i], blockY[i], blockWidth, blockHeight);
    }
  }
  
  // スコアとライフの表示
  fill(255);
  textSize(16);
  text("Score: " + score, 10, 20);
  text("Lives: " + lives, width - 100, 20);
  
  // ポーズ・ゲームオーバー表示
  if (paused) {
    fill(255);
    textSize(32);
    text("PAUSED", width/2 - 60, height/2);
    textSize(16);
    text("Press SPACE to continue", width/2 - 80, height/2 + 30);
  }
  if (gameOver) {
    fill(255);
    textSize(32);
    if (score >= blocksPerRow * blockRows * 10) {
      text("GAME CLEAR!", width/2 - 100, height/2);
    } else {
      text("GAME OVER", width/2 - 80, height/2);
    }
    textSize(16);
    text("Press R to restart", width/2 - 60, height/2 + 30);
  }
}

void keyPressed() {
  if (key == ' ') {
    paused = !paused;
  }
  if (key == 'r' || key == 'R') {
    resetGame();
  }
}

void mousePressed() {
  paused = false;
}
