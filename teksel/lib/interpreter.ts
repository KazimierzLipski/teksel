import { ErrorType, InterpreterError } from "./error-types";
import {
  AddExpression,
  AndExpression,
  ArgumentList,
  Assignment,
  AssignmentMinusEquals,
  AssignmentPlusEquals,
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

// export class VariableManager -> zarządza scopami i call contekstów
export class VariableManager {
  scopes: Scope[] = [];
  callContexts: any[] = [];

  onBlockEntry() {
    this.scopes.push(new Scope(new Map()));
  }

  onBlockExit() {
    this.scopes.pop();
  }

  onFunctionEntry() {
    this.callContexts.push(new Map());
  }

  onFunctionExit() {
    this.callContexts.pop();
  }

  getVariable(name: string) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const scope = this.scopes[i];
      if (scope.variables.has(name)) {
        return scope.variables.get(name);
      }
    }
  }

  setVariable(name: string, value: any) {
    this.scopes[this.scopes.length - 1].variables.set(name, value);
  }
}

export class Scope {
  variables: Map<string, any>;

  constructor(variables: Map<string, any>) {
    this.variables = new Map(variables);
  }
}

export class Interpreter implements IVisitor {
  functionsDefinitions: Map<string, FunctionDefinition> = new Map();

  setCells() {
    let newCells: Value<"cell">[][] = [];
    const ROW_MAX = 100;
    const COL_MAX = 26;
    for (let row = 0; row < ROW_MAX; row++) {
      let newRow = [];
      for (let col = 0; col < COL_MAX; col++) {
        newRow.push(Value.cell("", row, String.fromCharCode(col + 65), ""));
      }
      newCells.push(newRow);
    }
    return newCells;
  }

  cells: Value<"cell">[][] = this.setCells();

  varManager = new VariableManager();

  isReturning: boolean = false;

  prevRanFuncName: string = "";
  recursionDepthCounter: number = 0;

  lastCalculation: Value | undefined = undefined;

  argumentList: Value[] = [];

