import { CharacterReader } from "./character-reader";
import { ErrorType, InterpreterError } from "./error-types";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import {
  AddExpression,
  AndExpression,
  ArgumentList,
  Assignment,
  AttributeFormula,
  AttributeValue,
  Block,
  Cell,
  CellRange,
  DivideExpression,
  EqualExpression,
  Expression,
  FloatLiteral,
  ForEachStatement,
  FunctionCall,
  FunctionDefinition,
  GreaterThanExpression,
  GreaterThanOrEqualExpression,
  Identifier,
  IfStatement,
  IntegerLiteral,
  IVisitor,
  LessThanExpression,
  LessThanOrEqualExpression,
  MultiplyExpression,
  NegateExpression,
  NotEqualExpression,
  OrExpression,
  Program,
  ReturnStatement,
  SubtractExpression,
  TextLiteral,
  UseStatement,
} from "./statements";
import { Position } from "./token";
import {
  variantModule,
  VariantOf,
  TypeNames,
  match,
  isType,
  variantList,
} from "variant";

export class VariableManager {
  scopes: Scope[] = [];
  callContexts: Scope[][] = [];

  onBlockEntry() {
    this.scopes.push(new Scope(new Map()));
  }

  onBlockExit() {
    this.scopes.pop();
  }

  onFunctionEntry(args: Map<any, any>) {
    this.callContexts.push(this.scopes);
    this.scopes = [new Scope(new Map())];
    for (const [key, value] of args) {
      this.setVariable(key, value);
    }
  }

  onFunctionExit() {
    this.scopes = this.callContexts.pop() ?? [];
  }

  getVariable(name: string) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const scope = this.scopes[i];
      if (scope.variables.has(name)) {
        return scope.variables.get(name);
      }
    }
  }

  getVariableLocation(name: string) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const scope = this.scopes[i];
      if (scope.variables.has(name)) {
        return i;
      }
    }
  }

  setVariable(name: string, value: any) {
    let location = this.getVariableLocation(name);
    if (location !== undefined) {
      this.scopes[location].variables.set(name, value);
    } else this.scopes[this.scopes.length - 1].variables.set(name, value);
  }
}

export class Scope {
  variables: Map<string, any>;

  constructor(variables: Map<string, any>) {
    this.variables = new Map(variables);
  }
}

export function setCells() {
  let newCells: Value<"cell">[][] = [];
  const ROW_MAX = 30;
  const COL_MAX = 26;
  for (let row = 0; row <= ROW_MAX; row++) {
    let newRow = [];
    for (let col = 0; col < COL_MAX; col++) {
      newRow.push(
        Value.cell(Value.text(""), row, String.fromCharCode(col + 65), "")
      );
    }
    newCells.push(newRow);
  }
  return newCells;
}

export class Interpreter implements IVisitor {
  functionsDefinitions: Map<string, FunctionDefinition> = new Map();

  cells: Value<"cell">[][];

  varManager = new VariableManager();

  isReturning: boolean = false;

  prevRanFuncName: string = "";
  recursionDepthCounter: number = 0;

  lastCalculation: Value | undefined = undefined;

  argumentList: Value[] = [];

  inAssignment: boolean = false;

  error: undefined | any;

