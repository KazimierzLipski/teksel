import { CharacterReader } from '../character-reader';
import { Lexer } from '../lexer';
import { Token } from '../token';
import { TokenType } from '../token-types';

const tokenTests: [string, Token][] = [
  ["if", new Token("if", TokenType.T_If, {row: 0, column: 0})],
  ["else", new Token("else", TokenType.T_Else, {row: 0, column: 0})],
  ["return", new Token("return", TokenType.T_Return, {row: 0, column: 0})],
  ["&", new Token("&", TokenType.T_AndOp, {row: 0, column: 0})],
  ["|", new Token("|", TokenType.T_OrOp, {row: 0, column: 0})],
  ["id", new Token("id", TokenType.T_Identifier, {row: 0, column: 0})],
  ["", new Token("EOF", TokenType.T_EOF, {row: 0, column: 0})],
  ["123", new Token(123, TokenType.T_Int, {row: 0, column: 0})],
  ["9.99", new Token(9.99, TokenType.T_Float, {row: 0, column: 0})],
  ["'test_string'", new Token("test_string", TokenType.T_String, {row: 0, column: 0})],
  ['"test_string"', new Token("test_string", TokenType.T_String, {row: 0, column: 0})],
  ["*", new Token("*", TokenType.T_MulOp, {row: 0, column: 0})],
  ["/", new Token("/", TokenType.T_DivOp, {row: 0, column: 0})],
  ["-", new Token("-", TokenType.T_MinOp, {row: 0, column: 0})],
  ["+", new Token("+", TokenType.T_AddOp, {row: 0, column: 0})],
  [",", new Token(",", TokenType.T_Coma, {row: 0, column: 0})],
  [":", new Token(":", TokenType.T_Colon, {row: 0, column: 0})],
  [";", new Token(";", TokenType.T_Semicolon, {row: 0, column: 0})],
  [")", new Token(")", TokenType.T_CloseBracket, {row: 0, column: 0})],
  ["(", new Token("(", TokenType.T_OpenBracket, {row: 0, column: 0})],
  ["}", new Token("}", TokenType.T_CloseCurly, {row: 0, column: 0})],
  ["{", new Token("{", TokenType.T_OpenCurly, {row: 0, column: 0})],
  ["&", new Token("&", TokenType.T_AndOp, {row: 0, column: 0})],
  ["|", new Token("|", TokenType.T_OrOp, {row: 0, column: 0})],
  ["<=", new Token("<=", TokenType.T_LesEqOp, {row: 0, column: 0})],
  [">=", new Token(">=", TokenType.T_GreEqOp, {row: 0, column: 0})],
  ["==", new Token("==", TokenType.T_EqOp, {row: 0, column: 0})],
  ["!=", new Token("!=", TokenType.T_NotEqOp, {row: 0, column: 0})],
  ["<", new Token("<", TokenType.T_LesOp, {row: 0, column: 0})],
  [">", new Token(">", TokenType.T_GreOp, {row: 0, column: 0})],
  ["=", new Token("=", TokenType.T_AssignOp, {row: 0, column: 0})],
  [".", new Token(".", TokenType.T_AccessOp, {row: 0, column: 0})],
];

describe("build_tokens", () => {
    test.each(tokenTests)("build_tokens for input '%s' should produce expected token", (input, expected) => {
        const SR = new CharacterReader(input);
        const lexer = new Lexer(SR);
        const token = lexer.buildToken()
        const token2 = lexer.buildToken()
        expect(token?.type).toEqual(expected.type);
        expect(token?.value).toEqual(expected.value);
        expect(token2?.type).toEqual(TokenType.T_EOF);
    });
});

describe("variable_assignment", () => {
    test("should tokenize variable assignment correctly", () => {
        const SR = new CharacterReader("A10 = 5");
        const lexer = new Lexer(SR);
        expect(lexer.buildToken()?.type).toEqual(TokenType.T_Identifier);
        expect(lexer.buildToken()?.type).toEqual(TokenType.T_AssignOp);
        expect(lexer.buildToken()?.type).toEqual(TokenType.T_Int);
    });
});



test("build_integers_long", () => {
  const SR = new CharacterReader("1000000000");
  const lexer = new Lexer(SR);
  const token1 = lexer.buildToken();
  const token2 = lexer.buildToken();
  expect(token1?.type).toEqual(TokenType.T_Int);
  expect(token1?.value).toEqual(1000000000);
  expect(token2?.type).toEqual(TokenType.T_EOF);
});
