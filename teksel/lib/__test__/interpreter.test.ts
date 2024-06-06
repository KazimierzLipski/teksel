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
        a = 1 + 1
        return a
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