  constructor(cells?: Value<"cell">[][]) {
    if (cells !== undefined) {
      for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i].length; j++) {
          if (cells[i][j] !== undefined) {
            let value = cells[i][j].value.value;
            if (typeof value === "string") {
              if (value.charAt(0) === "=") {
                let computedValue: Value = this.evaluateFormula(value);
                let prim = checkIsPrim(computedValue);
                if (prim !== undefined) {
                  cells[i][j].value = prim;
                } else
                  throw new InterpreterError(
                    ErrorType.E_TypeError,
                    undefined,
                    "Value attribute must be a cell"
                  );
              }
            }
          }
        }
      }
    }
    this.cells = cells ?? setCells();
  }

  throwOperandTypesError(
    left: any,
    right: any,
    operand: string,
    position?: Position
  ) {
    throw new InterpreterError(
      ErrorType.E_TypeError,
      position,
      `Operands for ${operand} cannot have these types ${typeof left} ${typeof right}`
    );
  }

  visitProgram(element: Program) {
    const definitions = Array.from(element.definitions.values());
    for (const stmt of definitions) {
      const result = stmt.accept(this);
      if (this.isReturning) {
        if (result !== undefined) {
          return { value: result };
        }
        return;
      }
    }
    try {
      const mainFuncDef = this.functionsDefinitions.get("main");
      if (mainFuncDef === undefined) {
        throw new InterpreterError(
          ErrorType.E_NameError,
          undefined,
          "No main function defined."
        );
      }
      new FunctionCall(
        mainFuncDef?.position,
        "main",
        new ArgumentList(mainFuncDef?.position, [])
      ).accept(this);
    } catch (e) {
      console.log(e);
      this.error = e;
    }
  }

  checkRecursionLimit(funId: string, position?: Position) {
    if (this.prevRanFuncName == funId) {
      this.recursionDepthCounter += 1;
    } else {
      this.recursionDepthCounter = 0;
    }

    if (this.recursionDepthCounter >= 100) {
      throw new InterpreterError(
        ErrorType.E_RecursionError,
        position,
        `Maximum recursion depth of 100 has been reached`
      );
    }

    this.prevRanFuncName = funId;
  }

  evaluateArgs(args?: ArgumentList, params?: string[], position?: Position) {
    const evaluatedArgs: Map<string, any> = new Map();
    const argumentsList = args?.arguments ?? [];

    if (argumentsList?.length !== params?.length) {
      throw new InterpreterError(
        ErrorType.E_ValueError,
        position,
        `Expected ${params?.length} arguments, got ${argumentsList?.length}`
      );
    }
    if (params === undefined || args === undefined) return evaluatedArgs;
    for (let i = 0; i < params.length; i++) {
      const arg = argumentsList[i];
      const param = params[i];
      arg.accept(this);
      const evalArg = this.lastCalculation;

      evaluatedArgs.set(param, {
        position: args.position,
        name: param,
        value: evalArg,
      });
    }

    return evaluatedArgs;
  }

  runFunction(funDef: FunctionDefinition, funCall: FunctionCall) {
    const funcVars: Map<string, any> = new Map();
    const evaluatedArgs = this.evaluateArgs(
      funCall.argumentList,
      funDef.parametersList,
      funCall.position
    );
    for (const [key, value] of evaluatedArgs) {
      this.varManager.setVariable(key, value);
      funcVars.set(key, value.value);
    }

    this.varManager.onFunctionEntry(funcVars);
    this.checkRecursionLimit(funDef.identifier, funCall.position);
    funDef.block.accept(this);
    this.isReturning = false;
    this.varManager.onFunctionExit();
  }

  visitFunctionDefinition(element: FunctionDefinition) {
    const funcName = element.identifier;
    if (this.functionsDefinitions.has(funcName)) {
      throw new InterpreterError(
        ErrorType.E_TypeError,
        element.position,
        `Name ${funcName} is the same as an existing function`
      );
    }
    this.functionsDefinitions.set(funcName, element);
  }

  visitArgumentList(element?: ArgumentList) {
    if (element === undefined) return;
    const argumentList: Value[] = [];
    for (const arg of element.arguments) {
      arg.accept(this);
      argumentList.push(this.lastCalculation!);
    }
    return argumentList;
  }
  visitFunctionCall(element: FunctionCall) {
    const funcName = element.identifier;
    const funDef = this.functionsDefinitions.get(funcName);
    if (funDef === undefined) {
      throw new InterpreterError(
        ErrorType.E_NameError,
        element.position,
        `NameError: name '${funcName}' is not defined`
      );
    }
    element.argumentList?.accept(this);
    this.runFunction(funDef, element);
  }
  visitBlock(element: Block) {
    this.varManager.onBlockEntry();
    for (const stmt of element.anyStatements) {
      if (typeof stmt === "string") continue;
      stmt.accept(this);
      if (this.isReturning) {
        return;
      }
    }
    this.varManager.onBlockExit();
  }

  visitReturnStatement(element: ReturnStatement) {
    element.referent?.accept(this);
    this.isReturning = true;
  }

  visitIfStatement(element: IfStatement) {
    element.condition.accept(this);
    const condition = this.lastCalculation?.value;
    if (condition === true) {
      this.visitBlock(element.block);
      if (this.isReturning) return;
    } else if (element.elseBlock !== undefined) {
      this.visitBlock(element.elseBlock);
      if (this.isReturning) return;
    }
  }
  visitUseStatement(element: UseStatement) {
    element.checkExpression.accept(this);
    const checkExpression = this.lastCalculation?.value;
    element.trueExpression.accept(this);
    const trueExpression: Value | undefined = this.lastCalculation;
    if (checkExpression === true && trueExpression !== undefined) {
      this.lastCalculation = getLiteral(trueExpression);
    } else {
      element.falseExpression.accept(this);
      const falseExpression: Value | undefined = this.lastCalculation;
      if (falseExpression === undefined) {
        throw new InterpreterError(
          ErrorType.E_ValueError,
          element.position,
          "Some expression is undefined"
        );
      }
      this.lastCalculation = getLiteral(falseExpression);
    }
  }
  visitForEachStatement(element: ForEachStatement) {
    element.expression.accept(this);
    let expr = this.lastCalculation;
    let iterable: Value<"text"> | Value<"cellRange"> | undefined;
    if (isType(expr, "cellRange")) {
      iterable = expr;
    } else if (isType(expr, "text")) {
      iterable = expr;
    }
    if (isType(expr, "identifier")) {
      let innerValue: Value<"cellRange"> | ValuePrim | Value<"cell"> =
        expr.value;
      if (
        typeof innerValue === "string" ||
        typeof innerValue === "number" ||
        typeof innerValue === "boolean"
      ) {
      } else if (isType(innerValue, "cellRange")) {
        iterable = innerValue;
      }
    }
    if (
      isType(expr, "integer") ||
      isType(expr, "float") ||
      isType(expr, "boolean")
    ) {
      throw new InterpreterError(
        ErrorType.E_TypeError,
        element.position,
        "Iterable must be a list"
      );
    }
    if (isType(expr, "cell")) {
      if (isType(expr.value, "text")) {
        iterable = Value.text(expr.value.value);
      }
    }
    const iterableName = element.identifier;
    const block = element.block;

    if (iterable === undefined) {
      throw new InterpreterError(
        ErrorType.E_ValueError,
        element.position,
        "Some expression is undefined"
      );
    }
    if (isType(iterable, "cellRange")) {
      for (const element of iterable.cells) {
        this.varManager.setVariable(
          iterableName,
          Value.cell(
            element.value,
            element.row,
            element.column,
            element.formula
          )
        );
        block.accept(this);
        if (this.isReturning) {
          return;
        }
      }
    } else if (isType(iterable, "text")) {
      for (const element of iterable.value) {
        this.varManager.setVariable(iterableName, Value.text(element));
        block.accept(this);
        if (this.isReturning) {
          return;
        }
      }
    } else {
      throw new InterpreterError(
        ErrorType.E_TypeError,
        element.position,
        "Iterable must be a list"
      );
    }
  }
  visitAssignment(element: Assignment) {
    element.assigned.accept(this);
    if (this.lastCalculation === undefined) {
      throw new InterpreterError(
        ErrorType.E_NameError,
        element.position,
        `Right side must have value`
      );
    }
    this.inAssignment = true;
    element.assignee.accept(this);
    this.inAssignment = false;
  }
  getValuesLeftRight(element: any) {
    element.leftExpression.accept(this);
    const leftValue = this.lastCalculation?.get();
    element.rightExpression.accept(this);
    const rightValue = this.lastCalculation?.get();
    return { leftValue, rightValue };
  }
  getLeftRight(element: any) {
    element.leftExpression.accept(this);
    const left = this.lastCalculation;
    element.rightExpression.accept(this);
    const right = this.lastCalculation;
    return { left, right };
  }
  throwIfAnyUndefined(left: any, right: any) {
    if (left === undefined)
      throw new InterpreterError(
        ErrorType.E_ValueError,
        undefined,
        "left expression is undefined"
      );
    if (right === undefined)
      throw new InterpreterError(
        ErrorType.E_ValueError,
        undefined,
        "right expression is undefined"
      );
    return false;
  }
  visitExpression(expression: Expression) {
    return expression.accept(this);
  }
  visitOrExpression(element: OrExpression) {
    const { leftValue, rightValue } = this.getValuesLeftRight(element);
    this.throwIfAnyUndefined(leftValue, rightValue);
    this.lastCalculation = Value.boolean(
      (leftValue as boolean) || (rightValue as boolean)
    );
  }
  visitAndExpression(element: AndExpression) {
    const { leftValue, rightValue } = this.getValuesLeftRight(element);
    this.throwIfAnyUndefined(leftValue, rightValue);
    this.lastCalculation = Value.boolean(
      (leftValue as boolean) && (rightValue as boolean)
    );
  }
  visitLessThanExpression(element: LessThanExpression) {
    const { leftValue, rightValue } = this.getValuesLeftRight(element);
    this.throwIfAnyUndefined(leftValue, rightValue);
    this.lastCalculation = Value.boolean(leftValue! < rightValue!);
  }
  visitLessThanOrEqualExpression(element: LessThanOrEqualExpression) {
    const { leftValue, rightValue } = this.getValuesLeftRight(element);
    this.throwIfAnyUndefined(leftValue, rightValue);
    this.lastCalculation = Value.boolean(leftValue! <= rightValue!);
  }
  visitEqualExpression(element: EqualExpression) {
    const { leftValue, rightValue } = this.getValuesLeftRight(element);
    this.throwIfAnyUndefined(leftValue, rightValue);
    this.lastCalculation = Value.boolean(leftValue! === rightValue!);
  }
  visitNotEqualExpression(element: NotEqualExpression) {
    const { leftValue, rightValue } = this.getValuesLeftRight(element);
    this.throwIfAnyUndefined(leftValue, rightValue);
    this.lastCalculation = Value.boolean(leftValue! != rightValue!);
  }
  visitGreaterThanOrEqualExpression(element: GreaterThanOrEqualExpression) {
    const { leftValue, rightValue } = this.getValuesLeftRight(element);
    this.throwIfAnyUndefined(leftValue, rightValue);
    this.lastCalculation = Value.boolean(leftValue! >= rightValue!);
  }
  visitGreaterThanExpression(element: GreaterThanExpression) {
    const { leftValue, rightValue } = this.getValuesLeftRight(element);
    this.throwIfAnyUndefined(leftValue, rightValue);
    this.lastCalculation = Value.boolean(leftValue! > rightValue!);
  }
  visitAddExpression(element: AddExpression) {
    const { left, right } = this.getLeftRight(element);
    this.throwIfAnyUndefined(left, right);
    this.lastCalculation = literalOrError(getAddition(left!, right!));
  }
  visitSubtractExpression(element: SubtractExpression) {
    const { left, right } = this.getLeftRight(element);
    this.throwIfAnyUndefined(left, right);
    this.lastCalculation = literalOrError(getSubtraction(left!, right!));
  }
  visitMultiplyExpression(element: MultiplyExpression) {
    const { left, right } = this.getLeftRight(element);
    this.throwIfAnyUndefined(left, right);
    this.lastCalculation = literalOrError(getMultiplication(left!, right!));
  }
  visitDivideExpression(element: DivideExpression) {
    const { left, right } = this.getLeftRight(element);
    this.throwIfAnyUndefined(left, right);
    this.lastCalculation = literalOrError(getDivision(left!, right!));
  }
  visitNegateExpression(element: NegateExpression) {
    element.expression.accept(this);
    this.lastCalculation = literalOrError(getNegation(this.lastCalculation!));
  }
  evaluateFormula = (formula: string): Value => {
    let left = "def main(){";
    let right = "}";
    let tempFormula = formula.replace("=", "return ");
    let finalCode = left + tempFormula + right;
    const cr = new CharacterReader(finalCode);
    const lexer = new Lexer(cr);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    let visitor = new Interpreter(this.cells);
    program.accept(visitor);
    if (visitor.error) {
      throw visitor.error;
    }
    return visitor.lastCalculation ?? Value.text("");
  };
  visitFormulaAttribute(element: AttributeFormula) {
    let val: Value | undefined = this.lastCalculation;
    this.inAssignment = false;
    element.expression.accept(this);
    this.inAssignment = true;
    const elem = this.lastCalculation;
    let cell: Value<"cell"> | undefined;
    if (isType(elem, "cell")) cell = elem;
    if (isType(elem, "identifier"))
      if (isType(elem.value, "cell")) cell = elem.value;
    console.log("val", val);
    console.log("cell", cell);
    console.log("elem", elem);
    if (cell === undefined) {
      throw new InterpreterError(
        ErrorType.E_TypeError,
        element.position,
        "Value attribute must be a cell"
      );
    }
    if (this.inAssignment) {
      if (val !== undefined) {
        let tempVal = val;
        if (isType(tempVal, "text")) {
          let evaluation = this.evaluateFormula(tempVal.value);
          if (
            isType(evaluation, "integer") ||
            isType(evaluation, "float") ||
            isType(evaluation, "text")
          ) {
            this.cells[cell.row][this.letterToColumn(cell.column)] = Value.cell(
              evaluation,
              cell.row,
              cell.column,
              tempVal.value.toString() ?? ""
            );
          } else
            throw new InterpreterError(
              ErrorType.E_TypeError,
              element.position,
              "Value attribute must be a cell"
            );
        }
      }
      this.inAssignment = false;
    } else {
      this.lastCalculation = Value.text(
        this.cells[cell.row][this.letterToColumn(cell.column)].formula
      );
    }
  }
  visitValueAttribute(element: AttributeValue) {
    let val: Value | undefined = this.lastCalculation;
    element.expression.accept(this);
    const elem = this.lastCalculation;
    let cell: Value<"cell"> | undefined;
    if (isType(elem, "cell")) cell = elem;
    if (isType(elem, "identifier"))
      if (isType(elem.value, "cell")) cell = elem.value;
    if (cell === undefined) {
      throw new InterpreterError(
        ErrorType.E_TypeError,
        element.position,
        "Value attribute must be a cell"
      );
    }
    if (this.inAssignment) {
      if (val !== undefined) {
        let tempVal = val;
        if (
          isType(tempVal, "integer") ||
          isType(tempVal, "float") ||
          isType(tempVal, "text") ||
          isType(tempVal, "boolean")
        ) {
          this.cells[cell.row][this.letterToColumn(cell.column)] = Value.cell(
            tempVal,
            cell.row,
            cell.column,
            val.value.toString() ?? ""
          );
        } else {
          let newValue = tempVal.value ?? "";
          if (
            isType(newValue, "integer") ||
            isType(newValue, "text") ||
            isType(newValue, "float")
          ) {
            this.cells[cell.row][this.letterToColumn(cell.column)] = Value.cell(
              newValue,
              cell.row,
              cell.column,
              val.value.toString() ?? ""
            );
          }
        }
      }
      this.inAssignment = false;
    } else {
      this.lastCalculation = getLiteral(
        this.cells[cell.row][this.letterToColumn(cell.column)]
      );
    }
  }
  visitCellRange(element: CellRange) {
    let listOfCells: Value<"cell">[] = [];
    for (let i = element.start.row; i <= element.end.row; i++) {
      for (
        let j = element.start.column.charCodeAt(0);
        j <= element.end.column.charCodeAt(0);
        j++
      ) {
        let cell = this.cells[i][j - 65];
        listOfCells.push(cell);
      }
    }
    this.lastCalculation = Value.cellRange(undefined, listOfCells);
  }

  letterToColumn(letter: string) {
    return letter.charCodeAt(0) - 65;
  }
  visitCell(element: Cell) {
    if (this.inAssignment) {
      let val: Value | undefined = this.lastCalculation;
      if (val !== undefined) {
        let tempVal = val;
        if (
          isType(tempVal, "integer") ||
          isType(tempVal, "float") ||
          isType(tempVal, "text") ||
          isType(tempVal, "boolean")
        ) {
          this.cells[element.row][this.letterToColumn(element.column)] =
            Value.cell(
              tempVal,
              element.row,
              element.column,
              val.value.toString() ?? ""
            );
        } else {
          let newValue = tempVal.value ?? "";
          if (
            isType(newValue, "integer") ||
            isType(newValue, "text") ||
            isType(newValue, "float")
          ) {
            this.cells[element.row][this.letterToColumn(element.column)] =
              Value.cell(
                newValue,
                element.row,
                element.column,
                val.value.toString() ?? ""
              );
          }
        }
      }
      this.inAssignment = false;
    } else {
      this.lastCalculation = getLiteral(
        this.cells[element.row][this.letterToColumn(element.column)]
      );
    }
  }
  visitIdentifier(element: Identifier) {
    if (this.inAssignment) {
      if (isType(this.lastCalculation, "cell")) {
        this.cells[this.lastCalculation.row][
          this.letterToColumn(this.lastCalculation.column)
        ] = Value.cell(
          this.lastCalculation.value,
          this.lastCalculation.row,
          this.lastCalculation.column,
          this.lastCalculation.formula
        );
      }
      this.varManager.setVariable(element.name, this.lastCalculation);
      this.inAssignment = false;
    } else {
      this.lastCalculation = this.varManager.getVariable(element.name);
    }
  }
  visitText(element: TextLiteral) {
    this.lastCalculation = Value.text(element.value);
  }
  visitFloat(element: FloatLiteral) {
    this.lastCalculation = Value.float(element.value);
  }
  visitInteger(element: IntegerLiteral) {
    this.lastCalculation = Value.integer(element.value);
  }
}

