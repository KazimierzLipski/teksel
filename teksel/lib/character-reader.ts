export class CharacterReader {
  code: string;
  absolutePosition: number;
  positionCol: number;
  positionRow: number;

  constructor(code: string) {
    this.code = code;
    this.positionCol = 1;
    this.positionRow = 1;
    this.absolutePosition = 0;
  }

  getNextCharacter() {
    const nextCharacter = this.code[this.absolutePosition];
    if (nextCharacter === "\n") {
      this.positionRow += 1;
      this.positionCol = 1;
    } else {
      this.positionCol += 1;
    }
    this.absolutePosition += 1;
    if (nextCharacter === undefined) {
      return undefined;
    }
    return nextCharacter;
  }

  getPosition() {
    return { row: this.positionRow, column: this.positionCol };
  }
}
