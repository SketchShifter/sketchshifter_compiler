window.onload = runPDE;
// Processing風API定義（必要）
const processingAPI = `
let ctx;
let width = 0, height = 0;
const TRUE = true;
let fillColor = 'black';
let strokeColor = 'black';
let useStroke = true;
let useFill = true;
let loopId;

// マウス関連のグローバル変数
let mouseX = 0;
let mouseY = 0;
let pmouseX = 0;
let pmouseY = 0;
let mouseIsPressed = false;
let mouseButton = 0; // 0: LEFT, 1: RIGHT, 2: CENTER

// キーボード関連のグローバル変数
let keyIsPressed = false;
let key = '';
let keyCode = 0;
// テキスト関連
let textFont = "Arial";
let textSize_val = 12;
if(typeof mousePressed === 'undefined'){
  var mousePressed = () => {
    return mouseIsPressed;
  }
  var isMousePressedUndefined = true;
}
if(typeof keyPressed === 'undefined') {
  var keyPressed = () => {
    return keyIsPressed;
  }
  var isKeyPressedUndefined = true;
}

// radiansの実装
function radians(deg) {
  return deg * Math.PI / 180;
}

// 変形・座標系操作スタック
let matrixStack = [];
function pushMatrix() {
  matrixStack.push(ctx.getTransform());
}
function popMatrix() {
  const m = matrixStack.pop();
  if (m) ctx.setTransform(m);
}
// 平行移動
function translate(tx, ty) {
  ctx.translate(tx, ty);
}
// 回転（ラジアン）
function rotate(angle) {
  ctx.rotate(angle);
}
// 拡大縮小
function scale(sx, sy = sx) {
  ctx.scale(sx, sy);
}

// モード制御
let rectModeVal = 'CORNER';
let ellipseModeVal = 'CENTER';
const RGB = 'RGB';
const HSB = 'HSB';
let colorType = RGB;
let colorRange1Rate = 1;
let colorRange2Rate = 1;
let colorRange3Rate = 1;
let colorRange4Rate = 1;
function rectMode(mode) {
  rectModeVal = mode;
}
function ellipseMode(mode) {
  ellipseModeVal = mode;
}

function strokeWeight(w) {
  ctx.lineWidth = w;
}

let SQUARE = 'SQUARE';
let PROJECT = 'PROJECT';
let ROUND = 'ROUND';
function strokeCap(cap){
  _cap = {
    'SQUARE': 'butt',
    'PROJECT': 'square',
    'ROUND': 'round',
  }
  ctx.lineCap = _cap[cap];
}

// // 色関係
// function colorMode(mode, range1=undefined, range2=undefined, range3=undefined, range4=undefined) {
//   colorType = (mode === "RGB" || mode === "HSB") ? mode : "RGB"; // RGB or HSB
//   if(colorType === 'RGB'){
//     colorRange1Rate = 255/range1 || 1; // R
//     colorRange2Rate = 255/range2 || colorRange1Rate; // G
//     colorRange3Rate = 255/range3 || colorRange1Rate; // B
//     colorRange4Rate = 1/range4 || 1; // A
//   }
//   if(colorType === 'HSB'){
//     colorRange1Rate = 360/range1 || 1; // H
//     colorRange2Rate = 100/range2 || colorRange1Rate; // S
//     colorRange3Rate = 100/range3 || colorRange1Rate; // B
//     colorRange4Rate = 1/range4 || 1; // A
//   }
// }

// function Color(r, g, b, a){
//   if(r[0] === '#' || r.length === 4 || r.length === 7){
//     // HTML color code
//   }else{
//     if(colorType==='RGB){
//       _r = r*colorRange1Rate;
//       _g = g*colorRange2Rate || _r;
//       _b = b*colorRange3Rate || _r;
//       _a = a*colorRange4Rate || 1;
//     }else{
//       _r = r*colorRange1Rate;
//       _g = g*colorRange2Rate || _r;
//       _b = b*colorRange3Rate || _g;
//       _a = a*colorRange4Rate || 1;
//     }
//   }
// }

function size(w, h) {
  const canvas = document.getElementById("canvas");
  canvas.width = width = w;
  canvas.height = height = h;
  ctx = canvas.getContext("2d");
  
  ctx.lineCap = 'round';
  // マウスイベントのセットアップ
  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    pmouseX = mouseX;
    pmouseY = mouseY;
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    
    // mouseMoved関数が定義されていれば呼び出し
    if (typeof mouseMoved === 'function' && !mouseIsPressed) {
      mouseMoved();
    }
    
    // mouseDragged関数が定義されていれば呼び出し
    if (typeof mouseDragged === 'function' && mouseIsPressed) {
      mouseDragged();
    }
  });
  
  canvas.addEventListener('mousedown', function(e) {
    mouseIsPressed = true;
    mouseButton = e.button; // 0: 左, 1: 中, 2: 右

    // mousePressed関数が定義されていれば呼び出し
    if (typeof mousePressed === 'function' && !isMousePressedUndefined) {
      mousePressed();
    }else{
      console.log("mousePressed is not function")
    }
  });
  
  canvas.addEventListener('mouseup', function() {
    mouseIsPressed = false;
    
    // mouseReleased関数が定義されていれば呼び出し
    if (typeof mouseReleased === 'function') {
      mouseReleased();
    }
  });
  
  // キーボードイベントのセットアップ
  document.addEventListener('keydown', function(e) {
    keyIsPressed = true;
    key = e.key;
    keyCode = e.code;

    // keyPressed関数が定義されていれば呼び出し
    if (typeof keyPressed === 'function' && !isKeyPressedUndefined) {
      keyPressed();
    }else{
      console.log('keyPressed is not function');
    }
  });
  
  document.addEventListener('keyup', function() {
    keyIsPressed = false;
    
    // keyReleased関数が定義されていれば呼び出し
    if (typeof keyReleased === 'function') {
      keyReleased();
    }
  });
}

function background(r, g = r, b = r, a = 1) {
  ctx.fillStyle = (colorType === RGB) ? \`rgba(\${r*colorRange1Rate}, \${g*colorRange2Rate}, \${b*colorRange3Rate}, \${a*colorRange4Rate})\`:\`hsl(\${r*colorRange1Rate}deg \${g*colorRange2Rate}% \${b*colorRange3Rate}% / \${a*colorRange4Rate})\`;
  ctx.fillRect(0, 0, width, height);
}

function ellipse(x, y, w, h) {
  let _cx = x, _cy = y;
  if (ellipseModeVal === 'CORNER') {
    _cx = x + w/2;
    _cy = y + h/2;
  }
  ctx.beginPath();
  ctx.ellipse(_cx, _cy, w / 2, h / 2, 0, 0, 2 * Math.PI);
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
  let _x = x, _y = y;
  if (rectModeVal === 'CENTER') {
    _x = x - w/2;
    _y = y - h/2;
  }
  if (useFill) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(_x, _y, w, h);
  }
  if (useStroke) {
    ctx.strokeStyle = strokeColor;
    ctx.strokeRect(_x, _y, w, h);
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

function point(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 1, 0, 2 * Math.PI);
  if (useFill) { ctx.fillStyle = fillColor; ctx.fill(); }
  if (useStroke) { ctx.strokeStyle = strokeColor; ctx.stroke(); }
}

// 三角形
function triangle(x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  if (useFill) { ctx.fillStyle = fillColor; ctx.fill(); }
  if (useStroke) { ctx.strokeStyle = strokeColor; ctx.stroke(); }
}

// 四角形（quad）
function quad(x1, y1, x2, y2, x3, y3, x4, y4) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.lineTo(x4, y4);
  ctx.closePath();
  if (useFill) { ctx.fillStyle = fillColor; ctx.fill(); }
  if (useStroke) { ctx.strokeStyle = strokeColor; ctx.stroke(); }
}

// 円弧
function arc(x, y, w, h, start, stop, mode = 'OPEN') {
  ctx.beginPath();
  // optional chord/pie
  if (mode === 'CHORD') {
    ctx.moveTo(x + Math.cos(start) * w/2, y + Math.sin(start) * h/2);
  }
  ctx.ellipse(x, y, w/2, h/2, 0, start, stop);
  if (mode === 'PIE') {
    ctx.lineTo(x, y);
  }
  if (useFill) { ctx.fillStyle = fillColor; ctx.fill(); }
  if (useStroke) { ctx.strokeStyle = strokeColor; ctx.stroke(); }
}

function circle(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
}

// Bézier曲線
function bezier(x1, y1, x2, y2, x3, y3, x4, y4) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.bezierCurveTo(x2, y2, x3, y3, x4, y4);
  if (useStroke) { ctx.strokeStyle = strokeColor; ctx.stroke(); }
}

function fill(r, g = r, b = r) {
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


// テキスト関連機能
function text(str, x, y) {
  if (ctx) {
    ctx.fillStyle = fillColor;
    ctx.font = \`\${textSize_val}px \${textFont}\`;
    ctx.fillText(str, x, y);
  }
}

function textSize(size) {
  textSize_val = size;
}

// 数学関連の便利関数
function random(min, max = null) {
  if (max === null) {
    max = min;
    min = 0;
  }
  return min + (max - min) * Math.random();
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}

function min(a, b) {
  return (a < b) ? a : b;
}

function max(a, b) {
  return (a > b) ? a : b;
}

function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function constrain(value, min, max) {
  return value < min ? min : (value > max ? max : value);
}

// 特殊定数
const PI = Math.PI;
const HALF_PI = PI/2;
const QUARTER_PI/4;
const TAU = 2*PI;
const TWO_PI = 2*PI;
// arc
const OPEN  = 'OPEN';
const CHORD = 'CHORD';
const PIE   = 'PIE';

// マウス関連の定数
const LEFT = 0;
const CENTER = 1;
const RIGHT = 2;

// キーボード関連の定数
const BACKSPACE = 8;
const TAB = 9;
const ENTER = 13;
const RETURN = 13;
const SHIFT = 16;
const CTRL = 17;
const ALT = 18;
const ESCAPE = 27;
const UP = 38;
const DOWN = 40;
const LEFT_ARROW = 37;
const RIGHT_ARROW = 39;
`;

