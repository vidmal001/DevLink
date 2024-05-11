import axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { Link } from "react-router-dom";

const AllUsers = () => {
  const [students, setStudents] = useState(null);
  const [lecturers, setLecturers] = useState(null);
  const [query, setQuery] = useState(null);
  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const getUsers = ({ page, role }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-all-users", {
        page,
        role,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: role === "student" ? students : lecturers,
          data: data.users,
          page,
          countRoute: "/total-users-count",
          data_to_send: { role },
        });

        console.log("users => " + role, formatedData);

        if (role === "student") {
          setStudents(formatedData);
        } else {
          setLecturers(formatedData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (students === null && lecturers === null) {
      getUsers({ page: 1, role: "lecturer" });
      getUsers({ page: 1, role: "student" });
    }
  }, [students, lecturers]);

  return (
    <>
     
      <InPageNavigation routes={["Students", "Lecturers"]}>
        {students == null ? (
          <Loader />
        ) : students.results.length ? (
          <>
            <table className="w-full mb-7">
              <thead>
                <tr className="border-b border-grey text-xl font-medium ">
                  <th className="text-left px-4 py-2">profile image</th>
                  <th className="text-left px-4 py-2">Fullname</th>
                  <th className="text-left px-4 py-2">Username</th>
                  <th className="text-left px-4 py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {students.results.map((student, i) => (
                  <tr
                    key={i}
                    className={`px-4 py-6 ${
                      i % 2 === 0 ? "bg-white" : "bg-grey/100"
                    }`}
                  >
                    <td className="px-4 py-2">
                      <img
                        className="w-10 h-10 rounded-full mr-4"
                        src={student.personal_info.profile_img}
                      />
                    </td>
                    <td className="px-4 py-2">
                      {student.personal_info.fullname}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        to={`/user/${student.personal_info.username}`}
                        className="underline"
                      >
                        {student.personal_info.username}
                      </Link>
                    </td>
                    <td className="px-4 py-2">{student.personal_info.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <LoadMoreDataBtn
              state={students}
              fetchDataFun={getUsers}
              additionalParam={{
                role: "student",
              }}
            />
          </>
        ) : (
          <NoDataMessage message={"No Students"} />
        )}

        {lecturers == null ? (
          <Loader />
        ) : lecturers.results.length ? (
          <>
            <table className="w-full mb-7">
              <thead>
                <tr className="border-b border-grey text-xl font-medium ">
                  <th className="text-left px-4 py-2">profile image</th>
                  <th className="text-left px-4 py-2">Fullname</th>
                  <th className="text-left px-4 py-2">Username</th>
                  <th className="text-left px-4 py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {lecturers.results.map((lecturer, i) => (
                  <tr>
                    <td className="px-4 py-2">
                      <img
                        className="w-10 h-10 rounded-full mr-4"
                        src={lecturer.personal_info.profile_img}
                      />
                    </td>
                    <td className="px-4 py-2">
                      {lecturer.personal_info.fullname}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        to={`/user/${lecturer.personal_info.username}`}
                        className="underline"
                      >
                        {lecturer.personal_info.username}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      {lecturer.personal_info.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <LoadMoreDataBtn
              state={lecturers}
              fetchDataFun={getUsers}
              additionalParam={{
                role: "lecturer",
              }}
            />
          </>
        ) : (
          <NoDataMessage message={"No lecturers"} />
        )}
      </InPageNavigation>
    </>
  );
};

export default AllUsers;
