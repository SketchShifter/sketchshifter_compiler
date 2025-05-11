void setup() {
    size(400,400);
}

void draw() 
{ 
  background(204);
  float mx = constrain(mouseX, 30, 200);
  rect(mx-10, 40, 20, 20);
  text(frameCount,10,10);
}