const processingAPI2 = `
  setup();
  loopId = setInterval(() => {
    if (typeof draw === 'function') draw();
  }, 1000 / 30);
  function noLoop() {
    if (loopId != null) {
      clearInterval(loopId);
    }
  }
`;

function runPDE() {
  fetch('samplePDE.pde')
    .then(response => {
      if (!response.ok) throw new Error("ファイル読み込みに失敗しました");
      return response.text();
    })
    .then(code => {
      try {
        const tokens = tokenize(code);
        console.log("トークン化結果：", tokens);
        try {
          const parser = new Parser(tokens);
          try {
            const ast = parser.parseProgram();
            console.log("AST生成完了:", ast);
            try {
              const jsCode = generateJavaScriptFromAST(ast);
              console.log("JavaScript生成完了");
              const fullCode = processingAPI + "\n" + jsCode + "\n" + processingAPI2;
  
              const oldScript = document.getElementById("compiled-script");
              if (oldScript) {
                oldScript.remove();
              }
  
              const script = document.createElement("script");
              script.id = "compiled-script"; 
              script.textContent = fullCode;
              document.body.appendChild(script);
            } catch (e) {
              console.error("JavaScript生成エラー：", e);
              alert("JavaScript生成エラー：" + e.message);
            }
          } catch (e) {
            console.error("構文解析エラー：", e);
            alert("構文解析エラー：" + e.message);
          }
        } catch (e) {
          console.error("パーサー初期化エラー：", e);
          alert("パーサー初期化エラー：" + e.message);
        }
      } catch (e) {
        console.error("トークン化エラー：", e);
        alert("トークン化エラー：" + e.message);
      }
    })
    .catch(err => {
      console.error("読み込みエラー：", err);
      alert("samplePDE.pde を読み込めませんでした: " + err.message);
    });
}


// パーサー
// --------------------------------------------------
// AST ノードの定義 (実装方針はProcessing.js 参照)
// --------------------------------------------------
class ImportNode {
  constructor(path) {
    this.type = "Import";
    this.path = path;
  }
}

class ProgramNode {
  constructor(imports, topLevelElements, allClasses) {
    this.type = "Program";
    this.imports = imports;
    this.topLevelElements = topLevelElements;
    this.allClasses = allClasses;
  }
}

class ClassNode {
  constructor(name, members, baseClass = null, isAbstract = false) {
    this.type = "Class";
    this.name = name;
    this.members = members;
    this.baseClass = baseClass;  // 継承元クラス名
    this.isAbstract = isAbstract;
  }
}

class FieldNode {
  constructor(fieldType, fieldName, initializer) {
    this.type = "Field";
    this.fieldType = fieldType;
    this.fieldName = fieldName;
    this.initializer = initializer;
  }
}

class MethodNode {
  constructor(returnType, name, params, body, isAbstract = false) {
    this.type = "Method";
    this.returnType = returnType;
    this.name = name;
    this.params = params; // 配列 [{ type, name }, ...]
    this.body = body;     // BlockNode
    this.isAbstract = isAbstract;
  }
}

class GlobalFunctionNode {
  constructor(returnType, name, params, body) {
    this.type = "GlobalFunction";
    this.returnType = returnType;
    this.name = name;
    this.params = params;
    this.body = body;
  }
}

class VariableDeclarationNode {
  constructor(varType, varName, initializer) {
    this.type = "VariableDeclaration";
    this.varType = varType;
    this.varName = varName;
    this.initializer = initializer;
  }
}

class BlockNode {
  constructor(statements) {
    this.type = "Block";
    this.statements = statements;
  }
}

class ExpressionStatementNode {
  constructor(expression) {
    this.type = "ExpressionStatement";
    this.expression = expression;
  }
}

class IfStatementNode {
  constructor(condition, thenBlock, elseBlock) {
    this.type = "IfStatement";
    this.condition = condition;
    this.thenBlock = thenBlock;
    this.elseBlock = elseBlock;
  }
}

class WhileStatementNode {
  constructor(condition, body) {
    this.type = "WhileStatement";
    this.condition = condition;
    this.body = body;
  }
}

class ForStatementNode {
  constructor(init, condition, update, body) {
    this.type = "ForStatement";
    this.init = init;
    this.condition = condition;
    this.update = update;
    this.body = body;
  }
}

class ForEachStatementNode {
  constructor(variableDeclaration, iterable, body) {
    this.type = "ForEachStatement";
    this.variableDeclaration = variableDeclaration; // ループ変数の宣言（VariableDeclarationNode）
    this.iterable = iterable;  // 反復対象の式
    this.body = body;          // ループ本体のステートメント（BlockNode など）
  }
}

class ReturnStatementNode {
  constructor(expression) {
    this.type = "ReturnStatement";
    this.expression = expression; // null 可
  }
}

class BreakStatementNode {
  constructor() {
    this.type = "BreakStatement";
  }
}

class BinaryOpNode {
  constructor(operator, left, right) {
    this.type = "BinaryOp";
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

class UnaryOpNode {
  constructor(operator, expr) {
    this.type = "UnaryOp";
    this.operator = operator;
    this.expr = expr;
  }
}

class LiteralNode {
  constructor(value, literalType = "number") {
    this.type = "Literal";
    this.value = value;
    this.literalType = literalType;
  }
}

class IdentifierNode {
  constructor(name) {
    if(name==="mousePressed" || name=="keyPressed"){
      this.type = "FunctionCall";
      this.callee = {
        "name": name,
        "type":"Identifier"
      }
      this.args = [];
    }else{
      this.type = "Identifier";
      this.name = name;
    }
  }
}

class FunctionCallNode {
  constructor(callee, args) {
    if (!callee.name){
      this.type = "FunctionCall",
      this.callee = callee.callee,
      this.args = args
    }else{
      this.type = "FunctionCall";
      this.callee = callee;
      this.args = args;
    }
  }
}

class ArrayAccessNode {
  constructor(arrayExpr, indexExpr) {
    this.type = "ArrayAccess";
    this.arrayExpr = arrayExpr;
    this.indexExpr = indexExpr;
  }
}

class NewArrayNode {
  constructor(arrayType, sizeExpr) {
    this.type = "NewArray";
    this.arrayType = arrayType;
    this.sizeExpr = sizeExpr;
  }
}

// NewArrayInitNode クラスを追加 (AST ノード)
class NewArrayInitNode {
  constructor(arrayType, elements) {
    this.type = "NewArrayInit";
    this.arrayType = arrayType;
    this.elements = elements;  // 初期値の配列
  }
}

class NewObjectNode {
  constructor(className, args) {
    this.type = "NewObject";
    this.className = className;
    this.args = args;
  }
}

class CastNode {
  constructor(castType, expr) {
    this.type = "Cast";
    this.castType = castType;
    this.expr = expr;
  }
}  

class MemberAccessNode {
  constructor(object, property) {
    this.type = "MemberAccess";
    this.object = object;
    this.property = property;
  }
}

// --------------------------------------------------
// パーサ (Processing.js の AST 作成ロジックを参考)
// --------------------------------------------------
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.currentIndex = 0;
    console.log(`パーサー初期化: トークン数 ${tokens.length}`);
  }

  currentToken() {
    return this.tokens[this.currentIndex] || null;
  }

  peekNext() {
    return this.tokens[this.currentIndex + 1] || null;
  }

  nextToken() {
    const tok = this.currentToken();
    this.currentIndex++;
    return tok;
  }

  matchToken(type, value = null) {
    const tok = this.currentToken();
    if (!tok) return false;
    if (tok.type !== type) return false;
    if (value !== null && tok.value !== value) return false;
    return true;
  }

  error(msg) {
    const token = this.currentToken();
    const tokenInfo = token ? `(タイプ: ${token.type}, 値: ${token.value})` : '(トークンなし)';
    const prevToken = this.currentIndex > 0 ? this.tokens[this.currentIndex - 1] : null;
    const prevTokenInfo = prevToken ? `前のトークン(タイプ: ${prevToken.type}, 値: ${prevToken.value})` : 'なし';
    const context = this.tokens.slice(Math.max(0, this.currentIndex - 5), this.currentIndex + 5)
      .map((t, i) => `[${this.currentIndex - 5 + i}:${t.type}:${t.value}]`).join(' ');
    
    throw new Error("Parse Error: " + msg + " at token index " + this.currentIndex + 
                    " 現在のトークン: " + tokenInfo + 
                    " 前のトークン: " + prevTokenInfo +
                    " コンテキスト: " + context);
  }

