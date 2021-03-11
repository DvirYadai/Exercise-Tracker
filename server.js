require("dotenv").config();
const express = require("express");
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
    date: body.date === "" ? new Date() : body.date,
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
        date: exercise.date,
        duration: exercise.duration,
        description: exercise.description,
      });
    })
    .catch((err) => res.status(500).send(err));
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
