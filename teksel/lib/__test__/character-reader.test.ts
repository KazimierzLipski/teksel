import { CharacterReader } from "../character-reader";

test("First test", () => {
  expect(true).toBe(true);
  const testCase = "hmm\nhmm";
  const cr = new CharacterReader(testCase);
  const char = cr.getNextCharacter()
  expect(char).toBe("h");
  expect(cr.firstNotTakenPos).toBe(1);
  expect(cr.positionCol).toBe(1);
  expect(cr.positionRow).toBe(1);
  cr.getNextCharacter()
  cr.getNextCharacter()
  const char2 = cr.getNextCharacter();
  expect(char2).toBe("\n");
  expect(cr.firstNotTakenPos).toBe(4);
  expect(cr.positionCol).toBe(4);
  expect(cr.positionRow).toBe(1);
  cr.getNextCharacter()
  cr.getNextCharacter()
  cr.getNextCharacter()
  cr.getNextCharacter()
  cr.getNextCharacter()
  const char3 = cr.getNextCharacter()
  expect(char3).toBe(undefined);
});

test("/r/n test", () => {
  expect(true).toBe(true);
  const testCase = "\r\na\rb";
  const cr = new CharacterReader(testCase);
  const char = cr.getNextCharacter()
  expect(char).toBe("\n");
  expect(cr.firstNotTakenPos).toBe(2);
  expect(cr.positionCol).toBe(1);
  expect(cr.positionRow).toBe(1);
  const char2 = cr.getNextCharacter();
  expect(char2).toBe("a");
  expect(cr.firstNotTakenPos).toBe(3);
  expect(cr.positionCol).toBe(1);
  expect(cr.positionRow).toBe(2);
  const char3 = cr.getNextCharacter();
  expect(char3).toBe("\r");
  expect(cr.firstNotTakenPos).toBe(4);
  expect(cr.positionCol).toBe(2);
  expect(cr.positionRow).toBe(2);
  const char4 = cr.getNextCharacter()
  expect(char4).toBe("b");
  expect(cr.firstNotTakenPos).toBe(5);
  expect(cr.positionCol).toBe(3);
  expect(cr.positionRow).toBe(2);
  const char5 = cr.getNextCharacter()
  expect(char5).toBe(undefined);
  expect(cr.firstNotTakenPos).toBe(6);
  expect(cr.positionCol).toBe(4);
  expect(cr.positionRow).toBe(2);
  const char6 = cr.getNextCharacter()
  expect(char6).toBe(undefined);
  expect(cr.firstNotTakenPos).toBe(6);
  expect(cr.positionCol).toBe(4);
  expect(cr.positionRow).toBe(2);
});
