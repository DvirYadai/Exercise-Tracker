require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const User = require("./modules/username");

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.status(400).send("User name cannot be empty!");
  }
  const newUser = new User({
    username: username,
    count: 0,
    log: [],
  });
  newUser
    .save()
    .then(() => {
      return res
        .status(200)
        .json({ username: newUser.username, _id: newUser._id });
    })
    .catch((err) => res.status(400).send(err.message));
});

app.get("/api/exercise/users", (req, res) => {
  User.find({}, ["_id", "username"])
    .then((arr) => {
      return res.status(200).json(arr);
    })
    .catch((err) => res.status(500).send(err));
});

app.post("/api/exercise/add", (req, res) => {
  const body = req.body;
  if (body.userId === "") {
    return res.status(400).send("Please enter valid user ID");
  } else if (body.description === "") {
    return res.status(400).send("Please enter description");
  } else if (body.duration === "") {
    return res.status(400).send("Please enter duration");
  }
  const exercise = {
    description: body.description,
    duration: Number(body.duration),
    date: body.date === "" ? new Date() : new Date(body.date),
  };
  User.findByIdAndUpdate(
    body.userId,
    { $push: { log: exercise }, $inc: { count: 1 } },
    { new: true }
  )
    .then((user) => {
      return res.status(200).json({
        _id: user._id,
        username: user.username,
        date: exercise.date.toDateString(),
        duration: exercise.duration,
        description: exercise.description,
      });
    })
    .catch((err) => res.status(500).send(err));
});

app.get("/api/exercise/log", (req, res) => {
  const query = req.query;
  if (!query.userId) {
    return res.status(400).send("query parameters must include userId");
  }
  User.findById(query.userId)
    .then((user) => {
      let logs = user.log;
      logs.sort(function (a, b) {
        let dateA = a.date,
          dateB = b.date;
        return dateA - dateB;
      });
      let limitLogs = [];
      if (query.from && query.to && query.limit) {
        logs = logs
          .filter(
            (element) =>
              element.date >= new Date(query.from) &&
              element.date <= new Date(query.to)
          )
          .map((obj) => {
            const newObj = {
              description: obj.description,
              duration: obj.duration,
              date: obj.date.toDateString(),
            };
            return newObj;
          });
        query.limit = query.limit > logs.length ? logs.length : query.limit;
        for (let i = 0; i < query.limit; i++) {
          limitLogs.push(logs[i]);
        }
        return res.status(200).json({
          _id: mongoose.Types.ObjectId(query.userId),
          username: user.username,
          count: limitLogs.length,
          log: limitLogs,
        });
      } else if (query.from && query.to && !query.limit) {
        logs = logs
          .filter(
            (element) =>
              element.date >= new Date(query.from) &&
              element.date <= new Date(query.to)
          )
          .map((obj) => {
            const newObj = {
              description: obj.description,
              duration: obj.duration,
              date: obj.date.toDateString(),
            };
            return newObj;
          });
        return res.status(200).json({
          _id: mongoose.Types.ObjectId(query.userId),
          username: user.username,
          count: logs.length,
          log: logs,
        });
      } else if (query.limit) {
        let logs = user.log;
        logs = logs.map((element) => {
          const newObj = {
            description: element.description,
            duration: element.duration,
            date: element.date.toDateString(),
          };
          return newObj;
        });
        query.limit = query.limit > logs.length ? logs.length : query.limit;
        for (let i = 0; i < query.limit; i++) {
          limitLogs.push(logs[i]);
        }
        return res.status(200).json({
          _id: mongoose.Types.ObjectId(query.userId),
          username: user.username,
          count: limitLogs.length,
          log: limitLogs,
        });
      } else {
        let logs = user.log;
        logs = logs.map((element) => {
          const newObj = {
            description: element.description,
            duration: element.duration,
            date: element.date.toDateString(),
          };
          return newObj;
        });
        return res.status(200).json({
          _id: mongoose.Types.ObjectId(query.userId),
          username: user.username,
          count: user.count,
          log: logs,
        });
      }
    })
    .catch(() => res.status(500).send("Id does not valid or exist"));
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
