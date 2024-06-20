import mongoose  from "mongoose";

const reviewSchema = mongoose.Schema({

    details:{
        type:String,
        required:true

    },
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },

})


const reviewModel = mongoose.model('review',reviewSchema)

export default reviewModel