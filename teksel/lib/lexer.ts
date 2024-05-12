import { CharacterReader } from "./character-reader";
import { Position, Token } from "./token";
import { keywords, multiCharTokens, singleCharTokens } from "./token-dics";
import { ErrorType, LexerError } from "./error-types";
import { TokenType } from "./token-types";

export class Lexer {
  cr: CharacterReader;
  currentChar?: string;
  tokenPosition: Position;
  MAX_ID_LEN: number;
  MAX_STR_LEN: number;
  MAX_INT: number;
  MAX_FLOAT_LEN: number;

  constructor(
    cr: CharacterReader,
    MAX_ID_LEN = 256,
    MAX_STR_LEN = 256,
    MAX_INT = 2 ** 31 - 1, // 2147483647 -2147483647
    MAX_FLOAT_LEN = 256
  ) {
    this.cr = cr;
    this.nextChar();
    this.tokenPosition = this.cr.getPosition();
    this.MAX_ID_LEN = MAX_ID_LEN;
    this.MAX_STR_LEN = MAX_STR_LEN;
    this.MAX_INT = MAX_INT;
    this.MAX_FLOAT_LEN = MAX_FLOAT_LEN;
  }

  nextChar() {
    this.currentChar = this.cr.getNextCharacter();
  }

  buildToken() {
    while (this.skipWhitespace() || this.skipComments()) {}
    this.tokenPosition = this.cr.getPosition();
    return (
      this.buildEOF() ||
      this.buildMulticharOperator() ||
      this.buildSinglecharOperator() ||
      this.buildIdentifierOrKeywordOrCell() ||
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
    while (!["\n"].includes(this.currentChar as string)) this.nextChar();
    return true;
  }

  buildEOF() {
    if (this.currentChar === undefined) {
      return new Token("EOF", TokenType.T_EOF, this.tokenPosition);
    }
    return false;
  }

  buildMulticharOperator() {
    // do przerobienia
    let string = "";
    while (Object.keys(multiCharTokens).includes(this.currentChar as string)) {
      string += this.currentChar!;
      this.nextChar();
    }
    if (
      string.length === 0 ||
      multiCharTokens[string as keyof typeof multiCharTokens] === undefined
    )
      return;
    return new Token(
      string,
      multiCharTokens[string as keyof typeof multiCharTokens],
      this.tokenPosition
    );
  }

  buildSinglecharOperator() {
    let tokenType =
      singleCharTokens[this.currentChar as keyof typeof singleCharTokens];
    if (tokenType === undefined) {
      return;
    }
    const string = this.currentChar;
    this.nextChar();
    return new Token(string, tokenType, this.tokenPosition);
  }

  getCell() {
    // cell = upperLetter, nonZeroDigit, [digit];
    if (!this.currentChar?.match(/^[A-Z]$/i)) return ["", false];
    let cell = this.currentChar;
    this.nextChar();

    if (!this.currentChar?.match(/^[1-9]+$/i)) return [cell, false];
    cell += this.currentChar;
    this.nextChar();

    if (!this.currentChar?.match(/^\d+$/i)) return [cell, true];
    cell += this.currentChar;
    this.nextChar();

    return [cell, true];
  }

  buildIdentifierOrKeywordOrCell() {
    if (!this.currentChar?.match(/^[a-zA-Z]+$/i)) return;
    let string = "";
    let [cell, isCell] = this.getCell();
    if (isCell) {
      return new Token(cell, TokenType.T_Cell, this.tokenPosition);
    } else {
      string += cell;
    }
    // this.nextChar();

    while (this.currentChar?.match(/^\w+$/i)) {
      if (string.length === this.MAX_ID_LEN) {
        throw new LexerError(
          ErrorType.E_SyntaxError,
          this.cr.getPosition(),
          "too long identifier"
        );
      }
      isCell = isCell && !!this.currentChar?.match(/^\d+$/i);
      string += this.currentChar;
      this.nextChar();
    }
    if (isCell && string.length < 1 && string.length > 3) {
      isCell = false;
    }
    let keyword = keywords[string as keyof typeof keywords];
    if (keyword !== undefined) {
      return new Token(string, keyword, this.tokenPosition);
    } else if (isCell) {
      return new Token(string, TokenType.T_Cell, this.tokenPosition);
    }
    return new Token(string, TokenType.T_Identifier, this.tokenPosition);
  }

  handleEscape() {
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
        default:
          throw new LexerError(
            ErrorType.E_SyntaxError,
            this.cr.getPosition(),
            "escaping error"
          );
      }
    }
    return charToAdd;
  }

  buildString() {
    if (!['"', "'"].includes(this.currentChar!)) {
      return;
    }
    let string = "";
    const openingChar = this.currentChar;
    this.nextChar();
    while (this.currentChar != openingChar) {
      let charToAdd = this.handleEscape();
      if (charToAdd === undefined) {
        throw new LexerError(
          ErrorType.E_SyntaxError,
          this.cr.getPosition(),
          "string not ended"
        );
      }
      if (string.length === this.MAX_STR_LEN) {
        throw new LexerError(
          ErrorType.E_SyntaxError,
          this.cr.getPosition(),
          "string too long"
        );
      }
      string += charToAdd;
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
      let digit = Number(this.currentChar);
      if ((this.MAX_INT - digit) / 10 >= number) {
        number *= 10;
        number += digit;
        this.nextChar();
        length++;
      } else {
        throw new LexerError(
          ErrorType.E_SyntaxError,
          this.cr.getPosition(),
          "integer too long"
        );
      }
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
      if (length >= this.MAX_FLOAT_LEN) {
        throw new LexerError(
          ErrorType.E_SyntaxError,
          this.cr.getPosition(),
          "float too long"
        );
      }
      fraction *= 10;
      fraction += Number(this.currentChar);
      length++;
      exp++;
      this.nextChar();
    }
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
