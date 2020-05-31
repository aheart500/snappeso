const adminRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const config = require("../utils/config");
const verifyToken = require("../utils/verifyToken");

// Routes
const adminUsersRouter = require("./AdminRoutes/AdminUsersRouter");
const adminCountriesRouter = require("./AdminRoutes/AdminCountriesRouter");
const adminCitiesRouter = require("./AdminRoutes/AdminCitiesRouter");
const adminMessagesRouter = require("./AdminRoutes/AdminMessagesRouter");
const adminBlogsRouter = require("./AdminRoutes/AdminBlogsRouter");
const adminTagsRouter = require("./AdminRoutes/AdminTagsRouter");
const adminSettingsRouter = require("./AdminRoutes/AdminSettingsRouter");

// Models
const adminModel = require("../models/admin");
const settingsModel = require("../models/settings");

adminModel.findOne({ email: "app@gmail.com" }).then(res => {
  if (!res) {
    let admin = adminModel({
      email: "app@gmail.com",
      password: "123456789"
    });

    admin
      .save()
      .then(res => {
        console.log("added admin account");
      })
      .catch(err => {
        console.log("error happened couldn't add admin account");
      });
  }
});
settingsModel.findOne({}).then(res => {
  if (!res) {
    let settings = settingsModel({
      site_name: "موقع",
      site_description: "وصف الموقع",
      vip_message: "اشترك الآن",
      vip_per_page: 4,
      normal_per_page: 10
    });
    settings
      .save()
      .then(res => {
        console.log("added intial site settings");
      })
      .catch(err => {
        console.log("error happened couldn't add site settings");
      });
  }
});

// Admin Routes
adminRouter.use("/users", verifyToken, adminUsersRouter);
adminRouter.use("/countries", verifyToken, adminCountriesRouter);
adminRouter.use("/cities", verifyToken, adminCitiesRouter);
adminRouter.use("/messages", verifyToken, adminMessagesRouter);
adminRouter.use("/blogs", verifyToken, adminBlogsRouter);
adminRouter.use("/tags", verifyToken, adminTagsRouter);
adminRouter.use("/settings", verifyToken, adminSettingsRouter);

adminRouter.post("/login", (req, res) => {
  adminModel.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      return res.send("Incorrect Username and/or Password!");
    }

    if (user.password === req.body.password) {
      const secret = config.SECRET;
      const token = jwt.sign(
        {
          username: req.body.email,
          userID: req.body.password
        },
        secret,
        {
          expiresIn: "1hr"
        },
        function(err, token) {
          if (err) {
            console.log(err);
          } else {
            res
              .header("token", token)
              .send({ token: token, email: user.email });
            res.end();
          }
        }
      );
    } else {
      res.send("Incorrect Username and/or Password!");
    }
  });
});

adminRouter.get("/logged", verifyToken, (req, res) => {
  return res.send(req.user);
});

module.exports = adminRouter;
