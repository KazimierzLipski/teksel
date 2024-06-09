import { CharacterReader } from "@/lib/character-reader";
import { Interpreter, Value } from "@/lib/interpreter";
import { Lexer } from "@/lib/lexer";
import { Parser } from "@/lib/parser";
import { Token } from "@/lib/token";
import { TokenType } from "@/lib/token-types";

export async function POST(request: Request) {
  let data: { code: string, cells: Value<"cell">[][] } = await request.json();
  // console.log(data);
  const cr = new CharacterReader(data.code);
  const lexer = new Lexer(cr);
  const parser = new Parser(lexer);
  let program;
  let cellsRes: Value<"cell">[][] = [];
  let error: unknown | undefined;
  try {
    program = parser.parseProgram();
    let visitor = new Interpreter(data.cells);
    program.accept(visitor);
    const returnObject = visitor.lastCalculation;
    cellsRes = visitor.cells;
    error = visitor.error ? visitor.error.message : undefined;
  } catch (e: any) {
    console.error(e);
    error = e ? e.message : e;
  }
  return Response.json({cells: cellsRes, error: error});
}