type ValueType = string | number | boolean;

export type ValuePrim<T extends TypeNames<typeof ValuePrim> = undefined> =
  VariantOf<typeof ValuePrim, T>;

export type ValueComp<T extends TypeNames<typeof ValueComp> = undefined> =
  VariantOf<typeof ValueComp, T>;

const ValuePrim = variantModule({
  integer: (value: number) => ({
    value,
    get: () => value,
  }),
  float: (value: number) => ({
    value,
    get: () => value,
  }),
  text: (value: string) => ({
    value,
    getIter: () => value,
    get: () => value,
  }),
  boolean: (value: boolean) => ({
    value,
    get: () => value,
  }),
});

const ValueComp = variantModule({
  cell: (value: ValuePrim, row: number, column: string, formula: string) => ({
    value,
    row,
    column,
    formula,
    get: () => {
      return value.value;
    },
  }),
});

export type Value<T extends TypeNames<typeof Value> = undefined> = VariantOf<
  typeof Value,
  T
>;

const CellRangeMod = variantModule({
  cellRange: (value: ValueType = "", cells: ValueComp<"cell">[]) => ({
    cells,
    value,
    getIter: () => cells,
    get: () => value,
  }),
});

export type CellRangeMod<T extends TypeNames<typeof CellRangeMod> = undefined> =
  VariantOf<typeof CellRangeMod, T>;

