import { CharacterReader } from "../character-reader";
import { Lexer } from "../lexer";
import { Parser } from "../parser";
import {
  Cell,
  FloatLiteral,
  IntegerLiteral,
  TextLiteral,
} from "../statements";
// Unit tests

const logThis = (toLog: any) => {
  const util = require("util");
  console.log(util.inspect(toLog, false, null, true));
};

describe("unit_tests", () => {
  test("parse_program", () => {
    const SR = new CharacterReader("def foo(){ return true }");
    const parser = new Parser(new Lexer(SR));
    const program = parser.parseProgram();
    logThis(program);
    expect(program).toBeDefined();
  });

  test("parse_parameterList", () => {
    const SR = new CharacterReader("x, y, z");
    const parser = new Parser(new Lexer(SR));
    const parameterList = parser.parseParametersList();
    logThis(parameterList);
    expect(parameterList).toBeDefined();
  });

  test("parse_parameterList_oneParameter", () => {
    const SR = new CharacterReader("x");
    const parser = new Parser(new Lexer(SR));
    const parameterList = parser.parseParametersList();
    logThis(parameterList);
    expect(parameterList).toBeDefined();
  });

  test("parse_parameterList_noParameters", () => {
    const SR = new CharacterReader("");
    const parser = new Parser(new Lexer(SR));
    const parameterList = parser.parseParametersList();
    logThis(parameterList);
    expect(parameterList).toBeDefined();
  });

  test("parse_functionDefinition", () => {
    const SR = new CharacterReader("def foo(x, y, z) { return true }");
    const parser = new Parser(new Lexer(SR));
    const functionDefinition = parser.parseFunctionDefinition();
    logThis(functionDefinition);
    expect(functionDefinition).toBeDefined();
  });

  test("parse_argumentList", () => {
    const SR = new CharacterReader("1, 2, 3");
    const parser = new Parser(new Lexer(SR));
    const argumentList = parser.parseArgumentList();
    logThis(argumentList);
    expect(argumentList).toBeDefined();
  });

  test("parse_argumentList_oneArgument", () => {
    const SR = new CharacterReader("1");
    const parser = new Parser(new Lexer(SR));
    const argumentList = parser.parseArgumentList();
    logThis(argumentList);
    expect(argumentList).toBeDefined();
  });

  test("parse_argumentList_noArguments", () => {
    const SR = new CharacterReader("");
    const parser = new Parser(new Lexer(SR));
    const argumentList = parser.parseArgumentList();
    logThis(argumentList);
    expect(argumentList).toBeUndefined();
  });

  test("parse_functionCallOrIDAndOrAttribute", () => {
    const SR = new CharacterReader("foo(1, 2, 3)");
    const parser = new Parser(new Lexer(SR));
    const functionCallOrID = parser.functionCallOrIDAndOrAttribute();
    logThis(functionCallOrID);
    expect(functionCallOrID).toBeDefined();
  });

  test("parse_block", () => {
    const SR = new CharacterReader(`{ x = 1
    y = 2 }`);
    const parser = new Parser(new Lexer(SR));
    const block = parser.parseBlock();
    logThis(block);
    expect(block).toBeDefined();
  });

  test("parse_anyStatement", () => {
    const SR = new CharacterReader("x = 1");
    const parser = new Parser(new Lexer(SR));
    const anyStatement = parser.parseAnyStatement();
    logThis(anyStatement);
    expect(anyStatement).toBeDefined();
  });

  test("parse_returnStatement", () => {
    const SR = new CharacterReader("return true;");
    const parser = new Parser(new Lexer(SR));
    const returnStatement = parser.parseReturnStatement();
    logThis(returnStatement);
    expect(returnStatement).toBeDefined();
  });

  test("parse_conditionalStatement", () => {
    const SR = new CharacterReader(
      "if (x > 0) { return true } else { return false }"
    );
    const parser = new Parser(new Lexer(SR));
    const conditionalStatement = parser.parseConditionalStatement();
    logThis(conditionalStatement);
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
    logThis(forEachStatement);
    expect(forEachStatement).toBeDefined();
  });

  test("parse_assignment", () => {
    const SR = new CharacterReader("x = 1");
    const parser = new Parser(new Lexer(SR));
    const assignment = parser.parseAssignment();
    logThis(assignment);
    expect(assignment).toBeDefined();
  });

  test("parse_expression", () => {
    const SR = new CharacterReader("x < y and x < y");
    const parser = new Parser(new Lexer(SR));
    const expression = parser.parseExpression();
    logThis(expression);
    expect(expression).toBeDefined();
  });

  test("parse_expressionCell", () => {
    const SR = new CharacterReader("A10");
    const parser = new Parser(new Lexer(SR));
    const expression = parser.parseExpression();
    logThis(expression);
    expect(expression).toBeDefined();
  });

  test("parse_orExpression", () => {
    const SR = new CharacterReader("x or y");
    const parser = new Parser(new Lexer(SR));
    const orExpression = parser.parseOrExpression();
    logThis(orExpression);
    expect(orExpression).toBeDefined();
  });

  test("parse_andExpression", () => {
    const SR = new CharacterReader("x and y");
    const parser = new Parser(new Lexer(SR));
    const andExpression = parser.parseAndExpression();
    logThis(andExpression);
    expect(andExpression).toBeDefined();
  });

  test("parse_relativeExpression", () => {
    const SR = new CharacterReader("x < y");
    const parser = new Parser(new Lexer(SR));
    const relativeExpression = parser.parseRelativeExpression();
    logThis(relativeExpression);
    expect(relativeExpression).toBeDefined();
  });

  test("parse_additiveExpression", () => {
    const SR = new CharacterReader("x + y");
    const parser = new Parser(new Lexer(SR));
    const additiveExpression = parser.parseAdditiveExpression();
    logThis(additiveExpression);
    expect(additiveExpression).toBeDefined();
  });

  test("parse_multiplicativeExpression", () => {
    const SR = new CharacterReader("4 * 3");
    const parser = new Parser(new Lexer(SR));
    const multiplicativeExpression = parser.parseMultiplicativeExpression();
    logThis(multiplicativeExpression);
    expect(multiplicativeExpression).toBeDefined();
  });

  describe("parse_cellOrRangeOrAttribute", () => {
    // cellOrRangeOrAttribute = cell, ([":", cell] | [attribute]);
    test("parse_cellOrRangeOrAttribute_cell", () => {
      const SR = new CharacterReader("A1");
      const parser = new Parser(new Lexer(SR));
      const cellOrRangeOrAttribute = parser.parseCellOrRangeOrAttribute();
      logThis(cellOrRangeOrAttribute);
      expect(cellOrRangeOrAttribute).toBeDefined();
    });

    test("parse_cellOrRangeOrAttribute_attribute", () => {
      const SR = new CharacterReader("A10.value");
      const parser = new Parser(new Lexer(SR));
      const cellOrRangeOrAttribute = parser.parseCellOrRangeOrAttribute();
      logThis(cellOrRangeOrAttribute);
      expect(cellOrRangeOrAttribute).toBeDefined();
    });

    test("parse_cellOrRangeOrAttribute_range", () => {
      const SR = new CharacterReader("A10:B20");
      const parser = new Parser(new Lexer(SR));
      const cellOrRangeOrAttribute = parser.parseCellOrRangeOrAttribute();
      logThis(cellOrRangeOrAttribute);
      expect(cellOrRangeOrAttribute).toBeDefined();
    });
  });

  describe("parse_factor", () => {
    test("parse_factor_norm", () => {
      const SR = new CharacterReader("-5");
      const parser = new Parser(new Lexer(SR));
      const factor = parser.parseFactor();
      logThis(factor);
      expect(factor).toBeDefined();
    });

    test("parse_factor_negation", () => {
      const SR = new CharacterReader("-x");
      const parser = new Parser(new Lexer(SR));
      const factor = parser.parseFactor();
      logThis(factor);
      expect(factor).toBeDefined();
    });

    test("parse_factor_integer", () => {
      const SR = new CharacterReader("123");
      const parser = new Parser(new Lexer(SR));
      const factor = parser.parseFactor();
      logThis(factor);
      expect(factor).toBeDefined();
    });

    test("parse_factor_float", () => {
      const SR = new CharacterReader("3.14");
      const parser = new Parser(new Lexer(SR));
      const factor = parser.parseFactor();
      logThis(factor);
      expect(factor).toBeDefined();
    });

    test("parse_factor_text", () => {
      const SR = new CharacterReader('"Hello, World!"');
      const parser = new Parser(new Lexer(SR));
      const factor = parser.parseFactor();
      logThis(factor);
      expect(factor).toBeDefined();
    });

    test("parse_factor_functionCallOrIDAndOrAttribute", () => {
      const SR = new CharacterReader("myFunction()");
      const parser = new Parser(new Lexer(SR));
      const factor = parser.parseFactor();
      logThis(factor);
      expect(factor).toBeDefined();
    });

    test("parse_factor_expression", () => {
      const SR = new CharacterReader("(x + y)");
      const parser = new Parser(new Lexer(SR));
      const factor = parser.parseFactor();
      logThis(factor);
      expect(factor).toBeDefined();
    });

    test("parse_factor_cellOrRangeOrAttribute", () => {
      const SR = new CharacterReader("A1:B2");
      const parser = new Parser(new Lexer(SR));
      const factor = parser.parseFactor();
      logThis(factor);
      expect(factor).toBeDefined();
    });
  });

  describe("parse_literals", () => {
    test("parse_text", () => {
      const SR = new CharacterReader('"Hello, World!"');
      const parser = new Parser(new Lexer(SR));
      const text = parser.parseText();
      logThis(text);
      expect(text).toBeDefined();
      expect(text?.value).toBe("Hello, World!");
      expect(text).toBeInstanceOf(TextLiteral);
    });

    test("parse_integer", () => {
      const SR = new CharacterReader("123");
      const parser = new Parser(new Lexer(SR));
      const integer = parser.parseInteger();
      logThis(integer);
      expect(integer).toBeDefined();
      expect(integer?.value).toBe(123);
      expect(integer).toBeInstanceOf(IntegerLiteral);
    });

    test("parse_integerZero", () => {
      const SR = new CharacterReader("0");
      const parser = new Parser(new Lexer(SR));
      const integer = parser.parseInteger();
      logThis(integer);
      expect(integer).toBeDefined();
      expect(integer?.value).toBe(0);
      expect(integer).toBeInstanceOf(IntegerLiteral);
    });

    test("parse_float", () => {
      const SR = new CharacterReader("3.14");
      const parser = new Parser(new Lexer(SR));
      const float = parser.parseFloat();
      logThis(float);
      expect(float).toBeDefined();
      expect(float?.value).toBe(3.14);
      expect(float).toBeInstanceOf(FloatLiteral);
    });

    test("parse_identifier", () => {
      const SR = new CharacterReader("x");
      const parser = new Parser(new Lexer(SR));
      const identifier = parser.parseIdentifier();
      logThis(identifier);
      expect(identifier).toBeDefined();
      expect(identifier).toBe("x");
    });

    test("parse_identifierUnderscore", () => {
      const SR = new CharacterReader("x_");
      const parser = new Parser(new Lexer(SR));
      const identifier = parser.parseIdentifier();
      logThis(identifier);
      expect(identifier).toBeDefined();
      expect(identifier).toBe("x_");
    });

    test("parse_identifierUnderscoreLetter", () => {
      const SR = new CharacterReader("x_x");
      const parser = new Parser(new Lexer(SR));
      const identifier = parser.parseIdentifier();
      logThis(identifier);
      expect(identifier).toBeDefined();
      expect(identifier).toBe("x_x");
    });

    test("parse_cell", () => {
      const SR = new CharacterReader("A1");
      const parser = new Parser(new Lexer(SR));
      const cell = parser.parseCell();
      logThis(cell);
      expect(cell).toBeDefined();
      expect(cell?.column).toBe("A");
      expect(cell?.row).toBe(1);
      expect(cell).toBeInstanceOf(Cell);
    });

    test("parse_cellDouble", () => {
      const SR = new CharacterReader("A10");
      const parser = new Parser(new Lexer(SR));
      const cell = parser.parseCell();
      logThis(cell);
      expect(cell).toBeDefined();
      expect(cell?.column).toBe("A");
      expect(cell?.row).toBe(10);
      expect(cell).toBeInstanceOf(Cell);
    });
  });
});
// Additional tests
describe("additional_tests", () => {
  test("parse_assignmentCell", () => {
    const SR = new CharacterReader("A1 = 10");
    const parser = new Parser(new Lexer(SR));
    const assignment = parser.parseAssignment();
    logThis(assignment);
    expect(assignment).toBeDefined();
  });

  test("parse_assignmentMinusEqualsCell", () => {
    const SR = new CharacterReader("A11 -= 5");
    const parser = new Parser(new Lexer(SR));
    const assignment = parser.parseAssignment();
    logThis(assignment);
    expect(assignment).toBeDefined();
  });

  test("parse_assignmentPlusEqualsCell", () => {
    const SR = new CharacterReader("A1 += 3");
    const parser = new Parser(new Lexer(SR));
    const assignment = parser.parseAssignment();
    logThis(assignment);
    expect(assignment).toBeDefined();
  });

  test("parse_expressionWithParentheses", () => {
    const SR = new CharacterReader("(x + y) * (z - 5)");
    const parser = new Parser(new Lexer(SR));
    const expression = parser.parseExpression();
    logThis(expression);
    expect(expression).toBeDefined();
  });

  test("parse_nestedIfStatement", () => {
    const SR = new CharacterReader("if (x > 0) { if (y > 0) { return true } }");
    const parser = new Parser(new Lexer(SR));
    const ifStatement = parser.parseIfStatement();
    logThis(ifStatement);
    expect(ifStatement).toBeDefined();
  });

  test("parse_nestedForEachStatement", () => {
    const SR = new CharacterReader(
      "foreach x in A1:A10 { foreach y in B1:B5 { return true } }"
    );
    const parser = new Parser(new Lexer(SR));
    const forEachStatement = parser.parseForEachStatement();
    logThis(forEachStatement);
    expect(forEachStatement).toBeDefined();
  });

  test("parse_nestedAssignment", () => {
    const SR = new CharacterReader("x = y = 5");
    const parser = new Parser(new Lexer(SR));
    const assignment = parser.parseAssignment();
    logThis(assignment);
    expect(assignment).toBeDefined();
  });

  test("parse_nestedExpressionWithParentheses", () => {
    const SR = new CharacterReader("((x + y) * (z - 5)) / (a + b)");
    const parser = new Parser(new Lexer(SR));
    const expression = parser.parseExpression();
    logThis(expression);
    expect(expression).toBeDefined();
  });
});
// Error tests
describe("error_tests", () => {
  test("parse_badAssignment", () => {
    const SR = new CharacterReader("x = 5 +");
    const parser = new Parser(new Lexer(SR));
    let assignment;
    try {
      assignment = parser.parseAssignment();
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
});

test("parse_wholeProgramSum", () => {
  const SR = new CharacterReader(
    `def sum(range)
    {
        a = 0
        foreach cell in range
        {
           a += cell.value
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
        B2 = use 10 if B1>0 else 54
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
           count += use 1 if cell.value!=null else 0
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
          spaces += use 1 if letter==" " else -spaces
          newCell += use letter if spaces<=1 else letter
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
          tempNewLetter = use letter if count>=indexFrom else ""
          newCell += use tempNewLetter if indexFrom+chars<count else ""
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

test("parse_wholeProgramWithAdd", () => {
  const SR = new CharacterReader(
    `def mid(cell, indexFrom, chars)
    {
        newCell = ""
        count = 0
        tempNewLetter = ""
        a = 0
        foreach letter in cell
        {
          count += 1
          tempNewLetter = use letter + 1 if (count>=indexFrom) else ""
          newCell += use tempNewLetter if (indexFrom+chars<count) else ""
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

test("parse_myTest", () => {
  const SR = new CharacterReader(
    `def main()
    {
        a = A2
        a.value = 1
        # A2 should be equal to "you"
    }`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
});
