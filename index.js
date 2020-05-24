const mysql = require("mysql");
const cors = require("cors");
const express = require("express");
var app = express();
const bodyparser = require("body-parser");
var multer = require("multer");
const jwt = require("jsonwebtoken");
const verifyToken = require("./verifyToken");
const mongoose = require("mongoose");

//models
const adminModel = require("./models/admin");
const userModel = require("./models/user");
const countryModel = require("./models/country");
const messageModel = require("./models/message");
const vipModel = require("./models/vip");
const cityModel = require("./models/city");

app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
//app.use(bodyparser.json({limit: '10mb', extended: true}))
//app.use(bodyparser.urlencoded({limit: '10mb', extended: true}))
// var mysqlConnection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '123456123',
//     database: 'tjarob_node',
//     multipleStatements: true
// });

//router.get('/post', handler);
/* mongodb://testUser:xyz123@localhost:27017/test */
//connect to mongodb server
mongoose
  .connect("mongodb://127.0.0.1:27017/test", {
    useNewUrlParser: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("DB connection successed");
  })
  .catch(err => {
    console.log(err);
  });

//add an admin user

adminModel.findOne({ email: "app@gmail.com" }).then(res => {
  if (!res) {
    let admin = adminModel({
      email: "app@gmail.com",
      password: "123456789"
    });

    admin
      .save()
      .then(res => {
        console.log("added admin account");
      })
      .catch(err => {
        console.log("error happened couldn't add admin account");
      });
  }
});

// mysqlConnection.connect((err) => {
//     if (!err)
//         console.log('DB connection succeded.');
//     else
//         console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2));
// });

// //upload file
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, '/')
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + '.jpg')
//     }
// });

// var upload = multer({ storage: storage }).single('img');

app.post("/profile", function(req, res) {});

//end updload file
app.listen(3001, () =>
  console.log("Express server is runnig at port no : 3001")
);

//login admin
app.post("/api/admin/login", (req, res) => {
  // mysqlConnection.query('select * from admin where email = ? and password = ?', [req.body.email, req.body.password], function (error, results) {
  //     // res.send(results);
  //     if(error) {
  //         res.send('Incorrect Username and/or Password!');
  //     }

  adminModel.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      return res.send("Incorrect Username and/or Password!");
    }

    if (user.password === req.body.password) {
      const secret = "secret";
      const token = jwt.sign(
        {
          username: req.body.email,
          userID: req.body.password
        },
        secret,
        {
          expiresIn: "1hr"
        },
        function(err, token) {
          if (err) {
            console.log(err);
          } else {
            res
              .header("token", token)
              .send({ token: token, email: user.email });
            res.end();
          }
        }
      );
    } else {
      res.send("Incorrect Username and/or Password!");
    }
  });
});
app.get("/api/admin/logged", verifyToken, (req, res) => {
  return res.send(req.user);
});
//Get all users fluter
app.get("/gr/:id", async (req, res) => {
  // var sql = "SELECT users.*, country.name as country_name FROM users JOIN country ON country.id = users.country where  users.sex = ?";
  // mysqlConnection.query(sql, [req.params.id] ,(err, rows, fields) => {

  //     if (!err)
  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  try {
    let users = await userModel.find({ sex: req.params.id });

    let rows = [];

    for (let i = 0; i < users.length; i++) {
      let country_name = await countryModel.findOne({ _id: users[i].country });

      rows.push({ ...users[i]._doc, country_name: country_name.name });
    }

    res.send(rows);
  } catch (error) {
    console.log(error);
  }
});

//Get all users in admin panel
app.post("/admin/users/search", verifyToken, async (req, res) => {
  // mysqlConnection.query('SELECT users.*, country.name as country_name  FROM users  JOIN country ON country.id = users.country where users.name like "%'+req.body.search+'%" ', (err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send(rows);
  //     }
  // });

  try {
    let users = await userModel.find({
      name: { $regex: new RegExp(`^${req.body.search}.+`) }
    });

    let rows = [];

    for (let i = 0; i < users.length; i++) {
      let country_name = await countryModel.findOne({ _id: users[i].country });

      rows.push({ ...users[i]._doc, country_name: country_name.name });
    }

    res.send(rows);
  } catch (error) {
    console.log(error);
  }
});

