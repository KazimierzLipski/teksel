import { Scope } from "./interpreter";
import { Position } from "./token";

interface IVisitable {
  accept(visitor: IVisitor): void;
}

interface IVisitor {
  visitProgram(element: Program): void;
  visitFunctionDefinition(element: FunctionDefinition): void;
  visitArgumentList(element: ArgumentList): void;
  visitFunctionCall(element: FunctionCall): void;
  visitBlock(element: Block): void;
  visitReturnStatement(element: ReturnStatement): void;
  visitIfStatement(element: IfStatement): void;
  visitUseStatement(element: UseStatement): void;
  visitForEachStatement(element: ForEachStatement): void;
  visitAssignment(element: Assignment): void;
  visitAssignmentPlusEquals(element: AssignmentPlusEquals): void;
  visitAssignmentMinusEquals(element: AssignmentMinusEquals): void;
  visitOrExpression(element: OrExpression): void;
  visitAndExpression(element: AndExpression): void;
  visitLessThanExpression(element: LessThanExpression): void;
  visitLessThanOrEqualExpression(element: LessThanOrEqualExpression): void;
  visitEqualExpression(element: EqualExpression): void;
  visitNotEqualExpression(element: NotEqualExpression): void;
  visitGreaterThanOrEqualExpression(
    element: GreaterThanOrEqualExpression
  ): void;
  visitGreaterThanExpression(element: GreaterThanExpression): void;
  visitAddExpression(element: AddExpression): void;
  visitSubtractExpression(element: SubtractExpression): void;
  visitMultiplyExpression(element: MultiplyExpression): void;
  visitDivideExpression(element: DivideExpression): void;
  visitNegateExpression(element: NegateExpression): void;
  visitFormulaAttribute(element: AttributeFormula): void;
  visitValueAttribute(element: AttributeValue): void;
  visitCellRange(element: CellRange): void;
  visitCell(element: Cell): void;
  visitIdentifier(element: Identifier): void;
  visitText(element: TextLiteral): void;
  visitFloat(element: FloatLiteral): void;
  visitInteger(element: IntegerLiteral): void;
}

class ProgramPrinter implements IVisitor {
  private printBinaryExpression(element: BinaryExpression, operation: string) {
    console.log(operation, ": ");
    console.log("Left:");
    element.leftExpression.accept(this);
    console.log("Right:");
    element.rightExpression.accept(this);
  }
  private printAssignment(element: Assignment, operation: string) {
    console.log(`${operation}:`);
    console.log("Left, the expression to be assigned to:");
    element.assignee.accept(this);
    console.log("Right, the assigned expression:");
    element.assigned.accept(this);
  }
  public visitProgram(element: Program): void {
    console.log("Program: ");
    element.definitions.forEach((definition) => {
      definition.accept(this);
    });
  }
  public visitFunctionDefinition(element: FunctionDefinition): void {
    console.log("FunctionDefinition: ");
    console.log(`Identifier: ${element.identifier}`);
    console.log(`Parameters: ${element.parametersList}`);
    console.log("Block: ");
    element.block.accept(this);
  }
  public visitArgumentList(element: ArgumentList): void {
    console.log("ArgumentList:");
    element.arguments.forEach((argument) => {
      console.log("Argument: ");
      argument.accept(this);
    });
  }
  public visitFunctionCall(element: FunctionCall): void {
    console.log(`FunctionCall:`);
    console.log(`Identifier: ${element.identifier}`);
    element.argumentList?.accept(this);
  }
  public visitBlock(element: Block): void {
    console.log("Block:");
    element.anyStatements.forEach((statement) => {
      console.log("Statement: ");
      if (typeof statement === "string") console.log(statement);
      else statement.accept(this);
    });
  }
  public visitReturnStatement(element: ReturnStatement): void {
    console.log("ReturnStatement: ");
    console.log("Expression: ");
    element.referent?.accept(this);
  }
  public visitIfStatement(element: IfStatement): void {
    console.log("IfStatement: ");
    console.log("Condition: ");
    element.condition.accept(this);
    console.log("Block: ");
    element.block.accept(this);
    console.log("ElseBlock: ");
    element.elseBlock?.accept(this);
  }
  public visitUseStatement(element: UseStatement): void {
    console.log("UseStatement: ");
    console.log("CheckExpression: ");
    element.checkExpression.accept(this);
    console.log("TrueExpression: ");
    element.trueExpression.accept(this);
    console.log("FalseExpression: ");
    element.falseExpression.accept(this);
  }
  public visitForEachStatement(element: ForEachStatement): void {
    console.log("ForEachStatement: ");
    console.log(`Identifier: ${element.identifier}`);
    console.log("Expression: ");
    element.expression.accept(this);
    console.log("Block: ");
    element.block.accept(this);
  }
  public visitAssignment(element: Assignment): void {
    this.printAssignment(element, "Assignment");
  }
  public visitAssignmentPlusEquals(element: AssignmentPlusEquals): void {
    this.printAssignment(element, "AssignmentPlusEquals");
  }
  public visitAssignmentMinusEquals(element: AssignmentMinusEquals): void {
    this.printAssignment(element, "AssignmentMinusEquals");
  }
  public visitExpression(element: Expression): void {
    console.log("Expression: ");
    element.accept(this);
  }
  public visitOrExpression(element: OrExpression): void {
    this.printBinaryExpression(element, "OrExpression");
  }
  public visitAndExpression(element: AndExpression): void {
    this.printBinaryExpression(element, "AndExpression");
  }
  public visitLessThanExpression(element: LessThanExpression): void {
    this.printBinaryExpression(element, "LessThanExpression");
  }
  public visitLessThanOrEqualExpression(
    element: LessThanOrEqualExpression
  ): void {
    this.printBinaryExpression(element, "LessThanOrEqualExpression");
  }
  public visitEqualExpression(element: EqualExpression): void {
    this.printBinaryExpression(element, "EqualExpression");
  }
  public visitNotEqualExpression(element: NotEqualExpression): void {
    this.printBinaryExpression(element, "NotEqualExpression");
  }
  public visitGreaterThanOrEqualExpression(
    element: GreaterThanOrEqualExpression
  ): void {
    this.printBinaryExpression(element, "GreaterThanOrEqualExpression");
  }
  public visitGreaterThanExpression(element: GreaterThanExpression): void {
    this.printBinaryExpression(element, "GreaterThanExpression");
  }