export const Value = variantModule({
  ...variantList([
    ValueComp.cell,
    ValuePrim.boolean,
    ValuePrim.float,
    ValuePrim.integer,
    ValuePrim.text,
    CellRangeMod.cellRange,
  ]),

  identifier: (
    value: ValuePrim | ValueComp<"cell"> | CellRangeMod<"cellRange">,
    name: string
  ) => ({
    value,
    name,
    get: () => value.get(),
  }),
});

export const getLiteral = (value: Value) => {
  return match(value, {
    integer: (val) => Value.integer(val.value),
    float: (val) => Value.float(val.value),
    text: (val) => Value.text(val.value),
    boolean: (val) => Value.boolean(val.value),
    identifier: (val) => Value.identifier(val.value, val.name),
    cell: (val) => Value.cell(val.value, val.row, val.column, val.formula),
    cellRange: (val) => Value.cellRange(val.value, val.cells),
  });
};

const toValue = (value: Value): number | string | boolean => {
  return match(value, {
    integer: (val) => val.value,
    float: (val) => val.value,
    text: (val) => val.value,
    boolean: (val) => val.value,
    cell: (val) => toValue(val.value),
    cellRange: (val) => val.value,
    identifier: (val) => toValue(val.value),
  });
};

const checkIsPrim = (value: Value): ValuePrim | undefined => {
  return match(value, {
    integer: () => value as ValuePrim,
    float: () => value as ValuePrim,
    text: () => value as ValuePrim,
    boolean: () => value as ValuePrim,
    identifier: () => undefined,
    cell: () => undefined,
    cellRange: () => undefined,
  });
};

