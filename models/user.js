import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true

    },
    username: {
        type: String,
        required: true,
        unique:true

    },
    email: {
        type: String,
        required: true

    },
    password: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: true
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "blog"
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comments"
        }
    ],
    OTP: {
        type: Array,
        default: [],
        expiresAt: { type: Date, default: () => new Date(Date.now() + 60 * 1000) }

    }
})

const usermodel = mongoose.model('user', userSchema)

export default usermodel