const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { User, Exercise } = require("./models");

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// 3 routes
app.post("/api/users", async (req, res) => {
  console.log("🌸", req.body);
  const name = req.body;
  await User.create({ name });
  res.send(await User.find({ name }));
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  let { _id: userId } = req.params;
  let { description, duration, date } = req.body;

  await Exercise.create({ userId, description, duration, date });
  let { userId, description, duration, date } = await Exercise.findOne({
    userId,
    description,
  });
  let { name } = await User.findById(userId);
  res.send({ username, _id: userId, description, duration, date });
});

app.get("/api/users/:_id/exercises", async (req, res) => {
  let { _id: userId } = req.params;
  const foundUser = await User.findById(userId);
  const foundExercises = await Exercise.find({ userId });
  const log = foundExercise.map(({ description, duration, date }) => ({
    description,
    duration,
    date,
  }));
  let count = log.length;

  res.send({ _id: userId, count, username, log });
});

//mongoose connect to mongodb atlas
mongoose.connect('mongodb+srv://shawnsufcc:FiRv6w3nVywgFz6@cluster0.tjas7.mongodb.net/test');

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// module.exports = app
