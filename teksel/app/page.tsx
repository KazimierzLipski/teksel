"use client";
import { getLiteral, setCells, Value } from "@/lib/interpreter";
import Image from "next/image";
import { useState } from "react";

const alphabet = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

const sum = `def sum(range)
{
    sum = 0
    foreach cell in range
    {
       sum += cell
    }
    return sum
}

def main()
{
    B2 = 7
    B10 = 43
    B11 = sum(B1:B10)
    return B11
    # B11 should equal 50
}`;

const selection = `def main()
{
    B1 = 43
    B2 = use 10 if B1>0 else 54
    return B2
}`;

const count = `def count(range)
{
    count = 0
    foreach cell in range
    {
       count += use 1 if cell!="" else 0
    }
    return count
}

def main()
{
    B3 = 1
    B5 = 10
    B10 = 100
    B11 = count(B1:B10)
    return B11
}`;

const trim = `def trim(cell)
{
    newCell = ""
    spaces = 0
    foreach letter in cell
    {
      spaces += use 1 if letter==" " else -spaces
      newCell += use letter if spaces <= 1 else ""
    }
    return newCell
}

def main()
{
    A1 = "Hello     World"
    A2 = trim(A1)
}`;

const cut = `def mid(cell, indexFrom, chars)
{
    newCell = ""
    count = 0
    tempNewLetter = ""
    foreach letter in cell
    {
      count += 1
      tempNewLetter = use letter if count>=indexFrom else ""
      newCell += use tempNewLetter if indexFrom+chars > count else ""
    }
    return newCell
}

def main()
{
    A1 = "Would you like some crisps?"
    A2 = mid(A1, 7, 3)
    # A2 should be equal to "you"
}`;

const boilerplate = `def main()
{

}`;

function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key == "Tab") {
    e.preventDefault();
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const value = target.value;
    target.value = value.substring(0, start) + "    " + value.substring(end);
    target.selectionStart = start + 4;
    target.selectionEnd = start + 4;

    const event = new Event("input", { bubbles: true });
    target.dispatchEvent(event);

    return false;
  }
}

export default function Home() {
  const [code, setCode] = useState("");
  const [cells, setCellsState] = useState<Value<"cell">[][]>(setCells());
  const computeButtonHandler = () => {
    const res = fetch("/interpret", {
      body: JSON.stringify({ code: code, cells: cells }),
      method: "POST",
    });
    res.then((res) => {
      res.json().then((data: { cells: Value<"cell">[][]; error?: unknown }) => {
        console.log(data);
        if (data.error !== undefined) {
          console.error(data.error);
          alert(data.error);
        } else {
          setCellsState(data.cells);
        }
      });
    });
  };
  const sumButtonHandler = () => setCode(sum);
  const selectionButtonHandler = () => setCode(selection);
  const countButtonHandler = () => setCode(count);
  const trimButtonHandler = () => setCode(trim);
  const cutButtonHandler = () => setCode(cut);

  const zeroOutAllCells = () => {
    setCellsState(setCells());
  };
  return (
    <div className="grid grid-cols-2 h-screen">
      <div className="h-full w-full border-2 border-black">
        <textarea
          className="w-full p-0.5 border-1 border-black border-b-4"
          rows={30}
          onChange={(e) => setCode(e.currentTarget.value)}
          value={code}
          onKeyDown={handleKeyDown}
        />
        <div className="flex flex-row gap-4 flex-wrap">
          <div
            className="border px-2 py-1 flex justify-center items-center bg-green-200 rounded-md ml-1 cursor-pointer w-fit"
            onClick={computeButtonHandler}
          >
            COMPUTE
          </div>
          <div
            className="border px-2 py-1 flex justify-center items-center bg-red-200 rounded-md ml-1 cursor-pointer w-fit"
            onClick={zeroOutAllCells}
          >
            ZERO OUT ALL CELLS
          </div>
          <div
            className="border px-2 py-1 flex justify-center items-center bg-red-200 rounded-md ml-1 cursor-pointer w-fit"
            onClick={() => setCode("")}
          >
            DELETE CODE
          </div>
        </div>
        <div className="mt-2 ml-1">Typical programs:</div>
        <div className="flex flex-row gap-1 w-full flex-wrap">
          <div
            className="mt-1 border px-2 py-1 flex justify-center items-center bg-gray-200 rounded-md ml-1 cursor-pointer w-fit"
            onClick={() => setCode(boilerplate)}
          >
            BOILERPLATE
          </div>
          <div
            className="mt-1 border px-2 py-1 flex justify-center items-center bg-gray-200 rounded-md ml-1 cursor-pointer w-fit"
            onClick={sumButtonHandler}
          >
            SUM
          </div>
          <div
            className="mt-1 border px-2 py-1 flex justify-center items-center bg-gray-200 rounded-md ml-1 cursor-pointer w-fit"
            onClick={selectionButtonHandler}
          >
            SELECTION
          </div>
          <div
            className="mt-1 border px-2 py-1 flex justify-center items-center bg-gray-200 rounded-md ml-1 cursor-pointer w-fit"
            onClick={countButtonHandler}
          >
            COUNT
          </div>
          <div
            className="mt-1 border px-2 py-1 flex justify-center items-center bg-gray-200 rounded-md ml-1 cursor-pointer w-fit"
            onClick={trimButtonHandler}
          >
            TRIM
          </div>
          <div
            className="mt-1 border px-2 py-1 flex justify-center items-center bg-gray-200 rounded-md ml-1 cursor-pointer w-fit"
            onClick={cutButtonHandler}
          >
            CUT
          </div>
        </div>
      </div>
      <div className="h-full w-full flex flex-col overflow-scroll">
        <div className="flex flex-row w-fit">
          {alphabet.map((letter, j) => (
            <div className="flex flex-row" key={letter}>
              {j === 0 ? (
                <div
                  key={"TX" + letter}
                  className="w-8 h-8 flex border border-black overflow-clip pl-0.5 items-center"
                >
                  TX
                </div>
              ) : null}
              <div
                key={letter}
                className="w-16 h-8 flex border border-black overflow-clip pl-0.5 items-center"
              >
                {letter}
              </div>
            </div>
          ))}
        </div>
        {cells !== undefined
          ? cells.map((row, i) =>
              i !== 0 ? (
                <div key={"Row:" + row[0].row} className="flex flex-row w-fit">
                  {row.map((cell, j) => (
                    <div key={cell.column + cell.row} className="flex flex-row">
                      {j === 0 ? (
                        <div
                          key={"rowNum" + cell.row}
                          className="w-8 h-8 flex border border-black overflow-clip pl-0.5 items-center"
                        >
                          {cell.row}
                        </div>
                      ) : null}
                      <input
                        key={cell.column + cell.row}
                        className="w-16 h-8 pl-0.5 flex border border-black overflow-clip items-center"
                        value={cell.value.value as string}
                        onChange={(e) => {
                          setCellsState((prev) => {
                            const value = e.target ? e.target.value : "";
                            let valueLiteral: Value;
                            if (!isNaN(Number(value)) && value !== "") {
                              valueLiteral = Value.integer(Number(value));
                            } else {
                              valueLiteral = Value.text(value);
                            }
                            let newCells = [...prev];
                            newCells[i][j].value = valueLiteral;
                            return newCells;
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : null
            )
          : "No cells"}
      </div>
    </div>
  );
}