  inAssignment: boolean = false;

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
      console.log(this.functionsDefinitions);
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
      console.log("RETURN VAL PROG:", this.lastCalculation?.get());
    } catch (e) {
      console.log(e);
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
    const argumentsList = args?.arguments;

    if (argumentsList?.length !== params?.length) {
      throw new InterpreterError(
        ErrorType.E_ValueError,
        position,
        `Expected ${params?.length} arguments, got ${argumentsList?.length}`
      );
    }
    if (
      argumentsList === undefined ||
      params === undefined ||
      args === undefined
    )
      return evaluatedArgs;
    for (let i = 0; i < argumentsList.length; i++) {
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
    const scopeVars = funDef.scope?.variables;
    scopeVars?.forEach((value, key) => {
      funcVars.set(key, value);
    });
    for (const [key, value] of evaluatedArgs) {
      funcVars.set(key, value);
    }

    this.checkRecursionLimit(funDef.identifier, funCall.position);

    this.isReturning = false;
    funDef.block.accept(this);
    console.log("RETURN VAL:", this.lastCalculation);
  }

  visitFunctionDefinition(element: FunctionDefinition) {
    const argumentList = this.argumentList;
    if (argumentList.length !== element.parametersList.length)
      throw new InterpreterError(
        ErrorType.E_TypeError,
        element.position,
        `The number of arguments and parameters is incorrect`
      );
    const funcName = element.identifier;
    if (this.functionsDefinitions.has(funcName)) {
      throw new InterpreterError(
        ErrorType.E_TypeError,
        element.position,
        `Name ${funcName} is shadowing builtin function`
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
    this.varManager.onFunctionEntry();
    element.argumentList?.accept(this);
    this.runFunction(funDef, element);
    this.varManager.onFunctionExit();
  }
  visitBlock(element: Block) {
    this.varManager.onBlockEntry();
    for (const stmt of element.anyStatements) {
      if (typeof stmt === "string") continue;
      stmt.accept(this);
      if (this.isReturning) {
        console.log("I MUST RETURN THIS blocc:", this.lastCalculation);
        return;
      }
    }
    this.varManager.onBlockExit();
  }

  visitReturnStatement(element: ReturnStatement) {
    element.referent?.accept(this);
    this.isReturning = true;
    console.log("I MUST RETURN THIS:", this.lastCalculation);
  }

  visitIfStatement(element: IfStatement) {
    element.condition.accept(this);
    const condition = this.lastCalculation?.get();
    if (condition) {
      this.visitBlock(element.block);
      if (this.isReturning) return;
    } else if (element.elseBlock !== undefined) {
      this.visitBlock(element.elseBlock);
      if (this.isReturning) return;
    }
  }
  visitUseStatement(element: UseStatement) {
    element.checkExpression.accept(this);
    const checkExpression = this.lastCalculation?.get();
    element.trueExpression.accept(this);
    const trueExpression: Value | undefined = this.lastCalculation;
    console.log("CHECK EXPRESSION:", checkExpression);
    console.log("TRUE EXPRESSION:", trueExpression);
    if (checkExpression === true && trueExpression !== undefined) {
      this.lastCalculation = getLiteral(trueExpression);
    }
    element.trueExpression.accept(this);
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
  visitForEachStatement(element: ForEachStatement) {
    element.expression.accept(this);
    let expr: Value | undefined = this.lastCalculation;
    let iterable: string | Value<"cell">[] | undefined;
    if (isType(expr, "cellRange")) {
      iterable = expr.cells;
    }
    if (
      isType(expr, "integer") ||
      isType(expr, "float") ||
      isType(expr, "boolean") ||
      isType(expr, "cell") ||
      isType(expr, "identifier")
    ) {
      throw new InterpreterError(
        ErrorType.E_TypeError,
        element.position,
        "Iterable must be a list"
      );
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
    console.log("ITERABLE:", iterable);
    if (iterable.length) {
      for (const element of iterable) {
        const cell = element;
        this.varManager.setVariable(iterableName, cell);
        console.log("iterableName:", iterableName);
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
    // if (this.lastCalculation === undefined) {
    // }
    // this.currentScope.variables.set(left, result);
  }
  visitAssignmentPlusEquals(element: AssignmentPlusEquals) {
    element.assignee.accept(this);
    const prevValue = this.lastCalculation?.get();
    element.assigned.accept(this);
    const assigned = this.lastCalculation?.get();
    if (typeof prevValue === "number" && typeof assigned === "number") {
      this.lastCalculation = Value.integer(prevValue + assigned);
    } else if (typeof prevValue === "string" && typeof assigned === "string") {
      this.lastCalculation = Value.text(prevValue + assigned);
    } else {
      throw new InterpreterError(
        ErrorType.E_TypeError,
        element.position,
        `Operands for + cannot have these types ${typeof prevValue} ${typeof assigned}`
      );
    }
    this.inAssignment = true;
    element.assignee.accept(this);
    this.inAssignment = false;
  }
  visitAssignmentMinusEquals(element: AssignmentMinusEquals) {
    throw new Error("visitAssignmentMinusEquals method not implemented.");
  }
  visitExpression(expression: Expression) {
    return expression.accept(this);
  }
  visitOrExpression(element: OrExpression) {
    throw new Error("visitExpression Method not implemented.");
  }
  visitAndExpression(element: AndExpression) {
    throw new Error("visitAndExpression Method not implemented.");
  }
  visitLessThanExpression(element: LessThanExpression) {
    throw new Error("visitLessThanExpression Method not implemented.");
  }
  visitLessThanOrEqualExpression(element: LessThanOrEqualExpression) {
    throw new Error("visitLessThanOrEqualExpression Method not implemented.");
  }
  visitEqualExpression(element: EqualExpression) {
    element.leftExpression.accept(this);
    const left = this.lastCalculation?.get();
    element.rightExpression.accept(this);
    const right = this.lastCalculation?.get();
    this.lastCalculation = Value.boolean(left === right);
  }
  visitNotEqualExpression(element: NotEqualExpression) {
    throw new Error("visitNotEqualExpression Method not implemented.");
  }
  visitGreaterThanOrEqualExpression(element: GreaterThanOrEqualExpression) {
    throw new Error(
      "visitGreaterThanOrEqualExpression Method not implemented."
    );
  }
  visitGreaterThanExpression(element: GreaterThanExpression) {
    throw new Error("visitGreaterThanExpression Method not implemented.");
  }
  visitAddExpression(element: AddExpression) {
    element.leftExpression.accept(this);
    const left = this.lastCalculation?.get();
    element.rightExpression.accept(this);
    const right = this.lastCalculation?.get();
    if (left === undefined || right === undefined)
      throw new InterpreterError(
        ErrorType.E_ValueError,
        element.position,
        "Some expression is undefined"
      );
    console.log("LEFT:", left, "RIGHT:", right);
    console.log("TYPEOF LEFT:", typeof left, "TYPEOF RIGHT:", typeof right);
    console.log("IS NUMBER:", typeof left === "number", typeof right === "number");
    if (typeof left === "number" && typeof right === "number")
      this.lastCalculation = Value.integer(left + right);
    else if (typeof left === "string" && typeof right === "string") {
      this.lastCalculation = Value.text(left + right);
    }
    else this.throwOperandTypesError(left, right, "+", element.position);
  }
  visitSubtractExpression(element: SubtractExpression) {
    throw new Error("visitSubtractExpression Method not implemented.");
  }
  visitMultiplyExpression(element: MultiplyExpression) {
    element.leftExpression.accept(this);
    let left = this.lastCalculation?.get();
    element.rightExpression.accept(this);
    let right = this.lastCalculation?.get();
    if (left === undefined || right === undefined)
      throw new InterpreterError(
        ErrorType.E_ValueError,
        element.position,
        "Some expression is undefined"
      );

    if (typeof left === "number" && typeof right === "number") {
      this.lastCalculation = Value.integer(left + right);
    }
    else if (typeof left === "string" && typeof right === "number") {
      let result = "";
      for (let i = 0; i < right; i++) {
        result += right;
      }
      this.lastCalculation = Value.text(result);
    }
    else if (typeof left === "number" && typeof right === "string") {
      let result = "";
      for (let i = 0; i < left; i++) {
        result += right;
      }
      this.lastCalculation = Value.text(result);
    }
    else this.throwOperandTypesError(left, right, "*", element.position);
  }
  visitDivideExpression(element: DivideExpression) {
    throw new Error("visitDivideExpression Method not implemented.");
  }
  visitNegateExpression(element: NegateExpression) {
    throw new Error("visitNegateExpression Method not implemented.");
  }
  visitFormulaAttribute(element: AttributeFormula) {
    if (this.inAssignment) {
      this.inAssignment = false;
    } else {
      element.expression.accept(this);
      if (isType(this.lastCalculation, "cell")) {
        this.lastCalculation = Value.text(this.lastCalculation.formula);
      }
    }
  }
  visitValueAttribute(element: AttributeValue) {
    if (this.inAssignment) {
      this.inAssignment = false;
    } else {
      element.expression.accept(this);
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
    this.lastCalculation = Value.cellRange(listOfCells[0].get(), listOfCells);
  }

  letterToColumn(letter: string) {
    return letter.charCodeAt(0) - 65;
  }
  visitCell(element: Cell) {
    let cell = this.cells[element.row][this.letterToColumn(element.column)];
    if (this.inAssignment) {
      cell.set(this.lastCalculation?.get()!);
      this.inAssignment = false;
    } else {
      this.lastCalculation = cell;
    }
  }
  visitIdentifier(element: Identifier) {
    if (this.inAssignment) {
      // NOSONAR
      // const value = this.varManager.getVariable(element.name);
      // if (value !== undefined) {
      //   value.set(this.lastCalculation);
      //   this.inAssignment = false;
      // } else {
      //   this.varManager.setVariable(element.name, this.lastCalculation);
      //   this.inAssignment = false;
      // }
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

type ValueType = string | number | boolean;

export type ValuePrim<T extends TypeNames<typeof ValuePrim> = undefined> =
  VariantOf<typeof ValuePrim, T>;

export type ValueComp<T extends TypeNames<typeof ValueComp> = undefined> =
  VariantOf<typeof ValueComp, T>;

const ValuePrim = variantModule({
  integer: (value: number) => ({
    value,
    get: () => value,
    set: (v: number) => (value = v),
  }),
  float: (value: number) => ({
    value,
    get: () => value,
    set: (v: number) => (value = v),
  }),
  text: (value: string) => ({
    value,
    get: () => value,
    set: (v: string) => (value = v),
  }),
  boolean: (value: boolean) => ({
    value,
    get: () => value,
    set: (v: boolean) => (value = v),
  }),
});

const ValueComp = variantModule({
  identifier: (value: ValueType, name: string) => ({
    value,
    name,
    get: () => value,
    set: (v: any) => (value = v),
  }),
  cell: (value: ValueType, row: number, column: string, formula: string) => ({
    value,
    row,
    column,
    formula,
    get: () => value,
    set: (v: any) => (value = v),
  }),
});

export type Value<T extends TypeNames<typeof Value> = undefined> = VariantOf<
  typeof Value,
  T
>;

const Value = variantModule({
  ...variantList([
    ValueComp.cell,
    ValueComp.identifier,
    ValuePrim.boolean,
    ValuePrim.float,
    ValuePrim.integer,
    ValuePrim.text,
  ]),
  cellRange: (value: ValueType, cells: ValueComp<"cell">[]) => ({
    cells,
    value,
    get: () => cells[0].get(),
    set: (cells: any) => (cells = cells),
  }),
});

const getLiteral = (value: Value) => {
  return match(value, {
    integer: (val) => Value.integer(val.get()),
    float: (val) => Value.float(val.get()),
    text: (val) => Value.text(val.get()),
    boolean: (val) => undefined,
    identifier: (val) => undefined,
    cell: (val) => undefined,
    cellRange: (val) => undefined,
  });
};