const literalOrError = (value: Value | Error): Value => {
  if (value instanceof Error) {
    throw value;
  }
  return value;
};

const getLiteralOrError = (value: Value | Error): Value => {
  if (value instanceof Error) {
    throw value;
  }
  return getLiteral(value);
};

const getLiteralPrimOrError = (value: Value | Error): ValuePrim => {
  if (value instanceof Error) {
    throw value;
  }
  const val = checkIsPrim(value);
  if (val === undefined) {
    throw new Error("Value is not a primary value");
  }
  return val;
};

const getAddition = (left: Value, right: Value): Error | Value => {
  return match(left, {
    integer: (l) =>
      match(right, {
        integer: (r) => Value.integer(l.value + r.value),
        float: (r) => Value.float(l.value + r.value),
        text: (r) => {
          if (r.value == "") {
            return Value.integer(l.value);
          }
          return Value.text(l.value + r.value);
        },
        boolean: (r) => new Error("Cannot add integer and boolean"),
        identifier: (r) => new Error("Cannot add integer and identifier"),
        cell: (r) => getLiteralOrError(getAddition(l, r.value)),
        cellRange: (r) => new Error("Cannot add integer and cellRange"),
      }),
    float: (l) =>
      match(right, {
        integer: (r) => Value.float(l.value + r.value),
        float: (r) => Value.float(l.value + r.value),
        text: (r) => Value.text(l.value + r.value),
        boolean: (r) => new Error("Cannot add float and boolean"),
        identifier: (r) => new Error("Cannot add float and identifier"),
        cell: (r) => new Error("Cannot add float and cell"),
        cellRange: (r) => new Error("Cannot add float and cellRange"),
      }),
    text: (l) =>
      match(right, {
        integer: (r) => {
          if (l.value == "") {
            return Value.integer(r.value);
          }
          return Value.text(l.value + r.value);
        },
        float: (r) => {
          if (l.value == "") {
            return Value.float(r.value);
          }
          return Value.text(l.value + r.value);
        },
        text: (r) => Value.text(l.value + r.value),
        boolean: (r) => {
          if (l.value == "") {
            return Value.boolean(r.value);
          }
          return Value.text(l.value + r.value);
        },
        identifier: (r) => Value.text(l.value + r.get()),
        cell: (r) => getLiteralOrError(getAddition(l, r.value)),
        cellRange: (r) => new Error("Cannot add text and cellRange"),
      }),
    boolean: (l) =>
      match(right, {
        integer: (r) => new Error("Cannot add boolean and integer"),
        float: (r) => new Error("Cannot add boolean and float"),
        text: (r) => Value.text(l.value + r.value),
        boolean: (r) => new Error("Cannot add boolean and boolean"),
        identifier: (r) => new Error("Cannot add boolean and identifier"),
        cell: (r) => new Error("Cannot add boolean and cell"),
        cellRange: (r) => new Error("Cannot add boolean and cellRange"),
      }),
    identifier: (l) =>
      match(right, {
        integer: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getAddition(l, r))
              : l.value,
            l.name
          ),
        float: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getAddition(l, r))
              : l.value,
            l.name
          ),
        text: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getAddition(l, r))
              : l.value,
            l.name
          ),
        boolean: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getAddition(l, r))
              : l.value,
            l.name
          ),
        identifier: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getAddition(l, r))
              : l.value,
            l.name
          ),
        cell: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getAddition(l, r))
              : l.value,
            l.name
          ),
        cellRange: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getAddition(l, r))
              : l.value,
            l.name
          ),
      }),
    cell: (l) =>
      match(right, {
        integer: (r) =>
          Value.cell(
            getLiteralPrimOrError(getAddition(l.value, r)),
            l.row,
            l.column,
            l.formula
          ),
        float: (r) =>
          Value.cell(
            getLiteralPrimOrError(getAddition(l.value, r)),
            l.row,
            l.column,
            l.formula
          ),
        text: (r) =>
          Value.cell(
            getLiteralPrimOrError(getAddition(l.value, r)),
            l.row,
            l.column,
            l.formula
          ),
        boolean: (r) =>
          Value.cell(
            getLiteralPrimOrError(getAddition(l.value, r)),
            l.row,
            l.column,
            l.formula
          ),
        identifier: (r) =>
          Value.cell(
            getLiteralPrimOrError(getAddition(l.value, r)),
            l.row,
            l.column,
            l.formula
          ),
        cell: (r) =>
          Value.cell(
            getLiteralPrimOrError(getAddition(l.value, r)),
            l.row,
            l.column,
            l.formula
          ),
        cellRange: (r) =>
          Value.cell(
            getLiteralPrimOrError(getAddition(l.value, r)),
            l.row,
            l.column,
            l.formula
          ),
      }),
    cellRange: (l) =>
      match(right, {
        integer: (r) => {
          let cells = l.cells.map((cell) =>
            Value.cell(
              getLiteralPrimOrError(getAddition(cell.value, r)),
              cell.row,
              cell.column,
              cell.formula
            )
          );
          return Value.cellRange(cells[0].value.value, cells);
        },
        float: (r) => {
          let cells = l.cells.map((cell) =>
            Value.cell(
              getLiteralPrimOrError(getAddition(cell.value, r)),
              cell.row,
              cell.column,
              cell.formula
            )
          );
          return Value.cellRange(cells[0].value.value, cells);
        },
        text: (r) => {
          let cells = l.cells.map((cell) =>
            Value.cell(
              getLiteralPrimOrError(getAddition(cell.value, r)),
              cell.row,
              cell.column,
              cell.formula
            )
          );
          return Value.cellRange(cells[0].value.value, cells);
        },
        boolean: (r) => {
          let cells = l.cells.map((cell) =>
            Value.cell(
              getLiteralPrimOrError(getAddition(cell.value, r)),
              cell.row,
              cell.column,
              cell.formula
            )
          );
          return Value.cellRange(cells[0].value.value, cells);
        },
        identifier: (r) => {
          let cells = l.cells.map((cell) =>
            Value.cell(
              getLiteralPrimOrError(getAddition(cell.value, r)),
              cell.row,
              cell.column,
              cell.formula
            )
          );
          return Value.cellRange(cells[0].value.value, cells);
        },
        cell: (r) => {
          let cells = l.cells.map((cell) =>
            Value.cell(
              getLiteralPrimOrError(getAddition(cell.value, r)),
              cell.row,
              cell.column,
              cell.formula
            )
          );
          return Value.cellRange(cells[0].value.value, cells);
        },
        cellRange: (r) => {
          let cells = l.cells.map((cell) =>
            Value.cell(
              getLiteralPrimOrError(getAddition(cell.value, r)),
              cell.row,
              cell.column,
              cell.formula
            )
          );
          return Value.cellRange(cells[0].value.value, cells);
        },
      }),
  });
};

