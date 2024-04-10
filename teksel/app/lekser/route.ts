import { CharacterReader } from "@/lib/character-reader";
import { Lexer } from "@/lib/lexer";
import { Token } from "@/lib/token";
import { TokenType } from "@/lib/token-types";

export async function POST(request: Request) {
  let data: { code: string } = await request.json();
  console.log(data);
  const cr = new CharacterReader(data.code);
  const lexer = new Lexer(cr);
  try {
    let token = lexer.buildToken();
    console.log(token)
    while (token?.type !== TokenType.T_EOF) {
      token = lexer.buildToken();
      console.log(token)
    }
  } catch (e) {
    console.error(e);
  }
  return Response.json(data);
}
