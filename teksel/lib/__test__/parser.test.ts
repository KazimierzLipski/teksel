import { CharacterReader } from "../character-reader";
import { Lexer } from "../lexer";
import { Parser } from "../parser";
import { Expression, Factor } from "../statements";
import { Token } from "../token";
import { TokenType } from "../token-types";

// program = { functionDefinition };
// parameterList = [identifier, {",", identifier}];
// functionDefinition = "def", identifier, "(", parameterList, ")", block;
// argumentList = [expression, {",", expression}];
// functionCallOrID = identifier, ["(", argumentList, ")"];
// block = "{", {anyStatement}, "}";
// anyStatement = assignment | conditionalStatement | identifier | returnStatement;
// returnStatement = "return", [expression];
// conditionalStatement = ifStatement | forEachStatement;
// ifStatement = "if", expression, block, ["else", block];
// forEachStatement = "foreach", identifier, "in", expression, block;
// assignment = (identifier | cellOrRangeOrAttribute), ("=" | "+=" | "-="), expression;
// expression = orExpression;
// orExpression = andExpression, {"or", andExpression};
// andExpression = relativeExpression, {"and", relativeExpression};
// relativeExpression = additiveExpression, [(">" | "<" | ">=" | "<=" | "==" | "!="), additiveExpression];
// additiveExpression = multiplicativeExpression, {("+" | "-"), multiplicativeExpression};
// multiplicativeExpression = factor, {("*" | "/"), factor};
// cellOrRangeOrAttribute = cell, ([":", cell] | [".", identifier]);
// factor = [negation], (integer | float | text | functionCallOrID | "(", expression, ")" | cellOrRangeOrAttribute);
// negation = "!";
// text = "\"", {char}, "\"";
// identifier = letter, {char | "_"};
// cell = upperLetter, nonZeroDigit, [digit];
// float = integer, ".", digit, {digit};
// integer = "0" | (nonZeroDigit, {digit});
// char = letter | digit;
// letter = lowerLetter | upperLetter;
// lowerLetter = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z";
// upperLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
// digit = "0" | nonZeroDigit;
// nonZeroDigit = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

const logThis = (toLog: any) => {
  const util = require("util");
  console.log(util.inspect(toLog, false, null, true));
};

test("parse_parameterList", () => {
  const SR = new CharacterReader("x, y, z");
  const parser = new Parser(new Lexer(SR));
  const parameterList = parser.parseParametersList();
  console.log(parameterList);
  expect(parameterList).toBeDefined();
});

test("parse_functionDefinition", () => {
  const SR = new CharacterReader("def foo(x, y, z) { return true }");
  const parser = new Parser(new Lexer(SR));
  const functionDefinition = parser.parseFunctionDefinition();
  console.log(functionDefinition);
  expect(functionDefinition).toBeDefined();
});

test("parse_argumentList", () => {
  const SR = new CharacterReader("1, 2, 3");
  const parser = new Parser(new Lexer(SR));
  const argumentList = parser.parseArgumentList();
  console.log(argumentList);
  expect(argumentList).toBeDefined();
});

test("parse_functionCallOrID", () => {
  const SR = new CharacterReader("foo(1, 2, 3)");
  const parser = new Parser(new Lexer(SR));
  const functionCallOrID = parser.parseFunctionCallOrID();
  console.log(functionCallOrID);
  expect(functionCallOrID).toBeDefined();
});

test("parse_block", () => {
  const SR = new CharacterReader(`{ x = 1
    y = 2 }`);
  const parser = new Parser(new Lexer(SR));
  const block = parser.parseBlock();
  console.log(block);
  expect(block).toBeDefined();
});

test("parse_anyStatement", () => {
  const SR = new CharacterReader("x = 1");
  const parser = new Parser(new Lexer(SR));
  const anyStatement = parser.parseAnyStatement();
  console.log(anyStatement);
  expect(anyStatement).toBeDefined();
});

