import classNames from "classnames";
import { useEffect, useState } from "react";
import TextareaAutosize from "react-autosize-textarea";

export default function Instructions() {
  const [colorIndex, setColorIndex] = useState(1);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "c") return;
      if (event.target !== document.body) return;

      setColorIndex((colorIndex) => (colorIndex + 1) % 6);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div
      className={classNames(
        "w-screen h-screen flex flex-col px-32 justify-center",
        {
          "bg-yellow-400": colorIndex === 0,
          "bg-white": colorIndex === 1,
          "bg-black": colorIndex === 2,
          "bg-red-700": colorIndex === 3,
          "bg-green-700": colorIndex === 4,
          "bg-blue-700": colorIndex === 5,
        }
      )}
    >
      <TextareaAutosize
        className={classNames("bg-transparent text-4xl w-full", {
          "text-black opacity-70": colorIndex < 2,
          "text-white opacity-80": colorIndex >= 2,
        })}
        type="text"
        defaultValue="Please..."
      />
      <TextareaAutosize
        className={classNames("bg-transparent font-bold text-8xl py-4 w-full", {
          "text-gray-900": colorIndex < 2,
          "text-white": colorIndex >= 2,
        })}
        type="text"
        defaultValue="Take out your homework from last night."
      />
    </div>
  );
}
