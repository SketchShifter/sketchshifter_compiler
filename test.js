const fs = require('fs');
const { tokenize } = require('./tokenizer');
const { Parser } = require('./parser');
const { generateJavaScriptFromAST } = require('./codegen');

function parseProcessingCode(code) {
  const tokens = tokenize(code);
  const parser = new Parser(tokens);
  const ast = parser.parseProgram();
  return ast;
}

const sampleCode = `
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
`;

const processingAPI = `
let ctx;
let width = 0, height = 0;
let fillColor = 'black';
let strokeColor = 'black';
let useStroke = true;
let useFill = true;

function size(w, h) {
  const canvas = document.getElementById("canvas");
  canvas.width = width = w;
  canvas.height = height = h;
  ctx = canvas.getContext("2d");
}

function background(r, g = r, b = r) {
  ctx.fillStyle = \`rgb(\${r}, \${g}, \${b})\`;
  ctx.fillRect(0, 0, width, height);
}

function ellipse(x, y, w, h) {
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, 2 * Math.PI);
  if (useFill) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (useStroke) {
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
  }
}

function rect(x, y, w, h) {
  if (useFill) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w, h);
  }
  if (useStroke) {
    ctx.strokeStyle = strokeColor;
    ctx.strokeRect(x, y, w, h);
  }
}

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  if (useStroke) {
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
  }
}

function fill(r, g, b) {
  fillColor = \`rgb(\${r}, \${g}, \${b})\`;
  useFill = true;
}

function stroke(r, g, b) {
  strokeColor = \`rgb(\${r}, \${g}, \${b})\`;
  useStroke = true;
}

function noFill() {
  useFill = false;
}

function noStroke() {
  useStroke = false;
}
`;

const processingAPI2 = `
  \nsetup();\nsetInterval(() => { if (typeof draw === 'function') draw(); }, 30);
`;

try {
  const ast = parseProcessingCode(sampleCode);
  // console.log(JSON.stringify(ast, null, 2));
  const jsCode = generateJavaScriptFromAST(ast);
  // console.log(jsCode);
  const fullCode = processingAPI + "\n" + jsCode + processingAPI2;
  fs.writeFileSync('output.js', fullCode, 'utf-8');
  console.log(fullCode);

} catch (err) {
  console.error(err);
}
