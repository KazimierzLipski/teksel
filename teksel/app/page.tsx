"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState("");
  const computeButtonHandler = () => {
    fetch("/lekser", {
      body: JSON.stringify({ code: code }),
      method: "POST",
    });
  };
  return (
    <div className="grid grid-cols-2 h-screen">
      <div className="h-full w-full border-2 border-black">
        <textarea
          className="w-full"
          rows={30}
          onChange={(e) => setCode(e.currentTarget.value)}
          value={code}
        />
        <div
          className="border px-2 py-1 flex justify-center items-center bg-gray-200 rounded-md ml-1 cursor-pointer w-fit"
          onClick={computeButtonHandler}
        >
          COMPUTE
        </div>
      </div>
      <div className="h-full w-full flex items-center justify-center">
        <div>IN PRODUCTION</div>
      </div>
    </div>
  );
}