  public visitAddExpression(element: AddExpression): void {
    console.log(`This is an AddExpression`);
    this.printBinaryExpression(element, "AddExpression");
  }
  public visitSubtractExpression(element: SubtractExpression): void {
    this.printBinaryExpression(element, "SubtractExpression");
  }

  public visitMultiplyExpression(element: MultiplyExpression): void {
    this.printBinaryExpression(element, "MultiplyExpression");
  }
  public visitDivideExpression(element: DivideExpression): void {
    this.printBinaryExpression(element, "DivideExpression");
  }
  public visitNegateExpression(element: NegateExpression): void {
    console.log(`NegateExpression: `);
    element.expression.accept(this);
  }
  public visitFormulaAttribute(element: AttributeFormula): void {
    console.log(`AttributeFormula: `);
    console.log(element.expression.accept(this));
  }
  public visitValueAttribute(element: AttributeValue): void {
    console.log(`AttributeValue: `);
    element.expression.accept(this);
  }
  public visitCellRange(element: CellRange): void {
    console.log(`Range:`);
    console.log(`Start:`);
    element.start.accept(this);
    console.log(`End:`);
    element.end.accept(this);
  }
  public visitCell(element: Cell): void {
    console.log(`Cell: `);
    console.log(`Row: ${element.row}`);
    console.log(`Column: ${element.column}`);
  }
  public visitIdentifier(element: Identifier): void {
    console.log(`Identifier: `);
    console.log(`${element.name}`);
  }
  public visitInteger(element: IntegerLiteral): void {
    console.log(`Int, val: ${element.value}`);
  }
  public visitText(element: TextLiteral): void {
    console.log(`Text, val: ${element.value}`);
  }
  public visitFloat(element: FloatLiteral): void {
    console.log(`Float, val: ${element.value}`);
  }
}

const visitor1 = new ProgramPrinter();

export class ASTNode {
  position: Position | undefined;

  constructor(position: Position | undefined) {
    this.position = position;
  }
}

export class Program implements IVisitable {
  definitions: Map<string, FunctionDefinition>;
  constructor(definitions: Map<string, FunctionDefinition>) {
    this.definitions = definitions;
  }
  accept(visitor: IVisitor): void {
    visitor.visitProgram(this);
  }
}

export class FunctionDefinition extends ASTNode implements IVisitable {
  identifier: string;
  parametersList: string[];
  block: Block;
  scope: Scope | undefined;

  constructor(
    position: Position | undefined,
    identifier: string,
    parametersList: string[],
    block: Block
  ) {
    super(position);
    this.identifier = identifier;
    this.parametersList = parametersList;
    this.block = block;
  }
  accept(visitor: IVisitor): void {
    visitor.visitFunctionDefinition(this);
  }
}

