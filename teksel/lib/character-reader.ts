export class CharacterReader {
  code: string;
  firstNotTakenPos: number;
  positionCol: number;
  positionRow: number;
  character: string;

  constructor(code: string) {
    this.code = code;
    this.positionCol = 0;
    this.positionRow = 1;
    this.firstNotTakenPos = 0;
    this.character = "";
  }

  getNextCharacter() {
    if (this.character === "\n") { // o jeden za daleko
      this.positionRow += 1;
      this.positionCol = 0;
    }
    if (this.character === undefined) {
      return undefined;
    }
    let nextCharacter = this.code[this.firstNotTakenPos];
    if (nextCharacter === "\r" && this.code[this.firstNotTakenPos + 1] === "\n") {
      this.firstNotTakenPos += 1;
      nextCharacter = "\n";
    }
    this.positionCol += 1;
    this.firstNotTakenPos += 1;
    this.character = nextCharacter;
    return nextCharacter;
  }

  getPosition() {
    return { row: this.positionRow, column: this.positionCol };
  }
}
