import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import multer from "multer";
import path from "path";
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
import Notification from "./Schema/Notification.js";
import Comment from "./Schema/Comment.js";
import Question from "./Schema/Question.js";
import Submission from "./Schema/Submission.js";
import generateFile from "./generateFile.js";
import executePy from "./executePy.js";


const server = express();
let PORT = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.urlencoded({ extended: true }));
server.use(express.json()); // enable the json sharing and will accept json data from the frontend
server.use(cors());

mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});
server.use(express.static("public"));
server.post("/upload", upload.single("file"), (req, res) => {
  const imageUrl = `/Images/${req.file.filename}`;
  res.json({ imageUrl });
});

server.post("/run", async (req, res) => {
  const { language = "py", code } = req.body;
  if (code === undefined) {
    return res.status(400).json({ success: false, error: "Empty code body" });
  }

  try {
    const filepath = await generateFile(language, code);
    let output;
    if (language === "py") {
      output = await executePy(filepath);
    }
    return res.json({ filepath, output }); // Define output variable here
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});


const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({ error: "No access token " });
  }
  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }

    req.user = user.id;
    next();
  });
};

const formatDatatoSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );
  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
    role: user.personal_info.role,
  };
};

const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let isUsernameNotUnique = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);
  isUsernameNotUnique ? (username += nanoid().substring(0, 5)) : "";
  return username;
};

server.post("/signup", (req, res) => {
  let { fullname, role, email, password } = req.body;

  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "Fullname must be at least 3 letters long" });
  }

  // 0 means false email.length gives false. ! false gives true.
  if (!role.length) {
    return res.status(403).json({ error: "select role" });
  }

  if (!email.length) {
    return res.status(403).json({ error: "Enter Email" });
  }

  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "Email is invalid" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "Enter an Strong password..password should be 6 to 20 charcters long with a numeric, 1 lowercase and 1 uppercase letter",
    });
  }

  bcrypt.hash(password, 10, async (err, hashed_password) => {
    let username = await generateUsername(email);
    let user = new User({
      personal_info: {
        fullname,
        role,
        email,
        password: hashed_password,
        username,
      },
    });

    user
      .save()
      .then((u) => {
        return res.status(200).json(formatDatatoSend(u));
      })
      .catch((err) => {
        if (err.code == 11000) {
          return res.status(500).json({ error: "Email already exist" });
        }
        return res.status(500).json({ error: err.message });
      });
  });
});

server.post("/signin", (req, res) => {
  let { email, password } = req.body;
  User.findOne({ "personal_info.email": email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "Email not found" });
      }
      bcrypt.compare(password, user.personal_info.password, (err, result) => {
        if (err) {
          return res.status(500).json({
            error: "Error occured while login please try again later",
          });
        }
        if (!result) {
          return res.status(403).json({ error: "Incorrect Password" });
        } else {
          return res.status(200).json(formatDatatoSend(user));
        }
      });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/change-password", verifyJWT, (req, res) => {
  let { currentPassword, newPassword } = req.body;
  if (
    !passwordRegex.test(currentPassword) ||
    !passwordRegex.test(newPassword)
  ) {
    return res.status(403).json({
      error:
        "Enter an Strong password..password should be 6 to 20 charcters long with a numeric, 1 lowercase and 1 uppercase letter",
    });
  }

  User.findOne({ _id: req.user })
    .then((user) => {
      bcrypt.compare(
        currentPassword,
        user.personal_info.password,
        (err, result) => {
          if (err) {
            return res.status(500).json({
              error:
                "some error occured while changing the password please try again later.",
            });
          }
          if (!result) {
            return res
              .status(403)
              .json({ error: "Incorrect current password" });
          }

          bcrypt.hash(newPassword, 10, (err, hashed_password) => {
            User.findOneAndUpdate(
              { _id: req.user },
              { "personal_info.password": hashed_password }
            )
              .then((u) => {
                return res.status(200).json({ status: "password change" });
              })
              .catch((err) => {
                return res.status(500).json({
                  error:
                    "error occured while saving the password . please try again later",
                });
              });
          });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: "user not found" });
    });
});

