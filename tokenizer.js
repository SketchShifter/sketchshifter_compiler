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

    // 二文字演算子
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

module.exports = {
  tokenize: (code) => new Lexer(code).tokenize()
};
