import { Position } from "./token";
import { CellAttributeType, SetterType } from "./token-types";

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
  visitForEachStatement(element: ForEachStatement): void;
  visitAssignmentID(element: AssignmentID): void;
  visitAssignmentIDPlusEquals(element: AssignmentPlusEqualsID): void;
  visitAssignmentIDMinusEquals(element: AssignmentMinusEqualsID): void;
  visitAssignmentCell(element: AssignmentCell): void;
  visitAssignmentPlusEqualsCell(element: AssignmentPlusEqualsCell): void;
  visitAssignmentMinusEqualsCell(element: AssignmentMinusEqualsCell): void;
  visitOrExpression(element: OrExpression): void;
  visitAndExpression(element: AndExpression): void;
  visitRelativeExpression(element: RelativeExpression): void;
  visitLessThanExpression(element: LessThanExpression): void;
  visitLessThanOrEqualExpression(element: LessThanOrEqualExpression): void;
  visitEqualExpression(element: EqualExpression): void;
  visitNotEqualExpression(element: NotEqualExpression): void;
  visitGreaterThanOrEqualExpression(
    element: GreaterThanOrEqualExpression
  ): void;
  visitGreaterThanExpression(element: GreaterThanExpression): void;
  visitAdditiveExpression(element: AdditiveExpression): void;
  visitAddExpression(element: AddExpression): void;
  visitSubtractExpression(element: SubtractExpression): void;
  visitMultiplicativeExpression(element: MultiplicativeExpression): void;
  visitMultiplyExpression(element: MultiplyExpression): void;
  visitDivideExpression(element: DivideExpression): void;
  visitFactor(element: Factor): void;
  visitNegatedFactor(element: NegatedFactor): void;
  visitCellAttribute(element: CellAttribute): void;
  visitCellRange(element: CellRange): void;
  visitExpression(element: Expression): void;
  visitCell(element: Cell): void;
}

