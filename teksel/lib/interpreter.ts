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

// export class VariableManager -> zarządza scopami i call contekstów

export class Scope {
  nestedScope: Scope | undefined;
  parentScope: Scope | null;
  variables: Map<string, any>;

  constructor(variables: Map<string, any>, parentScope: Scope | null = null) {
    this.variables = new Map(variables);
    this.parentScope = parentScope;
  }

  createNestedScope(variables: Map<string, any>): Scope {
    const newScope = new Scope(variables, this);
    this.nestedScope = newScope;
    return newScope;
  }

  getVariable(name: string): any {
    if (this.variables.has(name)) {
      return this.variables.get(name);
    }
    if (this.parentScope !== undefined) {
      const variable = this.parentScope?.getVariable(name);
      if (variable !== undefined) {
        return variable;
      }
    }
    return undefined;
  }
}

export class Interpreter implements IVisitor {
  functionsDefinitions: Map<string, FunctionDefinition> = new Map();
  typeDefinitions: Map<string, any> = new Map();

  setCells() {
    let newRows = [];
    let newCells = [];
    const N = 99;
    const M = 26;
    for (let i = 0; i < N; i++) {
      newRows.push([]);
    }
    for (let j = 0; j < M; j++) {
      newCells.push(newRows);
    }
  }

  cells = this.setCells();

  currentScope: Scope = new Scope(new Map());
  prevScope: Scope | undefined = undefined;

  isReturning: boolean = false;

  prevRanFuncName: string = "";
  recursionDepthCounter: number = 0;

  lastCalculation?: string | number | boolean | (string | number | boolean)[] =
    undefined;

    inAssignment: boolean = false;

  tryGetFromDict(dict: Map<string, any>, member: string, position: Position) {
    if (dict.has(member)) {
      return dict.get(member);
    }
    throw new InterpreterError(
      ErrorType.E_ValueError,
      position,
      `${member} is undefined`
    );
  }

  createNestedScope(vars: Map<string, any>) {
    this.currentScope = this.currentScope.createNestedScope(vars);
  }

  deleteCurrentScope() {
    if (this.currentScope.parentScope === null) return;
    this.currentScope = this.currentScope.parentScope;
    this.currentScope.nestedScope = undefined;
  }

  evaluateBlock(block: any, vars: Map<string, any>) {}

  lookForVariable(identifier: string) {
    const variable = this.currentScope.getVariable(identifier);
    return variable;
  }

  findVariableOrThrow(identifier: string, position: any) {
    const variable = this.lookForVariable(identifier);
    if (variable) {
      return variable;
    }
    throw new InterpreterError(
      ErrorType.E_NameError,
      position,
      `NameError: name '${identifier}' is not defined`
    );
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
      const evalArg = arg.accept(this).value ?? { value: undefined };

      evaluatedArgs.set(param, {
        position: args.position,
        name: param,
        value: evalArg,
      });
    }

    return evaluatedArgs;
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
    // const definitions = Array.from(element.definitions.values());
    // for (let i = 0; i < definitions.length; i++) {
    //   const stmt = definitions[i];
    //   const result = stmt.accept(this);
    //   if (this.isReturning) {
    //     if (result !== undefined) {
    //       return { value: result };
    //     }
    //     return;
    //   }
    // }

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
      const returnVal = new FunctionCall(
        mainFuncDef?.position,
        "main",
        new ArgumentList(mainFuncDef?.position, [])
      ).accept(this).value;
      console.log("RETURN VAL PROG:", returnVal);
      return returnVal === undefined ? null : returnVal;
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
    const returnVal = this.evaluateBlock(funDef.block, funcVars).value;
    console.log("RETURN VAL:", returnVal);

