const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const FetchTeacher = require("../middleware/FetchTeacher");
const teachers = require("../models/Teacher");
const classrooms = require("../models/Classroom");
const Study = require("../models/Studymaterials");
const classroom = require("../models/Classroom");
const Student = require("../models/Student");
const upload = require("../FileUpload");

const router = express.Router();

//bcrypt js functionality to be added in future for securing the system when it will be ready

const JWT_Secret = "a1b1c13kfjnjfkk23";
let success = false;

// Route 1 : For creating the teacher profile or signup
router.post(
  "/signup",
  [
    body("name", "Please Enter your name").isLength(5),
    body("email", "Please Enter a valid email").contains("@").isLength(5),
    body("password", "Please Enter 8 digit Password").isLength(8),
    body("collegeName", "Please enter a valid college name").isLength(5),
  ],
  async (req, res) => {
    success = false;
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res
        .status(400)
        .send({ msg: "Please enter valid details", result });
    }

    // bcryptjs functionality to be added
    try {
      const { name, email, password, collegeName } = req.body;
      const teacher = new teachers({
        name: name,
        email: email,
        password: password,
        collegeName: collegeName,
      });
      const data = await teacher.save();
      success = true;
      res.send({ success, data });
    } catch (error) {
      res.send(error);
    }
  }
);

// Router 2 : Login For teacher using email and password
router.post(
  "/login",
  [
    body("email", "Please enter a valid email").contains("@").isLength(5),
    body("password", "Please enter password of length 8").isLength(8),
  ],
  async (req, res) => {
    success = false;
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ result });
    }

    try {
      const { email, password } = req.body;

      const teacherProfile = await teachers.findOne({
        email: email,
        password: password,
      });
      if (!teacherProfile) {
        return res.status(404).send({ msg: "Profile Doesn't Exist" });
      }
      const data = {
        user_id: teacherProfile.id,
      };
      const authToken = jwt.sign(data, JWT_Secret);
      success = true;
      res.send({ success, authToken });
    } catch (error) {
      res.status(500).send({ msg: error.message });
    }
  }
);

router.get("/", FetchTeacher, async (req, res) => {
  const tid = req.teacher_id;
  const teacherDetails = await teachers.findOne({ _id: tid });
  res.send({ user: teacherDetails });
});

// Route 3: For getting all the classrooms of the teacher
router.get("/classrooms", FetchTeacher, async (req, res) => {
  const tid = req.teacher_id;
  const t = await teachers.findOne({ _id: tid });
  const clsrm = t.classrooms.map((value) => {
    return value;
  });
  const classroom = await classrooms.find({ _id: { $in: clsrm } });

  res.send({ classroom });
});

// Route 4: For getting all the studymaterial
router.get("/study_material", FetchTeacher, async (req, res) => {
  const tid = req.teacher_id;
  const t = await teachers.findOne({ _id: tid });

  const clsrm = t.classrooms.map((value) => {
    return value;
  });
  const study = await Study.find({ classroom_id: { $in: clsrm } });

  res.send({ success:true, study });
});

// Route # : For Getting the classroom specific study material

router.get("/study_material/:classroomId", FetchTeacher, async (req, res) => {
  const classroomId = req.params.classroomId;

  const classroomStudyMaterial = await Study.find({
    classroom_id: classroomId,
  });

  if (!classroomStudyMaterial) {
    return res.status(400).send({ status: false, msg: "No Classroom Exist" });
  }

  res.send({ success: true, studyMaterial: classroomStudyMaterial });
});

// Route 5: For getting the students enrolled with the teacher
router.get("/students", FetchTeacher, async (req, res) => {
  const tid = req.teacher_id;
  const t = await teachers.findOne({ _id: tid });

  const clsrm = t.classrooms.map((value) => {
    return value;
  });

  // Matching those students who are enrolled in the teacher and whose status is accepted
  const students = await Student.find(
    {
      classrooms: { $elemMatch: { id: { $in: clsrm }, status: "accepted" } },
    },
    { name: 1, email: 1, rollno: 1 }
  );

  res.send({ students });
});

// Route 6: For creating the teacher's classroom
router.post(
  "/classrooms",
  [
    body("class_name", "Please Enter Valid Class Name").isLength(3),
    body("class_type", "Please enter the required class type").isLength(2),
  ],
  FetchTeacher,
  async (req, res) => {
    const { class_name, class_type } = req.body;
    const classroom = new classrooms({
      class_name,
      class_type,
    });
    const data = await classroom.save();
    await teachers.findByIdAndUpdate(req.teacher_id, {
      $push: { classrooms: data.id },
    });
    res.send(data);
  }
);

// Route 7 : Adding Study Materials related to the classroom

router.put(
  "/study_material/:classroomId",
  FetchTeacher,
  upload.fields([
    { name: "videotitle" },
    { name: "videolink" },
    { name: "notestitle" },
    { name: "noteslink" },
  ]),
  async (req, res) => {
    success = false;
    const classroomId = req.params.classroomId;

    const { videotitle, notestitle } = req.body;
    const videolink = req.files["videolink"][0].filename,
      noteslink = req.files["noteslink"][0].filename;

    console.log(videotitle, notestitle, videolink, noteslink);
    await Study.updateOne(
      { classroom_id: classroomId },
      { $push: { video_links: { title: videotitle, link: videolink } } },
      { upsert: true }
    );
    await Study.updateOne(
      { classroom_id: classroomId },
      { $push: { notes_links: { title: notestitle, link: noteslink } } }
    );
      
    success = true;
    res.json({ success });
  }
);

// Route 8 : For deleting the classroom
router.delete("/classrooms/:id", FetchTeacher, async (req, res) => {
  success = false;
  const id = req.params.id;

  await classrooms.findOneAndDelete(id);
  await teachers.updateOne(
    { _id: req.teacher_id },
    { $pull: { classrooms: id } }
  );
  await Study.deleteOne({ classroom_id: id });
  success = true;

  res.send({ success });
});

// Route 9 : viewing and responding to the student requests.
router.put(
  "/enroll/:studentId/:classroomId/:message",
  FetchTeacher,
  async (req, res) => {
    success = false;

    const studentId = req.params.studentId,
      classroomId = req.params.classroomId,
      message = req.params.message;

    // updating the status of the classroom requested to be enrolled
    const student = await Student.updateOne(
      { _id: studentId, "classrooms.id": classroomId },
      { $set: { "classrooms.$.status": message } }
    );
    const check = await Student.exists({ teachers: req.teacher_id });

    // updating the teacher details in the student profile
    let student1 = null;

    if (!check)
      student1 = await Student.updateOne(
        { _id: studentId, "classrooms.id": classroomId },
        { $push: { teachers: req.teacher_id } }
      );

    if (student && student1) success = true;
    res.send({ success, student: student1 });
  }
);

// teacher profile update endpoint to be added

module.exports = router;
