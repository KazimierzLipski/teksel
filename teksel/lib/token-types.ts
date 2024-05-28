export enum TokenType {
  T_Identifier = "id",
  T_Cell = "cell",

  // keywords
  T_If = "if",
  T_Else = "else",
  T_Foreach = "foreach",
  T_Return = "return",
  T_In = "in",
  T_Def = "def",
  T_Value = "value",
  T_Formula = "formula",
  T_Use = "use",
  T_AndOp = "and",
  T_OrOp = "or",

  T_Int = "int",
  T_Float = "float",
  T_String = "string",

  // single sign operators
  T_MulOp = "*",
  T_DivOp = "/",
  T_AddOp = "+",
  T_MinOp = "-",
  T_Neg = "!",
  T_AssignOp = "=",
  T_LesOp = "<",
  T_GreOp = ">",
  T_AccessOp = ".",

  // multi signs operators
  T_LesEqOp = "<=",
  T_GreEqOp = ">=",
  T_EqOp = "==",
  T_NotEqOp = "!=",
  T_PlusEqOp = "+=",
  T_MinEqOp = "-=",

  // punctation
  T_Coma = ",",
  T_Colon = ":",
  T_Semicolon = ";",
  T_CloseBracket = ")",
  T_OpenBracket = "(",
  T_CloseCurly = "}",
  T_OpenCurly = "{",

  T_EOF = "EOF",
  T_Unknown = "unknown",
}

export type SetterType =
  | TokenType.T_AssignOp
  | TokenType.T_PlusEqOp
  | TokenType.T_MinEqOp;

export type ComparisonType =
  | TokenType.T_LesEqOp
  | TokenType.T_GreEqOp
  | TokenType.T_EqOp
  | TokenType.T_NotEqOp
  | TokenType.T_LesOp
  | TokenType.T_GreOp;

export type CellAttributeType = TokenType.T_Value | TokenType.T_Formula;
