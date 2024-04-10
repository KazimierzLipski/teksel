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
    "&": TokenType.T_AndOp,
    "|": TokenType.T_OrOp,
    ".": TokenType.T_AccessOp,
}


export const multiCharTokens = {
    "<=": TokenType.T_LesEqOp,
    ">=": TokenType.T_GreEqOp,
    "==": TokenType.T_EqOp,
    "!=": TokenType.T_NotEqOp,
    "<": TokenType.T_LesOp,
    ">": TokenType.T_GreOp,
    "=": TokenType.T_AssignOp,
    "!": TokenType.T_Neg,
}

export const keywords = {
    "if": TokenType.T_If,
    "else": TokenType.T_Else,
    "return": TokenType.T_Return,

    "foreach": TokenType.T_Foreach,
    "in": TokenType.T_In,
}
