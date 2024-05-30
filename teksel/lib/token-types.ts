export enum TokenType {
  // unknown
  T_Unknown,

  // eof
  T_EOF,

  // identifiers
  T_Identifier,
  T_Cell,

  // keywords
  T_If,
  T_Else,
  T_Foreach,
  T_Return,
  T_In,
  T_Def,
  T_Value,
  T_Formula,
  T_Use,
  T_AndOp,
  T_OrOp,

  T_Int,
  T_Float,
  T_String,

  // single sign operators
  T_MulOp,
  T_DivOp,
  T_AddOp,
  T_MinOp,
  T_Neg,
  T_AssignOp,
  T_LesOp,
  T_GreOp,
  T_AccessOp,

  // multi signs operators
  T_LesEqOp,
  T_GreEqOp,
  T_EqOp,
  T_NotEqOp,
  T_PlusEqOp,
  T_MinEqOp,

  // punctation
  T_Coma,
  T_Colon,
  T_Semicolon,
  T_CloseBracket,
  T_OpenBracket,
  T_CloseCurly,
  T_OpenCurly,
}
