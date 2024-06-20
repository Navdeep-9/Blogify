import mongoose  from "mongoose";

const blogSchema = mongoose.Schema({
    title:{
        type:String,
        required:true

    },
    caption:{
        type:String,
        required:true

    },
    details:{
        type:String,
        required:true

    },
    image:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"comments"
    }],
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }],

    username:{
        type:String
    }
})


const blogModel = mongoose.model('blog',blogSchema)

export default blogModel