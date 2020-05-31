const router = require("express").Router();

// Models
const cityModel = require("../../models/city");
const countryModel = require("../../models/country");

// Routes
router.get("/", async (req, res) => {
  try {
    let cities = await cityModel.find().sort("_id");
    let rows = [];
    let country_name = { name: "" };
    for (let i = 0; i < cities.length; i++) {
      if (cities[i].country_id === "") {
        country_name.name = "";
      } else {
        let country = await countryModel.findOne({
          _id: cities[i].country_id
        });
        if (country) {
          country_name.name = country.name;
        } else {
          country_name.name = "";
        }
      }

      rows.push({ ...cities[i]._doc, country_name: country_name.name });
    }

    res.send(rows);
  } catch (error) {
    console.log(error);
  }
});

router.post("/", async (req, res) => {
  let city = cityModel({
    name: req.body.name,
    country_id: req.body.country_id ? req.body.country_id : "",
    created_at: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
  });
  let country_name = "";
  if (req.body.country_id !== "") {
    country_name = await countryModel.findOne({
      _id: city.country_id
    });
  }
  city
    .save()
    .then(rows => {
      res.send({ ...rows._doc, country_name: country_name.name });
    })
    .catch(err => res.send(err));
});

router.post("/many", async (req, res) => {
  try {
    let sentNames = req.body.names;
    let sentCountryId = req.body.country_id;
    let savedCities = await cityModel.find({ country_id: sentCountryId });

    let savedNames = savedCities.map(city => city.name);
    for (let i = 0; i < sentNames.length; i++) {
      if (savedNames.includes(sentNames[i]) === false) {
        let city = cityModel({
          name: sentNames[i],
          country_id: sentCountryId,
          created_at: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
        });
        await city.save();
      }
    }
    for (let i = 0; i < savedCities.length; i++) {
      if (sentNames.includes(savedNames[i]) === false) {
        await cityModel.deleteOne({
          name: savedNames[i],
          country_id: sentCountryId
        });
      }
    }

    res.send("success");
  } catch (err) {
    res.send(err);
  }
});

router.put("/:id", (req, res) => {
  cityModel
    .findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(rows => {
      res.send(rows);
    })
    .catch(err => res.send(err));
});

router.delete("/:id", (req, res) => {
  cityModel
    .findByIdAndRemove(req.params.id)
    .then(rows => {
      res.send("Deleted successfully.");
    })
    .catch(err => console.log(err));
});
module.exports = router;