  // トップレベルの解析: import 文、クラス定義、グローバル関数など
  parseProgram() {
    console.log("プログラム解析開始");
    const imports = [];
    const topLevelElements = [];
    const allClasses = {}; // クラス情報を格納

    // import 文の解析
    while (this.matchToken("KEYWORD", "import")) {
      imports.push(this.parseImportStatement());
    }

    // 最初のパスでクラス定義を走査して情報を集める
    let tempIndex = this.currentIndex;
    while (this.currentToken() !== null) {
      const currentToken = this.currentToken();
      
      if (this.matchToken("KEYWORD", "class") || this.matchToken("KEYWORD", "abstract")) {
        // クラス宣言を読み飛ばして情報だけ取る
        let isAbstract = false;
        if (this.matchToken("KEYWORD", "abstract")) {
          isAbstract = true;
          this.nextToken();
        }
        
        if (!this.matchToken("KEYWORD", "class")) this.error("Expected 'class'");
        this.nextToken();
        
        if (!this.matchToken("IDENTIFIER")) this.error("Class name expected");
        const className = this.currentToken().value;
        this.nextToken();
        
        // 継承情報
        let baseClass = null;
        if (this.matchToken("KEYWORD", "extends")) {
          this.nextToken();
          if (!this.matchToken("IDENTIFIER")) this.error("Base class name expected");
          baseClass = this.currentToken().value;
          this.nextToken();
        }
        
        // クラス本体を読み飛ばす
        let braceCount = 0;
        if (this.matchToken("LBRACE")) {
          braceCount++;
          this.nextToken();
          
          // クラスフィールドを収集
          const fields = [];
          while (braceCount > 0 && this.currentToken() !== null) {
            if (this.matchToken("LBRACE")) braceCount++;
            if (this.matchToken("RBRACE")) braceCount--;
            
            // フィールド宣言を見つける
            if (braceCount > 0 && this.matchToken("TYPE")) {
              const fieldType = this.parseType();
              if (this.matchToken("IDENTIFIER")) {
                const fieldName = this.currentToken().value;
                fields.push(fieldName);
              }
            }
            
            if (this.currentToken() !== null) this.nextToken();
          }
          
          // クラス情報を格納
          allClasses[className] = {
            isAbstract,
            baseClass,
            fields
          };
        }
      } else {
        // クラス以外は読み飛ばす
        this.nextToken();
      }
    }
    
    // インデックスを戻して本格的な解析を開始
    this.currentIndex = tempIndex;

    while (this.currentToken() !== null) {
      const currentToken = this.currentToken();
      console.log(`トップレベル要素解析: インデックス ${this.currentIndex}, トークン [${currentToken.type}:${currentToken.value}]`);
      
      if (this.matchToken("KEYWORD", "class") || this.matchToken("KEYWORD", "abstract")) {
        topLevelElements.push(this.parseClassDeclaration());
      } else {
        try {
          topLevelElements.push(this.parseGlobalElement());
        } catch (e) {
          console.error(`グローバル要素解析でエラー: インデックス ${this.currentIndex}`, e);
          throw e;
        }
      }
    }
    console.log("プログラム解析完了");
    return new ProgramNode(imports, topLevelElements, allClasses);
  }

  parseImportStatement() {
    // "import" はすでにマッチしている前提
    this.nextToken(); // consume "import"
    let pathParts = [];
    while (!this.matchToken("SEMICOLON")) {
      const tok = this.currentToken();
      if (!tok) this.error("Unexpected EOF in import");
      pathParts.push(tok.value);
      this.nextToken();
    }
    this.nextToken(); // consume SEMICOLON
    return new ImportNode(pathParts.join(""));
  }

  parseClassDeclaration() {
    let isAbstract = false;
    if (this.matchToken("KEYWORD", "abstract")) {
      isAbstract = true;
      this.nextToken();  // 'abstract' を消費
    }

    if (!this.matchToken("KEYWORD", "class")) this.error("Expected 'class'");
    this.nextToken();

    if (!this.matchToken("IDENTIFIER")) this.error("Class name expected");
    const className = this.currentToken().value;
    this.nextToken();
  
    // 継承がある場合の処理
    let baseClass = null;
    if (this.matchToken("KEYWORD", "extends")) {
      this.nextToken(); // "extends" 消費
      if (!this.matchToken("IDENTIFIER")) this.error("Base class name expected");
      baseClass = this.currentToken().value;
      this.nextToken();
    }
  
    if (!this.matchToken("LBRACE")) this.error("Expected { after class name");
    this.nextToken(); // "{" 消費
  
    const members = [];
    while (!this.matchToken("RBRACE")) {
      const nodeOrArray = this.parseClassMember(className, isAbstract);
      if (Array.isArray(nodeOrArray)) {
        members.push(...nodeOrArray);
      } else {
        members.push(nodeOrArray);
      }
    }
    this.nextToken(); // "}" 消費
  
    return new ClassNode(className, members, baseClass, isAbstract);
  }

  parseType() {
    if (this.matchToken("TYPE") || this.matchToken("IDENTIFIER") || (this.matchToken("KEYWORD") && this.currentToken().value === "void")) {
      let typeStr = this.nextToken().value;
      while (this.matchToken("LBRACKET")) {
        this.nextToken();
        if (!this.matchToken("RBRACKET")) {
          this.error("Expected ']' for array type");
        }
        this.nextToken();
        typeStr += "[]";
      }
      return typeStr;
    } else {
      this.error("Expected type");
    }
  }            

  // クラスメンバーのパース（修正例）
  parseClassMember(currentClassName, classIsAbstract) {
    // アノテーション風の識別子をスキップ（万が一残っていた場合の対策）
    if (this.matchToken("IDENTIFIER") && 
        (this.currentToken().value === "Override" || 
         this.currentToken().value === "Deprecated" ||
         this.currentToken().value === "SuppressWarnings")) {
      this.nextToken(); // アノテーション名をスキップ
    }

    // コンストラクタ判定
    if (this.matchToken("IDENTIFIER") && this.currentToken().value === currentClassName) {
      const constructorName = this.nextToken().value;
      if (!this.matchToken("LPAREN")) this.error("Expected '(' after constructor name");
      this.nextToken(); // "(" を消費
      const params = [];
      while (!this.matchToken("RPAREN")) {
        const paramType = this.parseType();
        if (!this.matchToken("IDENTIFIER")) this.error("Parameter name expected");
        const paramName = this.nextToken().value;
        params.push({ type: paramType, name: paramName });
        if (this.matchToken("COMMA")) this.nextToken();
      }
      this.nextToken(); // ")" を消費
      const body = this.parseBlock();
      return new MethodNode("constructor", constructorName, params, body, false);
    }

    // 抽象メソッド宣言判定（class が abstract の場合のみ）
    if (classIsAbstract && this.matchToken("KEYWORD", "abstract")) {
      this.nextToken(); // "abstract" を消費
      // 戻り値の型を取得
      if (!this.matchToken("TYPE") && !this.matchToken("IDENTIFIER") && !(this.matchToken("KEYWORD") && this.currentToken().value === "void")) {
        this.error("Return type expected for abstract method");
      }
      const returnType = this.parseType();
      
      // メソッド名を取得
      if (!this.matchToken("IDENTIFIER")) this.error("Method name expected for abstract method");
      const name = this.nextToken().value;
      
      // 引数リストを解析
      if (!this.matchToken("LPAREN")) this.error("Expected '(' after abstract method name");
      this.nextToken(); // "(" を消費
      
      const params = [];
      while (!this.matchToken("RPAREN")) {
        if (this.matchToken("TYPE") || this.matchToken("IDENTIFIER")) {
          const paramType = this.parseType();
          if (!this.matchToken("IDENTIFIER")) this.error("Parameter name expected in abstract method");
          const paramName = this.nextToken().value;
          params.push({ type: paramType, name: paramName });
          if (this.matchToken("COMMA")) this.nextToken();
        } else if (this.matchToken("COMMA")) {
          this.nextToken(); // カンマをスキップ
        } else {
          break;
        }
      }
      
      if (!this.matchToken("RPAREN")) this.error("Expected ')' after abstract method parameters");
      this.nextToken(); // ")" を消費
      
      if (!this.matchToken("SEMICOLON")) this.error("Expected ';' after abstract method declaration");
      this.nextToken(); // ";" を消費
      
      return new MethodNode(returnType, name, params, null, true);
    }

    // 別の形式の抽象メソッド宣言判定（class が abstract の場合のみ）
    if (classIsAbstract && (this.matchToken("TYPE") || this.matchToken("KEYWORD", "void"))) {
      const peek1 = this.peekNext(); 
      const peek2 = this.tokens[this.currentIndex + 2];
      
      // TYPE + IDENTIFIER + LPAREN パターンの抽象メソッド
      if (peek1 && peek1.type === "IDENTIFIER" && peek2 && peek2.type === "LPAREN") {
        // 型とメソッド名
        const returnType = this.parseType();
        const name       = this.nextToken().value;
            // "(" を必ず消費
        if (!this.matchToken("LPAREN")) this.error("Expected '(' after abstract method name");
        this.nextToken();
        
        // パラメータの解析
        const params = [];
        while (!this.matchToken("RPAREN")) {
          if (this.matchToken("TYPE") || this.matchToken("IDENTIFIER")) {
            const paramType = this.parseType();
            if (!this.matchToken("IDENTIFIER")) this.error("Parameter name expected in abstract method");
            const paramName = this.nextToken().value;
            params.push({ type: paramType, name: paramName });
            if (this.matchToken("COMMA")) this.nextToken();
          } else if (this.matchToken("COMMA")) {
            this.nextToken(); // カンマをスキップ
          } else {
            break;
          }
        }
        
        // ")" を必ず消費
        if (!this.matchToken("RPAREN")) this.error("Expected ')' after abstract method signature");
        this.nextToken();
        
        // ";" を必ず消費
        if (!this.matchToken("SEMICOLON")) this.error("Expected ';' after abstract method");
        this.nextToken();
        
        return new MethodNode(returnType, name, params, null, true);
      }
    }

    // 通常のフィールド or メソッド
    if (this.matchToken("TYPE") || this.matchToken("KEYWORD", "void") || this.matchToken("IDENTIFIER")) {
      const typeStr = this.parseType();
      if (!this.matchToken("IDENTIFIER")) this.error("Member name expected");
      const name = this.nextToken().value;

      // メソッド
      if (this.matchToken("LPAREN")) {
        // isAbstract = falseを明示
        const m = this.parseMethodDeclaration(typeStr, name);
        m.isAbstract = false;
        return m;
      }

      // フィールド宣言
      const fieldNodes = [];
      do {
        const init = this.matchToken("ASSIGN") ? (this.nextToken() && this.parseExpression()) : null;
        fieldNodes.push(new FieldNode(typeStr, name, init));
        if (this.matchToken("COMMA")) {
          this.nextToken();
          if (!this.matchToken("IDENTIFIER")) this.error("Field name expected");
          const nextName = this.nextToken().value;
          fieldNodes[fieldNodes.length - 1] = new FieldNode(typeStr, nextName,
            this.matchToken("ASSIGN") ? (this.nextToken() && this.parseExpression()) : null
          );
        } else break;
      } while (true);

      if (!this.matchToken("SEMICOLON")) this.error("Expected ';' after field declaration");
      this.nextToken();
      return fieldNodes;
    }

    this.error("Invalid class member");
  }
       

