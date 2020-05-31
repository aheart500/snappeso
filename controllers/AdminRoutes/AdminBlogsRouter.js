const router = require("express").Router();

// Models
const blogModel = require("../../models/blog");

router.get("/", async (req, res) => {
  try {
    let blogs = await blogModel
      .find({})
      .sort("-created_at")
      .lean();
    res.send(blogs);
  } catch (err) {
    res.end(err);
  }
});
router.post("/", async (req, res) => {
  try {
    let blog = blogModel({
      title: req.body.title,
      text: req.body.text,
      type: req.body.type,
      created_at: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
    });
    const saved = await blog.save();
    res.send(saved);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.send({
        error: "عنوان المدونة موجود سابقاً، رجاءاً اختر اسم جديد"
      });
    }
    res.end(err);
  }
});
router.put("/:id", async (req, res) => {
  try {
    const blog = await blogModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.send(blog);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.send({
        error: "عنوان المدونة موجود سابقاً، رجاءاً اختر اسم جديد"
      });
    }
    res.end(err);
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const blog = await blogModel.findByIdAndRemove(req.params.id);
    res.send("Deleted");
  } catch (err) {
    res.end(err);
  }
});

module.exports = router;
