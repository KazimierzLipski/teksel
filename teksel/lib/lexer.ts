import { CharacterReader } from "./character-reader";
import { Position, Token } from "./token";
import { EOL } from "os";
import { keywords, multiCharTokens, singleCharTokens } from "./token-dics";
import { ErrorType, LexerError } from "./error-types";
import { TokenType } from "./token-types";

export class Lexer {
  cr: CharacterReader;
  currentChar?: string;
  tokenPosition: Position;
  MAX_ID_LEN = 256;
  MAX_STR_LEN = 256;
  MAX_INT_LEN = 256;

  constructor(cr: CharacterReader) {
    this.cr = cr;
    this.nextChar();
    this.tokenPosition = this.cr.getPosition();
  }

  nextChar() {
    this.currentChar = this.cr.getNextCharacter();
  }

  buildToken() {
    this.tokenPosition = this.cr.getPosition();
    this.skipWhitespace();
    this.skipComments();
    return (
      this.buildEOF() ||
      this.buildMulticharOperator() ||
      this.buildSinglecharOperator() ||
      this.buildIdentifierOrKeyword() ||
      this.buildString() ||
      this.buildNumber()
    );
  }

  skipWhitespace() {
    let skipped = false;
    while (this.currentChar?.trim().length === 0) {
      this.nextChar();
      skipped = true;
    }
    return skipped;
  }

  skipComments() {
    if (this.currentChar !== "#") return false;
    this.nextChar();
    while (!["\n", "\r\n", "\r"].includes(this.currentChar as string))
      this.nextChar();
    return true;
  }

  buildEOF() {
    if (this.currentChar === undefined) {
      return new Token("EOF", TokenType.T_EOF, this.tokenPosition);
    }
    return false;
  }

  buildMulticharOperator() {
    let string = "";
    while (Object.keys(multiCharTokens).includes(this.currentChar as string)) {
      string += this.currentChar!;
      this.nextChar();
    }
    if (string.length === 0) return;
    return new Token(
      string,
      multiCharTokens[string as keyof typeof multiCharTokens],
      this.tokenPosition
    );
  }

  buildSinglecharOperator() {
    if (!Object.keys(singleCharTokens).includes(this.currentChar!)) {
      return;
    }
    const string = this.currentChar;
    this.nextChar();
    return new Token(
      string,
      singleCharTokens[string as keyof typeof singleCharTokens],
      this.tokenPosition
    );
  }

  buildIdentifierOrKeyword() {
    if (!this.currentChar?.match(/^[a-z]+$/i)) return;
    let length = 1;
    let string = this.currentChar;
    this.nextChar();

    while (this.currentChar?.match(/^[a-z0-9_]+$/i)) {
      length++;
      if (length >= this.MAX_ID_LEN) {
        throw new LexerError(
          ErrorType.E_SyntaxError,
          this.cr.getPosition(),
          "too long identifier"
        );
      }
      string += this.currentChar;
      this.nextChar();
    }
    if (Object.keys(keywords).includes(string)) {
      return new Token(
        string,
        keywords[string as keyof typeof keywords],
        this.tokenPosition
      );
    }
    return new Token(string, TokenType.T_Identifier, this.tokenPosition);
  }

  buildString() {
    if (!['"', "'"].includes(this.currentChar!)) {
      return;
    }

    let length = 1;
    let string = "";
    const openingChar = this.currentChar;
    this.nextChar();
    while (this.currentChar != openingChar) {
      if (length >= this.MAX_STR_LEN) {
        throw new LexerError(
          ErrorType.E_SyntaxError,
          this.cr.getPosition(),
          "string too long"
        );
      }
      let charToAdd = this.currentChar;
      if (this.currentChar == "\\") {
        this.nextChar();
        switch (this.currentChar as string) {
          case "n":
            charToAdd = "\n";
            break;
          case "t":
            charToAdd = "\t";
            break;
          case '"':
            charToAdd = '"';
            break;
          case "'":
            charToAdd = "'";
            break;
          case "\\":
            charToAdd = "\\";
            length++;
            break;
        }
      }
      if (!this.currentChar) {
        throw new LexerError(
          ErrorType.E_SyntaxError,
          this.cr.getPosition(),
          "string not ended"
        );
      }
      string += charToAdd;
      length++;
      this.nextChar();
    }
    this.nextChar();
    return new Token(string, TokenType.T_String, this.tokenPosition);
  }

  getInteger() {
    let length = 1;
    let number = Number(this.currentChar);
    this.nextChar();
    if (number === 0 && this.currentChar!.match(/^\d+$/i)) {
      throw new LexerError(
        ErrorType.E_SyntaxError,
        this.cr.getPosition(),
        "integer built incorrectly"
      );
    }
    while (this.currentChar?.match(/^\d+$/i)) {
      number *= 10;
      number += Number(this.currentChar);
      if (length >= this.MAX_INT_LEN) {
        throw new LexerError(
          ErrorType.E_SyntaxError,
          this.cr.getPosition(),
          "integer too long"
        );
      }
      this.nextChar();
      length++;
    }
    return [number, length];
  }

  getFloat(length: number, integer: number) {
    this.nextChar();
    let exp = 1;
    if (!this.currentChar?.match(/^\d+$/i)) {
      throw new LexerError(
        ErrorType.E_SyntaxError,
        this.cr.getPosition(),
        "float ends after point"
      );
    }
    let fraction = Number(this.currentChar);
    this.nextChar();
    length++;
    while (this.currentChar?.match(/^\d+$/i)) {
      fraction *= 10;
      fraction += Number(this.currentChar);
      if (length >= this.MAX_INT_LEN) {
        throw new LexerError(
          ErrorType.E_SyntaxError,
          this.cr.getPosition(),
          "float too long"
        );
      }
      length++;
      exp++;
      this.nextChar();
    }
    fraction = Number(fraction);
    let float = integer;
    float += fraction / 10 ** exp;
    return float;
  }

  buildNumber() {
    if (!this.currentChar?.match(/^\d+$/i)) {
      return;
    }
    let [integer, length] = this.getInteger();
    if (this.currentChar != ".") {
      return new Token(integer, TokenType.T_Int, this.tokenPosition);
    }
    let float = this.getFloat(length, integer);
    if (float === undefined) return;
    return new Token(float, TokenType.T_Float, this.tokenPosition);
  }
}
