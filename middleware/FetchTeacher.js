const jwt = require("jsonwebtoken");

const JWT_Secret = "a1b1c13kfjnjfkk23";

const FetchTeacher = (req, res, next)=>{
    const authToken = req.header("auth-token");
    if(!authToken){
        return res.status(404).send({msg:"Please authenticate using valid token id"});
    }
    const data = jwt.verify(authToken, JWT_Secret);
    
    req.teacher_id = data.user_id;
    next();
}

module.exports = FetchTeacher;