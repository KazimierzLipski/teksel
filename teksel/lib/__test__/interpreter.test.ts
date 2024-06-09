import { isType } from "variant";
import { CharacterReader } from "../character-reader";
import { Interpreter, Value } from "../interpreter";
import { Lexer } from "../lexer";
import { Parser } from "../parser";

export const logThis = (toLog: any) => {
  const util = require("util");
  console.log(util.inspect(toLog, false, null, true));
};

export const logThisReturn = (toLog: any) => {
  const util = require("util");
  return util.inspect(toLog, false, null, true);
};

test("emptyProgram", () => {
  const SR = new CharacterReader(`def main(){}`);
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  console.log(visitor.lastCalculation?.value);
});

test("addition", () => {
  const SR = new CharacterReader(
    `def main(){
      return 1 + 2
    }`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  const returnObject = visitor.lastCalculation;
  console.log(returnObject?.value);
  expect(returnObject?.value).toBe(3);
});

test("multiplicationTwoOne", () => {
  const SR = new CharacterReader(
    `def main(){
      return 1 * 2
    }`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  const returnObject = visitor.lastCalculation;
  console.log(returnObject?.value);
  expect(returnObject?.value).toBe(2);
});

test("multiplicationOne", () => {
  const SR = new CharacterReader(
    `def main(){
      return 1 * 1
    }`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  const returnObject = visitor.lastCalculation;
  console.log(returnObject?.value);
  expect(returnObject?.value).toBe(1);
});

test("scope", () => {
  const SR = new CharacterReader(
    `
def myFunc()
{
    a = 20
    b = a
    return b
}

def main()
{
    a = 10
    c = myFunc()

    x = a
    g = c
    z = 1 + 1
    return x
}`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  const returnObject = visitor.lastCalculation;
  expect(returnObject?.get()).toBe(10);
});

test("scopeParameter", () => {
  const SR = new CharacterReader(
    `
def myFunc(a)
{
    b = a
    return b
}

def main()
{
    a = 21
    c = myFunc(a)
    return c
}`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  const returnObject = visitor.lastCalculation;
  console.log(returnObject);
  expect(returnObject?.value).toBe(21);
});

test("globalCell", () => {
  const SR = new CharacterReader(
    `
def myFunc()
{
    A1 = 10
    return A1
}

def main()
{
    A1 = 0
    a = myFunc()
    return A1
}`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  const returnObject = visitor.lastCalculation;
  console.log(returnObject);
  expect(returnObject?.get()).toBe(10);
});

test("sum", () => {
  const SR = new CharacterReader(
    `def sum(range)
{
    sum = 0
    foreach cell in range
    {
       sum += cell
    }
    return sum
}

def main()
{
    B2 = 7
    B10 = 43
    B11 = sum(B1:B10)
    return B11
    # B11 should equal 50
}`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  const value = visitor.lastCalculation;
  expect(value?.get()).toBe(50);
});

test("selection", () => {
  const SR = new CharacterReader(
    `def main()
{
    B1 = 43
    B2 = use 10 if B1>0 else 54
    return B2
}`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  const returnObject = visitor.lastCalculation;
  console.log(returnObject?.value);
  expect(returnObject?.get()).toBe(10);
});

test("count", () => {
  const SR = new CharacterReader(
    `def count(range)
{
    count = 0
    foreach cell in range
    {
       count += use 1 if cell!="" else 0
    }
    return count
}

def main()
{
    B3 = 1
    B5 = 10
    B10 = 100
    B11 = count(B1:B10)
    return B11
}`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  const returnObject = visitor.lastCalculation;
  console.log(returnObject?.value);
  expect(returnObject?.get()).toBe(3);
});

test("trim", () => {
  const SR = new CharacterReader(
    `def trim(cell)
{
    newCell = ""
    spaces = 0
    foreach letter in cell
    {
      spaces += use 1 if letter==" " else -spaces
      newCell += use letter if spaces <= 1 else ""
    }
    return newCell
}

def main()
{
    A1 = "Hello     World"
    trimmed = trim(A1)
    return trimmed
}`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  const returnObject = visitor.lastCalculation;
  console.log(returnObject?.value);
  expect(returnObject?.value).toBe("Hello World");
});

test("cut", () => {
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
      newCell += use tempNewLetter if indexFrom+chars > count else ""
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
  let visitor = new Interpreter();
  expression.accept(visitor);
  const returnObject = visitor.lastCalculation;
  console.log(returnObject?.value);
  expect(returnObject?.value).toBe("you");
});

test("cellAccessThroughVariable", () => {
  const SR = new CharacterReader(
    `def main()
    {
      range = A1:A10
      foreach cell in range
      {
        cell += 1
      }
      return A1
    }`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  const returnObject = visitor.lastCalculation;
  expect(returnObject?.get()).toBe(1);
});

test("returnPointer", () => {
  const SR = new CharacterReader(
    `def main()
    {
      x = A1
      return x
    }`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  const returnObject = visitor.lastCalculation;
  logThis(returnObject);
  expect(returnObject?.get()).toBe("");
  expect(isType(returnObject, "cell")).toBe(true);
});

describe("addition", () => {
  test("addingStrings", () => {
    const SR = new CharacterReader(
      `def main(){
        return "Hello" + " " + "World"
      }`
    );
    const parser = new Parser(new Lexer(SR));
    const expression = parser.parseProgram();
    logThis(expression);
    expect(expression).toBeDefined();
    let visitor = new Interpreter();
    expression.accept(visitor);
    const returnObject = visitor.lastCalculation;
    logThis(returnObject?.value);
    expect(returnObject?.get()).toBe("Hello World");
  });

  test("addingStringAndNumber", () => {
    const SR = new CharacterReader(
      `def main(){
        return "Hello" + 1
      }`
    );
    const parser = new Parser(new Lexer(SR));
    const expression = parser.parseProgram();
    logThis(expression);
    expect(expression).toBeDefined();
    let visitor = new Interpreter();
    expression.accept(visitor);
    const returnObject = visitor.lastCalculation;
    logThis(returnObject?.value);
    expect(returnObject?.get()).toBe("Hello1");
  });

  test("addingNumberAndString", () => {
    const SR = new CharacterReader(
      `def main(){
        return 1 + "Hello"
      }`
    );
    const parser = new Parser(new Lexer(SR));
    const expression = parser.parseProgram();
    logThis(expression);
    expect(expression).toBeDefined();
    let visitor = new Interpreter();
    expression.accept(visitor);
    const returnObject = visitor.lastCalculation;
    logThis(returnObject?.value);
    expect(returnObject?.get()).toBe("1Hello");
  });

  test("addingStringAndCell", () => {
    const SR = new CharacterReader(
      `def main(){
        A1 = "Hello"
        return "Hello" + A1
      }`
    );
    const parser = new Parser(new Lexer(SR));
    const expression = parser.parseProgram();
    logThis(expression);
    expect(expression).toBeDefined();
    let visitor = new Interpreter();
    expression.accept(visitor);
    const returnObject = visitor.lastCalculation;
    logThis(returnObject?.value);
    expect(returnObject?.get()).toBe("HelloHello");
  });

  test("addingCellAndNumber", () => {
    const SR = new CharacterReader(
      `def main(){
        A1 = 1
        return A1 + 1
      }`
    );
    const parser = new Parser(new Lexer(SR));
    const expression = parser.parseProgram();
    logThis(expression);
    expect(expression).toBeDefined();
    let visitor = new Interpreter();
    expression.accept(visitor);
    const returnObject = visitor.lastCalculation;
    logThis(returnObject?.value);
    expect(returnObject?.get()).toBe(2);
  });

  test("addingIdentifierValueCessWithIdentifier", () => {
    const SR = new CharacterReader(
      `def main(){
        A1 = 1
        a = A1
        A2 = 4
        return A2 + a
      }`
    );
    const parser = new Parser(new Lexer(SR));
    const expression = parser.parseProgram();
    logThis(expression);
    expect(expression).toBeDefined();
    let visitor = new Interpreter();
    expression.accept(visitor);
    const returnObject = visitor.lastCalculation;
    logThis(returnObject?.value);
    expect(returnObject?.get()).toBe(5);
  });
});

describe("subtraction", () => {
  test("numberAndNumber", () => {
    const SR = new CharacterReader(
      `def main(){
        return 1 - 1
      }`
    );
    const parser = new Parser(new Lexer(SR));
    const expression = parser.parseProgram();
    logThis(expression);
    expect(expression).toBeDefined();
    let visitor = new Interpreter();
    expression.accept(visitor);
    const returnObject = visitor.lastCalculation;
    logThis(returnObject?.value);
    expect(returnObject?.get()).toBe(0);
  });

  test("numberAndCell", () => {
    const SR = new CharacterReader(
      `def main(){
        A1 = 1
        return 1 - A1
      }`
    );
    const parser = new Parser(new Lexer(SR));
    const expression = parser.parseProgram();
    logThis(expression);
    expect(expression).toBeDefined();
    let visitor = new Interpreter();
    expression.accept(visitor);
    const returnObject = visitor.lastCalculation;
    logThis(returnObject?.value);
    expect(returnObject?.get()).toBe(0);
  });

  test("numberAndText", () => {
    const SR = new CharacterReader(
      `def main(){
        return 1 - "Hello"
      }`
    );
    const parser = new Parser(new Lexer(SR));
    const expression = parser.parseProgram();
    logThis(expression);
    expect(expression).toBeDefined();
    let visitor = new Interpreter();
    expression.accept(visitor);
    expect(visitor.error).toBeTruthy();
  });

  test("cellAndIdentifierWithCell", () => {
    const SR = new CharacterReader(
      `def main(){
        A1 = 1
        a = A1
        A2 = 4
        return A2 - a
      }`
    );
    const parser = new Parser(new Lexer(SR));
    const expression = parser.parseProgram();
    logThis(expression);
    expect(expression).toBeDefined();
    let visitor = new Interpreter();
    expression.accept(visitor);
    const returnObject = visitor.lastCalculation;
    logThis(returnObject?.value);
    expect(returnObject?.get()).toBe(3);
  });
});

test("formula", () => {
  const SR = new CharacterReader(
    `def main()
{
  A3.formula = "=1+2"
  return A3
}`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  const returnObject = visitor.lastCalculation;
  logThis(returnObject?.value);
  expect(returnObject?.get()).toBe(3);
});

test("divBy0", () => {
  const SR = new CharacterReader(
    `def main()
{
  cell = A1
  return cell
}`
  );
  const parser = new Parser(new Lexer(SR));
  const expression = parser.parseProgram();
  logThis(expression);
  expect(expression).toBeDefined();
  let visitor = new Interpreter();
  expression.accept(visitor);
  const returnObject = visitor.lastCalculation;
  logThis(returnObject);
  // expect(returnObject?.get()).toBe(NaN);
});
