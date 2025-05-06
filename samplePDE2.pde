void setup() {
  size(800, 600);
}

void draw() {
  // 背景
  background(240);

  // 点描画
  stroke(0);        // 線色：黒
  fill(255, 0, 0);  // 塗り色：赤
  point(width*0.2, height*0.2);

  // 直線
  noFill();
  stroke(0, 0, 255);  // 線色：青
  line(width*0.5-100, height*0.5-100, width*0.5+100, height*0.5+100);

  // 三角形
  fill(0, 255, 0);    // 塗り色：緑
  stroke(0);          // 線色：黒
  triangle(100, 500, 200, 300, 300, 500);

  // 四角形（quad）
  fill(255, 165, 0);  // 塗り色：オレンジ
  stroke(0);
  quad(400, 100, 500, 200, 600, 100, 700, 200);

  // 円弧
  fill(255, 255, 0);  // 塗り色：黄
  stroke(0);
  // OPEN（開放弧）
  arc(width*0.5, height*0.5, 150, 150, 0, PI, OPEN);

  // 円
  noStroke();
  fill(0, 255, 255);  // 塗り色：シアン
  ellipse(600, 400, 100, 100);

  // ベジェ曲線
  noFill();
  stroke(255, 0, 255);  // 線色：マゼンタ
  bezier(50, 50,  150, 150,  250, 50,  350, 150);

  // フレーム外は描画しない（ループ停止）
  noLoop();
}
