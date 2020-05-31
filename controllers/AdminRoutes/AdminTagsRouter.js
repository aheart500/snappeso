const router = require("express").Router();

// Models
const tagModel = require("../../models/tag");

router.get("/", (req, res) => {
  tagModel
    .find({})
    .sort("_id")
    .lean()
    .then(tags => {
      if (tags.length > 0) {
        let tagNames = tags.map(tag => tag.name);
        let tagLink = tags[0].link;
        return res.send({ tags: tagNames, link: tagLink });
      } else {
        return res.send({ tags: [], link: "" });
      }
    })
    .catch(err => res.end(err));
});

router.post("/", async (req, res) => {
  let sentTags = req.body.tags;
  let sentLink = req.body.link;

  try {
    let savedTags = await tagModel
      .find({})
      .select({ name: 1 })
      .lean();
    savedTags = savedTags.map(tag => tag.name);
    for (let i = 0; i < sentTags.length; i++) {
      if (savedTags.includes(sentTags[i]) === false) {
        let newTag = tagModel({
          name: sentTags[i],
          link: sentLink
        });
        await newTag.save();
      } else {
        await tagModel.updateOne(
          { name: sentTags[i] },
          { $set: { link: sentLink } }
        );
      }
    }
    for (let i = 0; i < savedTags.length; i++) {
      if (sentTags.includes(savedTags[i]) === false) {
        await tagModel.deleteOne({ name: savedTags[i] });
      }
    }
    res.send("Saved");
  } catch (err) {
    res.end(err);
  }
});

module.exports = router;
