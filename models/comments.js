import mongoose  from "mongoose";

const commentSchema = mongoose.Schema({

    details:{
        type:String,
        required:true

    },
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    blogid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"blog"
    },
})


const commentModel = mongoose.model('comment',commentSchema)

export default commentModel