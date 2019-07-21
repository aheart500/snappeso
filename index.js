const mysql = require('mysql');
const cors = require("cors");
const express = require('express');
var app = express();
const bodyparser = require('body-parser');
var multer = require('multer');
const jwt = require('jsonwebtoken');
const verifyToken = require('./verifyToken');

app.use(cors());
// app.use(bodyparser.urlencoded({ extended: false }));
// app.use(bodyparser.json());
app.use(bodyparser.json({limit: '10mb', extended: true}))
app.use(bodyparser.urlencoded({limit: '10mb', extended: true}))
var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'node',
    multipleStatements: true
});


mysqlConnection.connect((err) => {
    if (!err)
        console.log('DB connection succeded.');
    else
        console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2));
});

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


// app.post('/profile', function (req, res) {
//     upload(req, res, function (err) {
//         console.log(req);
//         if (err) {
//             // An error occurred when uploading
//         }
//         res.json({
//             success: true,
//             message: 'Image uploaded!'
//         });

//         // Everything went fine
//     })
// });

//end updload file
app.listen(3000, () => console.log('Express server is runnig at port no : 3000'));

//login admin
app.post('/admin/login',(req, res) => {

    mysqlConnection.query('select * from admin where email = ? and password = ?', [req.body.email, req.body.password], function (error, results) {
        // res.send(results);
        if(error) {
            res.send('Incorrect Username and/or Password!');
        } 
        if(results.length == 1) {
            const secret = 'secret';
            const token = jwt.sign({
                username: req.body.email,
                userID: req.body.password
            },
            secret, {
                expiresIn: "1hr"
            },
            function(err, token) {
                if (err) {
                    console.log(err);
                } else {
                    res.header("token" ,token).send({"token":token,"email": results.email});
                    res.end() 
                    
                }
            });
        } else
        {
            res.send('Incorrect Username and/or Password!');

        }

        

    });
});

//Get all users in admin panel 
app.post('/admin/users/search', verifyToken ,(req, res) => {

    mysqlConnection.query('SELECT users.*, country.name as country_name  FROM users  JOIN country ON country.id = users.country where users.name like "%'+req.body.search+'%" ', (err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send(rows);
        }
    });
});

//Get all users in admin panel 
app.put('/admin/users/vipupdate', verifyToken ,(req, res) => {
    mysqlConnection.query('UPDATE users SET status = 1 WHERE id = ?',[req.body.id] , (err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send(rows);
        }
    });
});

//Get all users in admin panel 
app.put('/admin/users/block', verifyToken ,(req, res) => {
    mysqlConnection.query('UPDATE users SET block = 1 WHERE id = ?',[req.body.id] , (err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send(rows);
        }
    });
});


app.post('/admin/account/create', (req, res) => {
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
        date: req.body.date,
    };
    
    mysqlConnection.query('INSERT INTO users SET ?', postData, function (error, results ,data) {

        if (!error)
            res.send('inserted done');
            else

            console.log(error);
     });
});

//Get all users in count account  panel 
app.get('/admin/users/count', verifyToken ,(req, res) => {
    mysqlConnection.query('SELECT * FROM users', (err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send(rows);
        }
    });
});
//Get all users in count account  panel 
app.get('/admin/users', verifyToken ,(req, res) => {
    mysqlConnection.query('SELECT users.*, country.name as country_name  FROM users  JOIN country ON country.id = users.country', (err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send(rows);
        }
    });
});

//Get all users in count account  panel 
app.get('/admin/vip/count', verifyToken ,(req, res) => {
    mysqlConnection.query('SELECT * FROM users where status = 1', (err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send(rows);
        }
    });
});

//Get all users in count account  panel 
app.get('/admin/block/count', verifyToken ,(req, res) => {
    mysqlConnection.query('SELECT * FROM users where block = 1', (err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send(rows);
        }
    });
});

//Get all users in count account  panel 
app.get('/admin/vip/users', verifyToken ,(req, res) => {
    mysqlConnection.query('SELECT * FROM users where status = 1 limit 10', (err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send(rows);
        }
    });
});

//Get all users in count account  panel 
app.get('/admin/block/users', verifyToken ,(req, res) => {
    mysqlConnection.query('SELECT * FROM users where block = 1 limit 10', (err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send(rows);
        }
    });
});

//Get all message panel 
app.get('/admin/message', verifyToken ,(req, res) => { 
    mysqlConnection.query('SELECT * FROM message ', (err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send(rows);
        }
    });
});