server.post("/create-blog", verifyJWT, (req, res) => {
  let authorId = req.user;
  let { title, des, banner, tags, content, draft, id } = req.body;

  if (!title.length) {
    return res.status(403).json({ error: "You must provide a title" });
  }

  if (!draft) {
    if (!des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters ",
      });
    }
    if (!banner.length) {
      return res
        .status(403)
        .json({ error: "you must provide blog banner to publish it" });
    }
    if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: " There must be some blog content to publish it" });
    }
    if (!tags.length || tags.length > 10) {
      return res
        .status(403)
        .json({ error: "Provide tags in order to publish the blog" });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());
  let blog_id =
    id ||
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  if (id) {
    Blog.findOneAndUpdate(
      { blog_id },
      { title, des, banner, content, tags, draft: draft ? draft : false }
    )
      .then(() => {
        return res.status(200).json({ id: blog_id });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
  } else {
    let blog = new Blog({
      title,
      des,
      banner,
      content,
      tags,
      author: authorId,
      blog_id,
      draft: Boolean(draft),
    });

    blog
      .save()
      .then((blog) => {
        let incrementVal = draft ? 0 : 1;
        User.findOneAndUpdate(
          { _id: authorId },
          {
            $inc: { "account_info.total_posts": incrementVal },
            $push: { blogs: blog._id },
          }
        )
          .then((user) => {
            return res.status(200).json({ id: blog.blog_id });
          })
          .catch((err) => {
            return res
              .status(500)
              .json({ error: " Failed to update total posts number" });
          });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
  }
});

server.post("/search-blogs", (req, res) => {
  let { tag, query, author, page, limit, eliminate_blog } = req.body;
  let findQuery;
  if (tag) {
    findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }
  let maxLimit = limit ? limit : 2;

  Blog.find(findQuery)
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id "
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/search-blogs-count", (req, res) => {
  let { tag, author, query } = req.body;
  let findQuery;
  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }
  Blog.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/search-users", (req, res) => {
  let { query } = req.body;
  User.find({ "personal_info.username": new RegExp(query, "i") })
    .limit(50)
    .select(
      "personal_info.fullname personal_info.username personal_info.profile_img -_id"
    )
    .then((users) => {
      return res.status(200).json({ users });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/latest-blogs", (req, res) => {
  let maxLimit = 5;
  let { page } = req.body;

  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id "
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/all-latest-blogs-count", (req, res) => {
  Blog.countDocuments({ draft: false })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.loh(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.get("/trending-blogs", (req, res) => {
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id "
    )
    .sort({
      "activity.total_reads": -1,
      "activity.total_likes": -1,
      publishedAt: -1,
    })
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/get-profile", (req, res) => {
  let { username } = req.body;
  User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/get-blog", (req, res) => {
  let { blog_id, draft, mode } = req.body;
  let incrementVal = mode !== "edit" ? 1 : 0;
  Blog.findOneAndUpdate(
    { blog_id },
    { $inc: { "activity.total_reads": incrementVal } }
  )
    .populate(
      "author",
      "personal_info.fullname personal_info.username personal_info.profile_img"
    )
    .select("title des content banner activity publishedAt blog_id tags")
    .then((blog) => {
      User.findOneAndUpdate(
        { "personal_info.username": blog.author.personal_info.username },
        {
          $inc: { "account_info.total_reads": incrementVal },
        }
      ).catch((err) => {
        return res.json(500).json({ error: err.message });
      });
      if (blog.draft && !draft) {
        return res
          .status(500)
          .json({ error: "you can not access draft blogs" });
      }
      return res.status(200).json({ blog });
    })
    .catch((err) => {
      return res.json(500).json({ error: err.message });
    });
});

server.post("/like-blog", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id, islikedByUser } = req.body;
  let incrementVal = !islikedByUser ? 1 : -1;
  Blog.findOneAndUpdate(
    { _id },
    { $inc: { "activity.total_likes": incrementVal } }
  ).then((blog) => {
    if (!islikedByUser) {
      let like = new Notification({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id,
      });
      like.save().then((notification) => {
        return res.status(200).json({ liked_by_user: true });
      });
    } else {
      Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
        .then((data) => {
          return res.status(200).json({ liked_by_user: false });
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    }
  });
});

server.post("/isliked-by-user", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id } = req.body;
  Notification.exists({ user: user_id, type: "like", blog: _id })
    .then((result) => {
      return res.status(200).json({ result });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/add-comment", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id, comment, blog_author, replying_to, notification_id } = req.body;
  if (!comment.length) {
    return res
      .status(403)
      .json({ error: "write something to leave a comment" });
  }
  let commentObj = {
    blog_id: _id,
    blog_author,
    comment,
    commented_by: user_id,
  };

  if (replying_to) {
    commentObj.parent = replying_to;
    commentObj.isReply = true;
  }

  new Comment(commentObj).save().then(async (commentFile) => {
    let { comment, commentedAt, children } = commentFile;
    Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": replying_to ? 0 : 1,
        },
      }
    ).then((blog) => {
      console.log("New Comment created");
    });

    let notificationObj = {
      type: replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    };

    if (replying_to) {
      notificationObj.replied_on_comment = replying_to;

      await Comment.findOneAndUpdate(
        { _id: replying_to },
        { $push: { children: commentFile._id } }
      ).then((replyingToCommentDoc) => {
        notificationObj.notification_for = replyingToCommentDoc.commented_by;
      });

      if (notification_id) {
        Notification.findOneAndUpdate(
          { _id: notification_id },
          { reply: commentFile._id }
        ).then((notification) => console.log("notification updated"));
      }
    }

    new Notification(notificationObj)
      .save()
      .then((notification) => console.log("new notification created"));

    return res.status(200).json({
      comment,
      commentedAt,
      _id: commentFile._id,
      user_id,
      children,
    });
  });
});

server.post("/get-blog-comments", (req, res) => {
  let { blog_id, skip } = req.body;
  let maxLimit = 5;
  Comment.find({ blog_id, isReply: false })
    .populate(
      "commented_by",
      "personal_info.username personal_info.fullname personal_info.profile_img"
    )
    .skip(skip)
    .limit(maxLimit)
    .sort({
      commentedAt: -1,
    })
    .then((comment) => {
      console.log(comment, blog_id, skip);
      return res.status(200).json(comment);
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/get-replies", (req, res) => {
  let { _id, skip } = req.body;
  let maxLimit = 5;
  Comment.findOne({ _id }) //find the parent component
    .populate({
      path: "children",
      options: {
        limit: maxLimit,
        skip: skip,
        sort: { commentedAt: -1 },
      },
      populate: {
        path: "commented_by",
        select:
          "personal_info.profile_img personal_info.fullname personal_info.username",
      },
      // whqt do you want to select from children document
      select: "-blog_id -updatedAt",
    })
    .select("children")
    .then((doc) => {
      return res.status(200).json({ replies: doc.children });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

const deleteComments = (_id) => {
  Comment.findOneAndDelete({ _id })
    .then((comment) => {
      if (comment.parent) {
        Comment.findOneAndUpdate(
          { _id: comment.parent },
          { $pull: { children: _id } }
        )
          .then((data) => console.log("comment delete from parent"))
          .catch((err) => console.log(err));
      }

      Notification.findOneAndDelete({ comment: _id }).then((Notification) =>
        console.log("comment notification deleted")
      );

      Notification.findOneAndUpdate(
        { reply: _id },
        { $unset: { reply: 1 } }
      ).then((notification) => console.log("Reply notification deleted"));

      Blog.findOneAndUpdate(
        { _id: comment.blog_id },
        {
          $pull: { comments: _id },
          $inc: { "activity.total_comments": -1 },
          "activity.total_parent_comments": comment.parent ? 0 : -1,
        }
      ).then((blog) => {
        if (comment.children.length) {
          comment.children.map((replies) => {
            deleteComments(replies);
          });
        }
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
};

server.post("/delete-comment", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id } = req.body;
  Comment.findOne({ _id }).then((comment) => {
    if (user_id == comment.commented_by || user_id == comment.blog_author) {
      deleteComments(_id);
      return res.status(200).json({ status: "done" });
    } else {
      return res.status(403).json({ error: "you can not delete this comment" });
    }
  });
});

server.post("/update-profile-img", verifyJWT, (req, res) => {
  let { updatedProfileImg } = req.body;
  console.log(updatedProfileImg);
  User.findOneAndUpdate(
    { _id: req.user },
    { "personal_info.profile_img": updatedProfileImg }
  )
    .then(() => {
      return res.status(200).json({ profile_img: updatedProfileImg });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/update-profile", verifyJWT, (req, res) => {
  let { username, bio, social_links } = req.body;
  let bioLimit = 150;
  if (username.length < 3) {
    return res
      .status(403)
      .json({ error: "Username should be at least 3 letters long." });
  }
  if (bio.length > bioLimit) {
    return res
      .status(403)
      .json({ error: `Bio should not be more than ${bioLimit} characters` });
  }

  let socialLinksArr = Object.keys(social_links);

  try {
    for (let i = 0; i < socialLinksArr.length; i++) {
      if (social_links[socialLinksArr[i]].length) {
        let hostname = new URL(social_links[socialLinksArr[i]]).hostname;
        if (
          !hostname.includes(`${socialLinksArr[i]}.com`) &&
          socialLinksArr[i] !== "website"
        ) {
          return res.status(403).json({
            error: `${socialLinksArr[i]} link is invalid.You must enter a full link`,
          });
        }
      }
    }
  } catch (err) {
    return res.status(500).json({
      error: "You must provide full social links with http(s) included",
    });
  }

  let updateObj = {
    "personal_info.username": username,
    "personal_info.bio": bio,
    social_links,
  };
  User.findOneAndUpdate({ _id: req.user }, updateObj, {
    runValidators: true,
  })
    .then(() => {
      return res.status(200).json({ username });
    })
    .catch((err) => {
      if (err.code == 11000) {
        return res.status(409).json({ error: " username is already taken " });
      }
      return res.status(500).json({ error: err.message });
    });
});

server.get("/new-notification", verifyJWT, (req, res) => {
  let user_id = req.user;
  Notification.exists({
    notification_for: user_id,
    seen: false,
    user: { $ne: user_id },
  })
    .then((result) => {
      if (result) {
        return res.status(200).json({ new_notification_available: true });
      } else {
        return res.status(200).json({ new_notification_available: false });
      }
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/notifications", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { page, filter, deletedDocCount } = req.body;
  let maxLimit = 10;
  let findQuery = { notification_for: user_id, user: { $ne: user_id } };
  let skipDocs = (page - 1) * maxLimit;
  if (filter !== "all") {
    findQuery.type = filter;
  }
  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }
  Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id")
    .populate(
      "user",
      "personal_info.fullname personal_info.username personal_info.profile_img"
    )
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({ createdAt: -1 })
    .select("createdAt type seen reply")
    .then((notifications) => {
      Notification.updateMany(findQuery, { seen: true })
        .skip(skipDocs)
        .limit(maxLimit)
        .then(() => {
          console.log("notification seen");
        });
      return res.status(200).json({ notifications });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/all-notifications-count", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { filter } = req.body;
  let findQuery = { notification_for: user_id, user: { $ne: user_id } };
  if (filter !== "all") {
    findQuery.type = filter;
  }
  Notification.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/user-written-blogs", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { page, draft, query, deleteDocCount } = req.body;
  let maxLimit = 5;
  let skipDocs = (page - 1) * maxLimit;
  if (deleteDocCount) {
    skipDocs -= deleteDocCount;
  }
  Blog.find({ author: user_id, draft, title: new RegExp(query, "i") })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select("title banner publishedAt blog_id activity des draft -_id")
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/user-written-blogs-count", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { draft, query } = req.body;
  Blog.countDocuments({ author: user_id, draft, title: new RegExp(query, "i") })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/delete-blog", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { blog_id } = req.body;

  Blog.findOneAndDelete({ blog_id })

    .then((blog) => {
      Notification.deleteMany({ blog: blog._id }).then((data) =>
        console.log("notification deleted")
      );

      Comment.deleteMany({ blog_id: blog._id }).then((data) =>
        console.log("comments are deleted")
      );

      User.findOneAndUpdate(
        { _id: user_id },
        { $pull: { blog: blog._id }, inc: { "account_info.total_posts": -1 } }
      ).then((user) => console.log("Blog Deleted"));

      return res.status(200).json({ status: "done" });
    })

    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
    
});

server.post("/create-question", verifyJWT, async (req, res) => {
  try {
      const { title, banner, value,input, solution,explanation,link, companies, des, tags, difficulty } = req.body;
      const authorId = req.user; // Assuming req.user contains the author's ID from authentication middleware
      
      // Convert tags and companies to lowercase
      const formattedTags = tags.map(tag => tag.toLowerCase());
      const formattedCompanies = companies.map(company => company.toLowerCase());

      const question_id = title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();
      
      // Create a new question document
      const newQuestion = new Question({
          question_id,
          title,
          banner,
          value,
          input,
          solution,
          explanation,
          link,
          companies: formattedCompanies,
          des,
          tags: formattedTags,
          difficulty,
          author: authorId
      });

      // Save the new question to the database
      await newQuestion.save();

      res.status(201).json({ message: "Question created successfully", question: newQuestion });
  } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

server.post("/latest-questions", (req, res) => {
  let maxLimit = 2;
  let { page } = req.body;

  Question.find()
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id "
    )
    .sort({ publishedAt: -1 })
    .select("question_id title banner input value solution explanation link companies des tags difficulty -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((questions) => {
      return res.status(200).json({ success: true, questions });
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err.message });
    });
});

server.post("/all-latest-questions-count", (req, res) => {
  Question.countDocuments()
    .then((count) => {
      return res.status(200).json({ success: true, totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message); 
      return res.status(500).json({ success: false, error: err.message });
    });
});

server.post("/get-question", (req, res) => {
  let { question_id } = req.body; // Access question_id from request parameters
  console.log(question_id);
  Question.findOne({ question_id })
    .populate(
      "author",
      "personal_info.fullname personal_info.username personal_info.profile_img"
    )
    .select("question_id title banner value input solution explanation link companies des tags difficulty publishedAt")
    .then((question) => {
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/search-questions", (req, res) => {
  let { tag, query,company, author, page, limit, eliminate_question } = req.body;
  let findQuery;
  if (tag) {
    findQuery = { tags: tag, question_id: { $ne: eliminate_question } };
  } else if (query) {
    findQuery = { title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author};
  }else if (company) {
    findQuery = { companies: company };
  }
  
  let maxLimit = limit ? limit : 2;

  Question.find(findQuery)
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id "
    )
    .sort({ publishedAt: -1 })
    .select("question_id title banner value input solution explanation link companies des tags difficulty -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((questions) => {
      return res.status(200).json({ questions });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/search-questions-count", (req, res) => {
  let { tag, author, query,company } = req.body;
  let findQuery;
  if (tag) {
    findQuery = { tags: tag };
  } else if (query) {
    findQuery = { title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author};
  }
  else if (company) {
    findQuery = { companies: company };
  }
   Question.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/create-submission", verifyJWT, async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    const authorId = req.user;
    const newSubmission = new Submission({
      question: questionId,
      author: authorId,
      answer,
    });
    await newSubmission.save();

    res.status(201).json({
      message: "Submission created successfully",
      submission: newSubmission,
    });
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


server.post("/user-latest-submissions",verifyJWT, (req, res) => {
  let maxLimit = 10;
  let { page } = req.body;
  let user_id = req.user;

  // Define variables to store counts
  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;

  Submission.find({ author: user_id })
    .populate(
      "question",
      "question_id title banner input value solution explanation link companies des tags difficulty"
    )
    .sort({ publishedAt: -1 })
    .select("answer publishedAt")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((submissions) => {
      // Count the difficulty levels of submissions
      submissions.forEach((submission) => {
        if (submission.question.difficulty === 'easy') {
          easyCount++;
        } else if (submission.question.difficulty === 'medium') {
          mediumCount++;
        } else if (submission.question.difficulty === 'hard') {
          hardCount++;
        }
      });

      // Response object containing submissions and counts
      let response = {
        submissions: submissions,
        counts: {
          totalDocs: submissions.length,
          easyCount: easyCount,
          mediumCount: mediumCount,
          hardCount: hardCount
        }
      };

      return res.status(200).json(response);
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});


server.post("/all-user-latest-submissions-count", verifyJWT, (req, res) => {
  let user_id = req.user;
    Submission.countDocuments({author: user_id})
      .then((count) => {
        return res.status(200).json({ totalDocs: count });
      })
      .catch((err) => {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
      });
  });
  

  server.post("/question-counts", async (req, res) => {
    try {
      const easyCount = await Question.countDocuments({ difficulty: "easy" });
      const mediumCount = await Question.countDocuments({ difficulty: "medium" });
      const hardCount = await Question.countDocuments({ difficulty: "hard" });
      const totalDocs = await Question.countDocuments();
  
      const totalCounts = {
        easyCount,
        mediumCount,
        hardCount,
        totalDocs,
      };
  
      res.json(totalCounts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  server.get("/top-users", (req, res) => {
    Submission.aggregate([
      {
        $group: {
          _id: "$author",
          totalQuestions: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $sort: { totalQuestions: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: 0,
          username: "$user.personal_info.username",
          fullname: "$user.personal_info.fullname",
          profile_img: "$user.personal_info.profile_img",
          totalQuestions: 1
        }
      }
    ])
    .then((topUsers) => {
      return res.status(200).json({ topUsers });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
  });
  
  server.post("/get-all-users", (req, res) => {
    let maxLimit = 5;
    let { page, role } = req.body;
  
    // Define roles to include based on user selection
    let rolesToInclude = [];
    if (role === "lecturer") {
      rolesToInclude.push("lecturer");
    } else {
      rolesToInclude.push("student");
    }
  
    User.find({ "personal_info.role": { $in: rolesToInclude } })
      .sort({ joinedAt: -1 })
      .select("personal_info.profile_img personal_info.username personal_info.fullname personal_info.role personal_info.email -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit)
      .then((users) => {
        return res.status(200).json({ success: true, users });
      })
      .catch((err) => {
        return res.status(500).json({ success: false, error: err.message });
      });
  });
  
  server.post("/total-users-count", (req, res) => {
    let { role } = req.body;
  
    // Define roles to include based on user selection
    let rolesToInclude = [];
    if (role === "lecturer") {
      rolesToInclude.push("lecturer");
    } else {
      rolesToInclude.push("student");
    }
  
    User.countDocuments({ "personal_info.role": { $in: rolesToInclude } })
      .then((count) => {
        return res.status(200).json({ success: true, totalDocs: count });
      })
      .catch((err) => {
        console.log(err.message);
        return res.status(500).json({ success: false, error: err.message });
      });
  });
  
  server.post("/get-submission", (req, res) => {
    let { submission_id } = req.body; 
    console.log(submission_id);
    Submission.findOne({ _id: submission_id }) 
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img"
      )
    .populate(
      "question",
      "title banner value input solution link companies tags difficulty"
    )
      .select(
        "answer publishedAt"
      )
      .then((submission) => {
        if (!submission) {
          return res.status(404).json({ error: "submission not found" });
        }
        res.json(submission);
        console.log(submission);
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
  });
  

server.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