//Get all users in admin panel
app.put("/admin/users/vipupdate", verifyToken, (req, res) => {
  // mysqlConnection.query('UPDATE users SET status = 1 WHERE id = ?',[req.body.id] , (err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send(rows);
  //     }
  // });

  userModel
    .findByIdAndUpdate(req.body.id, { status: 1 })
    .then(rows => {
      res.send(rows);
    })
    .catch(err => {
      console.log(err);
    });
});

//Get all users in admin panel
app.put("/admin/users/block", verifyToken, (req, res) => {
  // mysqlConnection.query('UPDATE users SET block = 1 WHERE id = ?',[req.body.id] , (err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send(rows);
  //     }
  // });

  userModel
    .findByIdAndUpdate(req.body.id, { block: 1 })
    .then(rows => {
      res.send(rows);
    })
    .catch(err => console.log(err));
});

app.post("/admin/account/create", (req, res) => {
  var postData = {
    name: req.body.name,
    country: req.body.country,
    sex: req.body.sex,
    age: req.body.age,
    message: req.body.message,
    identity: req.body.identity,
    city: req.body.city,
    status: req.body.status,
    block: req.body.block,
    img: req.body.img,
    time: req.body.time,
    date: req.body.date
  };

  // mysqlConnection.query('INSERT INTO users SET ?', postData, function (error, results ,data) {

  //     if (!error)
  //         res.send('inserted done');
  //         else

  //         console.log(error);
  //  });

  let user = userModel(postData);

  user
    .save()
    .then(rows => res.send(rows))
    .catch(err => console.log(err));
});

//Get all users in count account  panel
app.get("/admin/users/count", verifyToken, (req, res) => {
  // mysqlConnection.query('SELECT * FROM users', (err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send(rows);
  //     }
  // });

  userModel
    .find()
    .then(rows => {
      res.send(rows);
    })
    .catch(err => console.log(err));
});

