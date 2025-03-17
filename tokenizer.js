// ==== Token クラス (トークンを保持するための簡易クラス) ====
class Token {
  constructor(type, value) {
    this.type = type;   // 例: "NUMBER", "IDENTIFIER", "TYPE", "KEYWORD", "STRING", etc.
    this.value = value; // 実際の文字列 "100", "x", "int", "class", "import" など
  }
}

// ==== ユーティリティ関数 ====
function isDigit(ch) {
  return /[0-9]/.test(ch);
}
function isWhitespace(ch) {
  return /\s/.test(ch);
}
function isLetterOrUnderscore(ch) {
  return /[a-zA-Z_]/.test(ch);
}
function isLetterDigitOrUnderscore(ch) {
  return /[a-zA-Z0-9_]/.test(ch);
}

// ==== Processing向け字句解析関数 ====
// Processingのソースコード文字列をトークン配列に分解する
function tokenize(code) {
  const tokens = [];
  let pos = 0;
  const length = code.length;

  // (A) Processingでよく使う型・キーワードをまとめる
  //     PDE(Processing) は実質 Java なので、最低限のものをピックアップ
  const processingTypes = [
    "boolean", "byte", "char", "color", "double", "float", "int", "long", "String"
  ];
  const processingKeywords = [
    // 制御構文
    "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "return",
    // Processing特有(関数)
    "void", "setup", "draw",   // この辺りはキーワードというより組み込み関数名扱い
    // クラス関連
    "class", "new", "extends", 
    // ライブラリインポート
    "import"
  ];

  // -- メインループ --
  while (pos < length) {
    let currentChar = code[pos];

    // 1) 空白・改行のスキップ
    if (isWhitespace(currentChar)) {
      pos++;
      continue;
    }

    // 2) コメント処理
    // 2-1) "//" ... 行末まで無視
    if (currentChar === "/" && pos + 1 < length && code[pos + 1] === "/") {
      pos += 2; // "//" をスキップ
      while (pos < length && code[pos] !== "\n") {
        pos++;
      }
      continue;
    }
    // 2-2) "/*" ... "*/" まで無視
    if (currentChar === "/" && pos + 1 < length && code[pos + 1] === "*") {
      pos += 2; // "/*"
      while (pos + 1 < length) {
        if (code[pos] === "*" && code[pos + 1] === "/") {
          pos += 2; // "*/" をスキップ
          break;
        }
        pos++;
      }
      continue;
    }

    // 3) 数字 (NUMBER)
    //    float や double もあるので、整数→小数点→小数 も簡易対応するならここを拡張
    if (isDigit(currentChar)) {
      let numStr = "";
      while (pos < length && (isDigit(code[pos]) || code[pos] === ".")) {
        numStr += code[pos];
        pos++;
      }
      // 例: "123.45"
      tokens.push(new Token("NUMBER", numStr));
      continue;
    }

    // 4) 識別子 or キーワード (英字または_ で始まる)
    if (isLetterOrUnderscore(currentChar)) {
      let idStr = "";
      // 1文字目
      idStr += code[pos];
      pos++;
      // 2文字目以降
      while (pos < length && isLetterDigitOrUnderscore(code[pos])) {
        idStr += code[pos];
        pos++;
      }

      // キーワード or 型かどうか判定
      if (processingTypes.includes(idStr)) {
        tokens.push(new Token("TYPE", idStr));
      } else if (processingKeywords.includes(idStr)) {
        tokens.push(new Token("KEYWORD", idStr));
      } else {
        // 上記に該当しなければ普通の識別子
        tokens.push(new Token("IDENTIFIER", idStr));
      }
      continue;
    }

    // 5) 二文字演算子(==, !=, <=, >=, &&, ||)など
    if (currentChar === "=") {
      if (pos + 1 < length && code[pos + 1] === "=") {
        tokens.push(new Token("EQ", "=="));
        pos += 2;
      } else {
        tokens.push(new Token("ASSIGN", "="));
        pos++;
      }
      continue;
    }
    if (currentChar === "!") {
      if (pos + 1 < length && code[pos + 1] === "=") {
        tokens.push(new Token("NEQ", "!="));
        pos += 2;
      } else {
        tokens.push(new Token("NOT", "!"));
        pos++;
      }
      continue;
    }
    if (currentChar === "<") {
      if (pos + 1 < length && code[pos + 1] === "=") {
        tokens.push(new Token("LE", "<="));
        pos += 2;
      } else {
        tokens.push(new Token("LT", "<"));
        pos++;
      }
      continue;
    }
    if (currentChar === ">") {
      if (pos + 1 < length && code[pos + 1] === "=") {
        tokens.push(new Token("GE", ">="));
        pos += 2;
      } else {
        tokens.push(new Token("GT", ">"));
        pos++;
      }
      continue;
    }
    if (currentChar === "&") {
      if (pos + 1 < length && code[pos + 1] === "&") {
        tokens.push(new Token("AND", "&&"));
        pos += 2;
      } else {
        tokens.push(new Token("UNDEFINED", "&"));
        pos++;
      }
      continue;
    }
    if (currentChar === "|") {
      if (pos + 1 < length && code[pos + 1] === "|") {
        tokens.push(new Token("OR", "||"));
        pos += 2;
      } else {
        tokens.push(new Token("UNDEFINED", "|"));
        pos++;
      }
      continue;
    }

    // 6) 1文字記号
    switch (currentChar) {
      case "+":
        tokens.push(new Token("PLUS", "+"));
        pos++;
        continue;
      case "-":
        tokens.push(new Token("MINUS", "-"));
        pos++;
        continue;
      case "*":
        tokens.push(new Token("MULTIPLY", "*"));
        pos++;
        continue;
      case "/":
        // ここは既にコメント判定と区別済みなので実質 "/" だけ
        tokens.push(new Token("DIVIDE", "/"));
        pos++;
        continue;
      case "(":
        tokens.push(new Token("LPAREN", "("));
        pos++;
        continue;
      case ")":
        tokens.push(new Token("RPAREN", ")"));
        pos++;
        continue;
      case "{":
        tokens.push(new Token("LBRACE", "{"));
        pos++;
        continue;
      case "}":
        tokens.push(new Token("RBRACE", "}"));
        pos++;
        continue;
      case "[":
        tokens.push(new Token("LBRACKET", "["));
        pos++;
        continue;
      case "]":
        tokens.push(new Token("RBRACKET", "]"));
        pos++;
        continue;
      case ";":
        tokens.push(new Token("SEMICOLON", ";"));
        pos++;
        continue;
      case ",":
        tokens.push(new Token("COMMA", ","));
        pos++;
        continue;
      case ".":
        tokens.push(new Token("DOT", "."));
        pos++;
        continue;
      default:
        break;
    }

    // 7) 文字列リテラル "..."
    if (currentChar === "\"") {
      pos++;
      let strValue = "";
      while (pos < length && code[pos] !== "\"") {
        strValue += code[pos];
        pos++;
      }
      // 終端の " を消費
      pos++;
      tokens.push(new Token("STRING", strValue));
      continue;
    }

    // 8) 文字リテラル: '...'
    if (currentChar === "'") {
      pos++;
      let charValue = "";
      while (pos < length && code[pos] !== "'") {
        charValue += code[pos];
        pos++;
      }
      pos++;
      tokens.push(new Token("CHAR", charValue));
      continue;
    }

    // 9) 未定義文字
    console.log("undefined string: " + currentChar);
    pos++;
  }

  return tokens;
}

// ----------------------------------------------------
// 動作テスト例
// ----------------------------------------------------
/*
const sampleCode = `
// 配列の例
int[] arr = new int[10];
float x = 3.14;

// クラス定義
class MyClass {
  int val = 0;
  void doSomething() {
    println("Hello");
  }
}

// コメント
// これは行コメント
/*
  これはブロックコメント
* /
import some.library.*;

void setup() {
  // setup
  size(400, 400);
}

void draw() {
  background(255);
  ellipse(width/2, height/2, 50, 50);
  if (mousePressed) {
    println("Clicked!");
  }
}
`;

const tokens = tokenize(sampleCode);
console.log(tokens);
*/