  parseMethodDeclaration(returnType, name) {
    // メソッド宣言: 引数リストとブロック
    this.nextToken(); // consume "("
    const params = [];
    while (!this.matchToken("RPAREN")) {
      // param: 型と識別子を parseType() を使って取得する
      const pType = this.parseType();  // これで TYPE, IDENTIFIER, "void" などが受け付けられる
      if (!this.matchToken("IDENTIFIER")) this.error("Parameter name expected");
      const pName = this.nextToken().value;
      params.push({ type: pType, name: pName });
      if (this.matchToken("COMMA")) this.nextToken();
    }
    this.nextToken(); // consume ")"
    const body = this.parseBlock();
    return new MethodNode(returnType, name, params, body, false);
  }

  parseGlobalElement() {
      // グローバル関数または変数の場合、TYPE, IDENTIFIER, または void キーワードを型として受け付ける
    if (this.matchToken("TYPE") || this.matchToken("IDENTIFIER") || (this.matchToken("KEYWORD") && this.currentToken().value === "void")) {
      const retType = this.parseType(); // parseType() で型名を取得（"Ball" や "Paddle" なども含む）
      if (!this.matchToken("IDENTIFIER")) this.error("Global element name expected");
      const name = this.nextToken().value;
      if (this.matchToken("LPAREN")) {
        const func = this.parseMethodDeclaration(retType, name);
        return new GlobalFunctionNode(retType, name, func.params, func.body);
      } else {
        let initializer = null;
        if (this.matchToken("ASSIGN")) {
          this.nextToken();
          initializer = this.parseExpression();
        }  
        if (!this.matchToken("SEMICOLON")) this.error("Expected ; after global variable");
        this.nextToken();
        return new VariableDeclarationNode(retType, name, initializer);
      }
    }
    this.error("Unknown global element");
  }

  parseBlock() {
    if (!this.matchToken("LBRACE")) this.error("Expected { for block");
    this.nextToken(); // consume "{"
    const statements = [];
    while (!this.matchToken("RBRACE")) {
      if (!this.currentToken()) this.error("Unexpected EOF in block");
      statements.push(this.parseStatement());
    }
    this.nextToken(); // consume "}"
    return new BlockNode(statements);
  }

  parseStatement() {
    if (this.matchToken("KEYWORD", "if")) return this.parseIfStatement();
    if (this.matchToken("KEYWORD", "while")) return this.parseWhileStatement();
    if (this.matchToken("KEYWORD", "for")) return this.parseForStatement();
    if (this.matchToken("KEYWORD", "return")) return this.parseReturnStatement();
    if (this.matchToken("KEYWORD", "break")) {
      this.nextToken();
      if (!this.matchToken("SEMICOLON")) this.error("Expected ; after break");
      this.nextToken();
      return new BreakStatementNode();
    }
    if (this.matchToken("LBRACE")) return this.parseBlock();
    // 変数宣言または式文
    if (this.matchToken("TYPE")) return this.parseLocalVariableDeclaration();
    const expr = this.parseExpression();
    if (!this.matchToken("SEMICOLON")) this.error("Expected ; after expression");
    this.nextToken(); // consume ";"
    return new ExpressionStatementNode(expr);
  }

  parseIfStatement() {
    this.nextToken(); // consume "if"
    if (!this.matchToken("LPAREN")) this.error("Expected ( after if");
    this.nextToken();
    const conditionCheck = this.parseExpression();
    const condition = (conditionCheck === ("keyPressed" || "mousePressed")) ? conditionCheck : conditionCheck; //TODO
    if (!this.matchToken("RPAREN")) this.error("Expected ) after if condition");
    this.nextToken();
    const thenBlock = this.parseStatement();
    let elseBlock = null;
    if (this.matchToken("KEYWORD", "else")) {
      this.nextToken();
      elseBlock = this.parseStatement();
    }
    return new IfStatementNode(condition, thenBlock, elseBlock);
  }

  parseWhileStatement() {
    this.nextToken(); // consume "while"
    if (!this.matchToken("LPAREN")) this.error("Expected ( after while");
    this.nextToken();
    const condition = this.parseExpression();
    if (!this.matchToken("RPAREN")) this.error("Expected ) after while condition");
    this.nextToken();
    const body = this.parseStatement();
    return new WhileStatementNode(condition, body);
  }

  parseForStatement() {
    this.nextToken(); // "for" 消費
    if (!this.matchToken("LPAREN")) this.error("Expected ( after for");
    this.nextToken(); // "(" 消費
  
    let isForEach = false;
    let init = null;
    if (this.matchToken("TYPE") || this.matchToken("IDENTIFIER") || (this.matchToken("KEYWORD") && this.currentToken().value === "void")) {
      init = this.parseForVariableDeclaration();
      if (this.matchToken("COLON")) {
        isForEach = true;
        this.nextToken(); // ':' 消費
      }
    } else {
      init = this.parseExpression();
    }
  
    if (isForEach) {
      let iterable = this.parseExpression();
      if (!this.matchToken("RPAREN")) this.error("Expected ) after for-each loop");
      this.nextToken();
      const body = this.parseStatement();
      return new ForEachStatementNode(init, iterable, body);
    } else {
      if (!this.matchToken("SEMICOLON")) this.error("Expected ; in for loop initialization");
      this.nextToken(); // ";" 消費
      let condition = null;
      if (!this.matchToken("SEMICOLON")) {
        condition = this.parseExpression();
        if (!this.matchToken("SEMICOLON")) this.error("Expected ; after for loop condition");
      }
      this.nextToken(); // ";" 消費
      let update = null;
      if (!this.matchToken("RPAREN")) {
        update = this.parseExpression();
        if (!this.matchToken("RPAREN")) this.error("Expected ) after for loop update");
      }
      this.nextToken(); // ")" 消費
      const body = this.parseStatement();
      return new ForStatementNode(init, condition, update, body);
    }
  }
  
  

  parseForVariableDeclaration() {
    let type = this.parseType();
    if (!this.matchToken("IDENTIFIER")) this.error("Variable name expected in for loop declaration");
    let name = this.nextToken().value;
    let initializer = null;
    if (this.matchToken("ASSIGN")) {
      this.nextToken();
      initializer = this.parseExpression();
    }
    return new VariableDeclarationNode(type, name, initializer);
  }   

  parseReturnStatement() {
    this.nextToken(); // consume "return"
    let expr = null;
    if (!this.matchToken("SEMICOLON")) {
      expr = this.parseExpression();
    }
    if (!this.matchToken("SEMICOLON")) this.error("Expected ; after return");
    this.nextToken();
    return new ReturnStatementNode(expr);
  }

  parseLocalVariableDeclaration() {
    const type = this.parseType();  // TYPE と IDENTIFIER 両方を受け付ける
    const declarations = [];
    do {
        if (!this.matchToken("IDENTIFIER")) this.error("Variable name expected");
        const name = this.nextToken().value;
        let initializer = null;
        if (this.matchToken("ASSIGN")) {
          this.nextToken();
          initializer = this.parseExpression();
        }
        declarations.push(
          new VariableDeclarationNode(type, name, initializer)
        );

        if (this.matchToken("COMMA")) {
          this.nextToken(); // consume ","
        } else {
          break;
        }
    } while (true);

    if (!this.matchToken("SEMICOLON")) this.error("Expected ; after variable declaration");
    this.nextToken();
    return declarations;
  }

  parseExpression() {
    const currentToken = this.currentToken();
    console.log(`parseExpression: インデックス ${this.currentIndex}, トークン ${currentToken ? `[${currentToken.type}:${currentToken.value}]` : 'null'}`);
    
    if (this.matchToken("SEMICOLON")) {
      console.log("空の式を検出");
      // 空の式を許容
      return null;
    }
    return this.parseAssignment();
  }

