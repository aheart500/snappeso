const cors = require("cors");
const express = require("express");
var app = express();
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const config = require("./utils/config");
const adminRouter = require("./controllers/AdminRouter");
const userRouter = require("./controllers/UserRouter");

mongoose
  .connect(config.MongoDB_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => {
    console.log("DB connection successed");
  })
  .catch(err => {
    console.log(err);
  });

app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(express.static("frontend"));
app.get("/admin", (req, res) => {
  res.sendFile("./frontend/index.html");
});
app.get("/admin-login", (req, res) => {
  res.sendFile("./frontend/index.html");
});
app.get("/blog", (req, res) => {
  res.sendFile("./frontend/index.html");
});
app.get("/blog/*", (req, res) => {
  res.sendFile("./frontend/index.html");
});
app.get("/add-account", (req, res) => {
  res.sendFile("./frontend/index.html");
});
app.get("/subscription", (req, res) => {
  res.sendFile("./frontend/index.html");
});
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

module.exports = app;