//Get all users in count account  panel
app.get("/api/admin/users", verifyToken, async (req, res) => {
  // mysqlConnection.query('SELECT users.*, country.name as country_name  FROM users  JOIN country ON country.id = users.country', (err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send(rows);
  //     }
  // });

  try {
    let users = await userModel.find();

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

//Get all users in count account  panel
app.get("/admin/vip/count", verifyToken, (req, res) => {
  // mysqlConnection.query('SELECT * FROM users where status = 1', (err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send(rows);
  //     }
  // });

  userModel
    .find({ status: 1 })
    .then(rows => {
      res.send(rows);
    })
    .catch(err => console.log(err));
});

//Get all users in count account  panel
app.get("/admin/block/count", verifyToken, (req, res) => {
  // mysqlConnection.query('SELECT * FROM users where block = 1', (err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send(rows);
  //     }
  // });

  userModel
    .find({ block: 1 })
    .then(rows => {
      res.send(rows);
    })
    .catch(err => console.log(err));
});

//Get all users in count account  panel
app.get("/admin/vip/users", verifyToken, (req, res) => {
  // mysqlConnection.query('SELECT * FROM users where status = 1 limit 10', (err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send(rows);
  //     }
  // });

  userModel
    .find({ status: 1 })
    .limit(10)
    .then(rows => {
      res.send(rows);
    })
    .catch(err => console.log(err));
});

//Get all users in count account  panel
app.get("/admin/block/users", verifyToken, (req, res) => {
  // mysqlConnection.query('SELECT * FROM users where block = 1 limit 10', (err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send(rows);
  //     }
  // });

  userModel
    .find({ block: 1 })
    .limit(10)
    .then(rows => {
      res.send(rows);
    })
    .catch(err => console.log(err));
});

//Get all message panel
app.get("/admin/message", verifyToken, async (req, res) => {
  // mysqlConnection.query('SELECT * FROM message ', (err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send(rows);
  //     }
  // });

  try {
    let messages = await messageModel.find();
    res.send(messages);
  } catch (error) {
    res.send(error);
  }
});

//Get all country panel
app.get("/api/admin/country", verifyToken, (req, res) => {
  // mysqlConnection.query('SELECT * FROM country ', (err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send(rows);
  //     }
  // });

  countryModel
    .find()
    .sort({ created_at: -1 })
    .then(rows => {
      res.send(rows);
    })
    .catch(err => res.send(err));
});

//Get all users in count message panel
app.get("/admin/message/count", verifyToken, (req, res) => {
  // mysqlConnection.query('SELECT count(*) FROM message', (err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send(rows);
  //     }
  // });

  messageModel
    .find()
    .then(rows => {
      res.send(rows.length);
    })
    .catch(err => res.send(err));
});

app.get("/admin/vip/page", verifyToken, (req, res) => {
  // mysqlConnection.query('SELECT * FROM vip', (err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send(rows);
  //     }
  // });

  vipModel
    .find()
    .then(row => res.send(rows))
    .catch(err => res.send(err));
});

app.put("/admin/vip/page/update", verifyToken, (req, res) => {
  // console.log(req.body);
  // mysqlConnection.query('UPDATE vip SET doc = ? WHERE id = ?',[req.body.doc , req.body.id] ,(err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send("dsfsdfsdfs");
  //     }
  // });

  vipModel
    .findByIdAndUpdate(req.body.id, { doc: req.body.doc })
    .then(rows => res.send("dsfsdfsdfs"))
    .catch(err => res.send(err));
});

app.put("/admin/message/:id", verifyToken, (req, res) => {
  // console.log(req.body);
  // mysqlConnection.query('UPDATE message SET name = ? WHERE id = ?',[req.body.name , req.params.id] ,(err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send("تم التحديث بنجاح");
  //     }
  // });

  messageModel
    .findByIdAndUpdate(req.params.id, { name: req.body.name })
    .then(rows => res.send("تم التحديث بنجاح"))
    .catch(err => res.send(err));
});

app.put("/api/admin/country/:id", verifyToken, (req, res) => {
  // console.log(req.body);
  // mysqlConnection.query('UPDATE country SET name = ? WHERE id = ?',[req.body.name , req.params.id] ,(err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send("تم التحديث بنجاح");
  //     }
  // });

  countryModel
    .findByIdAndUpdate(req.params.id, { name: req.body.name })
    .then(rows => {
      res.send("تم التحديث بنجاح");
    })
    .catch(err => res.send(err));
});

app.post("/api/admin/country/create", verifyToken, (req, res) => {
  // console.log(req.body);
  // mysqlConnection.query("INSERT INTO country (name) VALUES (?)" , [req.body.name],(err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send("تمت الاضافة بنجاح");
  //     }
  // });

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
app.post("/api/admin/country/create/many", verifyToken, async (req, res) => {
  try {
    for (let i = 0; i < req.body.names.length; i++) {
      let country = countryModel({
        name: req.body.names[i],
        created_at: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
      });

      await country.save();
    }
    res.send("success");
  } catch (err) {
    res.end(err);
  }
});

app.get("/admin/country/:id", verifyToken, (req, res) => {
  // mysqlConnection.query('select * from country WHERE id = ?', [req.params.id], (err, rows, fields) => {
  //     if (!err)
  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  countryModel
    .find({ _id: req.params.id })
    .then(rows => {
      res.send(rows);
    })
    .catch(err => console.log(err));
});

//city admin
app.put("/api/admin/city/:id", verifyToken, (req, res) => {
  // // console.log(req.body);
  // mysqlConnection.query('UPDATE message SET name = ? WHERE id = ?',[req.body.name , req.params.id] ,(err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send("تم التحديث بنجاح");
  //     }
  // });
  cityModel
    .findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(rows => {
      res.send(rows);
    })
    .catch(err => res.send(err));
});

app.get("/api/admin/city", verifyToken, async (req, res) => {
  // mysqlConnection.query('SELECT city.*, country.name as country_name  FROM city  JOIN country ON country.id = city.country_id',(err, rows, fields) => {
  //     if (!err)
  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  try {
    let cities = await cityModel.find().sort({ created_at: -1 });
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

app.post("/api/admin/city/create", verifyToken, async (req, res) => {
  // console.log(req.body);
  // mysqlConnection.query("INSERT INTO city (name,country_id) VALUES (? ,?)" , [req.body.name , req.body.contry_id],(err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send("تمت الاضافة بنجاح");
  //     }
  // });

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
app.post("/api/admin/city/create/many", verifyToken, async (req, res) => {
  try {
    for (let i = 0; i < req.body.names.length; i++) {
      let city = cityModel({
        name: req.body.names[i],
        country_id: req.body.country_id ? req.body.country_id : "",
        created_at: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
      });
      let country_name = "";
      if (req.body.country_id !== "") {
        country_name = await countryModel.findOne({
          _id: city.country_id
        });
      }
      await city.save();
    }
    res.send("success");
  } catch (err) {
    res.send(err);
  }
});

app.get("/admin/city/:id", verifyToken, (req, res) => {
  // mysqlConnection.query('SELECT city.*, country.name as country_name  FROM city  JOIN country ON country.id = city.country where city.id = ?', [req.params.id], (err, rows, fields) => {
  //     if (!err)
  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  cityModel
    .findById(req.params.id)
    .then(async rows => {
      let country = await countryModel.findById(rows.country_id);
      rows = { ...rows._doc, country_name: country.name };
      res.send(rows);
    })
    .catch(err => console.log(err));
});

app.delete("/api/admin/country/:id", verifyToken, (req, res) => {
  countryModel
    .findByIdAndRemove(req.params.id)
    .then(rows => {
      res.send("Deleted successfully.");
    })
    .catch(err => console.log(err));
});
// //Delete an city
app.delete("/api/admin/city/:id", verifyToken, (req, res) => {
  // mysqlConnection.query('DELETE FROM city WHERE id = ?', [req.params.id], (err, rows, fields) => {
  //     if (!err)
  //         res.send('Deleted successfully.');
  //     else
  //         console.log(err);
  // })

  cityModel
    .findByIdAndRemove(req.params.id)
    .then(rows => {
      res.send("Deleted successfully.");
    })
    .catch(err => console.log(err));
});

//get an message
app.get("/admin/message/:id", verifyToken, (req, res) => {
  // mysqlConnection.query('select * from message WHERE id = ?', [req.params.id], (err, rows, fields) => {
  //     if (!err)
  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  messageModel
    .findById(req.params.id)
    .then(rows => {
      res.send(rows);
    })
    .catch(err => console.log(err));
});

// //Delete an message
app.delete("/admin/message/:id", verifyToken, (req, res) => {
  // mysqlConnection.query('DELETE FROM message WHERE id = ?', [req.params.id], (err, rows, fields) => {
  //     if (!err)
  //         res.send('Deleted successfully.');
  //     else
  //         console.log(err);
  // })

  messageModel
    .findByIdAndRemove(req.params.id)
    .then(rows => {
      res.send("Deleted successfully.");
    })
    .catch(err => console.log(err));
});

app.post("/admin/message/create", verifyToken, (req, res) => {
  // console.log(req.body);
  // mysqlConnection.query("INSERT INTO message (name) VALUES (?)" , [req.body.name],(err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send("تمت الاضافة بنجاح");
  //     }
  // });

  let message = messageModel({
    name: req.body.name,
    created_at: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
  });

  message
    .save()
    .then(rows => {
      res.send("تمت الاضافة بنجاح");
    })
    .catch(err => console.log(err));
});

//add account in admin
app.post("/api/admin/users/create", verifyToken, (req, res) => {
  var postData = {
    name: req.body.name,
    username: req.body.username,
    country: req.body.country,
    sex: req.body.sex,
    status: req.body.status,
    block: req.body.block,
    age: req.body.age,
    message: req.body.message,
    city: req.body.city,
    ip: req.body.ip
  };

  // mysqlConnection.query('INSERT INTO users SET ?', postData, function (error, results ,data) {

  //     if (!error)
  //         res.send('inserted done');
  //         else

  //         console.log(error);
  //  });

  let user = userModel(postData);

  user
    .save()
    .then(rows => res.send(rows))
    .catch(err => console.log(err));
});
app.put("/api/admin/users/:id", verifyToken, (req, res) => {
  // // console.log(req.body);
  // mysqlConnection.query('UPDATE message SET name = ? WHERE id = ?',[req.body.name , req.params.id] ,(err, rows, fields) => {
  //      if (err) {
  //          res.send(err)
  //      }
  //      else {
  //         res.send("تم التحديث بنجاح");
  //     }
  // });
  userModel
    .findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(rows => {
      res.send(rows);
    })
    .catch(err => res.send(err));
});
app.delete("/api/admin/users/:id", verifyToken, (req, res) => {
  userModel
    .findByIdAndRemove(req.params.id)
    .then(rows => res.send("Deleted Successfully"))
    .catch(err => res.send(err));
});
//Get all message in admin panel
app.get("/admin/messages", verifyToken, (req, res) => {
  // console.log(req,res);

  // mysqlConnection.query('select * from message', (err, rows, fields) => {
  //     if (!err)

  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  messageModel
    .find()
    .then(rows => {
      res.send(rows);
    })
    .catch(err => console.log(err));
});

// verifyToken

//Get all login normail users
app.post("/login", (req, res) => {
  var postData = {
    name: req.body.name,
    country: req.body.country,
    sex: req.body.sex,
    age: req.body.age,
    message: req.body.message,
    identity: req.body.identity,
    city: req.body.city,
    time: req.body.time,
    date: req.body.date
  };

  console.log(postData);

  // mysqlConnection.query('INSERT INTO users SET ?', postData, function (error, results ,data) {

  //     if (!error)
  //         res.send('inserted done');
  //         else

  //         console.log(error);
  //  });

  let user = userModel(postData);

  user
    .save()
    .then(rows => res.send(rows))
    .catch(err => console.log(err));
});

//Get all country

app.post("/country", (req, res) => {
  var postData = req.body;
  //res.send(postData);

  // mysqlConnection.query('INSERT INTO country SET ?', postData, function (error, results) {
  //     if (!error)
  //         results.send('inserted done');

  //         else

  //         mysqlConnection.on('error', function(error) {
  //             console.log("[mysql error]",error);
  //           });
  //             // console.log(err);
  //  });

  let country = countryModel(postData);

  country
    .save()
    .then(rows => {
      results.send("inserted done");
    })
    .catch(err => console.log(err));
});

//Get all message
app.get("/message", (req, res) => {
  // mysqlConnection.query('SELECT * FROM message', (err, rows, fields) => {

  //     if (!err)
  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  messageModel
    .find()
    .then(rows => res.send(rows))
    .catch(err => console.log(err));
});

//Get all message
app.get("/vip", (req, res) => {
  // mysqlConnection.query('SELECT * FROM vip where id = 1', (err, rows, fields) => {

  //     if (!err)
  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  vipModel
    .find()
    .then(rows => res.send(rows[0]))
    .catch(err => console.log(err));
});

//Get all message
app.get("/country", (req, res) => {
  // mysqlConnection.query('SELECT * FROM country', (err, rows, fields) => {

  //     if (!err)
  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  countryModel
    .find()
    .then(rows => res.send(rows))
    .catch(err => console.log(err));
});

//Get all city by id
app.get("/City/:id", (req, res) => {
  // mysqlConnection.query('SELECT * FROM city where country_id = ?',[req.params.id], (err, rows, fields) => {

  //     if (!err)
  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  cityModel
    .findById(req.params.id)
    .then(rows => res.send(rows))
    .catch(err => console.log(err));
});

//Get all users vip
app.get("/users/vip", async (req, res) => {
  // mysqlConnection.query('SELECT users.*, country.name as country_name  FROM users  JOIN country ON country.id = users.country where users.status = 1', (err, rows, fields) => {

  //     if (!err)
  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  try {
    let users = await userModel.find({ status: 1 });
    let rows = [];

    for (let i = 0; i < users.length; i++) {
      let country_name = await countryModel.findOne({ _id: users[i].country });

      rows.push({ ...users[i]._doc, country_name: country_name.name });
    }

    res.send(rows);
  } catch (error) {
    console.log(error);
  }
});

//Get all users normal
app.get("/users", async (req, res) => {
  // mysqlConnection.query('SELECT users.*, country.name as country_name  FROM users  JOIN country ON country.id = users.country where users.status = 0', (err, rows, fields) => {

  //     if (!err)
  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  try {
    let users = await userModel.find({ status: 0 });

    let rows = [];

    for (let i = 0; i < users.length; i++) {
      let country_name = await countryModel.findOne({ _id: users[i].country });

      rows.push({ ...users[i]._doc, country_name: country_name.name });
    }

    res.send(rows);
  } catch (error) {
    console.log(error);
  }
});

//Get all users fluter
// app.post('/users/fluter', (req, res) => {
//     var sql = "SELECT users.*, country.name as country_name FROM users JOIN country ON country.id = users.country where users.status = ? AND  users.sex = ? AND users.country = ? AND users.city = ? AND users.age < ?";
//     mysqlConnection.query(sql, [0,req.body.sex ,req.body.country,req.body.city,req.body.age] ,(err, rows, fields) => {

//         if (!err)
//             res.send(rows);
//         else
//             console.log(err);
//     })
// });

//Get all users flutter country
// app.post('/users/fluter/country', (req, res) => {
//     var sql = "SELECT users.*, country.name as country_name FROM users JOIN country ON country.id = users.country where AND users.country = ? ";
//     mysqlConnection.query(sql, [req.body.country] ,(err, rows, fields) => {

//         if (!err)
//             res.send(rows);
//         else
//             console.log(err);
//     })
// });

//Get all users fluter
app.post("/users/fluter/1", async (req, res) => {
  // var sql = "SELECT users.*, country.name as country_name FROM users JOIN country ON country.id = users.country where users.status = ? AND  users.sex = ? AND users.country = ? AND users.city = ? AND users.age < ?";
  // mysqlConnection.query(sql, [0,req.body.sex ,req.body.country,req.body.city,req.body.age] ,(err, rows, fields) => {

  //     if (!err)
  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  try {
    let users = await userModel.find({
      status: 0,
      country: req.body.country,
      sex: req.params.id,
      city: req.body.city,
      age: { $lt: req.body.age }
    });
    let rows = [];

    for (let i = 0; i < users.length; i++) {
      let country_name = await countryModel.findOne({ _id: users[i].country });

      rows.push({ ...users[i]._doc, country_name: country_name.name });
    }

    res.send(rows);
  } catch (error) {
    console.log(error);
  }
});

//Get all users fluter
app.get("/sex/:id", async (req, res) => {
  // var sql = "SELECT users.*, country.name as country_name FROM users JOIN country ON country.id = users.country where users.sex = ? AND users.status = 0";
  // mysqlConnection.query(sql, [req.params.id] ,(err, rows, fields) => {

  //     if (!err)
  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  try {
    let users = await userModel.find({ sex: req.params.id, status: 0 });

    let rows = [];

    for (let i = 0; i < users.length; i++) {
      let country_name = await countryModel.findOne({ _id: users[i].country });

      rows.push({ ...users[i]._doc, country_name: country_name.name });
    }

    res.send(rows);
  } catch (error) {
    console.log(error);
  }
});

//Get an user by id
app.get("/users/:id", (req, res) => {
  // mysqlConnection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, rows, fields) => {
  //     if (!err)
  //         res.send(rows);
  //     else
  //         console.log(err);
  // })

  userModel
    .findById(req.params.id)
    .then(rows => {
      res.send(rows);
    })
    .catch(err => console.log(err));
});

// //Delete an users
app.delete("/users/:id", (req, res) => {
  // mysqlConnection.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, rows, fields) => {
  //     if (!err)
  //         res.send('Deleted successfully.');
  //     else
  //         console.log(err);
  // })

  userModel
    .findByIdAndRemove(req.params.id)
    .then(rows => {
      res.send("Deleted successfully.");
    })
    .catch(err => console.log(err));
});

// Insert an employees
app.post("/users", (req, res) => {
  var postData = req.body;
  // res.send(postData);

  // mysqlConnection.query('INSERT INTO users SET ?', postData, function (error, results, fields) {
  //     if (!err)
  //             rows.forEach(element => {
  //                 if(element.constructor == Array)
  //                 res.send('Inserted employee id : '+element[0].id);
  //             });
  //         else
  //             console.log(err);
  //  });

  // console.log(req);
  // var sql = "";
  // mysqlConnection.query(sql, data, (err, rows, fields) => {
  //     if (!err)
  //         rows.forEach(element => {
  //             if(element.constructor == Array)
  //             res.send('Inserted employee id : '+element[0].id);
  //         });
  //     else
  //         console.log(err);
  // })

  let user = userModel(postData);

  user
    .save()
    .then(rows => {
      res.send("Inserted successfully");
    })
    .catch(err => console.log(err));
});

// Update an employees
app.put("/users", (req, res) => {
  //let emp = req.body;
  // console.log(emp);
  // var sql = "SET @name = ?;SET @identity = ?;SET @message = ?;SET @sex = ?;SET @status = ?;SET @viewers = ?;SET @block = ?;SET @country = ?; \
  // CALL EmployeeAddOrEdit(,@Name,@identity,@message,@sex,@status,@viewers,@block,@country);";
  // mysqlConnection.query(sql, [emp.Name, emp.identity, emp.message,emp.sex,emp.status,emp.viewers,emp.block,emp.country], (err, rows, fields) => {
  //     if (!err)
  //         res.send('Updated successfully');
  //     else
  //         console.log(err);
  // })

  userModel
    .findOneAndUpdate({ identity: req.body.identity }, req.body)
    .then(rows => {
      res.send("Updated successfully");
    })
    .catch(err => console.log(err));
});
