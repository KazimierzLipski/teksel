import { ErrorType, ParserError } from "./error-types";
import { Lexer } from "./lexer";
import {
  AndExpression,
  ArgumentList,
  Assignment,
  Block,
  CellRange,
  Expression,
  FloatLiteral,
  ForEachStatement,
  AttributeFormula,
  FunctionCall,
  FunctionDefinition,
  Identifier,
  IfStatement,
  IntegerLiteral,
  NegateExpression,
  OrExpression,
  Program,
  ReturnStatement,
  TextLiteral,
  AttributeValue,
  UseStatement,
  Cell,
} from "./statements";
import { Position, Token } from "./token";
import {
  additiveConstructors,
  assignmentConstructors,
  multiplicativeConstructors,
  relativeConstructors,
} from "./token-dics";
import { TokenType } from "./token-types";

export class Parser {
  lexer: Lexer;
  currentToken: Token;
  errors = [];

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.buildToken();
  }

  nextToken = () => {
    this.currentToken = this.lexer.buildToken();
  };

  consume = () => {
    const token = this.currentToken;
    this.nextToken();
    return token;
  };

  throwUnexpectedToken = (message: string) => {
    throw new ParserError(
      ErrorType.E_SyntaxError,
      this.currentToken?.position,
      message + this.currentToken?.value
    );
  };

  ifNotOfTypeThrowUnexpectedToken = (token: TokenType, message: string) => {
    if (this.currentToken?.type !== token) {
      this.throwUnexpectedToken(message);
    }
  };

  parseProgram = () => {
    // program = { functionDefinition }; #NOSONAR
    const functionDefinitionMapDict = new Map<string, FunctionDefinition>();
    let functionDefinition = this.parseFunctionDefinition();

    while (functionDefinition !== undefined) {
      if (functionDefinitionMapDict.has(functionDefinition.identifier)) {
        throw new ParserError(
          ErrorType.E_SyntaxError,
          functionDefinition.position,
          "Function already defined: " + functionDefinition.identifier
        );
      }
      functionDefinitionMapDict.set(
        functionDefinition.identifier,
        functionDefinition
      );
      functionDefinition = this.parseFunctionDefinition();
    }

    if (functionDefinitionMapDict.size === 0) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected at least one function definition."
      );
    }

    this.ifNotOfTypeThrowUnexpectedToken(
      TokenType.T_EOF,
      "Expected EOF, got: "
    );

    return new Program(functionDefinitionMapDict);
  };

  parseParametersList = () => {
    // parametersList = identifier, {",", identifier};
    let parametersList: string[] = [];

    const firstParameter: string | undefined = this.parseIdentifier();
    if (firstParameter === undefined) return parametersList;
    parametersList.push(firstParameter);

    let nextParameter: string | undefined;
    while (this.currentToken?.type === TokenType.T_Coma) {
      this.consume();
      nextParameter = this.parseIdentifier();
      if (nextParameter) {
        parametersList.push(nextParameter);
      } else {
        this.throwUnexpectedToken("Expected a parameter, got: ");
      }
    }

    return parametersList;
  };

  parseFunctionDefinition = () => {
    // functionDefinition = "def", identifier, "(", [parametersList], ")", block;
    if (this.currentToken?.type !== TokenType.T_Def) return undefined;
    const position = this.currentToken?.position;
    this.consume();

    const identifier = this.parseIdentifier();
    if (identifier === undefined) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        position,
        "No identifier for function definition."
      );
    }

    this.ifNotOfTypeThrowUnexpectedToken(
      TokenType.T_OpenBracket,
      "Expected an opening bracket, got: "
    );
    this.consume();

    const parametersList = this.parseParametersList();

    this.ifNotOfTypeThrowUnexpectedToken(
      TokenType.T_CloseBracket,
      "Expected a closing bracket, got: "
    );
    this.consume();

    const block: Block = this.parseBlock();
    if (block === undefined) {
      this.throwUnexpectedToken("Expected a block, got: ");
    }

    return new FunctionDefinition(position, identifier, parametersList, block);
  };

  parseArgumentList = () => {
    // argumentList = expression, {",", expression};
    const position = this.currentToken?.position;
    let argumentList = [];

    const firstParameter: Expression | undefined = this.parseExpression();
    if (firstParameter === undefined) return undefined;
    argumentList.push(firstParameter);

    let nextParameter: Expression | undefined;
    while (this.currentToken?.type === TokenType.T_Coma) {
      this.consume();
      nextParameter = this.parseExpression();
      if (nextParameter) {
        argumentList.push(nextParameter);
      } else {
        this.throwUnexpectedToken("Expected an argument, got: ");
      }
    }

    return new ArgumentList(position, argumentList);
  };

  parseFunctionCall = (identifier: string, position: Position | undefined) => {
    let argumentList;
    if (this.currentToken?.type !== TokenType.T_OpenBracket) {
      return undefined;
    } else {
      this.consume();
      argumentList = this.parseArgumentList();

      this.ifNotOfTypeThrowUnexpectedToken(
        TokenType.T_CloseBracket,
        "Expected a closing bracket, got: "
      );
      this.consume();
      return new FunctionCall(position, identifier, argumentList);
    }
  };

  functionCallOrIDAndOrAttribute = () => {
    // functionCallOrIDAndOrAttribute = identifier, [("(", argumentList, ")")], ([".", "value"] | [".", "formula"]);
    const position = this.currentToken?.position;
    let identifier = this.parseIdentifier();
    if (identifier === undefined) return undefined;

    let left =
      this.parseFunctionCall(identifier, position) ??
      new Identifier(position, identifier);

    return this.parseAttribute(left) ?? left;
  };

  parseBlock = () => {
    // block = "{", {anyStatement}, "}";
    const position = this.currentToken?.position;
    let block: (
      | Assignment
      | IfStatement
      | ForEachStatement
      | ReturnStatement
    )[] = [];
    this.ifNotOfTypeThrowUnexpectedToken(
      TokenType.T_OpenCurly,
      "Expected an opening curly bracket, got: "
    );
    this.consume();

    let statement = this.parseAnyStatement();
    while (statement !== undefined) {
      block.push(statement);
      statement = this.parseAnyStatement();
    }

    this.ifNotOfTypeThrowUnexpectedToken(
      TokenType.T_CloseCurly,
      "Expected a closing curly bracket, got: "
    );
    this.consume();

    return new Block(position, block);
  };

  parseAnyStatement = () => {
    // anyStatement = assignment | conditionalStatement | identifier | returnStatement; #NOSONAR
    const anyStatement:
      | Assignment
      | IfStatement
      | ForEachStatement
      | ReturnStatement
      | undefined =
      this.parseAssignment() ??
      this.parseConditionalStatement() ??
      this.parseReturnStatement();
    if (anyStatement === undefined) return undefined;
    return anyStatement;
  };

  parseUseExpression = () => {
    // useIf = "use", expression, "if", expression, "else", expression;
    if (this.currentToken?.type !== TokenType.T_Use) return undefined;
    const position = this.currentToken?.position;
    this.consume();

    const expression: Expression | undefined = this.parseExpression();
    if (expression === undefined)
      return this.throwUnexpectedToken("Expected an expression, got: ");

    this.ifNotOfTypeThrowUnexpectedToken(
      TokenType.T_If,
      "Expected 'if', got: "
    );
    this.consume();

    const ifExpression: Expression | undefined = this.parseExpression();
    if (ifExpression === undefined)
      return this.throwUnexpectedToken("Expected an expression, got: ");

    this.ifNotOfTypeThrowUnexpectedToken(
      TokenType.T_Else,
      "Expected 'else', got: "
    );
    this.consume();

    const elseExpression: Expression | undefined = this.parseExpression();
    if (elseExpression === undefined)
      return this.throwUnexpectedToken("Expected an expression, got: ");

    return new UseStatement(position, expression, ifExpression, elseExpression);
  };

  parseReturnStatement = () => {
    // returnStatement = "return", [expression];
    if (this.currentToken?.type !== TokenType.T_Return) return undefined;
    const position = this.currentToken?.position;
    this.consume();

    const expression: Expression | undefined = this.parseExpression();

    return new ReturnStatement(position, expression);
  };

  parseConditionalStatement = () => {
    // conditionalStatement = ifStatement | forEachStatement; #NOSONAR
    return this.parseIfStatement() || this.parseForEachStatement();
  };

  parseIfStatement = () => {
    // ifStatement = "if", expression, block, ["else", block];
    if (this.currentToken?.type !== TokenType.T_If) return undefined;
    const position = this.currentToken?.position;
    this.consume();

    const expression: Expression | undefined = this.parseExpression();
    if (expression === undefined)
      return this.throwUnexpectedToken("Expected an expression, got: ");

    const block: Block | undefined = this.parseBlock();
    if (block === undefined)
      return this.throwUnexpectedToken("Expected a block, got: ");

    let elseBlock: Block | undefined;
    if ((this.currentToken?.type as number) === TokenType.T_Else) {
      this.consume();
      elseBlock = this.parseBlock();
      if (elseBlock === undefined)
        return this.throwUnexpectedToken("Expected a (else) block, got: ");
    }

    return new IfStatement(position, expression, block, elseBlock);
  };

  parseForEachStatement = () => {
    // forEachStatement = "foreach", identifier, "in", expression, block;
    if (this.currentToken?.type !== TokenType.T_Foreach) return undefined;
    const position = this.currentToken?.position;
    this.consume();

    const identifier = this.parseIdentifier();
    if (identifier === undefined)
      return this.throwUnexpectedToken("Expected an identifier, got: ");

    this.ifNotOfTypeThrowUnexpectedToken(
      TokenType.T_In,
      "Expected 'in', got: "
    );
    this.consume();

    const expression: Expression | undefined = this.parseExpression();
    if (expression === undefined)
      return this.throwUnexpectedToken("Expected an expression, got: ");

    const block: Block | undefined = this.parseBlock();
    if (block === undefined)
      return this.throwUnexpectedToken("Expected a block, got: ");

    return new ForEachStatement(position, identifier, expression, block);
  };

  parseAssignment = () => {
    // assignment = (functionCallOrIDAndOrAttribute | cellOrRangeOrAttribute), ("=" | "+=" | "-="), (expression | useIf);
    const position = this.currentToken?.position;
    let left =
      this.functionCallOrIDAndOrAttribute() ??
      this.parseCellOrRangeOrAttribute();

    if (left === undefined) return undefined;

    const constructor = assignmentConstructors.get(this.currentToken.type);

    if (constructor === undefined)
      return this.throwUnexpectedToken(
        "Expected an assignment operator, got: "
      );
    this.consume();

    let right = this.parseExpression();
    if (right === undefined) {
      return this.throwUnexpectedToken(
        "Expected an (assigned) expression, got: "
      );
    }

    return constructor(position, left, right);
  };

  parseExpression = () => {
    // expression = orExpression; #NOSONAR
    return this.parseOrExpression();
  };

  parseOrExpression = () => {
    // orExpression = andExpression, {"or", andExpression};
    let left: Expression | undefined = this.parseAndExpression();
    if (left === undefined) return undefined;

    while (this.currentToken?.type === TokenType.T_OrOp) {
      const position = this.currentToken?.position;
      this.consume();

      let right: Expression | undefined = this.parseAndExpression();
      if (right === undefined)
        return this.throwUnexpectedToken("Expected an and expression, got: ");

      left = new OrExpression(position, left, right);
    }

    return left;
  };

  parseAndExpression = () => {
    // andExpression = relativeExpression, {"and", relativeExpression};
    let left: Expression | undefined = this.parseRelativeExpression();
    if (left === undefined) return undefined;

    let right: Expression | undefined;
    while (this.currentToken?.type === TokenType.T_AndOp) {
      const position = this.currentToken?.position;
      this.consume();

      right = this.parseRelativeExpression();
      if (right === undefined)
        return this.throwUnexpectedToken(
          "Expected a relative expression, got: "
        );

      left = new AndExpression(position, left, right);
    }

    return left;
  };

  parseRelativeExpression = (): Expression | undefined => {
    // relativeExpression = additiveExpression, [(">" | "<" | ">=" | "<=" | "==" | "!="), additiveExpression];
    let left: Expression | undefined = this.parseAdditiveExpression();
    if (left === undefined) return undefined;

    const constructor = relativeConstructors.get(this.currentToken.type);
    if (constructor !== undefined) {
      const position = this.currentToken?.position;
      this.consume();

      const right: Expression | undefined = this.parseAdditiveExpression();
      if (right === undefined)
        return this.throwUnexpectedToken(
          "Expected an additive expression, got:"
        );

      left = constructor(position, left, right);
    }
    return left;
  };

  parseAdditiveExpression = () => {
    // additiveExpression = multiplicativeExpression, {("+" | "-"), multiplicativeExpression};
    let left: Expression | undefined = this.parseMultiplicativeExpression();
    if (left === undefined) return undefined;

    let constructor = additiveConstructors.get(this.currentToken.type);
    while (constructor !== undefined) {
      let position = this.currentToken?.position;
      this.consume();

      const right: Expression | undefined =
        this.parseMultiplicativeExpression();
      if (right === undefined)
        return this.throwUnexpectedToken(
          "Expected a multiplicative expression, got:"
        );

      left = constructor(position, left, right);
      constructor = additiveConstructors.get(this.currentToken.type);
    }
    return left;
  };

  parseMultiplicativeExpression = () => {
    // multiplicativeExpression = factor, {("*" | "/"), factor};
    let left: Expression | undefined = this.parseFactor();
    if (left === undefined) return undefined;

    let constructor = multiplicativeConstructors.get(this.currentToken.type);
    while (constructor !== undefined) {
      let position = this.currentToken?.position;
      this.consume();

      const right = this.parseFactor();
      if (right === undefined)
        return this.throwUnexpectedToken("Expected a factor, got: ");

      left = constructor(position, left, right);
      constructor = multiplicativeConstructors.get(this.currentToken.type);
    }

    return left;
  };

  parseAttribute = (left: Expression) => {
    if (this.currentToken?.type !== TokenType.T_AccessOp) return undefined;
    const position = this.currentToken?.position;
    this.consume();

    switch (this.currentToken?.type as number) {
      case TokenType.T_Value:
        this.consume();
        return new AttributeValue(position, left);
      case TokenType.T_Formula:
        this.consume();
        return new AttributeFormula(position, left);
      default:
        this.throwUnexpectedToken("Expected an attribute, got: ");
    }
  };

  parseCellOrRangeOrAttribute = () => {
    // cellOrRangeOrAttribute = cell, ([":", cell] | [".", "value"] | [".", "formula"]);
    const cell = this.parseCell();
    if (cell === undefined) return undefined;
    if (this.currentToken?.type === TokenType.T_Colon) {
      this.consume();
      const nextCell = this.parseCell();
      if (nextCell === undefined)
        return this.throwUnexpectedToken("Expected a cell, got: ");

      return new CellRange(this.currentToken?.position, cell, nextCell);
    }

    const attribute = this.parseAttribute(cell);
    if (attribute === undefined) return cell;
    return attribute;
  };

  parseUseIf = () => {
    // useIf = "use", expression, "if", expression, "else", expression;
    if (this.currentToken?.type !== TokenType.T_Use) return undefined;
    const position = this.currentToken?.position;
    this.consume();

    const expression: Expression | undefined = this.parseExpression();
    if (expression === undefined)
      return this.throwUnexpectedToken("Expected an expression, got: ");

    this.ifNotOfTypeThrowUnexpectedToken(
      TokenType.T_If,
      "Expected 'if', got: "
    );
    this.consume();

    const ifExpression: Expression | undefined = this.parseExpression();
    if (ifExpression === undefined)
      return this.throwUnexpectedToken("Expected an expression, got: ");

    this.ifNotOfTypeThrowUnexpectedToken(
      TokenType.T_Else,
      "Expected 'else', got: "
    );

    this.consume();
    const elseExpression: Expression | undefined = this.parseExpression();
    if (elseExpression === undefined)
      return this.throwUnexpectedToken("Expected an expression, got: ");

    return new UseStatement(position, expression, ifExpression, elseExpression);
  };

  parseFactor = () => {
    // factor =  [negation], (integer | float | text | functionCallOrID | "(", expression, ")" | cellOrRangeOrAttribute);
    const position = this.currentToken?.position;
    let negation: boolean = false;
    if (this.currentToken?.type === TokenType.T_MinOp) {
      negation = true;
      this.consume();
    }

    let factor: Expression | undefined =
      this.parseInteger() ??
      this.parseFloat() ??
      this.parseText() ??
      this.functionCallOrIDAndOrAttribute() ??
      this.parseCellOrRangeOrAttribute() ??
      this.parseUseIf();

    if (factor === undefined) {
      if (this.currentToken?.type === TokenType.T_OpenBracket) {
        this.consume();
        factor = this.parseExpression();
        this.ifNotOfTypeThrowUnexpectedToken(
          TokenType.T_CloseBracket,
          "Expected a closing bracket, got: "
        );
        this.consume();
      }
    }
    if (factor === undefined) {
      return undefined;
    }

    if (negation) {
      return new NegateExpression(position, factor);
    }

    return factor;
  };

  parseText = () => {
    // text = "\"", {char}, "\"";
    if (this.currentToken?.type !== TokenType.T_String) return undefined;
    const position = this.currentToken?.position;
    const text = this.currentToken.value;
    this.consume();

    return new TextLiteral(position, text);
  };

  parseInteger = () => {
    // integer = "0" | (nonZeroDigit, {digit}); #NOSONAR
    if (this.currentToken?.type !== TokenType.T_Int) return undefined;
    const position = this.currentToken?.position;
    const integer = this.currentToken.value;
    this.consume();

    return new IntegerLiteral(position, integer);
  };

  parseFloat = () => {
    // float = integer, ".", digit, {digit};
    if (this.currentToken?.type !== TokenType.T_Float) return undefined;
    const position = this.currentToken?.position;
    const float = this.currentToken.value;
    this.consume();

    return new FloatLiteral(position, float);
  };

  parseIdentifier = () => {
    // identifier = letter, {char | "_"};
    if (this.currentToken?.type !== TokenType.T_Identifier) return undefined;
    const identifier = this.currentToken.value;
    this.consume();

    return identifier;
  };

  parseCell = () => {
    // cell = upperLetter, integer;
    if (this.currentToken?.type !== TokenType.T_Cell) return undefined;
    const cell: string = this.currentToken.value;
    const position = this.currentToken.position;
    this.consume();

    return new Cell(position, cell[0], Number(cell.slice(1)));
  };
}
