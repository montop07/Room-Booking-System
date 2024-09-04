const mongoose = require('mongoose');
const proposal= new mongoose.Schema({
    Society: {
        type: String,
        required: true,
    },
    EventName: {
        type: String,
        required: true,
    },
    Block:{
        type:String,
        required:true,
    },
    ConfRoom :{
        type: String,
        required:true,
    },
    Proposal: {
        type: String,
        required: true,
    },
    Email:{
        type:String,
        required:true
    },
    Participation: {
        type: String,
        required: true,
    },
    StartingDate: {
        type: Date,
        required: true,
    },
    approved:{
        type: Number,
        default: 0,
    },
    checkstring:{
        type:String,
        default: null,
    }
});

module.exports = mongoose.model("proposal", proposal);