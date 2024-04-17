import React, { useContext } from "react";
import { Toaster, toast } from "react-hot-toast";
import defaultBanner from "../imgs/pexels-anna-shvets-3683053.jpg";
import logo from "../imgs/scroll.png";
import { QuestionContext } from "../pages/questions-add.page";
import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import axios from "axios";

const QuestionEditor = () => {
  let {
    question,
    question: { title, banner, value, input, solution, explanation, link },
    setQuestion,
    setEditorState,
  } = useContext(QuestionContext);

  const handleError = (e) => {
    let img = e.target;
    img.src = defaultBanner;
  };

  //handle image uploading part
  const handleBannerUpload = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      axios
        .post(`${import.meta.env.VITE_SERVER_DOMAIN}/upload`, formData)
        .then((res) => {
          const url = res.data.imageUrl;
          if (url) {
            setQuestion({
              ...question,
              banner: `${import.meta.env.VITE_SERVER_DOMAIN}${url}`,
            });
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const handleTitleChange = (e) => {
    setQuestion({ ...question, title: e.target.value });
  };

  const handleValueChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setQuestion({ ...question, value: input.value });
  };

  const handleSolutionChange = (e) => {
    setQuestion({ ...question, solution: e.target.value });
  };

  const handleLinkChange = (e) => {
    setQuestion({ ...question, link: e.target.value });
  };

  const handleInputChange = (e) => {
    setQuestion({ ...question, input: e.target.value });
  };

  const handleExplanationChange = (e) => {
    setQuestion({ ...question, explanation: e.target.value });
  };

  const handlePostEvent = () => {
    // if(!banner.length){
    //   return toast.error("please upload a image");
    // }

    if (!title.length) {
      return toast.error("Please add a title ");
    }

    if (!value.length) {
      return toast.error("Please add a boiler code ");
    }
    if (!solution.length) {
      return toast.error("Please add a final answer ");
    }
    if (!link.length) {
      return toast.error("Please add a final answer ");
    }
    if (!input.length) {
      return toast.error("please enter the input");
    }
    if (!explanation.length) {
      return toast.error("please enter an explanation");
    }

    setEditorState("post");
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} alt="Logo" />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : " New Question"}
        </p>

        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePostEvent}>
            Post Question
          </button>
          <button className="btn-light py-2">Save Draft</button>
        </div>
      </nav>

      <Toaster />

      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <img src={banner} alt="Uploaded" onError={handleError} />
              <label
                htmlFor="uploadBanner"
                className="absolute top-0 bottom-0 left-0 right-0 cursor-pointer"
              >
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <input
              value={title}
              type="text"
              placeholder="Enter your question title here"
              className="input-box mt-6"
              onChange={handleTitleChange}
            />

            <hr className="w-full opacity-10 my-4" />

            <textarea
              defaultValue={value}
              placeholder="Enter your boiler code here"
              className="input-box mt-6"
              onChange={handleValueChange}
            ></textarea>

            <input
              value={input}
              type="text"
              placeholder="Enter your input here"
              className="input-box mt-6"
              onChange={handleInputChange}
            />

            <input
              value={solution}
              type="text"
              placeholder="Enter the final answer here"
              className="input-box mt-6"
              onChange={handleSolutionChange}
            />
            <textarea
              defaultValue={explanation}
              placeholder="Enter your explanation here"
              className="input-box mt-6"
              onChange={handleExplanationChange}
            ></textarea>
            <input
              value={link}
              type="text"
              placeholder="Enter the video link as a solution"
              className="input-box mt-6 mb-8"
              onChange={handleLinkChange}
            />
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default QuestionEditor;
