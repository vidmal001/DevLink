import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../imgs/scroll.png";
import AnimationWrapper from "../common/page-animation";
import React, { useContext, useEffect } from "react";
import axios from "axios";
import defaultBanner from "../imgs/new_post2.jpg";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import { UserContext } from "../App";

const BlogEditor = () => {
  let {
    blog,
    blog: { title, banner, content, tags, des, author },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  let { blog_id } = useParams();

  let Navigate = useNavigate();

  useEffect(() => {
    setTextEditor(
      new EditorJS({
        holder: "textEditor",
        data: Array.isArray(content) ? content[0] : content,
        tools: tools,
        placeholder: "write your Qestion",
      })
    );
  }, []);

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
            setBlog({
              ...blog,
              banner: `${import.meta.env.VITE_SERVER_DOMAIN}${url}`,
            });
          }
        })
        .catch((err) => console.log(err));
    }
  };

  //handle enter key not going down part
  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      //press enter key
      e.preventDefault();
    }
  };

  //handle title changing part
  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };

  //set the defaultBanner image
  const handleError = (e) => {
    let img = e.target;
    img.src = defaultBanner;
  };

  const handlePostEvent = () => {
    if (!banner.length) {
      return toast.error("Please upload a image");
    }
    if (!title.length) {
      return toast.error("Please add a title ");
    }
    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("post");
          } else {
            return toast.error("Write something");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }

    if (!title.length) {
      return toast.error("Write question title before saving it as a draft ");
    }

    let loadingToast = toast.loading("Saving Draft....");

    e.target.classList.add("disable");

    if (textEditor.isReady) {
      textEditor.save().then((content) => {
        let blogObj = {
          title,
          banner,
          des,
          content,
          tags,
          draft: true,
        };
        axios
          .post(
            import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",
            { ...blogObj, id: blog_id },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          )
          .then(() => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.success("Saved");

            setTimeout(() => {
              Navigate("/dashboard/blogs?tab=draft");
            }, 500);
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);

            return toast.error(response.data.error);
          });
      });
    }
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
          <button className="btn-light py-2" onClick={handleSaveDraft}>
            Save Draft
          </button>
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

            <textarea
              defaultValue={title}
              placeholder="Question Title"
              className="text-3xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />
            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
