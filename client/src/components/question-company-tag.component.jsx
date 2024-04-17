import React, { useContext } from "react";
import { QuestionContext } from "../pages/questions-add.page";

const CompanyTag = ({ tag, tagIndex }) => {
  const {
    question,
    question: { companies },
    setQuestion,
  } = useContext(QuestionContext);

  const handleTagDelete = () => {
    const updatedCompanies = companies.filter((_, index) => index !== tagIndex);
    setQuestion({ ...question, companies: updatedCompanies });
  };

  const handleTagEdit = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();
      const currentTag = e.target.innerText;
      const updatedCompanies = companies.map((item, index) => {
        if (index === tagIndex) {
          return currentTag;
        }
        return item;
      });
      setQuestion({ ...question, companies: updatedCompanies });
      e.target.setAttribute("contentEditable", false);
    }
  };

  const addEditable = (e) => {
    e.target.setAttribute("contentEditable", true);
    e.target.focus();
  };

  return (
    <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10">
      <p
        className="outline-none"
        onKeyDown={handleTagEdit}
        onClick={addEditable}
      >
        {tag}
      </p>
      <button
        className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2"
        onClick={handleTagDelete}
      >
        <i className="fi fi-br-cross text-sm pointer-events-none"></i>
      </button>
    </div>
  );
};

export default CompanyTag;
