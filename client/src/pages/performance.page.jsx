import React, { useEffect, useState, useContext } from "react";
import {Navigate, Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import Leaderbod from "../components/leaderboard.component";
import Progress from "../components/progress.component";

const Performance = () => {
  let [submissions, setSubmissions] = useState(null);
  let [pageState, setPageState] = useState("submissions");
  const [topUsers, setTopUsers] = useState([]);

  const [counts, setCounts] = useState({
    easyCount: 0,
    mediumCount: 0,
    hardCount: 0,
    totalDocs: 0,
  });

  const [questionCounts, setQuestionCounts] = useState({
    easyCount: 0,
    mediumCount: 0,
    hardCount: 0,
    totalDocs: 0,
  });

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const fetchLatestSubmissions = ({ page = 1 }) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user-latest-submissions",
        { page },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData({
          state: submissions,
          data: data.submissions,
          page,
          user: access_token,
          countRoute: "/all-user-latest-submissions-count",
        });
        let { easyCount, mediumCount, hardCount, totalDocs } = data.counts;
        setSubmissions(formattedData);
        setCounts({ easyCount, mediumCount, hardCount, totalDocs });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchQuestionCounts = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/question-counts")
      .then(({ data }) => {
        setQuestionCounts(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchTopQuestionContributors = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/top-users")
      .then(({ data }) => {
        setTopUsers(data.topUsers);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    activeTabRef.current.click();
    if (access_token && pageState === "submissions") {
      fetchLatestSubmissions({ page: 1 });
    }
    fetchQuestionCounts();
    fetchTopQuestionContributors();
  }, [pageState, access_token]);

  return (
  
    <AnimationWrapper>    
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full scroll-m-2">
          <InPageNavigation
            routes={[pageState, "Submission Activity"]}
            defaultHidden={["Submission Activity"]}
          />
          <>
            {submissions === null ? (
              <Loader />
            ) : submissions.results.length ? (
              <table className="w-full mb-7">
                <thead>
                  <tr className="border-b border-grey text-xl font-medium ">
                    <th className="text-left px-4 py-2">published At</th>
                    <th className="text-left px-4 py-2">Title</th>
                    <th className="text-left px-4 py-2">Difficulty</th>
                    <th className="text-left px-4 py-2">Accepted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.results.map((submission, index) => (
                    <tr
                      key={index}
                      className={`px-4 py-6 ${
                        index % 2 === 0 ? "bg-white" : "bg-grey/100"
                      }`}
                    >
                      <td className="text-left px-4 py-4 capitalize justify-center">
                        {getDay(submission.publishedAt)}
                      </td>
                      <td className="text-left px-4 py-4 capitalize justify-center hover:text-purple">
                        <Link
                          to={`/submission/${submission._id}`}
                        >
                          {submission.question.title}
                        </Link>
                      </td>
                      <td
                        className={`text-left px-4 py-4 capitalize justify-center ${
                          submission.question.difficulty === "easy"
                            ? "text-green2"
                            : submission.question.difficulty === "medium"
                            ? "text-yellow"
                            : "text-red"
                        }`}
                      >
                        {submission.question.difficulty}
                      </td>
                      <td className="text-left px-4 py-4 capitalize justify-center">
                        true
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <NoDataMessage message="You have not submit any questions yet" />
            )}

            <LoadMoreDataBtn
              state={submissions}
              fetchDataFun={
                pageState == "submissions" ? fetchLatestSubmissions : " "
              }
            />
          </>
        </div>

        <div className="min-w-[50%] lg:min-w-[500px] max-w-min border-l border-gray pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10"></div>
          <div>
            <h1 className="font-medium text-xl mb-8">Solved Questions</h1>
            <AnimationWrapper>
              <Progress counts={counts} questionCounts={questionCounts} />
            </AnimationWrapper>
          </div>
          <div>
            <h1 className="font-medium text-xl mb-8">
              Leaderbod <i className="fi fi-rr-chess-king"></i>
            </h1>
            {topUsers.map((user, index) => (
              <AnimationWrapper
                transition={{ duration: 1, delay: index * 0.1 }}
                key={index}
              >
                <Leaderbod user={user} index={index} />
              </AnimationWrapper>
            ))}
          </div>
        </div>
      </section>
    
    </AnimationWrapper> 
    )
};

export default Performance;
