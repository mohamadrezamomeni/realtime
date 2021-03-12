var jwt = require('jsonwebtoken');

module.exports = (token) => {
    return new Promise((resolve, reject)=>{
        jwt.verify(token, process.env.SECRET_JWT_KEY, (err, decoded)=>{
            if (err) reject(err);
            if (decoded) resolve(decoded);
        })
    });
};