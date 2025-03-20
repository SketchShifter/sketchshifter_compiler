const { tokenize } = require('./tokenizer');
const { Parser } = require('./parser');

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

try {
  const ast = parseProcessingCode(sampleCode);
  console.log(JSON.stringify(ast, null, 2));
} catch (err) {
  console.error(err);
}