test("parse_returnStatement", () => {
  const SR = new CharacterReader("return true;");
  const parser = new Parser(new Lexer(SR));
  const returnStatement = parser.parseReturnStatement();
  console.log(returnStatement);
  expect(returnStatement).toBeDefined();
});

test("parse_conditionalStatement", () => {
  const SR = new CharacterReader(
    "if (x > 0) { return true } else { return false }"
  );
  const parser = new Parser(new Lexer(SR));
  const conditionalStatement = parser.parseConditionalStatement();
  console.log(conditionalStatement);
  expect(conditionalStatement).toBeDefined();
});

test("parse_ifStatement", () => {
  const SR = new CharacterReader("if (x > 0) { return true }");
  const parser = new Parser(new Lexer(SR));
  const ifStatement = parser.parseIfStatement();
  logThis(ifStatement);
  expect(ifStatement).toBeDefined();
});

test("parse_forEachStatement", () => {
  const SR = new CharacterReader("foreach x in A10:A20 { return true }");
  const parser = new Parser(new Lexer(SR));
  const forEachStatement = parser.parseForEachStatement();
  console.log(forEachStatement);
  expect(forEachStatement).toBeDefined();
});

test("parse_assignment", () => {
  const SR = new CharacterReader("x = 1");
  const parser = new Parser(new Lexer(SR));
  const assignment = parser.parseAssignmentOrID();
  console.log(assignment);
  expect(assignment).toBeDefined();
});

test("parse_expression", () => {
  const SR = new CharacterReader("x < y and x < y");
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseExpression();
  console.log(expression);
  expect(expression).toBeDefined();
});

test("parse_expressionCell", () => {
  const SR = new CharacterReader("A10");
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseExpression();
  console.log(expression);
  expect(expression).toBeDefined();
});

test("parse_orExpression", () => {
  const SR = new CharacterReader("x or y");
  const parser = new Parser(new Lexer(SR));
  const orExpression = parser.parseOrExpression();
  console.log(orExpression);
  expect(orExpression).toBeDefined();
});

test("parse_andExpression", () => {
  const SR = new CharacterReader("x and y");
  const parser = new Parser(new Lexer(SR));
  const andExpression = parser.parseAndExpression();
  console.log(andExpression);
  expect(andExpression).toBeDefined();
});

test("parse_relativeExpression", () => {
  const SR = new CharacterReader("x < y");
  const parser = new Parser(new Lexer(SR));
  const relativeExpression = parser.parseRelativeExpression();
  console.log(relativeExpression);
  expect(relativeExpression).toBeDefined();
});

test("parse_additiveExpression", () => {
  const SR = new CharacterReader("x + y");
  const parser = new Parser(new Lexer(SR));
  const additiveExpression = parser.parseAdditiveExpression();
  console.log(additiveExpression);
  expect(additiveExpression).toBeDefined();
});

test("parse_multiplicativeExpression", () => {
  const SR = new CharacterReader("4 * 3");
  const parser = new Parser(new Lexer(SR));
  const multiplicativeExpression = parser.parseMultiplicativeExpression();
  console.log(multiplicativeExpression);
  expect(multiplicativeExpression).toBeDefined();
});

test("parse_cellOrRangeOrAttribute", () => {
  const SR = new CharacterReader("A1:B2");
  const parser = new Parser(new Lexer(SR));
  const cellOrRangeOrAttribute = parser.parseCellOrRangeOrAttribute();
  console.log(cellOrRangeOrAttribute);
  expect(cellOrRangeOrAttribute).toBeDefined();
});

test("parse_factor", () => {
  const SR = new CharacterReader("-5");
  const parser = new Parser(new Lexer(SR));
  const factor = parser.parseFactor();
  console.log(factor);
  expect(factor).toBeDefined();
});

test("parse_text", () => {
  const SR = new CharacterReader('"Hello, World!"');
  const parser = new Parser(new Lexer(SR));
  const text = parser.parseText();
  console.log(text);
  expect(text).toBeDefined();
});

