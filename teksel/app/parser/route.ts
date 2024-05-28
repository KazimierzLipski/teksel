import { CharacterReader } from "@/lib/character-reader";
import { Lexer } from "@/lib/lexer";
import { Parser } from "@/lib/parser";
import { Token } from "@/lib/token";
import { TokenType } from "@/lib/token-types";

export async function POST(request: Request) {
  let data: { code: string } = await request.json();
  console.log(data);
  const cr = new CharacterReader(data.code);
  const lexer = new Lexer(cr);
  const parser = new Parser(lexer);
  let program;
  try {
    program = parser.parseProgram();
  } catch (e) {
    console.error(e);
  }
  console.log(program);
  return Response.json(program);
}