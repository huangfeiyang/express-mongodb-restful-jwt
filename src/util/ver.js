const jwt = require('jsonwebtoken');
var signKey = 'hello';

exports.setToken = async (username) => {
    return new Promise((resolve, reject) => {
        let token = jwt.sign({
            name:username,
        }, signKey, { expiresIn:'1h' });
        resolve(token);
    })
};

exports.verToken = async (token) => {
    return new Promise((resolve, reject) => {
        let info = jwt.verify(token.split(' ')[1], signKey);
        resolve(info);
    })
};