test("parse_integer", () => {
  const SR = new CharacterReader("123");
  const parser = new Parser(new Lexer(SR));
  const integer = parser.parseInteger();
  console.log(integer);
  expect(integer).toBeDefined();
});

test("parse_float", () => {
  const SR = new CharacterReader("3.14");
  const parser = new Parser(new Lexer(SR));
  const float = parser.parseFloat();
  console.log(float);
  expect(float).toBeDefined();
});

test("parse_identifier", () => {
  const SR = new CharacterReader("x");
  const parser = new Parser(new Lexer(SR));
  const identifier = parser.parseIdentifier();
  console.log(identifier);
  expect(identifier).toBeDefined();
});

test("parse_cell", () => {
  const SR = new CharacterReader("A1");
  const parser = new Parser(new Lexer(SR));
  const cell = parser.parseCell();
  console.log(cell);
  expect(cell).toBeDefined();
});

test("parse_program", () => {
  const SR = new CharacterReader("def foo(){ return true }");
  const parser = new Parser(new Lexer(SR));
  const program = parser.parseProgram();
  console.log(program);
  expect(program).toBeDefined();
});

test("parse_assignmentCell", () => {
  const SR = new CharacterReader("A1 = 10");
  const parser = new Parser(new Lexer(SR));
  const assignment = parser.parseAssignmentOrID();
  console.log(assignment);
  expect(assignment).toBeDefined();
});

test("parse_assignmentMinusEqualsCell", () => {
  const SR = new CharacterReader("A11 -= 5");
  const parser = new Parser(new Lexer(SR));
  const assignment = parser.parseAssignmentOrID();
  console.log(assignment);
  expect(assignment).toBeDefined();
});

test("parse_assignmentPlusEqualsCell", () => {
  const SR = new CharacterReader("A1 += 3");
  const parser = new Parser(new Lexer(SR));
  const assignment = parser.parseAssignmentOrID();
  console.log(assignment);
  expect(assignment).toBeDefined();
});

test("parse_expressionWithParentheses", () => {
  const SR = new CharacterReader("(x + y) * (z - 5)");
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseExpression();
  console.log(expression);
  expect(expression).toBeDefined();
});

test("parse_nestedIfStatement", () => {
  const SR = new CharacterReader("if (x > 0) { if (y > 0) { return true } }");
  const parser = new Parser(new Lexer(SR));
  const ifStatement = parser.parseIfStatement();
  console.log(ifStatement);
  expect(ifStatement).toBeDefined();
});

test("parse_nestedForEachStatement", () => {
  const SR = new CharacterReader(
    "foreach x in A1:A10 { foreach y in B1:B5 { return true } }"
  );
  const parser = new Parser(new Lexer(SR));
  const forEachStatement = parser.parseForEachStatement();
  console.log(forEachStatement);
  expect(forEachStatement).toBeDefined();
});

test("parse_nestedAssignment", () => {
  const SR = new CharacterReader("x = y = 5");
  const parser = new Parser(new Lexer(SR));
  const assignment = parser.parseAssignmentOrID();
  console.log(assignment);
  expect(assignment).toBeDefined();
});

test("parse_nestedExpressionWithParentheses", () => {
  const SR = new CharacterReader("((x + y) * (z - 5)) / (a + b)");
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseExpression();
  console.log(expression);
  expect(expression).toBeDefined();
});

test("parse_badAssignment", () => {
  const SR = new CharacterReader("x = 5 +");
  const parser = new Parser(new Lexer(SR));
  let assignment;
  try {
    assignment = parser.parseAssignmentOrID();
  } catch (e: any) {
    expect(e.message).toContain("SyntaxError");
  }
  expect(assignment).toBeUndefined();
});

test("parse_emptyProgram", () => {
  const SR = new CharacterReader("");
  const parser = new Parser(new Lexer(SR));
  let program;
  try {
    program = parser.parseProgram();
  } catch (e: any) {
    expect(e.message).toContain("SyntaxError");
  }
  expect(program).toBeUndefined();
});

