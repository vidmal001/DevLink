import React from "react";

const Progress = ({ counts, questionCounts }) => {
  // Calculate percentages
  const easyPercentage = Math.floor(
    (counts.easyCount / questionCounts.easyCount) * 100
  );
  const mediumPercentage = Math.floor(
    (counts.mediumCount / questionCounts.mediumCount) * 100
  );
  const hardPercentage = Math.floor(
    (counts.hardCount / questionCounts.hardCount) * 100
  );

  // Calculate total solved percentage
  const solvedPercentage = Math.floor(
    (counts.totalDocs / questionCounts.totalDocs) * 100
  );

  return (
    <div className="flex justify-between rounded-md px-4 py-2 mb-10 shadow-md">
      <div className="flex flex-col justify-center">
        <svg viewBox="0 0 36 36" width="120" height="120">
          <circle
            className="circle-bg"
            cx="18"
            cy="18"
            r="16"
            fill="transparent"
            stroke="#e6e6e6"
            strokeWidth="4"
          />
          <circle
            className="circle"
            cx="18"
            cy="18"
            r="16"
            fill="transparent"
            stroke="#d946ef"
            strokeWidth="4"
            strokeDasharray={`${solvedPercentage} 100`}
            strokeDashoffset="25"
          />
        </svg>
        <p className="text-lg font-semibold text-center mt-2">
          Solved {counts.totalDocs} / {questionCounts.totalDocs}
        </p>
      </div>
      <div className="flex flex-col ">
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium">Easy</p>
          <p className="font-medium">
            {counts.easyCount} / {questionCounts.easyCount}
          </p>
        </div>
        <div className="h-6 bg-green/10 rounded-full overflow-hidden mb-5 w-80">
          <div
            className="h-full bg-green text-white text-center"
            style={{ width: `${easyPercentage}%` }}
          >
            {easyPercentage}%
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium">Medium</p>
          <p className="font-medium">
            {counts.mediumCount} / {questionCounts.mediumCount}
          </p>
        </div>
        <div className="h-6 bg-yellow/10 rounded-full overflow-hidden mb-5 w-80">
          <div
            className="h-full bg-yellow text-white text-center"
            style={{ width: `${mediumPercentage}%` }}
          >
            {mediumPercentage}%
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium">Hard</p>
          <p className="font-medium">
            {counts.hardCount} / {questionCounts.hardCount}
          </p>
        </div>
        <div className="h-6 bg-red/10 rounded-full overflow-hidden w-80">
          <div
            className="h-full bg-red text-white text-center"
            style={{ width: `${hardPercentage}%` }}
          >
            {hardPercentage}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
