import React, { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { Toaster, toast } from "react-hot-toast";
import InputBox from "../components/input.component";
import { storeInSession } from "../common/session";

const EditProfile = () => {
  const {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);
  let bioLimit = 150;
  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [characterLeft, setCharacterLeft] = useState(bioLimit);
  const [updatedProfileImg, setUpdatedProfileImg] = useState("");
  let editprofileform = useRef();

  const {
    personal_info: {
      fullname,
      username: profile_username,
      profile_img,
      email,
      bio,
    },
    social_links,
  } = profile;

  useEffect(() => {
    if (access_token) {
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
          username: userAuth.username,
        })
        .then(({ data }) => {
          setProfile(data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [userAuth.access_token, userAuth.username]);

  const handleCharacterChange = (e) => {
    setCharacterLeft(bioLimit - e.target.value.length);
  };

  const handleImagePreview = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      axios
        .post(`${import.meta.env.VITE_SERVER_DOMAIN}/upload`, formData)
        .then((res) => {
          const url = res.data.imageUrl;
          if (url) {
            setUpdatedProfileImg(`${import.meta.env.VITE_SERVER_DOMAIN}${url}`);
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (updatedProfileImg) {
      let loadingToast = toast.loading("Uploading....");
      e.target.setAttribute("disabled", true);
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img",
          { updatedProfileImg },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data }) => {
          let newUserAuth = { ...userAuth, profile_img: data.profile_img };
          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
          toast.dismiss(loadingToast);
          e.target.removeAttribute("disabled");
          toast.success("Image Updated Successfully");
        })
        .catch(({ response }) => {
          toast.dismiss(loadingToast);
          e.target.removeAttribute("disabled");
          toast.error(response.data.error);
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let form = new FormData(editprofileform.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }
    let {
      username,
      bio,
      youtube,
      facebook,
      twitter,
      github,
      instagram,
      website,
    } = formData;

    if (username.length < 3) {
      return toast.error("Username should be at least 3 letters long");
    }
    if (bio.length > bioLimit) {
      return toast.error(`Bio Should not be more than ${bioLimit}`);
    }

    let loadingToast = toast.loading("Updating...");
    e.target.setAttribute("disabled", true);
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/update-profile",
        {
          username,
          bio,
          social_links: {
            youtube,
            facebook,
            twitter,
            github,
            instagram,
            website,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        if (userAuth.username !== data.username) {
          let newUserAuth = { ...userAuth, username: data.username };
          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
        }
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.success("Profile Updated");
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error(response.data.error);
      });
  };
  return (
    <div>
      <AnimationWrapper>
        {loading ? (
          <Loader />
        ) : (
          <form ref={editprofileform}>
            <Toaster />
            <h1 className="max-md:hidden">Edit Profile</h1>
            <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
              <div className="max-lg:center mb-5">
                <label
                  htmlFor="uploadImg"
                  id="profileImgLabel"
                  className="relative block w-48 h-48 bg-gray rounded-full overflow-hidden"
                >
                  <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black bg-opacity-30 opacity-0 hover:opacity-100 cursor-pointer">
                    Upload Image
                  </div>
                  <img src={updatedProfileImg || profile_img} alt="Profile" />
                </label>
                <input
                  type="file"
                  id="uploadImg"
                  accept=".jpeg, .png, .jpg"
                  hidden
                  onChange={handleImagePreview}
                />
                <button
                  className="btn-light mt-5 max-lg:center lg:w-full px-10"
                  onClick={handleUpload}
                >
                  {" "}
                  Upload{" "}
                </button>
              </div>
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                  <div>
                    <InputBox
                      name="fullname"
                      type="text"
                      value={fullname}
                      placeholder="Full Name"
                      disable={true}
                      icon="fi-rr-user"
                    />
                  </div>
                  <div>
                    <InputBox
                      name="email"
                      type="email"
                      value={email}
                      placeholder="Email"
                      disable={true}
                      icon="fi-rr-envelope"
                    />
                  </div>
                </div>
                <InputBox
                  type="text"
                  name="username"
                  value={profile_username}
                  placeholder="username"
                  icon="fi-rr-at"
                />
                <p className="text-dark-grey -mt-3">
                  Username will use to search user and will be visible to all
                  users
                </p>
                <textarea
                  name="bio"
                  maxLength={bioLimit}
                  defaultValue={bio}
                  className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                  placeholder="Bio"
                  onChange={handleCharacterChange}
                ></textarea>
                <p className="mt-1 text-dark-grey">
                  {characterLeft} Characters Left
                </p>
                <p className="my-6 text "> Add social handles below </p>
                <div className="md:grid md:grid-cols-2 gap-x-6">
                  {Object.keys(social_links).map((key, i) => {
                    let link = social_links[key];

                    return (
                      <InputBox
                        key={i}
                        name={key}
                        type="text"
                        value={link}
                        placeholder={"https://"}
                        icon={
                          "fi " +
                          (key !== "website"
                            ? "fi-brands-" + key
                            : "fi-rr-globe")
                        }
                      />
                    );
                  })}
                </div>
                <button
                  className="btn-dark w-auto px-12"
                  type="submit"
                  onClick={handleSubmit}
                >
                  Update
                </button>
              </div>
            </div>
          </form>
        )}
      </AnimationWrapper>
    </div>
  );
};

export default EditProfile;