test("parse_missingClosingBrace", () => {
  const SR = new CharacterReader("{");
  const parser = new Parser(new Lexer(SR));
  let block;
  try {
    block = parser.parseBlock();
  } catch (error) {
    console.log(error);
  }
  expect(block).toBeUndefined();
});

test("parse_invalidExpression", () => {
  const SR = new CharacterReader("x +");
  const parser = new Parser(new Lexer(SR));
  let expression;
  try {
    expression = parser.parseExpression();
  } catch (error) {
    console.log(error);
  }
  expect(expression).toBeUndefined();
});

test("parse_invalidIdentifier", () => {
  const SR = new CharacterReader("123x");
  const parser = new Parser(new Lexer(SR));
  let identifier;
  try {
    identifier = parser.parseIdentifier();
  } catch (error) {
    console.log(error);
  }
  expect(identifier).toBeUndefined();
});

test("parse_invalidCell", () => {
  const SR = new CharacterReader("A");
  const parser = new Parser(new Lexer(SR));
  let cell;
  try {
    cell = parser.parseCell();
  } catch (error) {
    console.log(error);
  }
  expect(cell).toBeUndefined();
});

test("parse_invalidProgramNoParenthesis", () => {
  const SR = new CharacterReader("def foo() { return true ");
  const parser = new Parser(new Lexer(SR));
  let program;
  try {
    program = parser.parseProgram();
  } catch (error) {
    console.log(error);
  }
  expect(program).toBeUndefined();
});

test("parse_invalidProgramTwoParenthesis", () => {
  const SR = new CharacterReader("def foo() { return true } }");
  const parser = new Parser(new Lexer(SR));
  let program;
  try {
    program = parser.parseProgram();
  } catch (error) {
    console.log(error);
  }
  expect(program).toBeUndefined();
});

test("parse_wholeProgramSum", () => {
  const SR = new CharacterReader(
    `def sum(range)
    {
        a = 0
        foreach cell in range
        {
           a += A10.value
        }
        return a
    }

    def main()
    {
        B2 = 7
        B10 = 43
        B11 = sum(B1:B10)
        # B11 should equal 50
    }`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
});

test("parse_wholeProgramSelection", () => {
  const SR = new CharacterReader(
    `def main()
    {
        B1 = 43
        B2 = if (B1>0) {10} else {54}
        # B2 should be 54
    }`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
});

test("parse_wholeProgramCount", () => {
  const SR = new CharacterReader(
    `def count(range)
    {
        count = 0
        foreach cell in range
        {
           count += if (A10.value!=null) {1} else {0}
        }
        return count
    }

    def main()
    {
        B3 = 1
        B5 = 10
        B10 = 100
        B11 = count(B1:B10)
        # B11 should be equal to 3
    }`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
});

test("parse_wholeProgramTrim", () => {
  const SR = new CharacterReader(
    `def trim(cell)
    {
        newCell = ""
        spaces = 0
        foreach letter in cell
        {
          spaces += if (letter==" ") {1} else {-spaces}
          newCell += if (spaces<=1) {letter} else {letter}
        }
        return newCell
    }

    def main()
    {
        A1 = "Hello          World"
        A2 = trim(A1)
        # A2 should be equal to "Hello World"
    }`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
});

test("parse_wholeProgramCut", () => {
  const SR = new CharacterReader(
    `def mid(cell, indexFrom, chars)
    {
        newCell = ""
        count = 0
        tempNewLetter = ""
        foreach letter in cell
        {
          count += 1
          tempNewLetter = if (count>=indexFrom) {letter} else {""}
          newCell += if (indexFrom+chars<count) {tempNewLetter} else {""}
        }
        return newCell
    }

    def main()
    {
        A1 = "Would you like some crisps?"
        A2 = mid(A1, 7, 3)
        # A2 should be equal to "you"
    }`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
});