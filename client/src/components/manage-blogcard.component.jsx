import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import axios from "axios";

const BlogStats = ({ stats }) => {
  return (
    <div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-gray3 max-lg:border-b">
      {Object.keys(stats).map((key, i) => {
        return !key.includes("parent") ? (
          <div
            key={i}
            className={
              "flex flex-col items-center w-full h-full justify-center p-4 px-6 " +
              (i !== 0 ? "border-gray3 border-l" : "")
            }
          >
            <h1 className="text-xl lg:text-xl mb-2">
              {stats[key].toLocaleString()}
            </h1>
            <p className="max-lg:text-dark-grey capitalize">
              {key.split("_")[1]}
            </p>
          </div>
        ) : (
          ""
        );
      })}
    </div>
  );
};

export const ManagePublishBlogCard = ({ blog }) => {
  let { banner, blog_id, title, publishedAt, activity } = blog;
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let [showStat, setShowStat] = useState(false);

  return (
    <>
      <div className="flex gap-10 border-b mb-6 max-w-md border-gray3 pb-6 items-center">
        <img
          src={banner}
          className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover"
        />

        <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
          <div>
            <Link
              to={`/blog/${blog_id}`}
              className="font-medium mb-4 hover:underline"
            >
              {title}
            </Link>
            <p className="line-clamp-1 mt-3">
              Published on {getDay(publishedAt)}{" "}
            </p>
          </div>
        </div>

        <div className="flex gap-6 mt-3">
          <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">
            {" "}
            Edit{" "}
          </Link>
          <button
            className="lg:hidden pr-4 py-2 underline"
            onClick={() => setShowStat((prevVal) => !prevVal)}
          >
            Stats
          </button>
          <button
            className="pr-4 py-2 underline text-red"
            onClick={(e) => {
              deleteBlog(blog, access_token, e.target);
            }}
          >
            Delete
          </button>
        </div>

        <div className="max-lg:hidden">
          <BlogStats stats={activity} />
        </div>
      </div>

      {showStat ? (
        <div className="lg:hidden">
          <BlogStats stats={activity} />
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export const ManagedDraftBlogPost = ({ blog }) => {
  let { blog_id, title, des, index } = blog;

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  index++;
  return (
    <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey ">
      <h1 className="blog-index text-center pl-4 md:pl-6 flex-none">
        {index < 10 ? "0" + index : index}
      </h1>
      <div>
        <h1 className="font-medium mb-3">{title}</h1>
        <p className="line-clamp-2 mt-3">
          {des.length ? des : "No Description"}
        </p>
        <div className="flex gap-6 mt-3">
          <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">
            Edit
          </Link>
          <button
            className="pr-4 py-2 underline text-red"
            onClick={(e) => {
              deleteBlog(blog, access_token, e.target);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const deleteBlog = (blog, access_token, target) => {
  let { index, blog_id, setStateFuc } = blog;
  target.setAttribute("disabled", true);
  axios.post(
    import.meta.env.VITE_SERVER_DOMAIN + "/delete-blog",
    {
      blog_id,
    },
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  ).then(({data})=>{
    target.removeAttribute("disabled");
    setStateFuc(preVal => {
      let { deleteDocCount, totalDocs,results} = preVal;
      results.splice(index,1);
     
      if(!deleteDocCount){
        deleteDocCount = 0;
      }

      if(!results.length && totalDocs -1 > 0 ){
          return null;
      }
      return {...preVal,totalDocs: totalDocs - 1 , deleteDocCount: deleteDocCount +1}
    })
  })
  .catch(err=>{
    console.log(err);
  })
};
