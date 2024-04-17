import mongoose, { Schema } from "mongoose";

const questionSchema = mongoose.Schema({

    question_id: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    banner: {
        type: String,
    },
    des: {
        type: String,
        maxlength: 200,
    },
    input:{
        type: String,
    },

    value: {
        type: String,
    },
    solution: {
        type: String,
    },
    explanation : {
        type:String,
    },
    link: {
        type: String,
    },
    tags: {
        type: [String],
    },
    companies: {
        type: [String],
    },
    level: {
        type: String,
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'easy'
    }
}, 
{ 
    timestamps: {
        createdAt: 'publishedAt'
    } 
});

export default mongoose.model("questions", questionSchema);