    return { value: returnVal };
  }

  visitFunctionDefinition(element: FunctionDefinition) {
    const argumentList = this.lastCalculation;
    if ((argumentList as any[])?.length !== element.parametersList.length)
      throw new InterpreterError(
        ErrorType.E_TypeError,
        element.position,
        `The number of arguments and parameters is incorrect`
      );
    // this.manager.onFunctionEntry()
    const funcName = element.identifier;
    if (this.functionsDefinitions.has(funcName)) {
      throw new InterpreterError(
        ErrorType.E_TypeError,
        element.position,
        `Name ${funcName} is shadowing builtin function`
      );
    }
    element.scope = this.currentScope;
    this.functionsDefinitions.set(funcName, element);
    // this.manager.onFunctionExit()
  }
  visitArgumentList(element: ArgumentList) {
    throw new Error("visitArgumentList method not implemented.");
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
    // wyliczyć wszystkie arumenty i wrzucić do tablicy
    // przypisać do this.lastCalculation
    funDef.accept(this);
  }
  visitBlock(element: Block) {
    // this.createNestedScope(vars);
    // this.manager.onBlockEntry
    for (const stmt of element.anyStatements) {
      if (typeof stmt === "string") continue;
      let value = stmt.accept(this);
      if (value && value.value) {
        value = value.value;
      }
      if (this.isReturning) {
        console.log("I MUST RETURN THIS blocc:", value);
        return { value: value };
      }
    }
    // this.deleteCurrentScope();
    this.lastCalculation = value;
    // this.manager.onBlockExit
    // return { value };
  }

  visitReturnStatement(element: ReturnStatement) {
    let value = element.referent?.accept(this);
    this.isReturning = true;
    if (value.value) {
      value = value.value;
    }
    console.log("I MUST RETURN THIS:", value);
    return { value: value };
  }

  visitIfStatement(element: IfStatement) {
    const condition = element.condition.accept(this);
    if (condition) {
      const value = this.evaluateBlock(element.block, new Map());
      if (this.isReturning) {
        return { value };
      }
    } else if (element.elseBlock !== undefined) {
      const value = this.evaluateBlock(element.elseBlock, new Map());
      if (this.isReturning) {
        return { value };
      }
    }
  }
  visitUseStatement(element: UseStatement) {
    const checkExpression = element.checkExpression.accept(this).value;
    const trueExpression = element.trueExpression.accept(this).value;
    console.log("CHECK EXPRESSION:", checkExpression);
    console.log("TRUE EXPRESSION:", trueExpression);
    if (checkExpression === true) {
      return { value: trueExpression };
    }
    return { value: element.falseExpression.accept(this).value };
  }
  visitForEachStatement(element: ForEachStatement) {
    const iterable = element.expression.accept(this).value;
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
      for (let i = 0; i < iterable.length; i++) {
        const cell = iterable[i];
        this.currentScope.variables.set(iterableName, cell);
        console.log("iterableName:", iterableName);
        console.log(this.currentScope);
        const value = this.evaluateBlock(
          block,
          new Map([[iterableName, cell]])
        ).value;
        if (this.isReturning) {
          return { value: value };
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
    if (this.lastCalculation === undefined){
      throw new InterpreterError(
        ErrorType.E_NameError,
        element.position,
        `Right side must have value`
      );
    }
    this.inAssignment = true;
    element.assignee.accept(this);
    this.inAssignment = false;
    if (this.lastCalculation === undefined) {}
    // a = 1
    // A10.value = 1
    // a.b() = 1
    // a() = 1
    this.currentScope.variables.set(left, result);
  }
  visitAssignmentPlusEquals(element: AssignmentPlusEquals) {
    const left = element.assignee.accept(this).name;
    const leftValue = this.currentScope.getVariable(left);
    if (leftValue === undefined) {
      throw new InterpreterError(
        ErrorType.E_NameError,
        element.position,
        `NameError: name '${left}' is not defined`
      );
    }
    const assigned = element.assigned.accept(this).value;
    if (typeof leftValue === "number" && typeof assigned === "number") {
      this.currentScope.parentScope?.variables.set(left, leftValue + assigned);
    } else if (typeof leftValue === "string" && typeof assigned === "string") {
      this.currentScope.parentScope?.variables.set(left, leftValue + assigned);
    } else {
      throw new InterpreterError(
        ErrorType.E_TypeError,
        element.position,
        `Operands for + cannot have these types ${typeof leftValue} ${typeof assigned}`
      );
    }
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
    const left = element.leftExpression.accept(this).value;
    const right = element.rightExpression.accept(this).value;
    return { value: left === right };
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
    const left = element.leftExpression.accept(this).value;
    const right = element.rightExpression.accept(this).value;
    if (left === undefined || right === undefined)
      throw new InterpreterError(
        ErrorType.E_ValueError,
        element.position,
        "Some expression is undefined"
      );

    if (typeof left === "number" && typeof right === "number")
      return { value: left + right };

    if (typeof left === "string" && typeof right === "string") {
      return { value: left + right };
    }
    this.throwOperandTypesError(left, right, "+", element.position);
  }
  visitSubtractExpression(element: SubtractExpression) {
    throw new Error("visitSubtractExpression Method not implemented.");
  }
  visitMultiplyExpression(element: MultiplyExpression) {
    const left = element.leftExpression.accept(this).value;
    const right = element.rightExpression.accept(this).value;
    if (left === undefined || right === undefined)
      throw new InterpreterError(
        ErrorType.E_ValueError,
        element.position,
        "Some expression is undefined"
      );

    if (typeof left === "number" && typeof right === "number") {
      return left * right;
    }
    if (typeof left === "string" && typeof right === "number") {
      let result = "";
      for (let i = 0; i < right; i++) {
        result += right;
      }
      return result;
    }
    if (typeof left === "number" && typeof right === "string") {
      let result = "";
      for (let i = 0; i < left; i++) {
        result += right;
      }
      return result;
    }
    this.throwOperandTypesError(left, right, "*", element.position);
  }
  visitDivideExpression(element: DivideExpression) {
    throw new Error("visitDivideExpression Method not implemented.");
  }
  visitNegateExpression(element: NegateExpression) {
    throw new Error("visitNegateExpression Method not implemented.");
  }
  visitFormulaAttribute(element: AttributeFormula) {
    throw new Error("visitFormulaAttribute Method not implemented.");
  }
  visitValueAttribute(element: AttributeValue) {
    if (this.inAssignment){
      this.inAssignment = false;
    } else {

    }
  }
  visitCellRange(element: CellRange) {
    let start = element.start.accept(this);
    let end = element.end.accept(this);
    let listOfCells = [];
    if (start === undefined || end === undefined)
      throw new InterpreterError(
        ErrorType.E_ValueError,
        element.position,
        "Some expression is undefined"
      );
    for (let i = start.row; i <= end.row; i++) {
      for (
        let j = start.column.charCodeAt(0);
        j <= end.column.charCodeAt(0);
        j++
      ) {
        listOfCells.push({ row: i, column: String.fromCharCode(j) });
      }
    }
    return { value: listOfCells };
  }
  visitCell(element: Cell) {
    const value = this.currentScope.getVariable(
      element.column + String(element.row)
    );
    return { value: value, row: element.row, column: element.column };
  }
  visitIdentifier(element: Identifier) {
    if (this.inAssignment){
      const value = this.currentScope.getVariable(element.name);
      if (value !== undefined){
        value.set(this.lastCalculation)
        this.inAssignment = false;
      } else {
        this.currentScope.setVariable(element.name, this.lastCalculation)
        this.inAssignment = false;
      }
    } else {
      this.lastCalculation = this.currentScope.getVariable(element.name)
    }
  }
  visitText(element: TextLiteral) {
    return { value: element.value };
  }
  visitFloat(element: FloatLiteral) {
    this.lastCalculation = new FloatValue(element.value);
  }
  visitInteger(element: IntegerLiteral) {
    this.lastCalculation = new IntValue(element.value);
  }
}

// Values
class IntValue{
    value?: number
    constructor(value: number) {
      this.set(value);
    }
    set(value: number) {
      this.value = value;
    }
    get() {
      return this.value
    }
  }

// Value -> CellValue, IntValue...
const vars = new Map<string, any>([
  ["count", new IntValue(0)],
  [
    "A2",
    { set: () => {}, get: () => {}, value: 0, rowValue: 2, columnValue: "A" },
  ],
]);
