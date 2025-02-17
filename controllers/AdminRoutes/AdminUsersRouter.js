const router = require("express").Router();
const upload = require("../../utils/upload");
// Models

const userModel = require("../../models/user");
const countryModel = require("../../models/country");
const cityModel = require("../../models/city");

router.get("/", async (req, res) => {
  try {
    let users = await userModel.find().sort({ _id: -1 });
    let rows = [];

    for (let i = 0; i < users.length; i++) {
      let country, city;
      if (users[i].country !== "") {
        country = await countryModel.findOne({ _id: users[i].country });
      }
      if (users[i].city !== "") {
        city = await cityModel.findOne({ _id: users[i].city });
      }

      rows.push({
        ...users[i]._doc,
        country_name: country ? country.name : "",
        city_name: city ? city.name : ""
      });
    }

    res.send(rows);
  } catch (error) {
    console.log(error);
  }
});

router.post("/", upload.single("img"), async (req, res) => {
  const url = req.protocol + "://" + req.get("host");
  let userData = JSON.parse(req.body.userData);

  var postData = {
    ...userData,
    img: req.file ? url + "/images/" + req.file.filename : ""
  };
  try {
    let user = userModel(postData);
    let country, city;
    if (postData.country !== "") {
      country = await countryModel.findOne({ _id: postData.country });
    }
    if (postData.city !== "") {
      city = await cityModel.findOne({ _id: postData.city });
    }
    user
      .save()
      .then(rows => {
        res.send({
          ...rows._doc,
          country_name: country ? country.name : "",
          city_name: city ? city.name : ""
        });
      })
      .catch(err => res.end(err));
  } catch (err) {
    res.end(err);
  }
});
router.put("/:id", upload.single("img"), async (req, res) => {
  const url = req.protocol + "://" + req.get("host");
  let userData = JSON.parse(req.body.userData);
  try {
    let country, city;
    if (req.body.country !== "") {
      country = await countryModel.findOne({ _id: userData.country });
    }
    if (req.body.city !== "") {
      city = await cityModel.findOne({ _id: userData.city });
    }
    userModel
      .findByIdAndUpdate(
        req.params.id,
        {
          ...userData,
          img: req.file ? url + "/images/" + req.file.filename : userData.img
        },
        { new: true }
      )
      .then(rows => {
        res.send({
          ...rows._doc,
          country_name: country ? country.name : "",
          city_name: city ? city.name : ""
        });
      })
      .catch(err => res.send(err));
  } catch (err) {
    res.end(err);
  }
});

router.delete("/:id", (req, res) => {
  userModel
    .findByIdAndRemove(req.params.id)
    .then(rows => res.send("Deleted Successfully"))
    .catch(err => res.send(err));
});

module.exports = router;