//Get all country panel 
app.get('/admin/country', verifyToken ,(req, res) => {
    mysqlConnection.query('SELECT * FROM country ', (err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send(rows);
        }
    });
});

//Get all users in count message panel 
app.get('/admin/message/count', verifyToken ,(req, res) => {
    mysqlConnection.query('SELECT count(*) FROM message', (err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send(rows);
        }
    });
});


app.get('/admin/vip/page', verifyToken ,(req, res) => {
    mysqlConnection.query('SELECT * FROM vip', (err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send(rows);
        }
    });
});

app.put('/admin/vip/page/update', verifyToken ,(req, res) => {
    // console.log(req.body);
    mysqlConnection.query('UPDATE vip SET doc = ? WHERE id = ?',[req.body.doc , req.body.id] ,(err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send("dsfsdfsdfs");
        }
    });
});

app.put('/admin/message/:id', verifyToken ,(req, res) => {
    // console.log(req.body);
    mysqlConnection.query('UPDATE message SET name = ? WHERE id = ?',[req.body.name , req.params.id] ,(err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send("تم التحديث بنجاح");
        }
    });
});


app.put('/admin/country/:id', verifyToken ,(req, res) => {
    // console.log(req.body);
    mysqlConnection.query('UPDATE country SET name = ? WHERE id = ?',[req.body.name , req.params.id] ,(err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send("تم التحديث بنجاح");
        }
    });
});

app.post('/admin/country/create', verifyToken ,(req, res) => {
    // console.log(req.body);
    mysqlConnection.query("INSERT INTO country (name) VALUES (?)" , [req.body.name],(err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send("تمت الاضافة بنجاح");
        }
    });
});

