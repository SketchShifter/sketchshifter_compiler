// ブラウザ環境でのみwindow.onloadを設定
if (typeof window !== 'undefined') {
  window.onload = runPDE;
}
// Processing風API定義（必要）
const processingAPI = `
let ctx;
let width = 0, height = 0;
let fillColor = 'black';
let strokeColor = 'black';
let useStroke = true;
let useFill = true;

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

function size(w, h) {
  const canvas = document.getElementById("canvas");
  canvas.width = width = w;
  canvas.height = height = h;
  ctx = canvas.getContext("2d");
  
  // マウスイベントのセットアップ
  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    pmouseX = mouseX;
    pmouseY = mouseY;
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
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
    if (typeof mousePressed === 'function') {
      mousePressed();
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
    keyCode = e.keyCode;
    
    // keyPressed関数が定義されていれば呼び出し
    if (typeof keyPressed === 'function') {
      keyPressed();
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

function fill(r, g = r, b = r) {
  fillColor = \`rgb(\${r}, \${g}, \${b})\`;
  useFill = true;
}

function stroke(r, g = r, b = r) {
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
\nsetup();\nsetInterval(() => { if (typeof draw === 'function') draw(); }, 30);
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
        const parser = new Parser(tokens);
        const ast = parser.parseProgram();
        const jsCode = generateJavaScriptFromAST(ast);
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
        console.error("実行エラー：", e);
        alert("コンパイル/実行エラーがあります");
      }
    })
    .catch(err => {
      console.error("読み込みエラー：", err);
      alert("samplePDE.pde を読み込めませんでした");
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
  constructor(imports, topLevelElements) {
    this.type = "Program";
    this.imports = imports;
    this.topLevelElements = topLevelElements;
  }
}

class ClassNode {
  constructor(name, members) {
    this.type = "Class";
    this.name = name;
    this.members = members;
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
  constructor(returnType, name, params, body) {
    this.type = "Method";
    this.returnType = returnType;
    this.name = name;
    this.params = params; // 配列 [{ type, name }, ...]
    this.body = body;     // BlockNode
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

class ReturnStatementNode {
  constructor(expression) {
    this.type = "ReturnStatement";
    this.expression = expression; // null 可
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
    this.type = "Identifier";
    this.name = name;
  }
}

class FunctionCallNode {
  constructor(callee, args) {
    this.type = "FunctionCall";
    this.callee = callee;
    this.args = args;
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

class PropertyAccessNode {
  constructor(object, property) {
    this.type = "PropertyAccess";
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
  }

  currentToken() {
    return this.tokens[this.currentIndex] || null;
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
    throw new Error("Parse Error: " + msg + " at token index " + this.currentIndex);
  }

  // トップレベルの解析: import 文、クラス定義、グローバル関数など
  parseProgram() {
    const imports = [];
    const topLevelElements = [];

    // import 文の解析
    while (this.matchToken("KEYWORD", "import")) {
      imports.push(this.parseImportStatement());
    }

    while (this.currentToken() !== null) {
      if (this.matchToken("KEYWORD", "class")) {
        topLevelElements.push(this.parseClassDeclaration());
      } else {
        topLevelElements.push(this.parseGlobalElement());
      }
    }
    return new ProgramNode(imports, topLevelElements);
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
    this.nextToken(); // consume "class"
    if (!this.matchToken("IDENTIFIER")) this.error("Class name expected");
    const className = this.currentToken().value;
    this.nextToken();

    if (!this.matchToken("LBRACE")) this.error("Expected { after class name");
    this.nextToken(); // consume "{"

    const members = [];
    while (!this.matchToken("RBRACE")) {
      if (!this.currentToken()) this.error("Unexpected EOF in class body");
      members.push(this.parseClassMember());
    }
    this.nextToken(); // consume "}"
    return new ClassNode(className, members);
  }

  parseType() {
      // 既に TYPE トークンが来ているのでその値を取得
      let typeStr = this.nextToken().value; // 例: "int"
      // 配列型対応: もし次が LBRACKET なら "[]" を追加
      while (this.matchToken("LBRACKET")) {
        this.nextToken(); // consume '['
        if (!this.matchToken("RBRACKET")) {
          this.error("Expected ']' for array type");
        }
        this.nextToken(); // consume ']'
        typeStr += "[]";
      }
      return typeStr;
    }            

    parseClassMember() {
      if (this.matchToken("TYPE") || this.matchToken("KEYWORD", "void")) {
        // 型のパースをヘルパー関数で行う
        const typeStr = this.parseType(); 
        if (!this.matchToken("IDENTIFIER")) this.error("Member name expected");
        const name = this.nextToken().value;
        if (this.matchToken("LPAREN")) {
          return this.parseMethodDeclaration(typeStr, name);
        } else {
          let initializer = null;
          if (this.matchToken("ASSIGN")) {
            this.nextToken();
            initializer = this.parseExpression();
          }  
          if (!this.matchToken("SEMICOLON")) this.error("Expected ; after field declaration");
          this.nextToken();
          return new FieldNode(typeStr, name, initializer);
        }
      }
      this.error("Invalid class member");
    }      

  parseMethodDeclaration(returnType, name) {
    // メソッド宣言: 引数リストとブロック
    this.nextToken(); // consume "("
    const params = [];
    while (!this.matchToken("RPAREN")) {
      // param: TYPE IDENTIFIER
      if (!this.matchToken("TYPE")) this.error("Parameter type expected");
      const pType = this.nextToken().value;
      if (!this.matchToken("IDENTIFIER")) this.error("Parameter name expected");
      const pName = this.nextToken().value;
      params.push({ type: pType, name: pName });
      if (this.matchToken("COMMA")) this.nextToken();
    }
    this.nextToken(); // consume ")"
    const body = this.parseBlock();
    return new MethodNode(returnType, name, params, body);
  }

  parseGlobalElement() {
    // グローバル関数または変数
    if (this.matchToken("TYPE") || this.matchToken("KEYWORD", "void")) {
      const retType = this.nextToken().value;
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
    // クラス型のグローバル変数の処理を追加
    else if (this.matchToken("IDENTIFIER")) {
      const className = this.nextToken().value;
      if (!this.matchToken("IDENTIFIER")) this.error("Variable name expected after class type");
      const varName = this.nextToken().value;
      
      let initializer = null;
      if (this.matchToken("ASSIGN")) {
        this.nextToken();
        initializer = this.parseExpression();
      }
      
      if (!this.matchToken("SEMICOLON")) this.error("Expected ; after global variable");
      this.nextToken();
      
      // クラス型の変数宣言を作成
      return new VariableDeclarationNode(className, varName, initializer);
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
    const condition = this.parseExpression();
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
    this.nextToken(); // consume "for"
    if (!this.matchToken("LPAREN")) this.error("Expected ( after for");
    this.nextToken();
    const init = this.parseExpression();
    if (!this.matchToken("SEMICOLON")) this.error("Expected ; in for loop");
    this.nextToken();
    const condition = this.parseExpression();
    if (!this.matchToken("SEMICOLON")) this.error("Expected ; after for condition");
    this.nextToken();
    const update = this.parseExpression();
    if (!this.matchToken("RPAREN")) this.error("Expected ) after for update");
    this.nextToken();
    const body = this.parseStatement();
    return new ForStatementNode(init, condition, update, body);
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
    const type = this.nextToken().value; // TYPE
    if (!this.matchToken("IDENTIFIER")) this.error("Variable name expected");
    const name = this.nextToken().value;
    let initializer = null;
    if (this.matchToken("ASSIGN")) {
      this.nextToken();
      initializer = this.parseExpression();
    }
    if (!this.matchToken("SEMICOLON")) this.error("Expected ; after variable declaration");
    this.nextToken();
    return new VariableDeclarationNode(type, name, initializer);
  }

  parseExpression() {
    return this.parseAssignment();
  }

  parseAssignment() {
    let left = this.parseComparison();

    if(this.matchToken("INCREMENT") ) {
      this.nextToken();
      // a++ は a = a + 1 に変換
      left = new BinaryOpNode("=", left, new BinaryOpNode("+", left, new LiteralNode(1)));
    } else if(this.matchToken("DECREMENT") ) {
      this.nextToken();
      // a-- は a = a - 1 に変換
      left = new BinaryOpNode("=", left, new BinaryOpNode("-", left, new LiteralNode(1)));
    } else if(this.matchToken("PLUSEQ")) {
      this.nextToken();
      const right = this.parseAssignment();
      // a += b は a = a + b に変換
      left = new BinaryOpNode("=", left, new BinaryOpNode("+", left, right));
    } else if(this.matchToken("MINUSEQ")) {
      this.nextToken();
      const right = this.parseAssignment();
      // a -= b は a = a - b に変換
      left = new BinaryOpNode("=", left, new BinaryOpNode("-", left, right));
    } else if(this.matchToken("MULTEQ")) {
      this.nextToken();
      const right = this.parseAssignment();
      // a *= b は a = a * b に変換
      left = new BinaryOpNode("=", left, new BinaryOpNode("*", left, right));
    } else if(this.matchToken("DIVEQ")) {
      this.nextToken();
      const right = this.parseAssignment();
      // a /= b は a = a / b に変換
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
      const right = this.parseMulDiv();
      node = new BinaryOpNode(op, node, right);
    }
    return node;
  }

  parseMulDiv() {
    let node = this.parseUnary();
    while (this.matchToken("MULTIPLY") || this.matchToken("DIVIDE")) {
      const op = this.currentToken().value;
      this.nextToken();
      const right = this.parseUnary();
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
    } else if (this.matchToken("INCREMENT")) {
      // ++a はUnaryOpとして処理
      this.nextToken();
      const expr = this.parseUnary();
      // ++a は a = a + 1 に変換し、a + 1を返す
      return new BinaryOpNode("=", expr, new BinaryOpNode("+", expr, new LiteralNode(1)));
    } else if (this.matchToken("DECREMENT")) {
      // --a はUnaryOpとして処理
      this.nextToken();
      const expr = this.parseUnary();
      // --a は a = a - 1 に変換し、a - 1を返す
      return new BinaryOpNode("=", expr, new BinaryOpNode("-", expr, new LiteralNode(1)));
    }
    return this.parsePrimary();
  }

  parsePrimary() {
      const tok = this.currentToken();
      if (!tok) this.error("Unexpected EOF in expression");
    
      // まず、括弧付き式やキャストを処理
      if (this.matchToken("LPAREN")) {
        this.nextToken(); // '(' 消費
        // キャストか括弧付き式か判定
        if (this.matchToken("TYPE")) {
          const castType = this.parseType();
          if (!this.matchToken("RPAREN")) {
            this.error("Expected ')' after cast type");
          }
          this.nextToken(); // ')' 消費
          const expr = this.parseUnary();
          return new CastNode(castType, expr);
        } else {
          const expr = this.parseExpression();
          if (!this.matchToken("RPAREN")) {
            this.error("Expected ')' after expression");
          }
          this.nextToken(); // ')' 消費
          return expr;
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
      if (tok.type === "KEYWORD" && (tok.value === "true" || tok.value === "false")) {
        this.nextToken();
        return new LiteralNode(tok.value, "boolean");
      }
    
      // ここで KEYWORD "new" を優先して処理する
      if (this.matchToken("KEYWORD", "new")) {
        this.nextToken(); // "new" 消費
        if (!this.matchToken("TYPE") && !this.matchToken("IDENTIFIER")) {
          this.error("Expected type or class after 'new'");
        }
        const newType = this.nextToken().value;
        if (this.matchToken("LBRACKET")) {
          this.nextToken(); // '[' 消費
          const sizeExpr = this.parseExpression();
          if (!this.matchToken("RBRACKET")) {
            this.error("Expected ']' in new array expression");
          }
          this.nextToken(); // ']' 消費
          return new NewArrayNode(newType, sizeExpr);
        } else if (this.matchToken("LPAREN")) {
          this.nextToken(); // '(' 消費
          const args = [];
          while (!this.matchToken("RPAREN")) {
            args.push(this.parseExpression());
            if (this.matchToken("COMMA")) this.nextToken();
          }
          this.nextToken(); // ')' 消費
          return new NewObjectNode(newType, args);
        } else {
          this.error("Invalid syntax after 'new'");
        }
      }
    
      // 識別子、関数呼び出し、配列アクセス
      if (tok.type === "IDENTIFIER") {
        this.nextToken();
        let expr = new IdentifierNode(tok.value);
        while (true) {
          if (this.matchToken("LPAREN")) {
            this.nextToken(); // '(' 消費
            const args = [];
            while (!this.matchToken("RPAREN")) {
              args.push(this.parseExpression());
              if (this.matchToken("COMMA")) this.nextToken();
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
          } else if (this.matchToken("DOT")) {
            this.nextToken(); // '.' 消費
            if (!this.matchToken("IDENTIFIER")) {
              this.error("Expected identifier after '.'");
            }
            const propName = this.nextToken().value;
            // プロパティアクセスを表現するドット表記
            expr = new PropertyAccessNode(expr, propName);
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
function generateJavaScriptFromAST(ast, indent = 0) {
  const INDENT = '  '.repeat(indent);
  if (!ast) return '';

  switch (ast.type) {
    case "Program":
      const imports = (ast.imports || []).map(im => `// import ${im.path}`).join('\n');
      const topLevel = (ast.topLevelElements || []).map(e => generateJavaScriptFromAST(e, indent)).join('\n\n');
      
      // クラスのインスタンス化コードを追加（変数がすでに宣言されていない場合のみ）
      const classNodes = ast.topLevelElements.filter(e => e.type === "Class");
      const varDecls = ast.topLevelElements.filter(e => e.type === "VariableDeclaration").map(v => v.varName);
      
      const instanceCreation = classNodes
        .filter(classNode => !varDecls.includes(classNode.name.toLowerCase()))
        .map(classNode => 
          `\n// ${classNode.name}のインスタンスを作成\nconst ${classNode.name.toLowerCase()} = new ${classNode.name}();`
        ).join('\n');
      
      return `${imports}\n\n${topLevel}${instanceCreation}`;

    case "Class":
      const classMembers = ast.members.map(member => {
        // メソッドの場合はprototypeに追加する形式に変換
        if (member.type === "Method") {
          const params = (member.params || []).map(p => p.name).join(', ');
          const body = generateJavaScriptMethodBody(member.body, indent + 1, member.params.map(p => p.name));
          return `${INDENT}${ast.name}.prototype.${member.name} = function(${params}) {\n${body}\n${INDENT}};`;
        } 
        // フィールドの場合はコンストラクタ内で初期化する
        else if (member.type === "Field") {
          return null; // コンストラクタ内で処理するため、ここではnullを返す
        }
        return generateJavaScriptFromAST(member, indent);
      }).filter(Boolean).join('\n');
      
      // フィールドを抽出してコンストラクタで初期化
      const fields = ast.members.filter(member => member.type === "Field");
      const fieldsInit = fields.map(field => {
        const fieldInit = generateJavaScriptFromAST(field.initializer, 0);
        return `${INDENT}  this.${field.fieldName} = ${fieldInit};`;
      }).join('\n');
      
      return `${INDENT}function ${ast.name}() {\n${fieldsInit}\n${INDENT}}\n\n${classMembers}`;

    case "Field":
      const fieldInit = generateJavaScriptFromAST(ast.initializer, 0);
      return `${INDENT}let ${ast.fieldName} = ${fieldInit};`;

    case "Method":
      const params = (ast.params || []).map(p => p.name).join(', ');
      const body = generateJavaScriptMethodBody(ast.body, indent + 1, ast.params.map(p => p.name));
      return `${INDENT}function ${ast.name}(${params}) {\n${body}\n${INDENT}}`;

    case "GlobalFunction":
      const gParams = (ast.params || []).map(p => p.name).join(', ');
      const gBody = generateJavaScriptFromAST(ast.body, indent + 1);
      return `${INDENT}function ${ast.name}(${gParams}) {\n${gBody}\n${INDENT}}`;

    case "VariableDeclaration":
      const varValue = ast.initializer ? generateJavaScriptFromAST(ast.initializer) : "null";
      return `${INDENT}let ${ast.varName} = ${varValue};`;

    case "Block":
      return (ast.statements || []).map(stmt => generateJavaScriptFromAST(stmt, indent)).join('\n');

    case "ExpressionStatement":
      return `${INDENT}${generateJavaScriptFromAST(ast.expression)};`;

    case "IfStatement":
      const cond = generateJavaScriptFromAST(ast.condition);
      const thenBlock = generateJavaScriptFromAST(ast.thenBlock, indent + 1);
      const elseBlock = ast.elseBlock
        ? ` else {\n${generateJavaScriptFromAST(ast.elseBlock, indent + 1)}\n${INDENT}}`
        : '';
      return `${INDENT}if (${cond}) {\n${thenBlock}\n${INDENT}}${elseBlock}`;

    case "WhileStatement":
      const whileCond = generateJavaScriptFromAST(ast.condition);
      const whileBody = generateJavaScriptFromAST(ast.body, indent + 1);
      return `${INDENT}while (${whileCond}) {\n${whileBody}\n${INDENT}}`;

    case "ForStatement":
      const init = generateJavaScriptFromAST(ast.init);
      const condition = generateJavaScriptFromAST(ast.condition);
      const update = generateJavaScriptFromAST(ast.update);
      const forBody = generateJavaScriptFromAST(ast.body, indent + 1);
      return `${INDENT}for (${init} ${condition}; ${update}) {\n${forBody}\n${INDENT}}`;

    case "ReturnStatement":
      const ret = ast.expression ? generateJavaScriptFromAST(ast.expression) : '';
      return `${INDENT}return ${ret};`;

    case "BinaryOp":
      return `${generateJavaScriptFromAST(ast.left)} ${ast.operator} ${generateJavaScriptFromAST(ast.right)}`;

    case "UnaryOp":
      return `${ast.operator}${generateJavaScriptFromAST(ast.expr)}`;

    case "Literal":
      return ast.literalType === 'string' ? `"${ast.value}"` : ast.value;

    case "Identifier":
      return ast.name;

    case "FunctionCall":
      return `${generateJavaScriptFromAST(ast.callee)}(${(ast.args || []).map(arg => generateJavaScriptFromAST(arg)).join(', ')})`;

    case "ArrayAccess":
      return `${generateJavaScriptFromAST(ast.arrayExpr)}[${generateJavaScriptFromAST(ast.indexExpr)}]`;

    case "NewArray":
      const arrSize = generateJavaScriptFromAST(ast.sizeExpr);
      return `new Array(${arrSize}).fill(0)`;

    case "NewObject":
      return `new ${ast.className}(${(ast.args || []).map(arg => generateJavaScriptFromAST(arg)).join(', ')})`;

    case "Cast":
      const castExpr = generateJavaScriptFromAST(ast.expr);
      if (ast.castType === "int") return `Math.floor(${castExpr})`;
      else return `${castExpr} /* cast to ${ast.castType} */`;

    case "PropertyAccess":
      const obj = generateJavaScriptFromAST(ast.object);
      const prop = ast.property;
      return `${obj}.${prop}`;

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
      const keywords = ["if", "else", "for", "while", "do", "switch", "case", "break", "continue", "return", "void", "class", "new", "extends", "import"];
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
      "(": "LPAREN", ")": "RPAREN",
      "{": "LBRACE", "}": "RBRACE",
      "[": "LBRACKET", "]": "RBRACKET",
      ";": "SEMICOLON", ",": "COMMA", ".": "DOT"
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
      while (!this.isEOF() && this.currentChar() !== "'") {
        charVal += this.currentChar();
        this.advance();
      }
      this.advance();
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
  return new Lexer(code).tokenize();
}
// window.tokenize = tokenize;

