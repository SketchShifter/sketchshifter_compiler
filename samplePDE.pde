void setup() {
    size(400, 400);
    background(255);
}

void draw() {
    if (mousePressed) {
        noStroke();
        fill(0); // 黒
        ellipse(mouseX, mouseY, 20, 20);
    }
}
