// マウスとキーボード入力のシンプルなサンプル

// グローバル変数
int circleX;
int circleY;
int circleSize;
String message;

void setup() {
  size(400, 400);
  circleX = 100;
  circleY = 100;
  circleSize = 50;
  message = "";
}

void draw() {
  background(200);
  
  // マウスの位置に応じて円の色を変える
  if (dist(mouseX, mouseY, circleX, circleY) < circleSize/2) {
    fill(255, 0, 0);  // 赤
  } else {
    fill(0, 0, 255);  // 青
  }
  
  // 円を描画
  ellipse(circleX, circleY, circleSize, circleSize);
  
  // 情報表示
  fill(0);
  textSize(16);
  text("Mouse: " + mouseX + ", " + mouseY, 10, 20);
  text("Key: " + key, 10, 40);
  text(message, 10, 60);
}

// マウスが押されたときの処理
void mousePressed() {
  message = "Mouse pressed at: " + mouseX + ", " + mouseY;
}

// マウスが離されたときの処理
void mouseReleased() {
  message = "Mouse released";
}

// キーが押されたときの処理
void keyPressed() {
  message = "Key pressed: " + key;
  
  // 矢印キーで円を移動
  if (keyCode == UP) {
    circleY = circleY - 5;
  }
  if (keyCode == DOWN) {
    circleY = circleY + 5;
  }
  if (keyCode == LEFT) {
    circleX = circleX - 5;
  }
  if (keyCode == RIGHT) {
    circleX = circleX + 5;
  }
} 