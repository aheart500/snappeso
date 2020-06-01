const multer = require("multer");
const path = require("path");
const fs = require("fs");
const saveFolder = path.join(__dirname, "../images");
if (!fs.existsSync(saveFolder)) {
  fs.mkdirSync(saveFolder);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, saveFolder);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    cb(null, Date.now() + "-" + fileName);
  }
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/webp"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg, .webp and .jpeg format allowed!"));
    }
  }
});

module.exports = upload;
