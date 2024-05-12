import { ErrorType, ParserError } from "./error-types";
import { Lexer } from "./lexer";
import {
  AddExpression,
  AdditiveExpression,
  AndExpression,
  ArgumentList,
  AssignmentCell,
  AssignmentID,
  AssignmentMinusEqualsCell,
  AssignmentPlusEqualsCell,
  Block,
  Cell,
  CellAttribute,
  CellRange,
  DivideExpression,
  EqualExpression,
  Expression,
  ExpressionType,
  Factor,
  ForEachStatement,
  FunctionCall,
  FunctionDefinition,
  GreaterThanExpression,
  GreaterThanOrEqualExpression,
  IfStatement,
  LessThanExpression,
  LessThanOrEqualExpression,
  MultiplyExpression,
  NotEqualExpression,
  OrExpression,
  OrExpressionType,
  Program,
  ReturnStatement,
  SubtractExpression,
} from "./statements";
import { Token } from "./token";
import {
  additiveCharTokens,
  assignmentTokens,
  multiCharTokens,
  multiplicativeCharTokens,
} from "./token-dics";
import { TokenType } from "./token-types";

// program = { functionDefinition };
// parameterList = identifier, {",", identifier};
// functionDefinition = "def", identifier, "(", [parameterList], ")", block;
// argumentList = expression, {",", expression};
// functionCallOrID = identifier, ["(", [argumentList], ")"];
// block = "{", {anyStatement}, "}";
// anyStatement = assignment | conditionalStatement | identifier | returnStatement;
// returnStatement = "return", [expression];
// conditionalStatement = ifStatement | forEachStatement;
// ifStatement = "if", expression, block, ["else", block];
// forEachStatement = "foreach", identifier, "in", expression, block;
// assignment = (identifier | cellAttribute), ("=" | "+=" | "-="), expression;
// expression = orExpression;
// orExpression = andExpression, {"or", andExpression};
// andExpression = relativeExpression, {"and", relativeExpression};
// relativeExpression = additiveExpression, [(">" | "<" | ">=" | "<=" | "==" | "!="), additiveExpression];
// additiveExpression = multiplicativeExpression, {("+" | "-"), multiplicativeExpression};
// multiplicativeExpression = factor, {("*" | "/"), factor};
// cellOrRangeOrAttribute = cell, ([":", cell] | [".", identifier]);
// factor = [negation], (integer | float | text | functionCallOrID | "(", expression, ")" | cellOrRangeOrAttribute);
// negation = "-";
// text = "\"", {char}, "\"";
// identifier = letter, {char | "_"};
// cell = upperLetter, integer;
// float = integer, ".", digit, {digit};
// integer = "0" | (nonZeroDigit, {digit});
// char = letter | digit;
// letter = lowerLetter | upperLetter;
// lowerLetter = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z";
// upperLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
// digit = "0" | nonZeroDigit;
// nonZeroDigit = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export class Parser {
  lexer: Lexer;
  currentToken?: Token;
  errors = [];

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.nextToken();
  }

  nextToken = () => {
    this.currentToken = this.lexer.buildToken();
  };

  consume = () => {
    const token = this.currentToken;
    this.nextToken();
    return token;
  };

  parseProgram = () => {
    // program = { functionDefinition };
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

    if (this.currentToken?.type !== TokenType.T_EOF) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Unexpected token: " + this.currentToken
      );
    }

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
        throw new ParserError(
          ErrorType.E_SyntaxError,
          this.currentToken?.position,
          "Expected a parameter, got: " + this.currentToken?.value
        );
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

    if ((this.currentToken?.type as string) !== TokenType.T_OpenBracket) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected an opening bracket, got: " + this.currentToken?.value
      );
    }
    this.consume();

    const parametersList = this.parseParametersList();

    if ((this.currentToken?.type as string) !== TokenType.T_CloseBracket) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected a closing bracket, got: " + this.currentToken?.value
      );
    }
    this.consume();

    const block: Block = this.parseBlock();
    if (block === undefined) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected a block, got: " + this.currentToken?.value
      );
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
        throw new ParserError(
          ErrorType.E_SyntaxError,
          this.currentToken?.position,
          "Expected an argument, got: " + this.currentToken?.value
        );
      }
    }

    return new ArgumentList(position, argumentList);
  };

  parseFunctionCallOrID = () => {
    // functionCallOrID = identifier, ["(", [argumentList], ")"];
    const position = this.currentToken?.position;
    const identifier = this.parseIdentifier();
    if (identifier === undefined) return undefined;

    if ((this.currentToken?.type as string) !== TokenType.T_OpenBracket) {
      return identifier;
    }
    this.consume();

    const argumentList = this.parseArgumentList();
    if ((this.currentToken?.type as string) !== TokenType.T_CloseBracket) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected a closing bracket, got: " + this.currentToken?.value
      );
    }
    this.consume();

    return new FunctionCall(position, identifier, argumentList);
  };

  parseBlock = () => {
    // block = "{", {anyStatement}, "}";
    const position = this.currentToken?.position;
    let block: (
      | AssignmentCell
      | AssignmentID
      | IfStatement
      | ForEachStatement
      | string
      | Factor
      | ReturnStatement
    )[] = [];
    if (this.currentToken?.type !== TokenType.T_OpenCurly) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected an opening curly bracket, got: " + this.currentToken?.value
      );
    }
    this.consume();

    let statement = this.parseAnyStatement();
    while (statement !== undefined) {
      block.push(statement);
      statement = this.parseAnyStatement();
    }

    if ((this.currentToken?.type as string) !== TokenType.T_CloseCurly) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected a closing curly bracket, got: " + this.currentToken?.value
      );
    }
    this.consume();

    return new Block(position, block);
  };

  parseAnyStatement = () => {
    // anyStatement = assignment | conditionalStatement | identifier | returnStatement;
    const anyStatement:
      | AssignmentCell
      | AssignmentID
      | IfStatement
      | ForEachStatement
      | string
      | ReturnStatement
      | Factor
      | undefined =
      this.parseAssignmentOrID() ||
      this.parseConditionalStatement() ||
      this.parseFactor() ||
      this.parseReturnStatement();
    console.log("anyStatement", anyStatement)
    if (anyStatement === undefined) return undefined;
    return anyStatement;
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
    // conditionalStatement = ifStatement | forEachStatement;
    return this.parseIfStatement() || this.parseForEachStatement();
  };

  parseIfStatement = () => {
    // ifStatement = "if", expression, block, ["else", block];
    if (this.currentToken?.type !== TokenType.T_If) return undefined;
    const position = this.currentToken?.position;
    this.consume();

    const expression: Expression | undefined = this.parseExpression();
    if (expression === undefined) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected a expression, got: " + this.currentToken?.value
      );
    }

    const block: Block | undefined = this.parseBlock();
    if (block === undefined) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected a block, got: " + this.currentToken?.value
      );
    }

    let elseBlock: Block | undefined;
    if ((this.currentToken?.type as string) === TokenType.T_Else) {
      this.consume();
      elseBlock = this.parseBlock();
      if (elseBlock === undefined) {
        throw new ParserError(
          ErrorType.E_SyntaxError,
          this.currentToken?.position,
          "Expected a block, got: " + this.currentToken?.value
        );
      }
    }

    return new IfStatement(position, expression, block, elseBlock);
  };

  parseForEachStatement = () => {
    // forEachStatement = "foreach", identifier, "in", expression, block;
    if (this.currentToken?.type !== TokenType.T_Foreach) return undefined;
    const position = this.currentToken?.position;
    this.consume();

    const identifier = this.parseIdentifier();
    if (identifier === undefined) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected an identifier, got: " + this.currentToken?.value
      );
    }

    if ((this.currentToken?.type as string) !== TokenType.T_In) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected 'in', got: " + this.currentToken?.value
      );
    }
    this.consume();

    const expression: Expression | undefined = this.parseExpression();
    if (expression === undefined) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected a expression, got: " + this.currentToken?.value
      );
    }

    const block: Block | undefined = this.parseBlock();
    if (block === undefined) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected a block, got: " + this.currentToken?.value
      );
    }

    return new ForEachStatement(position, identifier, expression, block);
  };

  getOperator = (
    tokensToChoose: { [operator: string]: string },
    currentTokenType: TokenType | undefined
  ): string | undefined => {
    let op = tokensToChoose[currentTokenType as keyof typeof tokensToChoose];
    return op;
  };

  parseAssignmentOrID = () => {
    // assignment = (identifier | cellAttribute), ("=" | "+=" | "-="), expression;
    const position = this.currentToken?.position;
    let isCell = false;
    let cellOrRangeOrAttribute: Cell | CellAttribute | CellRange | undefined =
      undefined;
    const identifier = this.parseIdentifier();
    if (identifier === undefined) {
      cellOrRangeOrAttribute = this.parseCellOrRangeOrAttribute();
      if (cellOrRangeOrAttribute === undefined) return undefined;
      isCell = true;
    }

    const operator = this.getOperator(
      assignmentTokens,
      this.currentToken?.type
    );
    if(operator === undefined && identifier !== undefined) {
      return identifier;
    }
    if (operator === undefined) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected an assignment operator, got: " + this.currentToken?.value
      );
    }
    this.consume();

    let expression: Expression | undefined;
    const ifStatement: IfStatement | undefined = this.parseIfStatement();
    if (ifStatement === undefined) {
      expression = this.parseExpression();
    }
    let assignor = expression === undefined ? ifStatement : expression;
    if (assignor === undefined) {
      throw new ParserError(
        ErrorType.E_SyntaxError,
        this.currentToken?.position,
        "Expected a expression, got: " + this.currentToken?.value
      );
    }

    if (isCell && cellOrRangeOrAttribute) {
      switch (operator) {
        case TokenType.T_AssignOp:
          return new AssignmentCell(position, cellOrRangeOrAttribute, assignor);
        case TokenType.T_PlusEqOp:
          return new AssignmentPlusEqualsCell(
            position,
            cellOrRangeOrAttribute,
            assignor
          );
        case TokenType.T_MinEqOp:
          return new AssignmentMinusEqualsCell(
            position,
            cellOrRangeOrAttribute,
            assignor
          );
      }
    } else {
      switch (operator) {
        case TokenType.T_AssignOp:
          return new AssignmentID(position, identifier, assignor);
        case TokenType.T_PlusEqOp:
          return new AssignmentPlusEqualsCell(position, identifier, assignor);
        case TokenType.T_MinEqOp:
          return new AssignmentMinusEqualsCell(position, identifier, assignor);
      }
    }
  };

  parseExpression = () => {
    // expression = orExpression;
    return new Expression(
      this.currentToken?.position,
      this.parseOrExpression()
    );
  };

  parseOrExpression = () => {
    // orExpression = andExpression, {"or", andExpression};
    let leftAndExpression: OrExpressionType | undefined =
      this.parseAndExpression();
    if (leftAndExpression === undefined) return undefined;

    while (this.currentToken?.type === TokenType.T_OrOp) {
      const position = this.currentToken?.position;
      this.consume();

      let rightAndExpression: OrExpressionType | undefined =
        this.parseAndExpression();
      if (rightAndExpression === undefined) {
        throw new ParserError(
          ErrorType.E_SyntaxError,
          this.currentToken?.position,
          "Expected an and expression, got: " + this.currentToken?.value
        );
      }

      leftAndExpression = new OrExpression(
        position,
        leftAndExpression,
        rightAndExpression
      );
    }

    return leftAndExpression;
  };

  parseAndExpression = () => {
    // andExpression = relativeExpression, {"and", relativeExpression};
    let leftRelativeExpression: ExpressionType | undefined =
      this.parseRelativeExpression();
    if (leftRelativeExpression === undefined) return undefined;

    let rightRelativeExpression: ExpressionType | undefined;
    while (this.currentToken?.type === TokenType.T_AndOp) {
      const position = this.currentToken?.position;
      this.consume();

      rightRelativeExpression = this.parseRelativeExpression();
      if (rightRelativeExpression === undefined) {
        throw new ParserError(
          ErrorType.E_SyntaxError,
          this.currentToken?.position,
          "Expected a relative expression, got: " + this.currentToken?.value
        );
      }
      leftRelativeExpression = new AndExpression(
        position,
        leftRelativeExpression,
        rightRelativeExpression
      );
    }

    return leftRelativeExpression;
  };

  parseRelativeExpression = () => {
    // relativeExpression = additiveExpression, [(">" | "<" | ">=" | "<=" | "==" | "!="), additiveExpression];
    let leftAdditiveExpression: ExpressionType = this.parseAdditiveExpression();
    if (leftAdditiveExpression === undefined) return undefined;

    const operator =
      multiCharTokens[this.currentToken?.type as keyof typeof multiCharTokens];
    if (operator) {
      const position = this.currentToken?.position;
      this.consume();

      const rightAdditiveExpression: ExpressionType =
        this.parseAdditiveExpression();
      if (rightAdditiveExpression === undefined) {
        throw new ParserError(
          ErrorType.E_SyntaxError,
          this.currentToken?.position,
          "Expected an additive expression, got: " + this.currentToken?.value
        );
      }

      switch (operator) {
        case TokenType.T_LesOp:
          leftAdditiveExpression = new LessThanExpression(
            position,
            leftAdditiveExpression,
            rightAdditiveExpression
          );
          break;
        case TokenType.T_GreOp:
          leftAdditiveExpression = new GreaterThanExpression(
            position,
            rightAdditiveExpression,
            leftAdditiveExpression
          );
          break;
        case TokenType.T_LesEqOp:
          leftAdditiveExpression = new LessThanOrEqualExpression(
            position,
            rightAdditiveExpression,
            leftAdditiveExpression
          );
          break;
        case TokenType.T_GreEqOp:
          leftAdditiveExpression = new GreaterThanOrEqualExpression(
            position,
            leftAdditiveExpression,
            rightAdditiveExpression
          );
          break;
        case TokenType.T_EqOp:
          leftAdditiveExpression = new EqualExpression(
            position,
            leftAdditiveExpression,
            rightAdditiveExpression
          );
          break;
        case TokenType.T_NotEqOp:
          leftAdditiveExpression = new NotEqualExpression(
            position,
            leftAdditiveExpression,
            rightAdditiveExpression
          );
          break;
      }
    }
    return leftAdditiveExpression;
  };

  parseAdditiveExpression = () => {
    // additiveExpression = multiplicativeExpression, {("+" | "-"), multiplicativeExpression};
    const position = this.currentToken?.position;
    let leftMultiplicativeExpression:
      | Factor
      | MultiplyExpression
      | DivideExpression
      | undefined
      | AdditiveExpression = this.parseMultiplicativeExpression();
    if (leftMultiplicativeExpression === undefined) return undefined;

    let operator = this.getOperator(
      additiveCharTokens,
      this.currentToken?.type
    );
    while (operator !== undefined) {
      this.consume();

      const rightMultiplicativeExpression: ExpressionType =
        this.parseMultiplicativeExpression();
      if (rightMultiplicativeExpression === undefined) {
        throw new ParserError(
          ErrorType.E_SyntaxError,
          this.currentToken?.position,
          "Expected a multiplicative expression, got: " +
            this.currentToken?.value
        );
      }

      switch (operator) {
        case TokenType.T_AddOp:
          leftMultiplicativeExpression = new AddExpression(
            position,
            leftMultiplicativeExpression,
            rightMultiplicativeExpression
          );
          break;
        case TokenType.T_MinOp:
          leftMultiplicativeExpression = new SubtractExpression(
            position,
            leftMultiplicativeExpression,
            rightMultiplicativeExpression
          );
          break;
      }
      operator = this.getOperator(additiveCharTokens, this.currentToken?.type);
    }
    return leftMultiplicativeExpression;
  };

  parseMultiplicativeExpression = () => {
    // multiplicativeExpression = factor, {("*" | "/"), factor};
    const position = this.currentToken?.position;
    let leftFactor: Factor | MultiplyExpression | DivideExpression | undefined =
      this.parseFactor();
    if (leftFactor === undefined) return undefined;

    let operator = this.getOperator(
      multiplicativeCharTokens,
      this.currentToken?.type
    );
    while (operator !== undefined) {
      this.consume();

      const rightFactor = this.parseFactor();
      if (rightFactor === undefined) {
        throw new ParserError(
          ErrorType.E_SyntaxError,
          this.currentToken?.position,
          "Expected a factor, got: " + this.currentToken?.value
        );
      }

      switch (operator) {
        case TokenType.T_MulOp:
          leftFactor = new MultiplyExpression(
            position,
            leftFactor,
            rightFactor
          );
          break;
        case TokenType.T_DivOp:
          leftFactor = new DivideExpression(position, leftFactor, rightFactor);
          break;
      }
      operator = this.getOperator(
        multiplicativeCharTokens,
        this.currentToken?.type
      );
    }

    return leftFactor;
  };

  parseCellOrRangeOrAttribute = () => {
    // cellOrRangeOrAttribute = cell, ([":", cell] | [".", identifier]);
    const cell = this.parseCell();
    if (cell === undefined) return undefined;
    if (this.currentToken?.type === TokenType.T_Colon) {
      this.consume();
      const nextCell = this.parseCell();
      if (nextCell === undefined) {
        throw new ParserError(
          ErrorType.E_SyntaxError,
          this.currentToken?.position,
          "Expected a cell, got: " + this.currentToken?.value
        );
      }
      return new CellRange(this.currentToken?.position, cell, nextCell);
    }
    let attribute: TokenType.T_Value | TokenType.T_Formula | undefined;
    if (this.currentToken?.type === TokenType.T_AccessOp) {
      this.consume();
      if ((this.currentToken?.type as string) === TokenType.T_Value) {
        attribute = TokenType.T_Value;
      } else if ((this.currentToken?.type as string) === TokenType.T_Formula) {
        attribute = TokenType.T_Formula;
      } else {
        throw new ParserError(
          ErrorType.E_SyntaxError,
          this.currentToken?.position,
          "Expected an attribute, got: " + this.currentToken?.value
        );
      }
      this.consume();
      return new CellAttribute(this.currentToken?.position, cell, attribute);
    }

    return cell;
  };

  parseFactor = (): Factor | undefined => {
    // factor =  [negation], (integer | float | text | functionCallOrID | "(", expression, ")" | cellOrRangeOrAttribute);
    const position = this.currentToken?.position;
    let negation: boolean = false;
    if (this.currentToken?.type === TokenType.T_MinOp) {
      negation = true;
      this.consume();
    }

    console.log("currentToken", this.currentToken?.type);
    let factor:
      | number
      | string
      | FunctionCall
      | Expression
      | Cell
      | CellRange
      | CellAttribute = this.parseInteger();
    if (factor === undefined) {
      factor = this.parseFloat();
    }
    if (factor === undefined) {
      factor = this.parseText();
    }
    if (factor === undefined) {
      factor = this.parseFunctionCallOrID();
    }
    if (factor === undefined) {
      factor = this.parseCellOrRangeOrAttribute();
    }
    if (factor === undefined) {
      if (this.currentToken?.type === TokenType.T_OpenBracket) {
        this.consume();
        factor = this.parseExpression();
        if ((this.currentToken?.type as string) !== TokenType.T_CloseBracket) {
          throw new ParserError(
            ErrorType.E_SyntaxError,
            this.currentToken?.position,
            "Expected a closing bracket, got: " + this.currentToken?.value
          );
        }
        this.consume();
      }
    }
    if (factor === undefined) {
      return undefined;
    }

    if (negation) {
      factor = -factor as number;
    }

    return new Factor(position, factor);
  };

  parseText = () => {
    // text = "\"", {char}, "\"";
    if (this.currentToken?.type !== TokenType.T_String) return undefined;
    const text = this.currentToken.value;
    this.consume();

    return text;
  };

  parseInteger = () => {
    // integer = "0" | (nonZeroDigit, {digit});
    if (this.currentToken?.type !== TokenType.T_Int) return undefined;
    const integer = this.currentToken.value;
    this.consume();

    return integer;
  };

  parseFloat = () => {
    // float = integer, ".", digit, {digit};
    if (this.currentToken?.type !== TokenType.T_Float) return undefined;
    const float = this.currentToken.value;
    this.consume();

    return float;
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
    const cell = this.currentToken.value;
    this.consume();

    return cell;
  };
}