class ConcreteVisitor1 implements IVisitor {
  public visitProgram(element: Program): void {
    console.log(`${element.definitions} + ConcreteVisitor1`);
  }
  public visitFunctionDefinition(element: FunctionDefinition): void {
    console.log(`${element.identifier} + ConcreteVisitor1`);
  }
  public visitArgumentList(element: ArgumentList): void {
    console.log(`${element.arguments} + ConcreteVisitor1`);
  }
  public visitFunctionCall(element: FunctionCall): void {
    console.log(`${element.identifier} + ConcreteVisitor1`);
  }
  public visitBlock(element: Block): void {
    console.log(`${element.anyStatements} + ConcreteVisitor1`);
  }
  public visitReturnStatement(element: ReturnStatement): void {
    console.log(`${element.referent} + ConcreteVisitor1`);
  }
  public visitIfStatement(element: IfStatement): void {
    console.log(`${element.expression} + ConcreteVisitor1`);
  }
  public visitForEachStatement(element: ForEachStatement): void {
    console.log(`${element.identifier} + ConcreteVisitor1`);
  }
  public visitAssignmentID(element: AssignmentID): void {
    console.log(`${element.identifier} + ConcreteVisitor1`);
  }
  public visitAssignmentIDPlusEquals(element: AssignmentPlusEqualsID): void {
    console.log(`${element.identifier} + ConcreteVisitor1`);
  }
  public visitAssignmentIDMinusEquals(element: AssignmentMinusEqualsID): void {
    console.log(`${element.identifier} + ConcreteVisitor1`);
  }
  public visitAssignmentCell(element: AssignmentCell): void {
    console.log(`${element.cell} + ConcreteVisitor1`);
  }
  public visitAssignmentPlusEqualsCell(
    element: AssignmentPlusEqualsCell
  ): void {
    console.log(`${element.cell} + ConcreteVisitor1`);
  }
  public visitAssignmentMinusEqualsCell(
    element: AssignmentMinusEqualsCell
  ): void {
    console.log(`${element.cell} + ConcreteVisitor1`);
  }
  public visitOrExpression(element: OrExpression): void {
    console.log(`${element.leftExpression} + ConcreteVisitor1`);
  }
  public visitAndExpression(element: AndExpression): void {
    console.log(`${element.leftExpression} + ConcreteVisitor1`);
  }
  public visitRelativeExpression(element: RelativeExpression): void {
    console.log(`${element.leftExpression} + ConcreteVisitor1`);
  }
  public visitLessThanExpression(element: LessThanExpression): void {
    console.log(`${element.leftExpression} + ConcreteVisitor1`);
  }
  public visitLessThanOrEqualExpression(
    element: LessThanOrEqualExpression
  ): void {
    console.log(`${element.leftExpression} + ConcreteVisitor1`);
  }
  public visitEqualExpression(element: EqualExpression): void {
    console.log(`${element.leftExpression} + ConcreteVisitor1`);
  }
  public visitNotEqualExpression(element: NotEqualExpression): void {
    console.log(`${element.leftExpression} + ConcreteVisitor1`);
  }
  public visitGreaterThanOrEqualExpression(
    element: GreaterThanOrEqualExpression
  ): void {
    console.log(`${element.leftExpression} + ConcreteVisitor1`);
  }
  public visitGreaterThanExpression(element: GreaterThanExpression): void {
    console.log(`${element.leftExpression} + ConcreteVisitor1`);
  }
  public visitAdditiveExpression(element: AdditiveExpression): void {
    console.log(`${element.leftTerm} + ConcreteVisitor1`);
  }
  public visitAddExpression(element: AddExpression): void {
    console.log(`${element.leftTerm} + ConcreteVisitor1`);
  }
  public visitSubtractExpression(element: SubtractExpression): void {
    console.log(`${element.leftTerm} + ConcreteVisitor1`);
  }
  public visitMultiplicativeExpression(
    element: MultiplicativeExpression
  ): void {
    console.log(`${element.leftFactor} + ConcreteVisitor1`);
  }
  public visitMultiplyExpression(element: MultiplyExpression): void {
    console.log(`${element.leftFactor} + ConcreteVisitor1`);
  }
  public visitDivideExpression(element: DivideExpression): void {
    console.log(`${element.leftFactor} + ConcreteVisitor1`);
  }
  public visitFactor(element: Factor): void {
    console.log(`${element.value} + ConcreteVisitor1`);
  }
  public visitNegatedFactor(element: NegatedFactor): void {
    console.log(`${element.value} + ConcreteVisitor1`);
  }
  public visitCellAttribute(element: CellAttribute): void {
    console.log(`${element.cell} + ConcreteVisitor1`);
  }
  public visitCellRange(element: CellRange): void {
    console.log(`${element.start} + ConcreteVisitor1`);
  }
  public visitExpression(element: Expression): void {
    console.log(`${element.expression} + ConcreteVisitor1`);
  }
  public visitCell(element: Cell): void {
    console.log(`${element.row} + ConcreteVisitor1`);
  }
}

