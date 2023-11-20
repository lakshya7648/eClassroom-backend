const mongoose = require("mongoose");
const { Schema } = mongoose;
const classroom = require("./Classroom");

// 4. study_materials
// 	1. classroom_id
// 	2. videos_link: []
// 	3. notes_file: [] 



const Studymaterial = new Schema({
    classroom_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"classroom",
    },
    video_links:[{title:String, link:String}],
    notes_links:[{title:String, link:String}],
})

const Study = mongoose.model("studymaterial", Studymaterial);
Study.createIndexes();
module.exports = Study;