const getSubtraction = (left: Value, right: Value): Error | Value => {
  return match(left, {
    integer: (l) =>
      match(right, {
        integer: (r) => Value.integer(l.value - r.value),
        float: (r) => Value.float(l.value - r.value),
        text: (r) => new Error("Cannot subtract integer and text"),
        boolean: (r) => new Error("Cannot subtract integer and boolean"),
        identifier: (r) => new Error("Cannot subtract integer and identifier"),
        cell: (r) => getLiteralOrError(getSubtraction(l, r.value)),
        cellRange: (r) => new Error("Cannot subtract integer and cellRange"),
      }),
    float: (l) =>
      match(right, {
        integer: (r) => Value.float(l.value - r.value),
        float: (r) => Value.float(l.value - r.value),
        text: (r) => new Error("Cannot subtract float and text"),
        boolean: (r) => new Error("Cannot subtract float and boolean"),
        identifier: (r) => new Error("Cannot subtract float and identifier"),
        cell: (r) => new Error("Cannot subtract float and cell"),
        cellRange: (r) => new Error("Cannot subtract float and cellRange"),
      }),
    text: (l) =>
      match(right, {
        integer: (r) => new Error("Cannot subtract text and integer"),
        float: (r) => new Error("Cannot subtract text and float"),
        text: (r) => new Error("Cannot subtract text and text"),
        boolean: (r) => new Error("Cannot subtract text and boolean"),
        identifier: (r) => new Error("Cannot subtract text and identifier"),
        cell: (r) => new Error("Cannot subtract text and cell"),
        cellRange: (r) => new Error("Cannot subtract text and cellRange"),
      }),
    boolean: (l) =>
      match(right, {
        integer: (r) => new Error("Cannot subtract boolean and integer"),
        float: (r) => new Error("Cannot subtract boolean and float"),
        text: (r) => new Error("Cannot subtract boolean and text"),
        boolean: (r) => new Error("Cannot subtract boolean and boolean"),
        identifier: (r) => new Error("Cannot subtract boolean and identifier"),
        cell: (r) => new Error("Cannot subtract boolean and cell"),
        cellRange: (r) => new Error("Cannot subtract boolean and cellRange"),
      }),
    identifier: (l) =>
      match(right, {
        integer: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getSubtraction(l, r))
              : l.value,
            l.name
          ),
        float: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getSubtraction(l, r))
              : l.value,
            l.name
          ),
        text: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getSubtraction(l, r))
              : l.value,
            l.name
          ),
        boolean: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getSubtraction(l, r))
              : l.value,
            l.name
          ),
        identifier: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getSubtraction(l, r))
              : l.value,
            l.name
          ),
        cell: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getSubtraction(l, r))
              : l.value,
            l.name
          ),
        cellRange: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getSubtraction(l, r))
              : l.value,
            l.name
          ),
      }),
    cell: (l) =>
      match(right, {
        integer: (r) =>
          Value.cell(
            getLiteralPrimOrError(getSubtraction(l.value, r)),
            l.row,
            l.column,
            l.formula
          ),
        float: (r) =>
          Value.cell(
            getLiteralPrimOrError(getSubtraction(l.value, r)),
            l.row,
            l.column,
            l.formula
          ),
        text: (r) => new Error("Cannot subtract cell and text"),
        boolean: (r) => new Error("Cannot subtract cell and boolean"),
        identifier: (r) => new Error("Cannot subtract cell and identifier"),
        cell: (r) => getLiteralOrError(getSubtraction(l, r.value)),
        cellRange: (r) => new Error("Cannot subtract cell and cellRange"),
      }),
    cellRange: (l) =>
      match(right, {
        integer: (r) => new Error("Cannot subtract cellRange and integer"),
        float: (r) => new Error("Cannot subtract cellRange and float"),
        text: (r) => new Error("Cannot subtract cellRange and text"),
        boolean: (r) => new Error("Cannot subtract cellRange and boolean"),
        identifier: (r) =>
          new Error("Cannot subtract cellRange and identifier"),
        cell: (r) => new Error("Cannot subtract cellRange and cell"),
        cellRange: (r) => new Error("Cannot subtract cellRange and cellRange"),
      }),
  });
};

