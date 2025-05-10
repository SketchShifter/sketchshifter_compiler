void setup() {
    size(400,400);
}

void draw() 
{ 
  background(204);
  float mx = constrain(mouseX, 30, 200);
  rect(mx-10, 40, 20, 20);
  // printIn(color(50, 55, 100));
  // printIn(color(100,100,100,100));
  color c = color(100,100,100,100);
}