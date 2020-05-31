require("dotenv").config();
const MongoDB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const SECRET = process.env.SECRET;

module.exports = { MongoDB_URI, PORT, SECRET };