const getMultiplication = (left: Value, right: Value): Error | Value => {
  return match(left, {
    integer: (l) =>
      match(right, {
        integer: (r) => Value.integer(l.value * r.value),
        float: (r) => Value.float(l.value * r.value),
        text: (r) => new Error("Cannot multiply integer and text"),
        boolean: (r) => new Error("Cannot multiply integer and boolean"),
        identifier: (r) => new Error("Cannot multiply integer and identifier"),
        cell: (r) => getLiteralOrError(getMultiplication(l, r.value)),
        cellRange: (r) => new Error("Cannot multiply integer and cellRange"),
      }),
    float: (l) =>
      match(right, {
        integer: (r) => Value.float(l.value * r.value),
        float: (r) => Value.float(l.value * r.value),
        text: (r) => new Error("Cannot multiply float and text"),
        boolean: (r) => new Error("Cannot multiply float and boolean"),
        identifier: (r) => new Error("Cannot multiply float and identifier"),
        cell: (r) => new Error("Cannot multiply float and cell"),
        cellRange: (r) => new Error("Cannot multiply float and cellRange"),
      }),
    text: (l) =>
      match(right, {
        integer: (r) => Value.text(l.value.repeat(r.value)),
        float: (r) => Value.text(l.value.repeat(r.value)),
        text: (r) => new Error("Cannot multiply text and text"),
        boolean: (r) => new Error("Cannot multiply text and boolean"),
        identifier: (r) => new Error("Cannot multiply text and identifier"),
        cell: (r) => new Error("Cannot multiply text and cell"),
        cellRange: (r) => new Error("Cannot multiply text and cellRange"),
      }),
    boolean: (l) =>
      match(right, {
        integer: (r) => new Error("Cannot multiply boolean and integer"),
        float: (r) => new Error("Cannot multiply boolean and float"),
        text: (r) => new Error("Cannot multiply boolean and text"),
        boolean: (r) => new Error("Cannot multiply boolean and boolean"),
        identifier: (r) => new Error("Cannot multiply boolean and identifier"),
        cell: (r) => new Error("Cannot multiply boolean and cell"),
        cellRange: (r) => new Error("Cannot multiply boolean and cellRange"),
      }),
    identifier: (l) =>
      match(right, {
        integer: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getMultiplication(l, r))
              : l.value,
            l.name
          ),
        float: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getMultiplication(l, r))
              : l.value,
            l.name
          ),
        text: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getMultiplication(l, r))
              : l.value,
            l.name
          ),
        boolean: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getMultiplication(l, r))
              : l.value,
            l.name
          ),
        identifier: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getMultiplication(l, r))
              : l.value,
            l.name
          ),
        cell: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getMultiplication(l, r))
              : l.value,
            l.name
          ),
        cellRange: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getMultiplication(l, r))
              : l.value,
            l.name
          ),
      }),
    cell: (l) =>
      match(right, {
        integer: (r) =>
          Value.cell(
            getLiteralPrimOrError(getMultiplication(l.value, r)),
            l.row,
            l.column,
            l.formula
          ),
        float: (r) =>
          Value.cell(
            getLiteralPrimOrError(getMultiplication(l.value, r)),
            l.row,
            l.column,
            l.formula
          ),
        text: (r) => new Error("Cannot multiply cell and text"),
        boolean: (r) => new Error("Cannot multiply cell and boolean"),
        identifier: (r) => new Error("Cannot multiply cell and identifier"),
        cell: (r) => new Error("Cannot multiply cell and cell"),
        cellRange: (r) => new Error("Cannot multiply cell and cellRange"),
      }),
    cellRange: (l) =>
      match(right, {
        integer: (r) => new Error("Cannot multiply cellRange and integer"),
        float: (r) => new Error("Cannot multiply cellRange and float"),
        text: (r) => new Error("Cannot multiply cellRange and text"),
        boolean: (r) => new Error("Cannot multiply cellRange and boolean"),
        identifier: (r) =>
          new Error("Cannot multiply cellRange and identifier"),
        cell: (r) => new Error("Cannot multiply cellRange and cell"),
        cellRange: (r) => new Error("Cannot multiply cellRange and cellRange"),
      }),
  });
};