export class ArgumentList extends ASTNode implements IVisitable {
  arguments: Expression[];
  constructor(position: Position | undefined, _arguments: Expression[]) {
    super(position);
    this.arguments = _arguments;
  }
  accept(visitor: IVisitor): void {
    visitor.visitArgumentList(this);
  }
}

export class FunctionCall extends ASTNode implements IVisitable {
  identifier: string;
  argumentList: ArgumentList | undefined;
  constructor(
    position: Position | undefined,
    identifier: string,
    argumentList: ArgumentList | undefined
  ) {
    super(position);
    this.identifier = identifier;
    this.argumentList = argumentList;
  }
  accept(visitor: IVisitor): void {
    visitor.visitFunctionCall(this);
  }
}

export class Block extends ASTNode implements IVisitable {
  anyStatements: (
    | Assignment
    | IfStatement
    | ForEachStatement
    | string
    | ReturnStatement
  )[];
  constructor(
    position: Position | undefined,
    anyStatements: (
      | Assignment
      | IfStatement
      | ForEachStatement
      | string
      | ReturnStatement
    )[]
  ) {
    super(position);
    this.anyStatements = anyStatements;
  }
  accept(visitor: IVisitor): void {
    visitor.visitBlock(this);
  }
}

export class ReturnStatement extends ASTNode implements IVisitable {
  referent: Expression | undefined;
  constructor(
    position: Position | undefined,
    referent: Expression | undefined = undefined
  ) {
    super(position);
    this.referent = referent;
  }
  accept(visitor: IVisitor): void {
    visitor.visitReturnStatement(this);
  }
}

export class IfStatement extends ASTNode implements IVisitable {
  condition: Expression;
  block: Block;
  elseBlock: Block | undefined;
  constructor(
    position: Position | undefined,
    condition: Expression,
    block: Block,
    elseBlock: Block | undefined
  ) {
    super(position);
    this.condition = condition;
    this.block = block;
    this.elseBlock = elseBlock;
  }
  accept(visitor: IVisitor): void {
    visitor.visitIfStatement(this);
  }
}

export class UseStatement extends ASTNode implements IVisitable {
  checkExpression: Expression;
  trueExpression: Expression;
  falseExpression: Expression;
  constructor(
    position: Position | undefined,
    checkExpression: Expression,
    trueExpression: Expression,
    falseExpression: Expression
  ) {
    super(position);
    this.checkExpression = checkExpression;
    this.trueExpression = trueExpression;
    this.falseExpression = falseExpression;
  }
  accept(visitor: IVisitor): void {
    visitor.visitUseStatement(this);
  }
}

export class ForEachStatement extends ASTNode implements IVisitable {
  identifier: string;
  expression: Expression;
  block: Block;
  constructor(
    position: Position | undefined,
    identifier: string,
    expression: Expression,
    block: Block
  ) {
    super(position);
    this.identifier = identifier;
    this.expression = expression;
    this.block = block;
  }
  accept(visitor: IVisitor): void {
    visitor.visitForEachStatement(this);
  }
}

export type Assignee =
  | Cell
  | CellRange
  | FunctionCall
  | AttributeFormula
  | AttributeValue
  | Identifier;

export class Assignment extends ASTNode implements IVisitable {
  assignee: Assignee;
  assigned: Expression | UseStatement;
  constructor(
    position: Position | undefined,
    assignee: Assignee,
    assigned: Expression | UseStatement
  ) {
    super(position);
    this.assigned = assigned;
    this.assignee = assignee;
  }
  accept(visitor: IVisitor): void {
    visitor.visitAssignment(this);
  }
}

export class AssignmentPlusEquals extends Assignment implements IVisitable {
  accept(visitor: IVisitor): void {
    visitor.visitAssignmentPlusEquals(this);
  }
}
export class AssignmentMinusEquals extends Assignment implements IVisitable {
  accept(visitor: IVisitor): void {
    visitor.visitAssignmentMinusEquals(this);
  }
}

export interface Expression extends IVisitable {
  accept(visitor: IVisitor): void;
}

export class BinaryExpression extends ASTNode implements Expression {
  leftExpression: Expression;
  rightExpression: Expression;
  constructor(
    position: Position | undefined,
    leftExpression: Expression,
    rightExpression: Expression
  ) {
    super(position);
    this.leftExpression = leftExpression;
    this.rightExpression = rightExpression;
  }
  accept(visitor: IVisitor): void {
    throw new Error("Method not implemented.");
  }
}

