const jwt = require("jsonwebtoken");
const config = require("./config");
module.exports = (req, res, next) => {
  const token = req.header("token");
  if (!token) return res.status(401).send("Access Denied");

  try {
    const doc = jwt.verify(token, config.SECRET);
    req.user = doc;
    next();
  } catch (error) {
    res.status(401).send(error);
  }
};
