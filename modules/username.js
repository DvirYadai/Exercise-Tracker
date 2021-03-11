const mongoose = require("mongoose");

const url = process.env;

console.log("connecting to", url);
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const logSchema = new mongoose.Schema({
  description: {
    type: String,
    require: true,
  },
  duration: {
    type: Number,
    require: true,
  },
  date: {
    type: Date,
    default: new Date(),
  },
});

const usernameSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  log: {
    type: [logSchema],
    default: [logSchema],
  },
});

module.exports = mongoose.model("UserName", usernameSchema);
module.exports = mongoose.model("Logs", logSchema);
