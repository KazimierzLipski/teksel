import { TokenType } from "./token-types"

export const singleCharTokens = {
    "*": TokenType.T_MulOp,
    "/": TokenType.T_DivOp,
    "-": TokenType.T_MinOp,
    "+": TokenType.T_AddOp,
    ",": TokenType.T_Coma,
    ":": TokenType.T_Colon,
    ";": TokenType.T_Semicolon,
    ")": TokenType.T_CloseBracket,
    "(": TokenType.T_OpenBracket,
    "}": TokenType.T_CloseCurly,
    "{": TokenType.T_OpenCurly,
    ".": TokenType.T_AccessOp,
}

export const multiCharTokens = {
    "<=": TokenType.T_LesEqOp,
    ">=": TokenType.T_GreEqOp,
    "==": TokenType.T_EqOp,
    "!=": TokenType.T_NotEqOp,
    "+=": TokenType.T_PlusEqOp,
    "-=": TokenType.T_MinEqOp,
    "<": TokenType.T_LesOp,
    ">": TokenType.T_GreOp,
    "=": TokenType.T_AssignOp,
    "!": TokenType.T_Neg,
    "-": TokenType.T_MinOp,
    "+": TokenType.T_AddOp,
}

export const additiveCharTokens = {
    "+": TokenType.T_AddOp,
    "-": TokenType.T_MinOp,
}

export const multiplicativeCharTokens = {
    "*": TokenType.T_MulOp,
    "/": TokenType.T_DivOp,
}

export const assignmentTokens = {
    "=": TokenType.T_AssignOp,
    "+=": TokenType.T_PlusEqOp,
    "-=": TokenType.T_MinEqOp,
}

export const firstMultiCharToken = {
    "<": TokenType.T_LesOp,
    ">": TokenType.T_GreOp,
    "=": TokenType.T_AssignOp,
    "!": TokenType.T_Neg,
}

export const keywords = {
    "if": TokenType.T_If,
    "else": TokenType.T_Else,
    "return": TokenType.T_Return,
    "value": TokenType.T_Value,
    "formula": TokenType.T_Formula,
    "and": TokenType.T_AndOp,
    "or": TokenType.T_OrOp,

    "foreach": TokenType.T_Foreach,
    "in": TokenType.T_In,
    "def": TokenType.T_Def,
}
