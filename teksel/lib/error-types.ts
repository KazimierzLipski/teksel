import { Position } from "./token";

export enum ErrorType {
  E_SyntaxError = "SyntaxError",
  E_TypeError = "TypeError",
  E_ValueError = "ValueError",
  E_NameError = "NameError",
  E_RecursionError = "RecursionError",
}

export class LexerError extends Error {
  type: ErrorType;
  position: Position;
  constructor(type: ErrorType, position: Position, message: string) {
    super(
      `${type}\nError at line:${position.row} column:${position.column}\n${message}`
    );
    this.type = type;
    this.position = position;
  }
}

export class ParserError extends Error {
  type: ErrorType;
  position: Position | undefined;
  constructor(type: ErrorType, position: Position | undefined, message: string) {
    super(
      `${type}\nError at line:${position?.row} column:${position?.column}\n${message}`
    );
    this.type = type;
    this.position = position;
  }
}