app.get('/admin/country/:id', verifyToken ,(req, res) => {
    mysqlConnection.query('select * from country WHERE id = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

app.get('/admin/country/:id', verifyToken ,(req, res) => {
    mysqlConnection.query('select * from country WHERE id = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});
//city admin
app.put('/admin/city/:id', verifyToken ,(req, res) => {
    // console.log(req.body);
    mysqlConnection.query('UPDATE message SET name = ? WHERE id = ?',[req.body.name , req.params.id] ,(err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send("تم التحديث بنجاح");
        }
    });
});

app.get('/admin/city', verifyToken ,(req, res) => {
    mysqlConnection.query('SELECT city.*, country.name as country_name  FROM city  JOIN country ON country.id = city.country_id',(err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

app.post('/admin/city/create', verifyToken ,(req, res) => {
    // console.log(req.body);
    mysqlConnection.query("INSERT INTO city (name,country_id) VALUES (? ,?)" , [req.body.name , req.body.contry_id],(err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send("تمت الاضافة بنجاح");
        }
    });
});

app.get('/admin/city/:id', verifyToken ,(req, res) => {
    mysqlConnection.query('SELECT city.*, country.name as country_name  FROM city  JOIN country ON country.id = city.country where city.id = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

// //Delete an city
app.delete('/admin/city/:id', verifyToken ,(req, res) => {
    mysqlConnection.query('DELETE FROM city WHERE id = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            res.send('Deleted successfully.');
        else
            console.log(err);
    })
});


//get an message
app.get('/admin/message/:id', verifyToken ,(req, res) => {
    mysqlConnection.query('select * from message WHERE id = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

// //Delete an message
app.delete('/admin/message/:id', verifyToken ,(req, res) => {
    mysqlConnection.query('DELETE FROM message WHERE id = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            res.send('Deleted successfully.');
        else
            console.log(err);
    })
});

app.post('/admin/message/create', verifyToken ,(req, res) => {
    // console.log(req.body);
    mysqlConnection.query("INSERT INTO message (name) VALUES (?)" , [req.body.name],(err, rows, fields) => {
         if (err) {
             res.send(err)
         }
         else {
            res.send("تمت الاضافة بنجاح");
        }
    });
});

//add account in admin 
app.get('/admin/users/create', verifyToken ,(req, res) => {
    var postData = {
        name: req.body.name,
        country: req.body.country,
        sex: req.body.sex,
        age: req.body.age,
        message: req.body.message,
        identity: req.body.identity,
        city: req.body.city,
        time: req.body.time,
        date: req.body.date,
    };
    
    mysqlConnection.query('INSERT INTO users SET ?', postData, function (error, results ,data) {

        if (!error)
            res.send('inserted done');
            else

            console.log(error);
     });
});

//Get all message in admin panel 
app.get('/admin/messages', verifyToken ,(req, res) => {
    // console.log(req,res);

    mysqlConnection.query('select * from message', (err, rows, fields) => {
        if (!err)

            res.send(rows);
        else
            console.log(err);
    })
});

// verifyToken

//Get all login normail users
app.post('/login', (req, res) => {
    var postData = {
        name: req.body.name,
        country: req.body.country,
        sex: req.body.sex,
        age: req.body.age,
        message: req.body.message,
        identity: req.body.identity,
        city: req.body.city,
        time: req.body.time,
        date: req.body.date,
    };
    
    mysqlConnection.query('INSERT INTO users SET ?', postData, function (error, results ,data) {

        if (!error)
            res.send('inserted done');
            else

            console.log(error);
     });
});

//Get all country

app.post('/country', (req, res) => {
    var postData  = req.body;
    // res.send(postData);

    mysqlConnection.query('INSERT INTO country SET ?', postData, function (error, results) {
        if (!error)
            results.send('inserted done');
            
            else

            mysqlConnection.on('error', function(error) {
                console.log("[mysql error]",error);
              });
                // console.log(err);
     });
});

//Get all message
app.get('/message', (req, res) => {

    mysqlConnection.query('SELECT * FROM message', (err, rows, fields) => {

        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Get all message
app.get('/vip', (req, res) => {

    mysqlConnection.query('SELECT * FROM vip where id = 1', (err, rows, fields) => {

        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Get all message
app.get('/country', (req, res) => {

    mysqlConnection.query('SELECT * FROM country', (err, rows, fields) => {

        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Get all city by id 
app.get('/City/:id', (req, res) => {

    mysqlConnection.query('SELECT * FROM city where country_id = ?',[req.params.id], (err, rows, fields) => {

        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Get all users vip 
app.get('/users/vip' ,(req, res) => {

    mysqlConnection.query('SELECT users.*, country.name as country_name  FROM users  JOIN country ON country.id = users.country where users.status = 1', (err, rows, fields) => {

        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Get all users normal 
app.get('/users' ,(req, res) => {

    mysqlConnection.query('SELECT users.*, country.name as country_name  FROM users  JOIN country ON country.id = users.country where users.status = 0', (err, rows, fields) => {

        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Get all users fluter 
app.post('/users/fluter', (req, res) => {
    var sql = "SELECT users.*, country.name as country_name FROM users JOIN country ON country.id = users.country where users.status = ? AND  users.sex = ? AND users.country = ? AND users.city = ? AND users.age < ?";    
    mysqlConnection.query(sql, [0,req.body.sex ,req.body.country,req.body.city,req.body.age] ,(err, rows, fields) => {

        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Get an user by id 
app.get('/users/:id', (req, res) => {
    mysqlConnection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

// //Delete an users
app.delete('/users/:id', (req, res) => {
    mysqlConnection.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            res.send('Deleted successfully.');
        else
            console.log(err);
    })
});

// Insert an employees
app.post('/users', (req, res) => {
    var postData  = req.body;
    // res.send(postData);

    mysqlConnection.query('INSERT INTO users SET ?', postData, function (error, results, fields) {
        if (!err)
                rows.forEach(element => {
                    if(element.constructor == Array)
                    res.send('Inserted employee id : '+element[0].id);
                });
            else
                console.log(err);
     });

    console.log(req);
    var sql = "";
    mysqlConnection.query(sql, data, (err, rows, fields) => {
        if (!err)
            rows.forEach(element => {
                if(element.constructor == Array)
                res.send('Inserted employee id : '+element[0].id);
            });
        else
            console.log(err);
    })
});

// Update an employees
app.put('/users', (req, res) => {
    let emp = req.body;
    // console.log(emp);
    var sql = "SET @name = ?;SET @identity = ?;SET @message = ?;SET @sex = ?;SET @status = ?;SET @viewers = ?;SET @block = ?;SET @country = ?; \
    CALL EmployeeAddOrEdit(,@Name,@identity,@message,@sex,@status,@viewers,@block,@country);";
    mysqlConnection.query(sql, [emp.Name, emp.identity, emp.message,emp.sex,emp.status,emp.viewers,emp.block,emp.country], (err, rows, fields) => {
        if (!err)
            res.send('Updated successfully');
        else
            console.log(err);
    })
});
