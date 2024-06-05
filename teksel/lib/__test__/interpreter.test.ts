import { CharacterReader } from "../character-reader";
import { Interpreter } from "../interpreter";
import { Lexer } from "../lexer";
import { Parser } from "../parser";
import { Cell, FloatLiteral, IntegerLiteral, TextLiteral } from "../statements";

const logThis = (toLog: any) => {
  const util = require("util");
  console.log(util.inspect(toLog, false, null, true));
};

test("parse_myTest", () => {
  const SR = new CharacterReader(
    `def main()
    {
        count = "0"
        cell = "123   "
        spaces = 0
        foreach letter in cell
        {
          count += letter
          spaces += use 1 if letter == " " else 20
        }
        # a = use 10 if 2 == 2 else 20
        return spaces
    }`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  let res = expression.accept(visitor);
  console.log(res);
});