  parseAssignment() {
    let left = this.parseLogical();

    if(this.matchToken("INCREMENT") ) {
      
      this.nextToken();
      // オブジェクトプロパティにインクリメントが使われた場合の対応
      if (left.type === "MemberAccess") {
        // 副作用を避けるための一時変数の使用は避け、直接変更する
        return new BinaryOpNode("=", left, new BinaryOpNode("+", left, new LiteralNode(1)));
      } else {
        return new BinaryOpNode("=", left, new BinaryOpNode("+", left, new LiteralNode(1)));
      }
    } else if(this.matchToken("DECREMENT") ) {
      
      this.nextToken();
      // オブジェクトプロパティにデクリメントが使われた場合の対応
      if (left.type === "MemberAccess") {
        return new BinaryOpNode("=", left, new BinaryOpNode("-", left, new LiteralNode(1)));
      } else {
        return new BinaryOpNode("=", left, new BinaryOpNode("-", left, new LiteralNode(1)));
      }
    } else if(this.matchToken("PLUSEQ")) {
      this.nextToken();
      const right = this.parseAssignment();
      left = new BinaryOpNode("=", left, new BinaryOpNode("+", left, right));
    } else if(this.matchToken("MINUSEQ")) {
      this.nextToken();
      const right = this.parseAssignment();
      left = new BinaryOpNode("=", left, new BinaryOpNode("-", left, right));
    } else if(this.matchToken("MULTEQ")) {
      this.nextToken();
      const right = this.parseAssignment();
      left = new BinaryOpNode("=", left, new BinaryOpNode("*", left, right));
    } else if(this.matchToken("DIVEQ")) {
      this.nextToken();
      const right = this.parseAssignment();
      left = new BinaryOpNode("=", left, new BinaryOpNode("/", left, right));
    } else {
      
      while (this.matchToken("ASSIGN")) {
        const op = this.currentToken().value;
        this.nextToken();
        const right = this.parseAssignment();
        left = new BinaryOpNode(op, left, right);
      }
    }

    return left;
  }

  parseLogical() {
    let left = this.parseComparison();
    while (this.matchToken("AND") || this.matchToken("OR")) {
      const op = this.currentToken().value;
      this.nextToken();
      if (!this.currentToken()) {
        this.error("Unexpected EOF after operator " + op);
      }
      const right = this.parseComparison();
      if (right === null) {
        this.error("Expected expression after operator " + op);
      }
      left = new BinaryOpNode(op, left, right);
    }
    return left;
  }

  parseComparison() {
    let left = this.parseAddSub();
    while (this.matchToken("EQ") || this.matchToken("NEQ") ||
           this.matchToken("LT") || this.matchToken("LE") ||
           this.matchToken("GT") || this.matchToken("GE")) {
      const op = this.currentToken().value;
      this.nextToken();
      const right = this.parseAddSub();
      left = new BinaryOpNode(op, left, right);
    }
    return left;
  }

  parseAddSub() {
    let node = this.parseMulDiv();
    while (this.matchToken("PLUS") || this.matchToken("MINUS")) {
      const op = this.currentToken().value;
      this.nextToken();
      if (!this.currentToken()) {
        this.error("Unexpected EOF after operator " + op);
      }
      const right = this.parseMulDiv();
      if (right === null) {
        this.error("Expected expression after operator " + op);
      }
      node = new BinaryOpNode(op, node, right);
    }
    return node;
  }

  parseMulDiv() {
    let node = this.parseUnary();
    while (this.matchToken("MULTIPLY") || this.matchToken("DIVIDE") || this.matchToken("MOD")) {
      const op = this.currentToken().value;
      this.nextToken();
      if (!this.currentToken()) {
        this.error("Unexpected EOF after operator " + op);
      }
      const right = this.parseUnary();
      if (right === null) {
        this.error("Expected expression after operator " + op);
      }
      node = new BinaryOpNode(op, node, right);
    }
    return node;
  }

