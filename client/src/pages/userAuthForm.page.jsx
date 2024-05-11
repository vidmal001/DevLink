import { useContext, useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { Link, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";

const UserAuthForm = ({ type }) => {
  const authForm = useRef();

  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let serverRoute = type === "sign-in" ? "/signin" : "/signup";

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    let form = new FormData(authForm.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }
    console.log(formData);

    let { fullname, email, password } = formData;

    if (fullname) {
      if (fullname.length < 3) {
        return toast.error("Fullname must be at least 3 letters long");
      }
    }
    if (!email.length) {
      return toast.error("please Enter your Email");
    }

    if (!emailRegex.test(email)) {
      return toast.error("Email is invalid");
    }

    if (!passwordRegex.test(password)) {
      return toast.error(
        "Enter an Strong password..password should be 6 to 20 charcters long with a numeric, 1 lowercase and 1 uppercase letter"
      );
    }

    userAuthThroughServer(serverRoute, formData);
  };

  return (

     access_token ?
     <Navigate to="/"/>

    :
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form ref={authForm} id="authForm"  name="authForm" className="w-[80%] max-w-[400px]">
        {/* heading */}
          <h1 className="text-4xl font-gelasio capitalize text-center mb-12 mt-3">
            {type === "sign-in" ? "Welcome Back" : "Join Us Today "}
          </h1>
          
          {type !== "sign-in" ? (
            <>
              <InputBox
                name="fullname"
                id="fullname"
                type="text"
                placeholder="full name"
                icon="fi-rr-user"
              />
              <div className="relative w-[100%] mb-4">
                <select
                  name="role"
                  id="role"
                  className="input-box"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select your role
                  </option>
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                </select>
                <i className={"fi fi-rr-users input-icon"}></i>
              </div>
            </>
          ) : (
            ""
          )}
          <InputBox
            name="email"
            type="email"
            id="email"
            placeholder="email"
            icon="fi-rr-at"
          />
          <InputBox
            name="password"
            type="password"
            id="password"
            placeholder="password"
            icon="fi-rr-key"
          />

          <button
            className="btn-dark center mt-12 w-[80%] "
            type="submit"
            onClick={handleSubmit}
          >
            {type.replace("-", " ")}
          </button>

          <div className="relative w-full flex items-center gap-2 my-4 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>
          
          {type === "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join us today
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a member?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
