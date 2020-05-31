const router = require("express").Router();

// Models
const countryModel = require("../../models/country");

router.get("/", (req, res) => {
  countryModel
    .find()
    .sort({ created_at: 1 })
    .then(rows => {
      res.send(rows);
    })
    .catch(err => res.send(err));
});

router.post("/", (req, res) => {
  let country = countryModel({
    name: req.body.name,
    created_at: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
  });

  country
    .save()
    .then(rows => {
      res.send(rows);
    })
    .catch(err => res.send(err));
});
router.post("/many", async (req, res) => {
  try {
    let savedCountries = await countryModel
      .find({})
      .select({ name: 1 })
      .lean();
    let savedCountriesNames = savedCountries.map(country => country.name);
    for (let i = 0; i < req.body.names.length; i++) {
      if (savedCountriesNames.indexOf(req.body.names[i]) < 0) {
        let country = countryModel({
          name: req.body.names[i],
          created_at: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
        });
        await country.save();
      }
    }
    savedCountries
      .filter(country => req.body.names.indexOf(country.name) < 0)
      .forEach(async country => {
        await countryModel.deleteOne({ _id: country._id });
      });
    res.send("success");
  } catch (err) {
    res.end(err);
  }
});
router.put("/:id", (req, res) => {
  countryModel
    .findByIdAndUpdate(req.params.id, { name: req.body.name })
    .then(rows => {
      res.send("تم التحديث بنجاح");
    })
    .catch(err => res.send(err));
});
router.delete("/:id", (req, res) => {
  countryModel
    .findByIdAndRemove(req.params.id)
    .then(rows => {
      res.send("Deleted successfully.");
    })
    .catch(err => console.log(err));
});

module.exports = router;
