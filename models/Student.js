const mongoose = require("mongoose");
const { Schema } = mongoose;
const classroom = require("./Classroom");
const teachers = require("./Teacher");

// 2. Student
// 	1. name
// 	2. email
// 	3. password
// 	4. rollno
// 	5. school
// 	6. classrooms- [array of objects of classroom ids enrolled with accept/rejected/pending status]
// 	7. teacher_id - [array of teacher ids enrolled under]

const Student = new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    rollno:{
        type:String,
        required:true,
    },
    college:{
        type:String,
        required:true,
    },
    classrooms:{ // array schema type has its default value []
        type:[{id:mongoose.Schema.Types.ObjectId, status:String}],
        ref : "classroom"
    },
    teachers:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"teachers"
    }
});

const students = mongoose.model("students", Student);
students.createIndexes();
module.exports = students;