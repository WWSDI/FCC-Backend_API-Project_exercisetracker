const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { User, Exercise } = require("./models");
const mongoose = require("mongoose");
const fs = require("fs");
const { stringify } = require("flatted");
const bodyParser = require("body-parser");
const url = require("url");
const querystring = require("querystring");

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

// Date formatting function
const formatDate = date => new Date("1998-01-29T00:00:00.000Z").toString().substr(0,15)

// 3 routes
// ✅
app.post("/api/users", async (req, res) => {
  const { username } = req.body;
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
  const {username} = await User.findById(userId);
  res.send({ username, _id: userId, description, duration, date: formatDate(date) });
});
// ✅
app.get(
  // ❗❗️❗️️query string is NOT part of route path! So don't put it in there!
  "/api/users/:_id/logs",
  async (req, res) => {
    // console.log("🌸 req.url", req.url);
    // console.log("🌸 req.params:", req.params);
    // extracting query info
    const parsedUrl = url.parse(req.url);
    // ❗️if limit is undefined, limit() will simply return all found documents
    let { from, to, limit } = querystring.parse(parsedUrl.query);
    // if abscent, replace them with boundary dates.
    from = from || "0001";
    to = to || "3000";
    // query username
    let { _id: userId } = req.params;
    const { username } = await User.findById(userId);
    // query exercises
    const foundExercises = await Exercise.find({
      $and: [
        { userId },
        // ❗️If use mongodb driver instead then should replace new Date() with ISODate()
        { date: { $gte: new Date(from), $lte: new Date(to) } },
      ],
    }).limit(limit);
    const log = foundExercises.map(({ description, duration, date }) => ({
      description,
      duration,
      date: formatDate(date),
    }));

    let count = log.length;
    // send back data
    res.send({ _id: userId, count, username, log });
  },
);

//mongoose connect to mongodb atlas
mongoose.connect(
  "mongodb+srv://shawnsufcc:FiRv6w3nVywgFz6@cluster0.tjas7.mongodb.net/fccExercise",
);

const listener = app.listen(process.env.PORT || 3005, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// module.exports = app
