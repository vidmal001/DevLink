import React, { createContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import QuestionPost from "../components/question-post.component";
import Loader from "../components/loader.component";
import CodeEditor from "../components/code-editor.component";

export const SingleQuestionContext = createContext({});

const QuestionPage = () => {
  const { question_id } = useParams();
  console.log("Question ID:", question_id);

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/get-question",
          { question_id }
        );
        setQuestion(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching question:", error);
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [question_id]);

  return (
    <div>
      <AnimationWrapper>
        <section className="h-cover flex justify-center gap-20">
          <div className="w-full">
            {loading ? (
              <Loader />
            ) : question ? (
              <QuestionPost question={question} />
            ) : (
              <p>Question not found</p>
            )}
          </div>
          <div className="min-w-[60%] lg:min-w-[600px] max-w-min border rounded-lg border-gray3  max-md:hidden">
            <div>
              {loading ? (
                <Loader />
              ) : question ? (
                <CodeEditor question={question} />
              ) : (
                <p>Question not found</p>
              )}
            </div>
          </div>
        </section>
      </AnimationWrapper>
    </div>
  );
};

export default QuestionPage;
