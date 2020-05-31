const router = require("express").Router();

// Models
const messageModel = require("../../models/message");
const userModel = require("../../models/user");

// Routes
router.get("/", async (req, res) => {
  try {
    let messages = await messageModel.find({}).sort({ created_at: 1 });
    res.send(messages);
  } catch (err) {
    res.send(err);
  }
});

router.post("/", async (req, res) => {
  try {
    let savedMessages = await messageModel.find({}).lean();
    let savedMessagesText = savedMessages.map(message => message.text);
    for (let i = 0; i < req.body.length; i++) {
      if (savedMessagesText.indexOf(req.body[i]) < 0) {
        let message = messageModel({
          text: req.body[i],
          created_at: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
        });
        await message.save();
      }
    }
    savedMessages
      .filter(message => req.body.indexOf(message.text) < 0)
      .forEach(async message => {
        await messageModel.deleteOne({ _id: message._id });
      });
    res.send("success");
  } catch (err) {
    res.end(err);
  }
});

router.delete("/:id", (req, res) => {
  messageModel
    .findByIdAndRemove(req.params.id)
    .then(rows => {
      res.send("Deleted successfully.");
    })
    .catch(err => console.log(err));
});

module.exports = router;