  parseUnary() {
    if (this.matchToken("NOT") || this.matchToken("MINUS")) {
      const op = this.currentToken().value;
      this.nextToken();
      const expr = this.parseUnary();
      return new UnaryOpNode(op, expr);
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const tok = this.currentToken();
    if (!tok) this.error("Unexpected EOF in expression");
    
    console.log(`parsePrimary: インデックス ${this.currentIndex}, トークン [${tok.type}:${tok.value}]`);
    
    // まず、括弧付き式やキャストを処理
    if (this.matchToken("LPAREN")) {
      console.log(`括弧式の解析開始: インデックス ${this.currentIndex}`);
      this.nextToken(); // '(' 消費
      
      // キャストか括弧付き式か判定
      if (this.matchToken("TYPE")) {
        console.log(`キャスト式の解析: インデックス ${this.currentIndex}`);
        const castType = this.parseType();
        
        if (!this.matchToken("RPAREN")) {
          this.error("Expected ')' after cast type");
        }
        
        this.nextToken(); // ')' 消費
        try {
          const expr = this.parseUnary();
          return new CastNode(castType, expr);
        } catch (e) {
          console.error(`キャスト式の中の式の解析でエラー: ${e.message}`);
          throw e;
        }
      } else {
        console.log(`括弧付き式の解析: インデックス ${this.currentIndex}`);
        try {
          const expr = this.parseExpression();
          
          if (!this.matchToken("RPAREN")) {
            const missing = "Expected ')' after expression";
            console.error(missing);
            this.error(missing);
          }
          
          this.nextToken(); // ')' 消費
          return expr;
        } catch (e) {
          console.error(`括弧式の解析でエラー: ${e.message}`);
          throw e;
        }
      }
    }
    
    // リテラルなどの処理
    if (tok.type === "NUMBER") {
      this.nextToken();
      return new LiteralNode(tok.value, "number");
    }
    if (tok.type === "STRING") {
      this.nextToken();
      return new LiteralNode(tok.value, "string");
    }
    if (tok.type === "CHAR") {
      this.nextToken();
      return new LiteralNode(tok.value, "char");
    }
    // キーワードの処理を優先
    if (tok.type === "KEYWORD") {
      // this と super キーワードを特別に処理
      if (tok.value === "this" || tok.value === "super") {
        this.nextToken();
        return new IdentifierNode(tok.value);
      }
      // true, false キーワードはそのまま処理
      else if (tok.value === "true" || tok.value === "false") {
        this.nextToken();
        return new LiteralNode(tok.value, "boolean");
      }
      // new キーワードの処理
      else if (tok.value === "new") {
        this.nextToken(); // "new" 消費
        if (!this.matchToken("TYPE") && !this.matchToken("IDENTIFIER")) {
          this.error("Expected type or class after 'new'");
        }
        const newType = this.nextToken().value;
        
        if (this.matchToken("LBRACKET")) {
          this.nextToken(); // '[' 消費
          
          // 空の配列初期化子を処理: new Type[] { ... }
          if (this.matchToken("RBRACKET")) {
            this.nextToken(); // ']' 消費
            
            // 配列初期化子
            if (this.matchToken("LBRACE")) {
              this.nextToken(); // '{' 消費
              const elements = [];
              
              // 空の初期化子の場合
              if (this.matchToken("RBRACE")) {
                this.nextToken(); // '}' 消費
                return new NewArrayInitNode(newType, elements);
              }
              
              // 要素がある初期化子
              do {
                if (this.matchToken("COMMA")) {
                  this.nextToken(); // カンマをスキップ
                  continue;
                }
                
                const element = this.parseExpression();
                if (element !== null) {
                  elements.push(element);
                }
                
                if (!this.matchToken("COMMA") && !this.matchToken("RBRACE")) {
                  this.error("Expected ',' or '}' in array initializer");
                }
              } while (this.matchToken("COMMA") && this.nextToken());
              
              if (!this.matchToken("RBRACE")) {
                this.error("Expected '}' to close array initializer");
              }
              this.nextToken(); // '}' 消費
              
              return new NewArrayInitNode(newType, elements);
            }
            // 初期化子なしの空配列 new Type[]
            return new NewArrayNode(newType, new LiteralNode(0, "number"));
          }
          
          // サイズ指定配列: new Type[SIZE]
          const sizeExpr = this.parseExpression();
          if (!this.matchToken("RBRACKET")) {
            this.error("Expected ']' in new array expression");
          }
          this.nextToken(); // ']' 消費
          return new NewArrayNode(newType, sizeExpr);
        } else if (this.matchToken("LPAREN")) {
          this.nextToken(); // '(' 消費
          const args = [];
          if (!this.matchToken("RPAREN")) {
            do {
              if (this.matchToken("COMMA")) {
                this.nextToken(); // カンマをスキップ
                continue;
              }
              
              // ここでEOFや予期しないトークンをチェック
              if (!this.currentToken()) {
                this.error("Unexpected EOF in constructor arguments");
              }
              
              const arg = this.parseExpression();
              if (arg !== null) { // null（空の式）でなければ追加
                args.push(arg);
              }
              
              // カンマまたは閉じ括弧があるか確認
              if (!this.matchToken("COMMA") && !this.matchToken("RPAREN")) {
                this.error("Expected ',' or ')' in constructor arguments");
              }
            } while (this.matchToken("COMMA") && this.nextToken()); // カンマがあれば続行
          }
          
          if (!this.matchToken("RPAREN")) {
            this.error("Expected ')' to close constructor call");
          }
          this.nextToken(); // ')' 消費
          return new NewObjectNode(newType, args);
        } else {
          this.error("Invalid syntax after 'new'");
        }
      }
    }
  
    // 識別子、関数呼び出し、配列アクセス、メンバーアクセス
    if (tok.type === "IDENTIFIER") {
      this.nextToken();
      let expr = new IdentifierNode(tok.value);
      
      // ここからループして、関数呼び出し、配列アクセス、メンバーアクセスを処理
      while (true) {
        // ドット演算子によるメンバーアクセス処理を追加
        if (this.matchToken("DOT")) {
          this.nextToken(); // '.' 消費
          if (!this.matchToken("IDENTIFIER")) {
            this.error("Expected identifier after '.'");
          }
          const member = this.nextToken().value;
          expr = new MemberAccessNode(expr, new IdentifierNode(member));
        } 
        else if (this.matchToken("LPAREN")) {
          this.nextToken(); // '(' 消費
          const args = [];
          if (!this.matchToken("RPAREN")) {
            do {
              if (this.matchToken("COMMA")) {
                this.nextToken(); // カンマをスキップ
                continue;
              }
              
              // ここでEOFや予期しないトークンをチェック
              if (!this.currentToken()) {
                this.error("Unexpected EOF in function arguments");
              }
              
              const arg = this.parseExpression();
              if (arg !== null) { // null（空の式）でなければ追加
                args.push(arg);
              }
              
              // カンマまたは閉じ括弧があるか確認
              if (!this.matchToken("COMMA") && !this.matchToken("RPAREN")) {
                this.error("Expected ',' or ')' in function arguments");
              }
            } while (this.matchToken("COMMA") && this.nextToken()); // カンマがあれば続行
          }
          
          if (!this.matchToken("RPAREN")) {
            this.error("Expected ')' to close function call");
          }
          this.nextToken(); // ')' 消費
          expr = new FunctionCallNode(expr, args);
        } else if (this.matchToken("LBRACKET")) {
          this.nextToken(); // '[' 消費
          const indexExpr = this.parseExpression();
          if (!this.matchToken("RBRACKET")) {
            this.error("Expected ']' for array access");
          }
          this.nextToken(); // ']' 消費
          expr = new ArrayAccessNode(expr, indexExpr);
        } else {
          break;
        }
      }
      return expr;
    }
  
    this.error("Unexpected token in expression: " + tok.type + ", " + tok.value);
  }
}

// --------------------------------------------------
// エクスポート
// --------------------------------------------------


// window.Parser = Parser;

// // 必要なASTノードも個別に公開
// window.ImportNode = ImportNode;
// window.ProgramNode = ProgramNode;
// window.ClassNode = ClassNode;
// window.FieldNode = FieldNode;
// window.MethodNode = MethodNode;
// window.GlobalFunctionNode = GlobalFunctionNode;
// window.VariableDeclarationNode = VariableDeclarationNode;
// window.BlockNode = BlockNode;
// window.ExpressionStatementNode = ExpressionStatementNode;
// window.IfStatementNode = IfStatementNode;
// window.WhileStatementNode = WhileStatementNode;
// window.ForStatementNode = ForStatementNode;
// window.ReturnStatementNode = ReturnStatementNode;
// window.BinaryOpNode = BinaryOpNode;
// window.UnaryOpNode = UnaryOpNode;
// window.LiteralNode = LiteralNode;
// window.IdentifierNode = IdentifierNode;
// window.FunctionCallNode = FunctionCallNode;
// window.ArrayAccessNode = ArrayAccessNode;
// window.NewArrayNode = NewArrayNode;
// window.NewObjectNode = NewObjectNode;

// --------------------------------------------------
// コード生成
// --------------------------------------------------
// クラスフィールドかどうかを判定する関数
function isClassField(identifier, context) {
  // Processingのグローバル関数かどうかをチェック
  if (PROCESSING_GLOBALS.includes(identifier)) {
    return false;
  }

  // クラスフィールドの直接チェック
  const isDirectField = context && context.classFields && context.classFields.includes(identifier);
  
  // 親クラスから継承したフィールドのチェック
  const isInheritedField = context && context.parentClassFields && context.parentClassFields.includes(identifier);
  
  // どのフィールドにも属さないが、メソッド内で使われるクラスインスタンス変数かどうか
  // Processingのスタイルではthisなしでアクセスできる
  const isImplicitField = 
    context && context.inMethod && 
    !context.localVariables?.includes(identifier) && 
    /^[a-z][a-zA-Z0-9]*$/.test(identifier) && // 先頭が小文字で始まる識別子は大抵フィールド
    !PROCESSING_GLOBALS.includes(identifier); // グローバル関数でない
  
  return isDirectField || isInheritedField || isImplicitField;
}

function generateJavaScriptFromAST(ast, context = {}, indent = 0) {
  const INDENT = '  '.repeat(indent);
  if (!ast) return '';

  // プログラムノードからクラス情報を取得し、コンテキストに追加
  if (ast.type === "Program" && ast.allClasses) {
    context = { ...context, allClasses: ast.allClasses };
  }

  if(Array.isArray(ast)) {
    return ast
      .map(node => generateJavaScriptFromAST(node, context, indent))
      .filter(Boolean)
      .join('\n');
  }

  switch (ast.type) {
    case "Program":
      const imports = (ast.imports || []).map(im => `// import ${im.path}`).join('\n');
      const topLevel = (ast.topLevelElements || [])
        .map(e => generateJavaScriptFromAST(e, context, indent))
        .join('\n\n');
      return `${imports}\n\n${topLevel}`;

    case "Class":
      
      // 抽象クラス処理
      let classHeader = '';
      if(ast.isAbstract) {
        classHeader += `${INDENT}// abstract class\n`;
      }

      // 親クラスのフィールド情報を追加（可能であれば）
      let parentClassFields = [];
      if (ast.baseClass && context.allClasses) {
        const parentClass = context.allClasses[ast.baseClass];
        if (parentClass && parentClass.fields) {
          parentClassFields = parentClass.fields;
        }
      }
      
      // クラスの場合、まずフィールドの名前を集める
      const classFields = [];
      for (const member of ast.members) {
        if (member.type === "Field") {
          classFields.push(member.fieldName);
        }
      }
      
      // クラス内では新たなコンテキストとして classFields を渡す
      const newContext = Object.assign({}, context, { 
        classFields, 
        parentClassFields,
        allClasses: context.allClasses
      });
      
      const extendsClause = ast.baseClass ? ` extends ${ast.baseClass}` : '';
      let constructorBody = "";
      let methodStr = "";
      let hasConstructor = false;
      let constructorParams = "";
      
      // クラスメンバーの走査
      for (const member of ast.members) {
        if (member.type === "Field") {
          const init = member.initializer 
            ? generateJavaScriptFromAST(member.initializer, newContext, indent + 1) 
            : "undefined";
          constructorBody += `    this.${member.fieldName} = ${init};\n`;
        } else if (member.type === "Method") {
          if (member.name === ast.name) {
            // コンストラクタの場合：識別子のthis変換を抑制するためフラグを付与
            hasConstructor = true;
            const params = member.params || [];
            constructorParams = params.map(p => p.name).join(', ');
            
            // メソッド内で引数名を追跡するためのコンテキスト
            const methodParamsNames = params.map(p => p.name);
            
            // superの呼び出しを含むコンストラクタボディを正しい順序で生成
            const bodyContext = Object.assign({}, newContext, { 
              disableFieldPrefix: true,
              methodParams: methodParamsNames,
              inConstructor: true 
            });
            const rawBody = generateJavaScriptFromAST(member.body, bodyContext, indent + 1);
            
            // パラメータからフィールドへの代入を生成（フィールド初期化値がない場合）
            let paramAssignments = "";
            if (member.params && member.params.length > 0) {
              // 既に初期化されたフィールドを追跡
              const initializedFields = new Set();
              
              member.params.forEach(param => {
                if (classFields.includes(param.name) && !initializedFields.has(param.name)) {
                  paramAssignments += `    this.${param.name} = ${param.name};\n`;
                  initializedFields.add(param.name);
                }
              });
            }
            
            // superの呼び出しがある場合は、それ以外の初期化コードとは別にする
            if (rawBody && rawBody.includes("super(")) {
              const superCallMatch = rawBody.match(/\s*super\(.*?\);/);
              if (superCallMatch) {
                const superCall = superCallMatch[0];
                // superを抽出し、それ以外のコードを残りのボディとする
                const restOfBody = rawBody.replace(superCall, "");
                constructorBody = superCall + "\n" + paramAssignments;
                
                // 重複をフィルタリングして追加のコードを追加
                if (restOfBody.trim()) {
                  // 中身がある場合のみ追加
                  constructorBody += restOfBody;
                }
              } else {
                constructorBody = paramAssignments + rawBody;
              }
            } else {
              constructorBody = paramAssignments + rawBody;
            }
          } else {
            // 抽象メソッドかどうか
            const params = member.params || [];
            const paramNames = params.map(p => p.name);
            const paramsStr = paramNames.join(', ');
            
            if (member.isAbstract) {
              // 抽象メソッドは空の本体を持つようにする（エラーをスローしない）
              methodStr += 
                `  ${member.name}(${paramsStr}) {\n` +
                `    // 抽象メソッド\n` +
                `  }\n`;
            } else {
              // 通常メソッド - メソッド内ではフィールド名をthis.フィールド名に変換
              const methodContext = Object.assign({}, newContext, { 
                inMethod: true,
                methodParams: paramNames
              });
              const body = generateJavaScriptFromAST(member.body, methodContext, indent + 1);
              methodStr += `  ${member.name}(${paramsStr}) {\n${body}\n  }\n`;
            }
          }
        } else {
          methodStr += `  // Unhandled class member: ${member.type}\n`;
        }
      }
      
      if (!hasConstructor) {
        constructorBody = constructorBody || "    // no field initializations\n";
        constructorParams = "";
      }
      const constructorStr = `  constructor(${constructorParams}) {\n${constructorBody}  }\n`;
      
      return `${classHeader}${INDENT}class ${ast.name}${extendsClause} {\n${constructorStr}${methodStr}${INDENT}}`;
      
    case "Field":
      // ※ グローバル変数として Field が出力されるケースがある場合、
      //     初期化子がないなら "undefined" を出力するようにする
      const fieldInit = ast.initializer 
        ? generateJavaScriptFromAST(ast.initializer, context, 0) 
        : "undefined";
      return `${INDENT}let ${ast.fieldName} = ${fieldInit};`;

    case "Method":
      // グローバルな関数の場合（クラス外）
      const params = (ast.params || []).map(p => p.name).join(', ');
      const body = generateJavaScriptFromAST(ast.body, context, indent + 1);
      return `${INDENT}function ${ast.name}(${params}) {\n${body}\n${INDENT}}`;

    case "GlobalFunction":
      const gParams = (ast.params || []).map(p => p.name).join(', ');
      const gBody = generateJavaScriptFromAST(ast.body, context, indent + 1);
      return `${INDENT}function ${ast.name}(${gParams}) {\n${gBody}\n${INDENT}\n}`;

    case "VariableDeclaration":
      let varValue = ast.initializer 
        ? generateJavaScriptFromAST(ast.initializer, context, 0) 
        : 'undefined';
      return `${INDENT}let ${ast.varName} = ${varValue};`;

    case "Block":
      // ブロック内のローカル変数を特定
      const localVariables = [];
      if (Array.isArray(ast.statements)) {
        for (const stmt of ast.statements) {
          if (stmt.type === "VariableDeclaration") {
            localVariables.push(stmt.varName);
          }
        }
      }
      
      // ローカル変数情報を含む新しいコンテキスト
      const blockContext = { ...context, localVariables };
      
      return (ast.statements || [])
        .map(stmt => generateJavaScriptFromAST(stmt, blockContext, indent))
        .join('\n');

    case "ExpressionStatement":
      // コンストラクタ内のフィールド初期化（x = tempX など）を検出して this. を付加
      if (context.inConstructor && ast.expression && ast.expression.type === "BinaryOp" && 
          ast.expression.operator === "=" && ast.expression.left.type === "Identifier") {
        
        const leftName = ast.expression.left.name;
        const rightExpr = generateJavaScriptFromAST(ast.expression.right, context);
        
        // クラスのフィールドとして扱う（this.を追加）
        if (context.classFields && context.classFields.includes(leftName)) {
          return `${INDENT}this.${leftName} = ${rightExpr};`;
        } 
        // クラスのフィールドリストに入っていなくても暗黙的に宣言されるフィールドとして扱う
        else if (/^[a-z][a-zA-Z0-9]*$/.test(leftName) && !PROCESSING_GLOBALS.includes(leftName)) {
          return `${INDENT}this.${leftName} = ${rightExpr};`;
        }
      }
      
      return `${INDENT}${generateJavaScriptFromAST(ast.expression, context)};`;

    case "IfStatement":
      let cond = generateJavaScriptFromAST(ast.condition, context);
      if (ast.condition.type === "BinaryOp" &&
          (ast.condition.left.type === "BinaryOp" || ast.condition.right.type === "BinaryOp")) {
        if (!(ast.condition.operator === "&&" || ast.condition.operator === "||")) {
          cond = `(${cond})`;
        }
      }
      const thenBlock = generateJavaScriptFromAST(ast.thenBlock, context, indent + 1);
      const elseBlock = ast.elseBlock
        ? ` else {\n${generateJavaScriptFromAST(ast.elseBlock, context, indent + 1)}\n${INDENT}}`
        : '';
      return `${INDENT}if (${cond}) {\n${thenBlock}\n${INDENT}}${elseBlock}`;

    case "WhileStatement":
      const whileCond = generateJavaScriptFromAST(ast.condition, context);
      const whileBody = generateJavaScriptFromAST(ast.body, context, indent + 1);
      return `${INDENT}while (${whileCond}) {\n${whileBody}\n${INDENT}}`;

    case "ForStatement":
      const init = generateJavaScriptFromAST(ast.init, context);
      const condition = generateJavaScriptFromAST(ast.condition, context);
      const update = generateJavaScriptFromAST(ast.update, context);
      const forBody = generateJavaScriptFromAST(ast.body, context, indent + 1);
      return `${INDENT}for (${init} ${condition}; ${update}) {\n${forBody}\n${INDENT}}`;

    case "ForEachStatement":
      // ここでは ES6 の for...of ループに変換する例
      const varName = ast.variableDeclaration.varName;
      const iterable = generateJavaScriptFromAST(ast.iterable, context);
      const forEachBody = generateJavaScriptFromAST(ast.body, context, indent + 1);
      return `${INDENT}for (let ${varName} of ${iterable}) {\n${forEachBody}\n${INDENT}}`;

    case "ReturnStatement":
      const ret = ast.expression 
        ? generateJavaScriptFromAST(ast.expression, context) 
        : '';
      return `${INDENT}return ${ret};`;

    case "BinaryOp":
      let operator = ast.operator;
      const opMap = {
        '%': '%',
        '==': '===',
        '!=': '!==',
        '&&': '&&',
        '||': '||',
      };
      if (opMap[operator]) {
        operator = opMap[operator];
      }
      
      // 左右の式を生成
      const leftContext = { ...context };
      const rightContext = { ...context };
      
      // = 演算子の場合は、左辺は常にthisがつく可能性があるのでdisableFieldPrefixをセット
      if (operator === "=") {
        leftContext.disableAssignLeftPrefix = true;
      }
      
      let left = generateJavaScriptFromAST(ast.left, leftContext);
      let right = generateJavaScriptFromAST(ast.right, rightContext);
      const precedence = {
        '*': 3, '/': 3, '%': 3,
        '+': 2, '-': 2,
        '<': 1, '>': 1, '<=': 1, '>=': 1, '===': 1, '!==': 1,
        '&&': 0, '||': 0
      };
      if (ast.right.type === "BinaryOp" && ast.right.operator === "/") {
        if (operator === "-" &&
            ((ast.left.type === "Identifier" && ast.left.name === "width") ||
             (ast.left.type === "Identifier" && ast.left.name === "height"))) {
          return `${left} - ${right}`;
        }
        if ((operator === "-" || operator === "+") &&
            ast.right.right.type === "Identifier" &&
            (ast.right.right.name === "paddleWidth" || ast.right.right.name === "paddleHeight")) {
          return `(${left} ${operator} ${generateJavaScriptFromAST(ast.right.left, context)}) / ${generateJavaScriptFromAST(ast.right.right, context)}`;
        }
      }
      if (ast.right.type === "BinaryOp") {
        const rightOp = opMap[ast.right.operator] || ast.right.operator;
        if ((precedence[operator] || 0) >= (precedence[rightOp] || 0) &&
            operator !== "-" &&
            !(operator === "*" && rightOp === "/")) {
          right = `(${right})`;
        }
      }
      if (ast.left.type === "BinaryOp") {
        const leftOp = opMap[ast.left.operator] || ast.left.operator;
        if ((precedence[operator] || 0) > (precedence[leftOp] || 0)) {
          left = `(${left})`;
        }
      }
      if (ast.left.type === "Identifier" && ast.left.name === "ballX" &&
          operator === "-" &&
          ast.right.type === "Identifier" && ast.right.name === "paddleX") {
        return `${left} ${operator} ${right}`;
      }
      return `${left} ${operator} ${right}`;

    case "UnaryOp":
      return `${ast.operator}${generateJavaScriptFromAST(ast.expr, context)}`;

    case "Literal":
      if (ast.literalType === 'string') {
        return `"${ast.value}"`;
      } else if (ast.literalType === 'char') {
        if (ast.value === ' ') {
          return `' '`; 
        } else {
          return `'${ast.value}'`;
        }
      } else {
        return ast.value;
      }

    case "Identifier":
      // メソッド内でのフィールド参照
      if (context.inMethod) {
        // このメソッドのローカル変数でないかつ、フィールドと判断される場合はthisを付ける
        // ただし、メソッドの引数に含まれる名前は対象外
        if (isClassField(ast.name, context) && !context.methodParams?.includes(ast.name)) {
          return `this.${ast.name}`;
        }
      } 
      // コンストラクタのthis重複などを避ける
      else if (isClassField(ast.name, context) && !context.disableFieldPrefix) {
        return `this.${ast.name}`;
      }
      return ast.name;

    case "FunctionCall":
      if (ast.callee.type === "Identifier" && ast.callee.name === "random") {
        if (ast.args.length === 2) {
          const min = generateJavaScriptFromAST(ast.args[0], context);
          const max = generateJavaScriptFromAST(ast.args[1], context);
          return `${min} + ((mouseX % 100) / 100.0) * (${max} - ${min})`;
        }
      }
      if (ast.callee.type === "Identifier" && ast.callee.name === "super") {
        return `super(${(ast.args || [])
          .map(arg => generateJavaScriptFromAST(arg, context))
          .join(', ')})`;
      }
      return `${generateJavaScriptFromAST(ast.callee, context)}(${(ast.args || [])
        .map(arg => generateJavaScriptFromAST(arg, context))
        .join(', ')})`;

    case "ArrayAccess":
      return `${generateJavaScriptFromAST(ast.arrayExpr, context)}[${generateJavaScriptFromAST(ast.indexExpr, context)}]`;

    case "NewArray":
      const arrSize = generateJavaScriptFromAST(ast.sizeExpr, context);
      return `new Array(${arrSize}).fill(0)`;

    case "NewObject":
      return `new ${ast.className}(${(ast.args || [])
        .map(arg => generateJavaScriptFromAST(arg, context))
        .join(', ')})`;

    case "Cast":
      const castExpr = generateJavaScriptFromAST(ast.expr, context);
      if (ast.castType === "int") return `Math.floor(${castExpr})`;
      else return `${castExpr} /* cast to ${ast.castType} */`;

    case "MemberAccess":
      if (ast.object.type === "Identifier" && ast.object.name === "super") {
        return `super.${generateJavaScriptFromAST(ast.property, context)}`;
      }
      return `${generateJavaScriptFromAST(ast.object, context)}.${generateJavaScriptFromAST(ast.property, context)}`;

    case "NewArrayInit":
      return `[${(ast.elements || [])
        .map(elem => generateJavaScriptFromAST(elem, context))
        .join(', ')}]`;

    default:
      return `${INDENT}// Unhandled AST node: ${ast.type}`;
  }
}



// window.generateJavaScriptFromAST = generateJavaScriptFromAST;

// --------------------------------------------------
// tokenization
// --------------------------------------------------
class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

// ==== Lexer クラス ====
// Processing.js の字句解析器に似た実装
class Lexer {
  constructor(code) {
    this.code = code;
    this.pos = 0;
    this.length = code.length;
  }

