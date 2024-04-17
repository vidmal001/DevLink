import React, { useEffect, useState } from "react";
import { Link,useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";


const SearchQuestions = () => {
    
    let { query } = useParams();
    let [questions, setQuestions] = useState(null);
  
    const searchQuestions = ({ page = 1, create_new_arr = false }) => {
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-questions", {
          query,
          page,
        })
        .then(async ({ data }) => {
          let formatedData = await filterPaginationData({
            state: questions,
            data: data.questions,
            page,
            countRoute: "/search-questions-count",
            data_to_send: { query },
            create_new_arr,
          });
          setQuestions(formatedData);
        })
        .catch((err) => {
          console.log(err);
        });
    };
  
    useEffect(() => {
      resetState();
      searchQuestions({ page: 1, create_new_arr: true });
    }, [query]);
  
    const resetState = () => {
      setQuestions(null);
    };
  
    return (
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigation routes={[`search Results From "${query}"`]}>
            <>
              {questions === null ? (
                <Loader />
              ) : questions.results.length ? (
                <table className="w-full mb-7">
                  <thead>
                    <tr className=" border-b border-grey text-xl font-medium">
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
                            question.difficulty === "Easy"
                              ? "text-green2"
                              : question.difficulty === "Medium"
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
  
              <LoadMoreDataBtn state={questions} fetchDataFun={searchQuestions} />
            </>
          </InPageNavigation>
        </div>
      </section>
    );
  };


export default SearchQuestions