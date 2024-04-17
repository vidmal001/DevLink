import React,{ createContext, useContext, useEffect, useState } from 'react'
import { UserContext } from "../App";
import { Link, Navigate } from "react-router-dom";
import Loader from "../components/loader.component";
import QuestionEditor from '../components/question-editor.component';
import QuestionPublsihForm from '../components/Question-Publish-Form.component';


const QuestionStructure = {
  title: "",
  banner: "",
  des: "",
  value:"",
  input:"",
  solution:"",
  explanation:"",
  link : "",
  tags: [],
  companies: [],
  author: { personal_info: {} },
  difficulty : ""
};

export const QuestionContext = createContext({});

const QuestionsAdd = () => {

  const [question, setQuestion] = useState(QuestionStructure);
  const [editorState, setEditorState] = useState("editor");

    let {
        userAuth: { access_token },
      } = useContext(UserContext);
    
      return (

        <QuestionContext.Provider
        value={{
          question,
          setQuestion,
          editorState,
          setEditorState,
        }}
      >
       {access_token === null ? (
        <Navigate to="/signin" />
      
      ) : editorState === "editor" ? (
        <QuestionEditor />
      ) : (
        <QuestionPublsihForm/>
      )}
      </QuestionContext.Provider>
     )
    
}

export default QuestionsAdd