  currentChar() {
    return this.code[this.pos];
  }

  advance() {
    this.pos++;
  }

  peek(offset = 1) {
    return this.code[this.pos + offset];
  }

  isEOF() {
    return this.pos >= this.length;
  }

  skipWhitespace() {
    while (!this.isEOF() && /\s/.test(this.currentChar())) {
      this.advance();
    }
  }

  // コメント処理: // と /* ... */
  skipComment() {
    if (this.currentChar() === "/" && this.peek() === "/") {
      this.advance(); this.advance();
      while (!this.isEOF() && this.currentChar() !== "\n") {
        this.advance();
      }
    } else if (this.currentChar() === "/" && this.peek() === "*") {
      this.advance(); this.advance();
      while (!this.isEOF() && !(this.currentChar() === "*" && this.peek() === "/")) {
        this.advance();
      }
      this.advance(); this.advance();
    }
  }

  nextToken() {
    // @Override, @Deprecated...）をスキップ 
    if (this.currentChar() === '@') {
      // @から始まる全てのコンテンツを現在の行の終わりまでスキップ
      while (!this.isEOF() && this.currentChar() !== '\n') {
        this.advance();
      }
      
      // 改行もスキップ
      if (!this.isEOF() && this.currentChar() === '\n') {
        this.advance();
      }
      
      // 次のトークンを再帰的に取得
      return this.nextToken();
    }
    
    this.skipWhitespace();
    if (this.isEOF()) return null;
    
    // コメントのチェック
    if (this.currentChar() === "/" && (this.peek() === "/" || this.peek() === "*")) {
      this.skipComment();
      return this.nextToken();
    }

    let ch = this.currentChar();

    // 数字 (整数・小数)
    if (/[0-9]/.test(ch)) {
      let numStr = "";
      while (!this.isEOF() && /[0-9.]/.test(this.currentChar())) {
        numStr += this.currentChar();
        this.advance();
      }
      return new Token("NUMBER", numStr);
    }

    // 識別子またはキーワード (アルファベットまたは _ で始まる)
    if (/[a-zA-Z_]/.test(ch)) {
      let idStr = "";
      while (!this.isEOF() && /[a-zA-Z0-9_]/.test(this.currentChar())) {
        idStr += this.currentChar();
        this.advance();
      }
      const types = ["boolean", "byte", "char", "color", "double", "float", "int", "long", "String"];
      const keywords = ["if", "else", "for", "while", "do", "switch", "case", "break", "continue", "return", "void", "class", "new", "extends", "abstract", "import"];
      if (types.includes(idStr)) {
        return new Token("TYPE", idStr);
      } else if (keywords.includes(idStr)) {
        return new Token("KEYWORD", idStr);
      } else {
        return new Token("IDENTIFIER", idStr);
      }
    }

    // 二文字演算子（先にチェック）
    if (ch === "+" && this.peek() === "+") {
      this.advance(); this.advance();
      return new Token("INCREMENT", "++");
    }
    if (ch === "-" && this.peek() === "-") {
      this.advance(); this.advance();
      return new Token("DECREMENT", "--");
    }
    if (ch === "+" && this.peek() === "=") {
      this.advance(); this.advance();
      return new Token("PLUSEQ", "+=");
    }
    if (ch === "-" && this.peek() === "=") {
      this.advance(); this.advance();
      return new Token("MINUSEQ", "-=");
    }
    if (ch === "*" && this.peek() === "=") {
      this.advance(); this.advance();
      return new Token("MULTEQ", "*=");
    }
    if (ch === "/" && this.peek() === "=") {
      this.advance(); this.advance();
      return new Token("DIVEQ", "/=");
    }

    // 既存の2文字演算子
    if (ch === "=") {
      if (this.peek() === "=") {
        this.advance(); this.advance();
        return new Token("EQ", "==");
      }
      this.advance();
      return new Token("ASSIGN", "=");
    }
    if (ch === "!") {
      if (this.peek() === "=") {
        this.advance(); this.advance();
        return new Token("NEQ", "!=");
      }
      this.advance();
      return new Token("NOT", "!");
    }
    if (ch === "<") {
      if (this.peek() === "=") {
        this.advance(); this.advance();
        return new Token("LE", "<=");
      }
      this.advance();
      return new Token("LT", "<");
    }
    if (ch === ">") {
      if (this.peek() === "=") {
        this.advance(); this.advance();
        return new Token("GE", ">=");
      }
      this.advance();
      return new Token("GT", ">");
    }
    if (ch === "&" && this.peek() === "&") {
      this.advance(); this.advance();
      return new Token("AND", "&&");
    }
    if (ch === "|" && this.peek() === "|") {
      this.advance(); this.advance();
      return new Token("OR", "||");
    }

    // 1文字記号
    const singleChars = {
      "+": "PLUS", "-": "MINUS", "*": "MULTIPLY", "/": "DIVIDE",
      "%": "MOD",
      "(": "LPAREN", ")": "RPAREN",
      "{": "LBRACE", "}": "RBRACE",
      "[": "LBRACKET", "]": "RBRACKET",
      ";": "SEMICOLON", ",": "COMMA", ".": "DOT",
      ":": "COLON"
    };

    if (ch in singleChars) {
      this.advance();
      return new Token(singleChars[ch], ch);
    }

    // 文字列リテラル
    if (ch === "\"") {
      this.advance();
      let strVal = "";
      while (!this.isEOF() && this.currentChar() !== "\"") {
        strVal += this.currentChar();
        this.advance();
      }
      this.advance(); // 終端の " を消費
      return new Token("STRING", strVal);
    }

    // 文字リテラル
    if (ch === "'") {
      this.advance();
      let charVal = "";
      // エスケープシーケンスのサポート
      if (this.currentChar() === '\\') {
        this.advance();
        if (this.currentChar() === 'n') charVal = '\n';
        else if (this.currentChar() === 't') charVal = '\t';
        else if (this.currentChar() === 'r') charVal = '\r';
        else if (this.currentChar() === '\\') charVal = '\\';
        else if (this.currentChar() === '\'') charVal = '\'';
        else charVal = this.currentChar();
        this.advance();
      } else {
        // 通常の文字
        charVal = this.currentChar();
        this.advance();
      }
      if (this.currentChar() !== "'") {
        console.error("文字リテラルが正しく閉じられていません");
        return this.nextToken(); // 閉じていない場合は次のトークンを取得
      } else {
        this.advance(); // 終端の ' を消費
      }
      return new Token("CHAR", charVal);
    }

    // 未定義文字の場合はログ出力しつつ読み進める
    console.log("undefined character: " + ch);
    this.advance();
    return this.nextToken();
  }

