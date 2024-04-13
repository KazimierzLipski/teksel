import { TokenType } from "./token-types";

export type Position = {
  row: number, column: number
}

export class Token{
  value: any;
  type: TokenType;
  position: Position;
  constructor(value: any, type: TokenType, position: Position) {
    this.value = value;
    this.type = type;
    this.position = position
  }
}