const getDivision = (left: Value, right: Value): Error | Value => {
  return match(left, {
    integer: (l) =>
      match(right, {
        integer: (r) => Value.integer(l.value / r.value),
        float: (r) => Value.float(l.value / r.value),
        text: (r) => new Error("Cannot divide integer and text"),
        boolean: (r) => new Error("Cannot divide integer and boolean"),
        identifier: (r) => new Error("Cannot divide integer and identifier"),
        cell: (r) => getLiteralOrError(getDivision(l, r.value)),
        cellRange: (r) => new Error("Cannot divide integer and cellRange"),
      }),
    float: (l) =>
      match(right, {
        integer: (r) => Value.float(l.value / r.value),
        float: (r) => Value.float(l.value / r.value),
        text: (r) => new Error("Cannot divide float and text"),
        boolean: (r) => new Error("Cannot divide float and boolean"),
        identifier: (r) => new Error("Cannot divide float and identifier"),
        cell: (r) => new Error("Cannot divide float and cell"),
        cellRange: (r) => new Error("Cannot divide float and cellRange"),
      }),
    text: (l) =>
      match(right, {
        integer: (r) => new Error("Cannot divide text and integer"),
        float: (r) => new Error("Cannot divide text and float"),
        text: (r) => new Error("Cannot divide text and text"),
        boolean: (r) => new Error("Cannot divide text and boolean"),
        identifier: (r) => new Error("Cannot divide text and identifier"),
        cell: (r) => new Error("Cannot divide text and cell"),
        cellRange: (r) => new Error("Cannot divide text and cellRange"),
      }),
    boolean: (l) =>
      match(right, {
        integer: (r) => new Error("Cannot divide boolean and integer"),
        float: (r) => new Error("Cannot divide boolean and float"),
        text: (r) => new Error("Cannot divide boolean and text"),
        boolean: (r) => new Error("Cannot divide boolean and boolean"),
        identifier: (r) => new Error("Cannot divide boolean and identifier"),
        cell: (r) => new Error("Cannot divide boolean and cell"),
        cellRange: (r) => new Error("Cannot divide boolean and cellRange"),
      }),
    identifier: (l) =>
      match(right, {
        integer: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getDivision(l, r))
              : l.value,
            l.name
          ),
        float: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getDivision(l, r))
              : l.value,
            l.name
          ),
        text: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getDivision(l, r))
              : l.value,
            l.name
          ),
        boolean: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getDivision(l, r))
              : l.value,
            l.name
          ),
        identifier: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getDivision(l, r))
              : l.value,
            l.name
          ),
        cell: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getDivision(l, r))
              : l.value,
            l.name
          ),
        cellRange: (r) =>
          Value.identifier(
            isType(l.value, "cell")
              ? getLiteralPrimOrError(getDivision(l, r))
              : l.value,
            l.name
          ),
      }),
    cell: (l) =>
      match(right, {
        integer: (r) =>
          Value.cell(
            getLiteralPrimOrError(getDivision(l.value, r)),
            l.row,
            l.column,
            l.formula
          ),
        float: (r) =>
          Value.cell(
            getLiteralPrimOrError(getDivision(l.value, r)),
            l.row,
            l.column,
            l.formula
          ),
        text: (r) => new Error("Cannot divide cell and text"),
        boolean: (r) => new Error("Cannot divide cell and boolean"),
        identifier: (r) => new Error("Cannot divide cell and identifier"),
        cell: (r) => new Error("Cannot divide cell and cell"),
        cellRange: (r) => new Error("Cannot divide cell and cellRange"),
      }),
    cellRange: (l) =>
      match(right, {
        integer: (r) => new Error("Cannot divide cellRange and integer"),
        float: (r) => new Error("Cannot divide cellRange and float"),
        text: (r) => new Error("Cannot divide cellRange and text"),
        boolean: (r) => new Error("Cannot divide cellRange and boolean"),
        identifier: (r) => new Error("Cannot divide cellRange and identifier"),
        cell: (r) => new Error("Cannot divide cellRange and cell"),
        cellRange: (r) => new Error("Cannot divide cellRange and cellRange"),
      }),
  });
};

const getNegation = (value: Value): Error | Value => {
  return match(value, {
    integer: (val) => Value.integer(-val.value),
    float: (val) => Value.float(-val.value),
    text: () => new Error("Cannot negate a text"),
    boolean: (val) => Value.boolean(!val.value),
    identifier: () => new Error("Cannot negate an identifier"),
    cell: (val) => getNegation(val.value),
    cellRange: () => new Error("Cannot negate a cellRange"),
  });
};

// Values

// class Value {
//   value: ValueType;
//   constructor(value: ValueType) {
//     this.value = value;
//   }
//   set(value: ValueType) {
//     this.value = value;
//   }
//   get(): ValueType {
//     return this.value;
//   }
// }

// class FloatValue extends Value {}

// class BooleanValue extends Value {}

// class IntValue extends Value {}

// class TextValue extends Value {}

// class IdentifierValue extends Value {
//   name: string;
//   constructor(value: ValueType, name: string) {
//     super(value);
//     this.name = name;
//   }
// }

// class CellValue extends Value {
//   row: number;
//   column: string;
//   formula: string;
//   constructor(value: ValueType, row: number, column: string, formula: string) {
//     super(value);
//     this.row = row;
//     this.column = column;
//     this.formula = formula;
//   }
// }

// class CellRangeValue extends Value {
//   cells: CellValue[];
//   constructor(cells: CellValue[]) {
//     super(cells[0]?.get() ?? "");
//     this.cells = cells;
//   }
//   get() {
//     return this.cells[0]?.get();
//   }
// }

// type ValueTypes =
//   | FloatValue
//   | IntValue
//   | BooleanValue
//   | TextValue
//   | IdentifierValue
//   | CellValue
//   | CellRangeValue;
