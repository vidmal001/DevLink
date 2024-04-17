import React from "react";
import { getDay } from "../common/date";
import { Link, useParams } from "react-router-dom";

const QuestionPost = ({ question }) => {
  let {
    title,
    banner,
    value,
    solution,
    explanation,
    link,
    publishedAt,
    question_id,
    input,
    tags,
    companies,
    des,
    difficulty,
    author: {
      personal_info: { fullname, profile_img, username: author_username },
    },
  } = question;

  console.log(publishedAt);

  // Determine the color based on the difficulty level
  let difficultyColor = "";
  if (difficulty === "easy") {
    difficultyColor = "text-green2";
  } else if (difficulty === "medium") {
    difficultyColor = "text-yellow";
  } else {
    difficultyColor = "text-red";
  }

  return (
    <div className="border border-gray3 px-12 py-6 rounded-lg mb-4">
      <p className="font-medium text-xl mb-4">{title}</p>

      <div className="flex max-sm:flex-col justify-between my-8">
        <div className="flex gap-5 items-start">
          <img src={profile_img} className="w-12 h-12 rounded-full" />
          <p className="capitalize">
            {fullname}
            <br />@
            <Link to={`/user/${author_username}`} className="underline">
              {author_username}
            </Link>
          </p>
        </div>

        <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
          Published on {getDay(publishedAt)}
        </p>
      </div>

      <div className="flex flex-wrap gap-8 mb-10">
        <div>
          <div className="font-medium mb-2">Tags</div>
          <div className="flex gap-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="bg-grey px-2 py-1 rounded-full capitalize text-center"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="font-medium mb-2">Companies</div>
          <div className="flex gap-2">
            {companies.map((company, index) => (
              <div
                key={index}
                className="bg-grey px-2 py-1 rounded-full capitalize text-center"
              >
                {company}
              </div>
            ))}
          </div>
        </div>

        <div>
            <div className="font-medium mb-2">Difficulty</div>
            <div className="flex gap-2"></div>
            <div className={`px-2 py-1 bg-grey/100 rounded-full text-center capitalize ${difficultyColor}`}>
            {difficulty}
            </div>
          </div>

      
      </div>

      <div>
        <div className="font-medium mb-2">Description</div>
        <p>{des}</p>
      </div>

      <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4 mb-6">
        <img src={banner} />
      </div>

      <div>
        <div className="font-medium mb-2">Example 1</div>

        <p className="font-medium mb-2 py-2">Input : {input}</p>

        <p className="font-medium mb-2">Output : {solution}</p>
        <p className="font-medium mb-2">Explanation : {explanation}</p>
      </div>
    </div>
  );
};

export default QuestionPost;
