const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const teachers = require("../models/Teacher");
const classrooms = require("../models/Classroom");
const Study = require("../models/Studymaterials");
const Student = require("../models/Student");
const FetchStudent = require("../middleware/FetchStudent");

const router = express.Router();


const Student_JWT_Secret = "hwe##@hfw1983nfi233487ygn";
let success = false;

// bcrypt js to be used

// Route 1 : Signup for student
router.post("/signup", [
    body("name", "Please Enter valid name").isLength(3),
    body("email", "Please Enter valid email").contains("@").isLength(5),
    body("password", "Please Enter valid password").isLength(8),
    body("rollno", "Please Enter valid rollno").isLength(1),
    body("college", "Please Enter valid college").isLength(3),
], async (req, res)=>{

    success = false; // setting success false so that furthur if result is achieved it can be set true and send to the user

    const result = validationResult(req);
    if(!result.isEmpty()) {
        return res.status(400).send({msg:"Please enter valid details", result});
    }
    // bcrypt js to be used
    const { name, email, password, rollno, college } = req.body;
    // saving the provided data after validation into the database
    const student = new Student(
        {name, email, password, rollno, college}
    )
    const data = await student.save();

    //returning the data to the user with success set to true
    success = true;
    res.send({success, data});
});


// Route 2: Login for student
router.post("/login",[
    body("email", "Please Enter valid email").contains("@").isLength(5),
    body("password", "Please Enter valid password").isLength(8),
], async (req, res)=>{
    success = false; // setting success false so that furthur if result is achieved it can be set true and sent to the user

    const result = validationResult(req);
    if(!result.isEmpty()) {
        return res.status(400).send({msg:"Please enter valid details", result});
    }
    // bcryptjs comparison to be used furthur in the database.
    const { email, password } = req.body;
    // finding for if the profile of student with the given email and password exists.
    const student = await Student.findOne({ email, password });
    if(!student)
        return res.status(404).send({msg:" Student Profile not found "});
    
    const data = {
        sid:student.id,
    }
    // Generated Auth token will be used to verify the identity as well as authenticity of the student.
    const authToken = jwt.sign(data, Student_JWT_Secret)

    success = true;
    res.send({success, authToken});
});

// Route 3 : Fetching Classrooms enrolled with status either pending or success

router.get("/classrooms/:status", FetchStudent, async(req, res)=>{
    const status = req.params.status;
    console.log(status, typeof(status));
    const sid = req.student_id;
    const student = await Student.findOne({ "_id":sid });

    const c = student.classrooms.map((value)=>{
        if(value.status === status)
            return value.id;
    });
    const classroom = await classrooms.find({"_id":{"$in":c}});

    res.send({classroom});
})

// Route 4 : Fetching the teachers related to classrooms

router.get("/teachers", FetchStudent, async (req, res)=>{
    const sid = req.student_id;
    const student = await Student.findOne({"_id":sid});

    // TODO : keep only the relevant details for security purpose
    const teacher = await teachers.find({"_id":{"$in":student.teachers}});

    res.send({teacher});
})

// Route 3 : Request For Enrollment if an id of teacher is provided
router.put("/enrollme/:cid", FetchStudent, async (req, res)=>{
    const id = req.params.cid;

    // Checking for if student is requesting for an unique enrollment
    const result  = await Student.exists({"_id":req.student_id, "classrooms.id":id});
    if(result)
        return res.send({enrollStatus:1});

    // if enrollment is unique then update the classrooms of the student .
    const student = await Student.findOneAndUpdate({"_id":req.student_id}, {'$push':{classrooms:{id:id, status:"pending"}}});
    res.send({student});
});

// Route 4 : Fetch Study Material related to the classroom selected
router.get("/study_material/:cid", FetchStudent, async (req, res)=>{
    success = false;
    const cid = req.params.cid;
    const study = await Study.find({"classroom_id":cid});
    if(study.length === 0){
        return res.status(404).send({msg:'No study material available'});
    }
    success = true;
    res.send({success, study});
});

// student profile update endpoint to be added


module.exports = router;