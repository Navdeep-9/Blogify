import mongoose from "mongoose";

const contectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile:{
        type: String,
       
    },
    message: {
        type: String,
        required: true
    },
});


const contectModel = mongoose.model('contact',contectSchema)


export default contectModel;
