import React, { useEffect, useState } from "react";
import InPageNavigation from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import { Link } from "react-router-dom";
import { useParams,useNavigate } from "react-router-dom";

const Questions = () => {
  let [questions, setQuestions] = useState(null);
  let [pageState, setPageState] = useState("questions");
  let categories = ["array", "string", "hashmap", "linkedlist", "arraylist"];
  let companies = ["virtusa", "ifs", "99x", "codegen", "syzco"];

  let navigate = useNavigate();

  const fetchLatestQuestions = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-questions", { page })
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData({
          state: questions,
          data: data.questions,
          page,
          countRoute: "/all-latest-questions-count",
        });
        setQuestions(formattedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    activeTabRef.current.click();

    if (pageState === "questions") {
      fetchLatestQuestions({ page: 1 });
    } else if (companies.includes(pageState)) {
      fetchQuestionsByCompany({ page: 1 });
    } else {
      fetchQuestionsByCategory({ page: 1 });
    }
  }, [pageState]);

  const loadQuestionByCategory = (e) => {
    let category = e.target.innerText.toLowerCase();
    setQuestions(null);
    if (pageState === category) {
      setPageState("questions"); // Reset to show all questions
    } else if (categories.includes(category) || companies.includes(category)) {
      setPageState(category);
      if (companies.includes(category)) {
        fetchQuestionsByCompany({ page: 1 }); // Fetch questions for the selected company
      } else {
        fetchQuestionsByCategory({ page: 1 }); // Fetch questions for the selected category
      }
    }
  };
  

  const fetchQuestionsByCompany = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-questions", {
        company: pageState,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: questions,
          data: data.questions,
          page,
          countRoute: "/search-questions-count",
          data_to_send: { company: pageState },
        });
        setQuestions(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };


  const fetchQuestionsByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-questions", {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: questions,
          data: data.questions,
          page,
          countRoute: "/search-questions-count",
          data_to_send: { tag: pageState },
        });
        setQuestions(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

   
  const handleSearch = (e) => {
    let query = e.target.value;
    console.log(query);
    if (e.keyCode == 13 && query.length) {
      navigate(`/search-questions/${query}`);
    }
  };


  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <div className="flex items-center justify-end mt-2">
            {/* Search input */}
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search questions"
                className="border border-grey rounded-md py-3 px-12 w-full bg-grey  placeholder:text-dark-grey"
                onKeyDown={handleSearch}
              />
              <i className="fi fi-rr-search absolute top-1/2 transform -translate-y-1/2 left-4 text-dark-grey"></i>
            </div>
          </div>
          <InPageNavigation
            routes={[pageState, "companies"]}
            defaultHidden={["companies"]}
          />
          <>
            {questions === null ? (
              <Loader />
            ) : questions.results.length ? (
              <table className="w-full mb-7">
                <thead>
                  <tr className=" border-b border-grey text-xl font-medium ">
                    <th className="text-left px-4 py-2">Title</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Solution</th>
                    <th className="text-left px-4 py-2">Difficulty</th>
                    <th className="text-left px-4 py-2">Author</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.results.map((question, index) => (
                    <tr
                      key={index}
                      className={`px-4 py-6 ${
                        index % 2 === 0 ? "bg-white" : "bg-grey/100"
                      }`}
                    >
                      <td className="text-left px-4 py-4 capitalize justify-center hover:text-purple">
                        <Link to={`/question/${question.question_id}`}>
                          {question.title}
                        </Link>
                      </td>
                      <td className="text-left px-4 py-4 justify-center">
                        <i className="fi fi-rr-check text-green2"></i>
                      </td>
                      <td className="text-left px-4 py-4 justify-center">
                        <Link
                          to={question.link}
                          className="text-purple3 hover:text-black"
                        >
                          <i className="fi fi-rr-video-camera-alt"></i>
                        </Link>
                      </td>
                      <td
                        className={`text-left px-4 py-4 capitalize justify-center ${
                          question.difficulty === "easy"
                            ? "text-green2"
                            : question.difficulty === "medium"
                            ? "text-yellow"
                            : "text-red"
                        }`}
                      >
                        {question.difficulty}
                      </td>
                      <td className="text-left px-4 py-4 capitalize justify-center">
                        {question.author.personal_info.fullname}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <NoDataMessage message="No Questions Published" />
            )}

            <LoadMoreDataBtn
              state={questions}
              fetchDataFun={
                pageState == "questions"
                  ? fetchLatestQuestions
                  : fetchQuestionsByCategory
              }
            />
          </>
        </div>

        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">
                Topics from all interests
              </h1>
              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => (
                  <button
                    onClick={loadQuestionByCategory}
                    className={
                      "tag" +
                      (pageState === category ? " bg-black text-white " : " ")
                    }
                    key={i}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h1 className="font-medium text-xl mb-8">
                Companies <i className="fi fi-rr-building"></i>
              </h1>
              <div className="flex gap-3 flex-wrap">
                {companies.map((company, i) => (
                  <button
                  onClick={loadQuestionByCategory}
                    className={
                      "tag" +
                      (pageState === company ? " bg-black text-white " : " ")
                    }
                    key={i}
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default Questions;
