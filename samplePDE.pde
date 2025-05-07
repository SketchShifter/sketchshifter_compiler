void setup() {
    size(400, 400);
    background(255);
}

void draw() {
    if (mousePressed) {
        fill(0); // 黒
        noStroke();
        ellipse(mouseX, mouseY, 20, 20);
    }else{
        text("",0,0);
    }
}
