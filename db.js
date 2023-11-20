const mongoose = require("mongoose");

const mongoURI = "mongodb://127.0.0.1:27017/eclass";

const connectToMongo = async ()=>{
    await mongoose.connect(mongoURI).then(()=>{
        console.log("Connection Established Successfully")
    })
}

module.exports = connectToMongo;