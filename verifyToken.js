const jwt = require('jsonwebtoken');
module.exports = (req,res,next) => {
    const token = req.header('token');
    if(!token) return res.status(401).send("Access Denied");
    
    try {
        const doc  = jwt.verify(token,'secret');
        req.user = doc;
        next();
    } catch (error) {
        res.status(401).send(error);
    }
}
