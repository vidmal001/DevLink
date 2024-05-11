import React, { useState, useEffect, createContext } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNav from "./components/sidenavbar.component";
import ChangePassword from "./pages/change-password.page";
import EditProfile from "./pages/edit-profile.page";
import Notifications from "./pages/notifications.page";
import ManageBlogs from "./pages/manage-blogs.page";
import Questions from "./pages/questions.page";
import QuestionsAdd from "./pages/questions-add.page";
import QuestionPage from "./pages/question.page";
import SearchQuestions from "./pages/search-questions.page";
import Performance from "./pages/performance.page";
import AllUsers from "./pages/all-users.page";
import SubmissionPage from "./pages/submission.page";

export const UserContext = createContext({});
export const ThemeContex = createContext({});

const App = () => {
  const [userAuth, setUserAuth] = useState({});
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    let userInSession = lookInSession("user");
    let themeInSession = lookInSession("theme");
    setUserAuth(
      userInSession ? JSON.parse(userInSession) : { access_token: null }
    );

    if(themeInSession){
      setTheme(()=>{
        document.body.setAttribute('data-theme',themeInSession);
        return themeInSession;
      })
    }
    else{
      document.body.setAttribute('data-theme',theme);
    }
   
  }, []);

  return (
    <ThemeContex.Provider value={{theme,setTheme}}>
      <UserContext.Provider value={{ userAuth, setUserAuth }}>
        <Routes>
          <Route path="/code/add" element={<QuestionsAdd />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:blog_id" element={<Editor />} />
          {/** parent route..Outlet should use in navbar otherwise we can't see any text and only navbar will display.it basically means rendering the nested route elements */}
          <Route path="/" element={<Navbar />}>
            <Route path="/code" element={<Questions />} />
            <Route path="/performance" element={<Performance/>}/>
            <Route index element={<HomePage />} />

            <Route path="dashboard" element={<SideNav />}>
              <Route path="blogs" element={<ManageBlogs />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="all-users" element={<AllUsers/>} />
            </Route>

            <Route path="settings" element={<SideNav />}>
              <Route path="edit-profile" element={<EditProfile />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>

            <Route
              path="signin"
              element={<UserAuthForm key="signin" type="sign-in" />}
            />
            <Route
              path="signup"
              element={<UserAuthForm key="signup" type="sign-up" />}
            />
            <Route path="search/:query" element={<SearchPage />} />

            <Route
              path="search-questions/:query"
              element={<SearchQuestions />}
            />

            <Route path="user/:id" element={<ProfilePage />} />
            <Route path="blog/:blog_id" element={<BlogPage />} />
            <Route path="question/:question_id" element={<QuestionPage />} />
            <Route path="submission/:submission_id" element={<SubmissionPage/>}/>
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </UserContext.Provider>
    </ThemeContex.Provider>
  );
};

export default App;
