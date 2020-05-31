const userRouter = require("express").Router();

// Models
const userModel = require("../models/user");
const countryModel = require("../models/country");
const cityModel = require("../models/city");
const messageModel = require("../models/message");
const blogModel = require("../models/blog");
const tagsModel = require("../models/tag");
const settingsModel = require("../models/settings");

userRouter.get("/messages", (req, res) => {
  messageModel
    .find()
    .sort({ created_at: -1 })
    .then(rows => res.send(rows))
    .catch(err => res.end(err));
});

userRouter.get("/countries", (req, res) => {
  countryModel
    .find()
    .then(rows => res.send(rows))
    .catch(err => res.end(err));
});
userRouter.get("/cities", (req, res) => {
  cityModel
    .find()
    .then(rows => res.send(rows))
    .catch(err => res.end(err));
});
userRouter.get("/blogs", (req, res) => {
  blogModel
    .find()
    .then(rows => res.send(rows))
    .catch(err => res.end(err));
});
userRouter.get("/blogs/:title", (req, res) => {
  const title = decodeURIComponent(req.params.title);
  blogModel
    .findOne({ title: title })
    .then(rows => res.send(rows))
    .catch(err => res.end(err));
});
userRouter.get("/tags", (req, res) => {
  tagsModel
    .find()
    .then(rows => res.send(rows))
    .catch(err => res.end(err));
});
userRouter.get("/settings", async (req, res) => {
  try {
    let link = await tagsModel
      .findOne({})
      .select({ link: 1 })
      .lean();
    let nUsers = await userModel.estimatedDocumentCount();
    let settings = await settingsModel.findOne({}).lean();
    if (settings) {
      res.send({ ...rows, link: link.link, nUsers });
    } else {
      res.send({
        site_name: "",
        site_description: "",
        vip_per_page: 3,
        normal_per_page: 5,
        vip_message: "اشتراك"
      });
    }
  } catch (err) {
    res.end(err);
  }
});

userRouter.get("/vip/:page/:number", async (req, res) => {
  let { page, number } = req.params;
  page = parseInt(page);
  number = parseInt(number);
  let numberToskip = page === 1 ? 0 : (page - 1) * number;

  try {
    let users = await userModel
      .find({ status: 1 })
      .sort("-_id")
      .limit(number)
      .skip(numberToskip)
      .lean();
    for (let i = 0; i < users.length; i++) {
      let country, city;
      country = await countryModel
        .findOne({ _id: users[i].country })
        .select({ name: 1 })
        .lean();
      city = await cityModel
        .findOne({ _id: users[i].city })
        .select({ name: 1 })
        .lean();
      users[i] = {
        ...users[i],
        country_name: country ? country.name : "",
        city_name: city ? city.name : ""
      };
    }
    res.send(users);
  } catch (err) {
    res.end(err);
  }
});
userRouter.get("/normal/:page/:number", async (req, res) => {
  let { page, number } = req.params;
  page = parseInt(page);
  number = parseInt(number);
  if (!number) return res.send([]);
  let numberToskip = page === 1 ? 0 : (page - 1) * number;

  try {
    let users = await userModel
      .find({})
      .sort("-_id")
      .limit(number)
      .skip(numberToskip)
      .lean();
    for (let i = 0; i < users.length; i++) {
      let country, city;
      country = await countryModel
        .findOne({ _id: users[i].country })
        .select({ name: 1 })
        .lean();
      city = await cityModel
        .findOne({ _id: users[i].city })
        .select({ name: 1 })
        .lean();
      if (users[i].time.indexOf("PM"))
        users[i].time = users[i].time.replace("PM", "م");
      if (users[i].time.indexOf("AM"))
        users[i].time = users[i].time.replace("AM", "ص");
      let tags = await tagsModel
        .find({})
        .select({ name: 1 })
        .lean();
      tags = tags
        .map(tag => tag.name)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      users[i] = {
        ...users[i],
        country_name: country ? country.name : "",
        city_name: city ? city.name : "",
        tags
      };
    }
    res.send(users);
  } catch (err) {
    res.end(err);
  }
});
userRouter.get("/search/:page/:number", async (req, res) => {
  let { page, number } = req.params;
  page = parseInt(page);
  number = parseInt(number);
  if (!number) return res.send({ users: [], nFound: 0 });
  let numberToskip = page === 1 ? 0 : (page - 1) * number;
  try {
    let query = req.query;

    const queryUnChanged = { ...query };
    let country, city;
    if (query.country) {
      country = await countryModel
        .findOne({ name: query.country })
        .select({ _id: 1 })
        .lean();
      if (country) {
        query.country = country._id;
      } else {
        delete query.country;
      }
    }

    if (query.city) {
      city = await cityModel
        .findOne({ name: query.city })
        .select({ _id: 1 })
        .lean();
      if (city) {
        query.city = city._id;
      } else {
        delete query.city;
      }
    }
    if (query.name) {
      if (query.name === "") {
        delete query.name;
      } else {
        query.name = new RegExp(query.name, "ig");
      }
    }
    let users = await userModel
      .find(query)
      .skip(numberToskip)
      .limit(number)
      .lean();
    let nFound = await userModel.countDocuments(query);
    if (req.query.country) {
      users = users.map(user => {
        return { ...user, country_name: queryUnChanged.country };
      });
    } else {
      for (let i = 0; i < users.length; i++) {
        let userCountry = await countryModel
          .findOne({ _id: users[i].country })
          .select({ name: 1 })
          .lean();
        users[i].country_name = userCountry.name;
      }
    }
    if (req.query.city) {
      users = users.map(user => {
        return { ...user, city_name: queryUnChanged.city };
      });
    } else {
      for (let i = 0; i < users.length; i++) {
        let userCity = await cityModel
          .findOne({ _id: users[i].city })
          .select({ name: 1 })
          .lean();
        users[i].city_name = userCity.name;
      }
    }

    let tags = await tagsModel
      .find({})
      .select({ name: 1 })
      .lean();
    tags = tags.map(tag => tag.name);

    users = users.map(user => {
      if (user.time.indexOf("PM")) user.time = user.time.replace("PM", "م");
      if (user.time.indexOf("AM")) user.time = user.time.replace("AM", "ص");
      return {
        ...user,
        tags: tags.sort(() => 0.5 - Math.random()).slice(0, 3)
      };
    });

    res.send({ users, nFound });
  } catch (err) {
    res.end(err);
  }
});
userRouter.get("/filter/all", async (req, res) => {
  try {
    let users = await userModel
      .find({})
      .select({ age: 1, country: 1, city: 1 })
      .lean();
    if (users) {
      for (let i = 0; i < users.length; i++) {
        let country, city;
        country = await countryModel
          .findOne({ _id: users[i].country })
          .select({ name: 1 })
          .lean();
        city = await cityModel
          .findOne({ _id: users[i].city })
          .select({ name: 1 })
          .lean();
        users[i] = {
          ...users[i],
          country_name: country ? country.name : "",
          city_name: city ? city.name : ""
        };
      }
      res.send(users);
    } else {
      res.send([]);
    }
  } catch (err) {
    res.end(err);
  }
});
userRouter.post("/", async (req, res) => {
  try {
    let user = userModel({
      name: req.body.name,
      username: req.body.username,
      age: req.body.age,
      sex: req.body.sex,
      country: req.body.country,
      city: req.body.city,
      message: req.body.message,
      ip: req.body.ip
    });

    await user.save();
    res.send("Success");
  } catch (err) {
    res.end(err);
  }
});

module.exports = userRouter;
