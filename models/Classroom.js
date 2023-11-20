const mongoose = require("mongoose");
const { Schema } = mongoose;

//  1. classroom_id
// 	2. class_name
// 	3. class_type - 10/12/grad


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
const Classroom = new Schema({
    class_name : {
        type:String,
        required:true,
    },
    class_type : {
        type: String,
        required : true,
    },
  });

  const classroom = mongoose.model("classroom", Classroom);
  classroom.createIndexes();

  module.exports = classroom;