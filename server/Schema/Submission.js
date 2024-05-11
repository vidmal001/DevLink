import mongoose, { Schema } from "mongoose";

const submissionSchema = mongoose.Schema(
  {
    question: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "questions",
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "publishedAt",
    },
  }
);

export default mongoose.model("submissions", submissionSchema);
