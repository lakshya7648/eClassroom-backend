const express = require('express');
const cors = require("cors");
const connectToMongo = require("./db");

const app = express()
const port = process.env.PORT || 5000

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

connectToMongo();

app.use(cors());
app.use(express.json());

app.use("/api/teacher", require("./routes/teacher"));
app.use("/api/student", require("./routes/student"));

app.listen(port, () => {
  console.log(`eclass app listening on port ${port}`);
})