  tokenize() {
    const tokens = [];
    let tok;
    while ((tok = this.nextToken()) !== null) {
      tokens.push(tok);
    }
    return tokens;
  }
}

function tokenize(code) {
  const tokens = new Lexer(code).tokenize();
  console.log("トークン化結果（最初の10個）:", tokens.slice(0, 10).map(t => `[${t.type}:${t.value}]`).join(" "));
  console.log("トークン化結果（最後の10個）:", tokens.slice(-10).map(t => `[${t.type}:${t.value}]`).join(" "));
  console.log(`トークン総数: ${tokens.length}`);
  console.log("トークン200-205:", tokens.slice(200, 206).map((t, i) => `[${200+i}:${t.type}:${t.value}]`).join(" "));
  return tokens;
}
// window.tokenize = tokenize;

// Processingのグローバル関数リスト
const PROCESSING_GLOBALS = [
  // 描画関数
  "fill", "stroke", "noFill", "noStroke", "background", 
  "ellipse", "rect", "line", "point", "triangle", "quad", "arc",
  "circle","bezier", "curve", "vertex", "beginShape", "endShape",
  // 変換関数
  "translate", "rotate", "scale", "pushMatrix", "popMatrix",
  // モード設定
  "rectMode", "ellipseMode", "colorMode", "strokeWeight", "strokeCap", "strokeJoin",
  // ユーティリティ
  "size", "loop", "noLoop", "redraw", "frameRate",
  // その他よく使われる関数
  "random", "map", "constrain", "dist", "abs", "sin", "cos", "tan",
  "millis", "second", "minute", "hour", "day", "month", "year"
];
