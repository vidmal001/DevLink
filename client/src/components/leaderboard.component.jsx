import React from "react";
import { Link } from "react-router-dom";

const Leaderboard = ({ user, index }) => {
  let { username, fullname, profile_img, totalQuestions } = user;
  return (
    <div className="flex items-center justify-between px-4 py-2  rounded-md shadow-md mb-2">
      <div className="flex items-center">
        <p className="font-medium mr-2"> # {index + 1} </p>
        <img
          className="w-10 h-10 rounded-full mr-4"
          src={profile_img}
          alt={`${fullname}'s profile`}
        />
        <div>
          <p className="text-lg font-semibold">{fullname}</p>
          <Link to={`/user/${username}`} className="underline">
            {username}
          </Link>
        </div>
      </div>
      <p className="text-base "> Q : {totalQuestions}</p>
    </div>
  );
};

export default Leaderboard;
