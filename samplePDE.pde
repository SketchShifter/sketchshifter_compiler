// 円（フォロワー）の動きを管理するクラス
class Follower {
  float x,y;         // フォロワーの位置
  float easing;     // イージング（緩やかな追従）係数
  float diameter;   // 円の直径

  // コンストラクタ：初期位置とイージング係数、直径を設定
  Follower(float tempX, float tempY, float easingValue, float d) {
    x = tempX;
    y = tempY;
    easing = easingValue;
    diameter = d;
  }

  // 指定されたターゲット座標に向かって位置を更新する
  void update(float targetX, float targetY) {
    x += (targetX - x) * easing;
    y += (targetY - y) * easing;
  }
  
  // 円を描画する
  void display() {
    fill(100, 150, 200);
    noStroke();
    ellipse(x, y, diameter, diameter);
  }
}

// フォロワーの数（配列の長さ）
int numFollowers = 10;
// フォロワーを管理する配列
Follower[] followers = new Follower[numFollowers];

void setup() {
  int w, h, ssss;
  size(400, 400);
  background(255);
  // 配列内の各フォロワーを初期化
  // 初期位置はウィンドウの中心、イージング係数は0.1、直径は50に設定
  for (int i = 0; i < numFollowers; i++) {
    followers[i] = new Follower(width / 2, height / 2, 0.1, 50);
  }
}

void draw() {
  // 毎フレーム背景を白でクリア
  background(255);

  // 最初のフォロワーはマウス座標をターゲットにする
  followers[0].update(mouseX, mouseY);
  followers[0].display();

  // 残りのフォロワーは、1つ前のフォロワーをターゲットにして追従させる
  for (int i = 1; i < numFollowers; i++) {
    followers[i].update(followers[i - 1].x, followers[i - 1].y);
    followers[i].display();
  }
}