// モジュールエクスポート（Node.js環境用）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    tokenize,
    Parser,
    generateJavaScriptFromAST,
    // AST ノードクラス
    ImportNode,
    ProgramNode,
    ClassNode,
    FieldNode,
    MethodNode,
    GlobalFunctionNode,
    VariableDeclarationNode,
    BlockNode,
    ExpressionStatementNode,
    IfStatementNode,
    WhileStatementNode,
    ForStatementNode,
    ReturnStatementNode,
    BinaryOpNode,
    UnaryOpNode,
    LiteralNode,
    IdentifierNode,
    FunctionCallNode,
    ArrayAccessNode,
    NewArrayNode,
    NewObjectNode,
    CastNode,
    PropertyAccessNode,
    // 実行関数
    runPDE
  };
}

// メソッド内部の変数アクセスを変換するヘルパー関数
function generateJavaScriptMethodBody(ast, indent = 0, paramNames = []) {
  const INDENT = '  '.repeat(indent);
  if (!ast) return '';

  // ProcessingのAPI関数リスト
  const processingFunctions = [
    'rect', 'ellipse', 'line', 'background', 'fill', 'stroke', 
    'noFill', 'noStroke', 'size', 'translate', 'rotate', 'scale', 
    'pushMatrix', 'popMatrix', 'bezier', 'curve',
    // マウス関連の関数
    'mousePressed', 'mouseReleased', 'mouseMoved', 'mouseDragged',
    // キーボード関連の関数
    'keyPressed', 'keyReleased',
    // テキスト関連の関数
    'text', 'textSize',
    // 数学関連の関数
    'random', 'dist', 'min', 'max', 'map', 'constrain'
  ];

  // BlockNodeの場合は各ステートメントを再帰的に処理
  if (ast.type === "Block") {
    return (ast.statements || []).map(stmt => generateJavaScriptMethodBody(stmt, indent, paramNames)).join('\n');
  }
  
  // 他のノードはgenerateJavaScriptFromASTを呼び出すが、Identifierの扱いを修正
  const originalGenerateIdentifier = generateJavaScriptFromAST;
  
  // 新しい関数を一時的に定義
  generateJavaScriptFromAST = function(node, indentLevel = 0) {
    if (node && node.type === "Identifier") {
      // ProcessingのAPI関数はthis.プレフィックスを付けない
      if (processingFunctions.includes(node.name)) {
        return node.name;
      }
      // マウスとキーボード関連のグローバル変数
      else if (['mouseX', 'mouseY', 'pmouseX', 'pmouseY', 'mouseIsPressed', 'mouseButton',
               'keyIsPressed', 'key', 'keyCode', 'LEFT', 'RIGHT', 'CENTER',
               'UP', 'DOWN', 'LEFT_ARROW', 'RIGHT_ARROW', 'ENTER', 'RETURN',
               'SHIFT', 'CTRL', 'ALT', 'BACKSPACE', 'TAB', 'ESCAPE', 
               'width', 'height', 'textFont', 'textSize_val'].includes(node.name)) {
        return node.name;
      }
      // パラメータでない識別子はthis.プレフィックスを追加
      else if (!paramNames.includes(node.name)) {
        const localVars = findLocalVariables(ast);
        if (!localVars.includes(node.name)) {
          return `this.${node.name}`;
        }
      }
    }
    return originalGenerateIdentifier(node, indentLevel);
  };
  
  // 通常の変換処理を呼び出す
  const result = originalGenerateIdentifier(ast, indent);
  
  // 元の関数を復元
  generateJavaScriptFromAST = originalGenerateIdentifier;
  
  return result;
}

// ブロック内のローカル変数を検索する補助関数
function findLocalVariables(node) {
  const localVars = [];
  
  if (!node) return localVars;
  
  // 変数宣言を見つける
  if (node.type === "VariableDeclaration") {
    localVars.push(node.varName);
  }
  // ステートメントリストを再帰的に処理
  else if (node.type === "Block" && node.statements) {
    for (const stmt of node.statements) {
      localVars.push(...findLocalVariables(stmt));
    }
  }
  // その他のノードタイプに対しても必要に応じて処理
  
  return localVars;
}
