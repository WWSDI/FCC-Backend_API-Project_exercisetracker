const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { User, Exercise } = require("./models");
const mongoose = require("mongoose");
const fs = require("fs");
const { stringify } = require("flatted");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  fs.writeFile("./requestObject_root.js", stringify(req), (err) => {
    if (err) console.log(err);
  });
  res.sendFile(__dirname + "/views/index.html");
});

// 3 routes
// ✅
app.post("/api/users", async (req, res) => {
  // 把数据输出至文件
  // fs.writeFile('./requestObject_user.js', stringify(req), (err) => {
  //   if(err) console.log(err)
  // })
  // fs.writeFile('./requestObject_user_reqbody.js', stringify(req.body), (err) => {
  //   if(err) console.log(err)
  // })

  const { username } = req.body;
  // console.log("🌸 req.body:", req.body);
  // Model.create firstly create a new user object, then Model.save it into the database, then return it. So you don't have to look it up again in the database for the object to return to the client.
  const user = await User.create({ username });
  res.send(user);
});
// ✅
app.post("/api/users/:_id/exercises", async (req, res) => {
  let { _id: userId } = req.params;
  let { description, duration, date } = req.body;

  const newExercise = await Exercise.create({
    userId,
    description,
    duration,
    date,
  });
  const { username } = await User.findById(userId);
  res.send({ username, _id: userId, description, duration, date });
});
// TODO: check out how format the path string
app.get(
  "/api/users/:_id/logs",
  // ❓ query string is NOT part of route path!
  // "/api/users/:_id/logs([\?]):from?&:to?&:limit?",
  // "/api/users/:_id/logs(forshawn)?:from?&:to?&:limit?",
  async (req, res) => {
    console.log("🌸 logs route");
    console.log("🌸 req.params:", req.params);

    let { _id: userId } = req.params;
    const { username } = await User.findById(userId);
    const foundExercises = await Exercise.find({ userId });
    const log = foundExercises.map(({ description, duration, date }) => ({
      description,
      duration,
      date,
    }));
    let count = log.length;
    res.send({ _id: userId, count, username, log });
  },
);

app.use((err, req, res, next) => {
  if (err) console.log("❌");
});

//mongoose connect to mongodb atlas
mongoose.connect(
  "mongodb+srv://shawnsufcc:FiRv6w3nVywgFz6@cluster0.tjas7.mongodb.net/fccExercise",
);

const listener = app.listen(process.env.PORT || 3005, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// module.exports = app
