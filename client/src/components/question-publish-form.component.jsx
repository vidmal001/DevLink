import React, { useContext } from "react";
import { QuestionContext } from "../pages/questions-add.page";
import AnimationWrapper from "../common/page-animation";
import { UserContext } from "../App";
import QuestionTag from "./question-tag.component";
import CompanyTag from "./question-company-tag.component";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";


const QuestionPublsihForm = () => {
  let CharacterLimit = 1000;
  let tagLimit = 6;

  let Navigate = useNavigate();
  let {
    question,
    question: { title, banner, value,input, solution,explanation, link, companies, des, tags ,difficulty},
    setQuestion,
    setEditorState,
  } = useContext(QuestionContext);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  //handle enter key not going down part
  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };

  const handleDescriptionChange = (e) => {
    setQuestion({ ...question, des: e.target.value });
  };

  const handleKeyDown = (e) => {
    if (e.keyCode == 13 || e.keyCode == 188) {
      e.preventDefault();
      let tag = e.target.value;
      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setQuestion({ ...question, tags: [...tags, tag] });
        }
      } else {
        toast.error(`You can only add ${tagLimit} tags`);
      }
      e.target.value = "";
    }
  };

  const handleCompanyKeyDown = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();
      let company = e.target.value.trim();
      if (companies.length < tagLimit) {
        if (!companies.includes(company) && company.length) {
          setQuestion({ ...question, companies: [...companies, company] });
        }
      } else {
        toast.error(`You can only add ${tagLimit} companies`);
      }
      e.target.value = "";
    }
  };

  const handleDifficultyChange = (e) => {
    setQuestion({ ...question, difficulty: e.target.value });
  };

 
  const publishBlog = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }

    if (!title.length) {
      return toast.error("Write question title before publishing ");
    }
    if (!des.length || des.length > CharacterLimit) {
      return toast.error(
        `Write a description about your question withing ${CharacterLimit} characters to publish`
      );
    }
    if (!tags.length) {
      return toast.error("Enter at least 1 tag to help us rank your Question ");
    }

    let loadingToast = toast.loading("Publishing....");

    e.target.classList.add("disable");

    let questionObj = {
      title,
      banner,
      value,
      input,
      solution,
      link,
      explanation,
      des,
      tags,
      companies,
      difficulty,
    };

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/create-question",
        { ...questionObj},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        toast.success("Published ");

        setTimeout(() => {
          Navigate("/code");
        }, 500);
      })
      .catch(({ response }) => {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);

        return toast.error(response.data.error);
      });
  };


  return (
    <AnimationWrapper>
      <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gp-4">
        {/**close button */}
        <Toaster />
        <button
          className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]
        "
          onClick={handleCloseEvent}
        >
          <i className="fi fi-br-cross"></i>
        </button>

        {/**left section */}

        <div className="max-w-[550px] center">
          <p className="text-dark-grey mb-1">Preview</p>
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img src={banner} />
          </div>
          <h1 className="text-2xl font-medium mt-6 leading-tight line-clamp-2">
            {title}
          </h1>
          
          <p className="text-dark-grey mb-2 mt-9">Question Difficuty</p>
           <select value={difficulty} onChange={handleDifficultyChange} className="input-box pl-4">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

        </div>

        {/**right section */}

        <div className="border-grey lg:border-1 lg:pl-8">
          <p className="text-dark-grey mb-2 ">
            Short Description About Your Question
          </p>

          <textarea
            maxLength={CharacterLimit}
            defaultValue={des}
            className="h-40 resize-none leading-7 input-box pl-4"
            onChange={handleDescriptionChange}
            onKeyDown={handleTitleKeyDown}
          ></textarea>

          <p className="mt-1 text-dark-grey text-sm text-right">
            {CharacterLimit - des.length} characters left
          </p>

          <p className="text-dark-grey mb-2 mt-3">
            Topics - ( Helps in searching and ranking )
          </p>
         
          <div className="relative input-box pl-2 py-2 pb-4">
            <input
              type="text placeholder"
              placeholder="Topic"
              className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
              onKeyDown={handleKeyDown}
            />
            {tags.map((tag, i) => {
              return <QuestionTag tag={tag} tagIndex={i} key={i} />;
            })}
          </div>

          <p className="mt-1 mb-4 text-dark-grey text-right">
            You can add total of {tagLimit - tags.length} Tags{" "}
          </p>


          <p className="text-dark-grey mb-2 mt-3">
            Companies 
          </p>
         
          <div className="relative input-box pl-2 py-2 pb-4">
            <input
              type="text"
              placeholder="Company"
              className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
              onKeyDown={handleCompanyKeyDown}
            />
            {companies.map((company, i) => (
              <CompanyTag
                tag={company}
                tagIndex={i}
                key={i}
              />
            ))}
          </div>

          <p className="mt-1 mb-4 text-dark-grey text-right">
            You can add total of {tagLimit - companies.length} Tags{" "}
          </p>

          <button className="btn-dark px-8" onClick={publishBlog} >
            
            Publish
          </button>
         

        </div>
      </section>
    </AnimationWrapper>
  );
};

export default QuestionPublsihForm;
