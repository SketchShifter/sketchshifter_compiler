// 例 2: ボールの移動と反射
class Ball {
  float x;
  float y;         // 位置
  float speedX;
  float speedY; // 速度
  float radius;       // 半径
  
  // コンストラクタ：初期位置と半径、速度を設定
  Ball(float x, float y, float r) {
    this.x = x;
    this.y = y;
    this.radius = r;
    this.speedX = 3;
    this.speedY = 2;
  }
  
  // 状態更新（移動と反射）
  void update() {
    x += speedX;
    y += speedY;
    
    if (x < radius || x > width - radius) {
      speedX *= -1;
    }
    if (y < radius || y > height - radius) {
      speedY *= -1;
    }
  }
  
  // 描画
  void display() {
    fill(255, 0, 0);
    noStroke();
    ellipse(x, y, radius * 2, radius * 2);
  }
}

Ball ball;

void setup() {
  size(600, 400);
  ball = new Ball(width / 2, height / 2, 20);
}

void draw() {
  background(0);
  ball.update();
  ball.display();
}
