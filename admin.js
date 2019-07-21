const verifyToken = require('verifyToken');
const router = require('express').Router();

app.post('/',verifyToken,(req, res) => {
    var postData = {
        email: req.body.email,
        password: req.body.password,
    };

    res.send(postData);

});

module.exports = router;