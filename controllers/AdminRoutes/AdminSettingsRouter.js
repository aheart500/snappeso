const router = require("express").Router();
// Models
const settingsModel = require("../../models/settings");

router.get("/", (req, res) => {
  settingsModel
    .find({})
    .then(settings => {
      res.send(settings[0]);
    })
    .catch(err => res.end(err));
});
router.get("/vip", (req, res) => {
  settingsModel
    .find({})
    .select({ vip_message: 1 })
    .then(settings => {
      res.send(settings[0]);
    })
    .catch(err => res.end(err));
});

router.patch("/", (req, res) => {
  settingsModel
    .updateOne({ _id: req.body.id }, { $set: req.body.data })
    .then(result => {
      res.send("success");
    })
    .catch(err => res.end(err));
});
module.exports = router;
