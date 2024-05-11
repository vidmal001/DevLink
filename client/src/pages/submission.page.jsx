import React, { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { getDay } from "../common/date";

const SubmissionPage = () => {
  const { submission_id } = useParams();
  console.log("Submission ID:", submission_id);

  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/get-submission",
          { submission_id }
        );
        setSubmission(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchSubmission();
  }, [submission_id]);

  return (
    <AnimationWrapper>
      <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
        {submission && (
          <>
            <img src={submission.question.banner} className="aspect-video" />
            <div className="mt-12">
              <h2>{submission.question.title}</h2>
              <div className="flex max-sm:flex-col justify-between my-8">
                <div className="flex gap-5 items-start">
                  <img
                    src={submission.author.personal_info.profile_img}
                    className="w-12 h-12 rounded-full"
                  />
                  <p className="capitalize">
                    {submission.author.personal_info.fullname}
                    <br />@
                    <Link
                      to={`/user/${submission.author.personal_info.username}`}
                      className="underline"
                    >
                      {submission.author.personal_info.username}
                    </Link>
                  </p>
                </div>
                <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  Answered on {getDay(submission.publishedAt)}
                </p>
              </div>
            </div>
            <div className="my-12 font-medium bg-grey rounded-lg p-7">
              <pre className="text-xl font-mono">
                <code className="language-python">{submission.answer}</code>
              </pre>
            </div>
          </>
        )}
      </div>
    </AnimationWrapper>
  );
};

export default SubmissionPage;
