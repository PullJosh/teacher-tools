import { useEffect, useState } from "react";
import Head from "next/head";

export default function Timer() {
  const [running, setRunning] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [startValue, setStartValue] = useState(5 * 60);

  const [timerTimeout, setTimerTimeout] = useState(null);

  const [, rerender] = useState(null);
  useEffect(() => {
    if (running) {
      const interval = setInterval(() => {
        rerender(Math.random());
      }, 100);
      return () => {
        clearInterval(interval);
      };
    }
  }, [running]);

  const currentValue = Math.round(
    startValue - (running ? (new Date() - startDate) / 1000 : 0)
  );

  const pad = (num, minDigits) => {
    let result = String(num);
    let zeroes = "0".repeat(Math.max(0, minDigits - result.length));
    return zeroes + result;
  };
  const formatValue = (value) =>
    `${Math.floor(value / 60)}:${pad(value % 60, 2)}`;

  const [inputValue, setInputValue] = useState(formatValue(currentValue));

  function parseInputValue(v = inputValue) {
    let value = 0;
    if (!isNaN(Number(v))) {
      value = Number(v) * 60;
    } else {
      const parts = v.split(":");
      if (parts.length === 2) {
        value = (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
      }
    }
    setStartValue(value);
    setInputValue(formatValue(value));
    return value;
  }

  function startTimer(value = null) {
    if (value !== null) {
      setStartValue(value);
    }
    setStartDate(new Date());
    setRunning(true);

    clearTimeout(timerTimeout);
    setTimerTimeout(
      setTimeout(endTimer, (value === null ? currentValue : value) * 1000)
    );
  }

  function stopTimer(endValue = currentValue) {
    setStartValue(endValue);
    setInputValue(formatValue(endValue));
    setRunning(false);

    clearTimeout(timerTimeout);
  }

  function endTimer() {
    stopTimer(0);
  }

  function setTime(value) {
    if (value <= 0) {
      endTimer(0);
    } else if (running) {
      startTimer(value);
    } else {
      stopTimer(value);
    }
  }

  const [pressure, setPressure] = useState("low");

  let displayTime = formatValue(currentValue);
  if (pressure === "low") {
    let mins = Math.floor(currentValue / 60);
    displayTime = `${mins} min${mins === 1 ? "" : "s"}`;

    if (currentValue < 60) {
      displayTime = `${currentValue}s`;
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col">
      <Head>
        <title>{running ? `${displayTime} | Timer` : "Timer"}</title>
      </Head>
      <input
        className="font-mono my-auto w-full text-center bg-transparent"
        style={{ fontSize: "20vw" }}
        type="text"
        value={running ? displayTime : inputValue}
        onInput={(event) => {
          setInputValue(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            startTimer(parseInputValue(event.target.value));
          }
          if (event.key === "Escape") {
            event.target.blur();
          }
        }}
        onBlur={(event) => {
          parseInputValue(event.target.value);
        }}
        placeholder="0:00"
        disabled={running}
      />
      <div className="flex p-4 space-x-2">
        <select
          className="bg-gray-200 px-4 py-2 mr-auto"
          value={pressure}
          onChange={(event) => {
            setPressure(event.target.value);
          }}
        >
          <option value="low">Low pressure</option>
          <option value="high">High pressure</option>
        </select>

        <button
          className="bg-gray-200 px-4 py-2"
          onClick={() => {
            setTime(currentValue - 60);
          }}
        >
          -1 min
        </button>
        <button
          className="bg-gray-200 px-4 py-2"
          onClick={() => {
            setTime(currentValue + 60);
          }}
        >
          +1 min
        </button>

        <button
          className="bg-black text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            if (running) {
              stopTimer();
            } else {
              startTimer();
            }
          }}
          disabled={currentValue === 0}
        >
          {running ? "Pause" : "Start"}
        </button>
      </div>
    </div>
  );
}
