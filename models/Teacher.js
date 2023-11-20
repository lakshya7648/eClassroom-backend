const mongoose = require("mongoose");
const { Schema } = mongoose;
const classroom = require("./Classroom");

// 0. teacher_id
// 	1. name
// 	2. email
// 	3. password
// 	4. School/college name
// 	5. classroom_id - [array of classrooms teacher holds]


// const Teacher = new Schema({
//   title: String, // String is shorthand for {type: String}
//   author: String,
//   body: String,
//   comments: [{ body: String, date: Date }],
//   date: { type: Date, default: Date.now },
//   hidden: Boolean,
//   meta: {
//     votes: Number,
//     favs: Number
//   }
// });
const Teacher = new Schema({
    name : {
        type : String,
        required:true,
    },
    email : {
        type:String,
        required:true,
        unique:true,
    },
    password : {
        type: String,
        required : true,
    },
    collegeName : {
        type:String,
        required:true,
    },
    classrooms:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"classroom",
    }
  });

  const teacher = mongoose.model("teacher", Teacher);
  teacher.createIndexes();

  module.exports = teacher;