import some.library.*;

class MySketch {
  int value = 10;
  float[] data = new float[5];

  void doSomething(int a, float b) {
    if (a > b) {
      value = a;
    } else {
      value = (int)b;
    }
  }
}

void setup() {
  size(400, 400);
}

void draw() {
  background(200);
  ellipse(width/2, height/2, 50, 50);
}