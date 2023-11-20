const jwt = require("jsonwebtoken");

const Student_JWT_Secret = "hwe##@hfw1983nfi233487ygn";

const FetchStudent = (req, res, next)=>{
    const authToken = req.header("auth-token");

    if(!authToken)
        return res.status(400).send({msg:"Please Authenticate using valid token"});

    const data = jwt.verify(authToken, Student_JWT_Secret);
    req.student_id = data.sid;
    next();
}

module.exports = FetchStudent;