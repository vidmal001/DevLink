import React, { useState, useRef } from "react";

const Timer = () => {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef();

  const startTimer = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setTimer(0);
    setIsRunning(false);
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <button className="mt-5 ml-3 whitespace-nowrap bg-yellow2 rounded-full py-2 px-5 text-base capitalize hover:bg-opacity-80" onClick={isRunning ? stopTimer : startTimer}>
        <i
          className={
            isRunning ? "fi fi-rr-pause mr-2" : "fi fi-rr-play mr-2"
          }
        ></i>
        {isRunning ? "Stop" : "Start"}
      </button>
      <p1 className="mt-5 ml-3 whitespace-nowrap bg-purple2 rounded-full py-3 px-5 text-base capitalize hover:bg-opacity-80">
        <i className="fi fi-rr-alarm-clock mr-2"></i>
        {formatTime(timer)}
      </p1>

      <button className="mt-5 ml-3 whitespace-nowrap bg-red2 rounded-full py-2 px-5 text-base capitalize hover:bg-opacity-80" onClick={resetTimer}>
        <i className="fi fi-rr-refresh mr-2"></i>
        Reset
      </button>
    </>
  );
};

export default Timer;