export class OrExpression extends BinaryExpression {
  accept(visitor: IVisitor): void {
    visitor.visitOrExpression(this);
  }
}

export class AndExpression extends BinaryExpression implements IVisitable {
  accept(visitor: IVisitor): void {
    visitor.visitAndExpression(this);
  }
}

export class LessThanExpression extends BinaryExpression implements IVisitable {
  accept(visitor: IVisitor): void {
    visitor.visitLessThanExpression(this);
  }
}
export class LessThanOrEqualExpression
  extends BinaryExpression
  implements IVisitable
{
  accept(visitor: IVisitor): void {
    visitor.visitLessThanOrEqualExpression(this);
  }
}
export class EqualExpression extends BinaryExpression implements IVisitable {
  accept(visitor: IVisitor): void {
    visitor.visitEqualExpression(this);
  }
}
export class NotEqualExpression extends BinaryExpression implements IVisitable {
  accept(visitor: IVisitor): void {
    visitor.visitNotEqualExpression(this);
  }
}
export class GreaterThanOrEqualExpression
  extends BinaryExpression
  implements IVisitable
{
  accept(visitor: IVisitor): void {
    visitor.visitGreaterThanOrEqualExpression(this);
  }
}
export class GreaterThanExpression
  extends BinaryExpression
  implements IVisitable
{
  accept(visitor: IVisitor): void {
    visitor.visitGreaterThanExpression(this);
  }
}

export class AddExpression extends BinaryExpression implements IVisitable {
  accept(visitor: IVisitor): void {
    visitor.visitAddExpression(this);
  }
}
export class SubtractExpression extends BinaryExpression implements IVisitable {
  accept(visitor: IVisitor): void {
    visitor.visitSubtractExpression(this);
  }
}

export class MultiplyExpression extends BinaryExpression implements IVisitable {
  accept(visitor: IVisitor): void {
    visitor.visitMultiplyExpression(this);
  }
}
export class DivideExpression extends BinaryExpression implements IVisitable {
  accept(visitor: IVisitor): void {
    visitor.visitDivideExpression(this);
  }
}

export class NegateExpression extends ASTNode implements IVisitable {
  expression: Expression;
  constructor(position: Position | undefined, expression: Expression) {
    super(position);
    this.expression = expression;
  }
  accept(visitor: IVisitor): void {
    visitor.visitNegateExpression(this);
  }
}

// A10.value A15.formula b.value

export class Attribute extends ASTNode implements IVisitable {
  expression: Expression;
  constructor(position: Position | undefined, expression: Expression) {
    super(position);
    this.expression = expression;
  }
  accept(visitor: IVisitor): void {
    throw new Error("Method not implemented.");
  }
}

export class AttributeFormula extends Attribute {
  accept(visitor: IVisitor): void {
    visitor.visitFormulaAttribute(this);
  }
}

export class AttributeValue extends Attribute {
  accept(visitor: IVisitor): void {
    visitor.visitFormulaAttribute(this);
  }
}

export class CellRange extends ASTNode implements IVisitable {
  start: Cell;
  end: Cell;
  constructor(position: Position | undefined, start: Cell, end: Cell) {
    super(position);
    this.start = start;
    this.end = end;
  }
  accept(visitor: IVisitor): void {
    visitor.visitCellRange(this);
  }
}

export class Cell extends ASTNode implements IVisitable {
  row: number;
  column: string;
  constructor(position: Position | undefined, column: string, row: number) {
    super(position);
    this.row = row;
    this.column = column;
  }
  accept(visitor: IVisitor): void {
    visitor.visitCell(this);
  }
}

export class Identifier extends ASTNode implements IVisitable {
  name: string;
  constructor(position: Position | undefined, name: string) {
    super(position);
    this.name = name;
  }
  accept(visitor: IVisitor): void {
    visitor.visitIdentifier(this);
  }
}

export class IntegerLiteral extends ASTNode implements IVisitable {
  value: number;
  constructor(position: Position | undefined, value: number) {
    super(position);
    this.value = value;
  }
  accept(visitor: IVisitor): void {
    visitor.visitInteger(this);
  }
}

export class TextLiteral extends ASTNode implements IVisitable {
  value: string;
  constructor(position: Position | undefined, value: string) {
    super(position);
    this.value = value;
  }
  accept(visitor: IVisitor): void {
    visitor.visitText(this);
  }
}

export class FloatLiteral extends ASTNode implements IVisitable {
  value: number;
  constructor(position: Position | undefined, value: number) {
    super(position);
    this.value = value;
  }
  accept(visitor: IVisitor): void {
    visitor.visitInteger(this);
  }
}
