import {
  AddExpression,
  Assignee,
  Assignment,
  DivideExpression,
  EqualExpression,
  Expression,
  GreaterThanExpression,
  GreaterThanOrEqualExpression,
  LessThanExpression,
  LessThanOrEqualExpression,
  MultiplyExpression,
  NotEqualExpression,
  SubtractExpression,
} from "./statements";
import { Position } from "./token";
import { TokenType } from "./token-types";

export const singleCharTokens = {
  "<": TokenType.T_LesOp,
  ">": TokenType.T_GreOp,
  "=": TokenType.T_AssignOp,
  "!": TokenType.T_Neg,
  "-": TokenType.T_MinOp,
  "+": TokenType.T_AddOp,
  "*": TokenType.T_MulOp,
  "/": TokenType.T_DivOp,
  ",": TokenType.T_Coma,
  ":": TokenType.T_Colon,
  ";": TokenType.T_Semicolon,
  ")": TokenType.T_CloseBracket,
  "(": TokenType.T_OpenBracket,
  "}": TokenType.T_CloseCurly,
  "{": TokenType.T_OpenCurly,
  ".": TokenType.T_AccessOp,
};

export const multiCharTokens = {
  "<=": TokenType.T_LesEqOp,
  ">=": TokenType.T_GreEqOp,
  "==": TokenType.T_EqOp,
  "!=": TokenType.T_NotEqOp,
  "+=": TokenType.T_PlusEqOp,
  "-=": TokenType.T_MinEqOp,
};

export const additiveCharTokens = {
  "+": TokenType.T_AddOp,
  "-": TokenType.T_MinOp,
};

export const multiplicativeCharTokens = {
  "*": TokenType.T_MulOp,
  "/": TokenType.T_DivOp,
};

type Fucuntion = (
  position: Position,
  left: Assignee,
  right: Expression
) => Assignment;

export const assignmentConstructors = new Map<TokenType, Fucuntion>([
  [
    TokenType.T_AssignOp,
    (position: Position, left: Assignee, right: Expression) => {
      return new Assignment(position, left, right);
    },
  ],
  [
    TokenType.T_PlusEqOp,
    (position: Position, left: Assignee, right: Expression) => {
      return new Assignment(
        position,
        left,
        new AddExpression(position, left, right)
      );
    },
  ],
  [
    TokenType.T_MinEqOp,
    (position: Position, left: Assignee, right: Expression) => {
      return new Assignment(
        position,
        left,
        new SubtractExpression(position, left, right)
      );
    },
  ],
]);

type BinaryConstructorType = (
  position: Position,
  leftExpression: Expression,
  rightExpression: Expression
) => Expression;

export const relativeConstructors = new Map<TokenType, BinaryConstructorType>([
  [
    TokenType.T_LesOp,
    (position: Position, left: Expression, right: Expression) => {
      return new LessThanExpression(position, left, right);
    },
  ],
  [
    TokenType.T_LesEqOp,
    (position: Position, left: Expression, right: Expression) => {
      return new LessThanOrEqualExpression(position, left, right);
    },
  ],
  [
    TokenType.T_EqOp,
    (position: Position, left: Expression, right: Expression) => {
      return new EqualExpression(position, left, right);
    },
  ],
  [
    TokenType.T_NotEqOp,
    (position: Position, left: Expression, right: Expression) => {
      return new NotEqualExpression(position, left, right);
    },
  ],
  [
    TokenType.T_GreOp,
    (position: Position, left: Expression, right: Expression) => {
      return new GreaterThanExpression(position, left, right);
    },
  ],
  [
    TokenType.T_GreEqOp,
    (position: Position, left: Expression, right: Expression) => {
      return new GreaterThanOrEqualExpression(position, left, right);
    },
  ],
]);

export const additiveConstructors = new Map<TokenType, BinaryConstructorType>([
  [
    TokenType.T_AddOp,
    (position: Position, left: Expression, right: Expression) => {
      return new AddExpression(position, left, right);
    },
  ],
  [
    TokenType.T_MinOp,
    (position: Position, left: Expression, right: Expression) => {
      return new SubtractExpression(position, left, right);
    },
  ],
]);

export const multiplicativeConstructors = new Map<
  TokenType,
  BinaryConstructorType
>([
  [
    TokenType.T_MulOp,
    (position: Position, left: Expression, right: Expression) => {
      return new MultiplyExpression(position, left, right);
    },
  ],
  [
    TokenType.T_DivOp,
    (position: Position, left: Expression, right: Expression) => {
      return new DivideExpression(position, left, right);
    },
  ],
]);

export const firstMultiCharToken = {
  "<": TokenType.T_LesOp,
  ">": TokenType.T_GreOp,
  "=": TokenType.T_AssignOp,
  "!": TokenType.T_Neg,
};

export const keywords = {
  if: TokenType.T_If,
  else: TokenType.T_Else,
  return: TokenType.T_Return,
  value: TokenType.T_Value,
  formula: TokenType.T_Formula,
  use: TokenType.T_Use,
  and: TokenType.T_AndOp,
  or: TokenType.T_OrOp,

  foreach: TokenType.T_Foreach,
  in: TokenType.T_In,
  def: TokenType.T_Def,
};