const visitor1 = new ConcreteVisitor1();

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
    | AssignmentCell
    | AssignmentID
    | IfStatement
    | ForEachStatement
    | string
    | ReturnStatement
    | Factor
  )[];
  constructor(
    position: Position | undefined,
    anyStatements: (
      | AssignmentCell
      | AssignmentID
      | IfStatement
      | ForEachStatement
      | string
      | ReturnStatement
      | Factor
    )[]
  ) {
    super(position);
    this.anyStatements = anyStatements;
  }
  accept(visitor: IVisitor): void {
    throw new Error("Method not implemented.");
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
  expression: Expression;
  block: Block;
  elseBlock: Block | undefined;
  constructor(
    position: Position | undefined,
    expression: Expression,
    block: Block,
    elseBlock: Block | undefined
  ) {
    super(position);
    this.expression = expression;
    this.block = block;
    this.elseBlock = elseBlock;
  }
  accept(visitor: IVisitor): void {
    visitor.visitIfStatement(this);
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

export class AssignmentID extends ASTNode implements IVisitable {
  identifier: string;
  expression: Expression | IfStatement;
  constructor(
    position: Position | undefined,
    identifier: string,
    expression: Expression | IfStatement
  ) {
    super(position);
    this.identifier = identifier;
    this.expression = expression;
  }
  accept(visitor: IVisitor): void {
    visitor.visitAssignmentID(this);
  }
}
export class AssignmentPlusEqualsID extends AssignmentID implements IVisitable {
  accept(visitor: IVisitor): void {
    visitor.visitAssignmentIDPlusEquals(this);
  }
}
export class AssignmentMinusEqualsID
  extends AssignmentID
  implements IVisitable
{
  accept(visitor: IVisitor): void {
    visitor.visitAssignmentIDMinusEquals(this);
  }
}

export class AssignmentCell extends ASTNode implements IVisitable {
  cell: Cell | CellRange | CellAttribute;
  expression: Expression | IfStatement;
  constructor(
    position: Position | undefined,
    cell: Cell | CellRange | CellAttribute,
    expression: Expression | IfStatement
  ) {
    super(position);
    this.cell = cell;
    this.expression = expression;
  }
  accept(visitor: IVisitor): void {
    visitor.visitAssignmentCell(this);
  }
}
export class AssignmentPlusEqualsCell
  extends AssignmentCell
  implements IVisitable
{
  accept(visitor: IVisitor): void {
    visitor.visitAssignmentPlusEqualsCell(this);
  }
}
export class AssignmentMinusEqualsCell
  extends AssignmentCell
  implements IVisitable
{
  accept(visitor: IVisitor): void {
    visitor.visitAssignmentMinusEqualsCell(this);
  }
}

export class Expression extends ASTNode implements IVisitable {
  expression: OrExpressionType | undefined;
  constructor(
    position: Position | undefined,
    expression: OrExpressionType | undefined
  ) {
    super(position);
    this.expression = expression;
  }
  accept(visitor: IVisitor): void {
    visitor.visitExpression(this);
  }
}

export type ExpressionType =
  | OrExpression
  | AndExpression
  | RelativeExpression
  | AdditiveExpression
  | MultiplicativeExpression
  | Factor
  | undefined;

export type OrExpressionType = OrExpression | AndExpressionType;

export class OrExpression extends ASTNode implements IVisitable {
  leftExpression: OrExpressionType;
  rightExpression: OrExpressionType | undefined;
  constructor(
    position: Position | undefined,
    leftExpression: OrExpressionType,
    rightExpression: OrExpressionType | undefined = undefined
  ) {
    super(position);
    this.leftExpression = leftExpression;
    this.rightExpression = rightExpression;
  }

  accept(visitor: IVisitor): void {
    visitor.visitOrExpression(this);
  }
}

export type AndExpressionType = AndExpression | RelativeExpressionType;

export class AndExpression extends ASTNode implements IVisitable {
  leftExpression: AndExpressionType;
  rightExpression: AndExpressionType | undefined;
  constructor(
    position: Position | undefined,
    leftExpression: AndExpressionType,
    rightExpression: AndExpressionType | undefined = undefined
  ) {
    super(position);
    this.leftExpression = leftExpression;
    this.rightExpression = rightExpression;
  }
  accept(visitor: IVisitor): void {
    visitor.visitAndExpression(this);
  }
}

type RelativeExpressionType =
  | AndExpression
  | MultiplicativeExpression
  | Factor
  | AdditiveExpression
  | RelativeExpression;

export class RelativeExpression extends ASTNode implements IVisitable {
  position: Position | undefined;
  leftExpression: RelativeExpressionType;
  rightExpression: RelativeExpressionType | undefined;
  constructor(
    position: Position | undefined,
    leftExpression: RelativeExpressionType,
    rightExpression: RelativeExpressionType | undefined = undefined
  ) {
    super(position);
    this.leftExpression = leftExpression;
    this.rightExpression = rightExpression;
  }
  accept(visitor: IVisitor): void {
    visitor.visitRelativeExpression(this);
  }
}
export class LessThanExpression
  extends RelativeExpression
  implements IVisitable
{
  accept(visitor: IVisitor): void {
    visitor.visitLessThanExpression(this);
  }
}
export class LessThanOrEqualExpression
  extends RelativeExpression
  implements IVisitable
{
  accept(visitor: IVisitor): void {
    visitor.visitLessThanOrEqualExpression(this);
  }
}
export class EqualExpression extends RelativeExpression implements IVisitable {
  accept(visitor: IVisitor): void {
    visitor.visitEqualExpression(this);
  }
}
export class NotEqualExpression
  extends RelativeExpression
  implements IVisitable
{
  accept(visitor: IVisitor): void {
    visitor.visitNotEqualExpression(this);
  }
}
export class GreaterThanOrEqualExpression
  extends RelativeExpression
  implements IVisitable
{
  accept(visitor: IVisitor): void {
    visitor.visitGreaterThanOrEqualExpression(this);
  }
}
export class GreaterThanExpression
  extends RelativeExpression
  implements IVisitable
{
  accept(visitor: IVisitor): void {
    visitor.visitGreaterThanExpression(this);
  }
}

export class AdditiveExpression extends ASTNode implements IVisitable {
  position: Position | undefined;
  leftTerm: MultiplicativeExpression | AdditiveExpression | Factor;
  rightTerm: MultiplicativeExpression | AdditiveExpression | Factor | undefined;
  constructor(
    position: Position | undefined,
    leftTerm: MultiplicativeExpression | AdditiveExpression | Factor,
    rightTerm:
      | MultiplicativeExpression
      | AdditiveExpression
      | Factor
      | undefined = undefined
  ) {
    super(position);
    this.leftTerm = leftTerm;
    this.rightTerm = rightTerm;
  }
  accept(visitor: IVisitor): void {
    visitor.visitAdditiveExpression(this);
  }
}
export class AddExpression extends AdditiveExpression implements IVisitable {
  accept(visitor: IVisitor): void {
    visitor.visitAddExpression(this);
  }
}
export class SubtractExpression
  extends AdditiveExpression
  implements IVisitable
{
  accept(visitor: IVisitor): void {
    visitor.visitSubtractExpression(this);
  }
}

export class MultiplicativeExpression extends ASTNode implements IVisitable {
  leftFactor: Factor | MultiplicativeExpression;
  rightFactor: Factor | undefined;
  constructor(
    position: Position | undefined,
    leftFactor: Factor | MultiplicativeExpression,
    rightFactor: Factor | undefined = undefined
  ) {
    super(position);
    this.leftFactor = leftFactor;
    this.rightFactor = rightFactor;
  }
  accept(visitor: IVisitor): void {
    visitor.visitMultiplicativeExpression(this);
  }
}
export class MultiplyExpression
  extends MultiplicativeExpression
  implements IVisitable
{
  accept(visitor: IVisitor): void {
    visitor.visitMultiplyExpression(this);
  }
}
export class DivideExpression
  extends MultiplicativeExpression
  implements IVisitable
{
  accept(visitor: IVisitor): void {
    visitor.visitDivideExpression(this);
  }
}

type FactorValuesType =
  | number
  | string
  | FunctionCall
  | string
  | CellRange
  | CellAttribute
  | Expression
  | Cell;

export class Factor extends ASTNode implements IVisitable {
  value: FactorValuesType;
  constructor(position: Position | undefined, value: FactorValuesType) {
    super(position);
    this.value = value;
  }
  accept(visitor: IVisitor): void {
    visitor.visitFactor(this);
  }
}
export class NegatedFactor extends ASTNode implements IVisitable {
  value: FactorValuesType;
  constructor(position: Position | undefined, value: FactorValuesType) {
    super(position);
    this.value = value;
  }
  accept(visitor: IVisitor): void {
    visitor.visitNegatedFactor(this);
  }
}

export class CellAttribute extends ASTNode implements IVisitable {
  cell: Cell;
  idAttribute: CellAttributeType;
  constructor(
    position: Position | undefined,
    cell: Cell,
    idAttribute: CellAttributeType
  ) {
    super(position);
    this.cell = cell;
    this.idAttribute = idAttribute;
  }
  accept(visitor: IVisitor): void {
    visitor.visitCellAttribute(this);
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
  constructor(position: Position | undefined, row: number, column: string) {
    super(position);
    this.row = row;
    this.column = column;
  }
  accept(visitor: IVisitor): void {
    visitor.visitCell(this);
  }
}
