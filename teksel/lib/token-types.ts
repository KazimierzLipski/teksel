export enum TokenType {
  T_Identifier = "id",

  // keywords
  T_If = "if",
  T_Else = "else",
  T_Foreach = "foreach",
  T_Return = "return",
  T_In = "in",

  T_Int = "int",
  T_Float = "float",
  T_String = 'string',

  // single sign operators
  T_MulOp = "*",
  T_DivOp = "/",
  T_AddOp = "+",
  T_MinOp = "-",
  T_AssignOp = "=",
  T_LesOp = "<",
  T_GreOp = ">",
  T_AndOp = "&",
  T_OrOp = "|",
  T_Neg = "!",
  T_AccessOp = ".",

  // multi signs operators
  T_LesEqOp = "<=",
  T_GreEqOp = ">=",
  T_EqOp = "==",
  T_NotEqOp = "!=",

  // punctation
  T_Coma = ",",
  T_Colon = ":",
  T_Semicolon = ";",
  T_CloseBracket = ")",
  T_OpenBracket = "(",
  T_CloseCurly = "}",
  T_OpenCurly = "{",

  T_EOF = "EOF",
}
