/*
Encrypts token key 
which is then stored to the db
*/

var crypto = require('crypto');

var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
var key = process.env.SERVER_KEY;

exports.encrypt = function encrypt(accessToken){
    var cipher = crypto.createCipher(algorithm, key);
    return cipher.update(accessToken, 'utf8', 'hex') + cipher.final('hex');
};

exports.decrypt = function decrypt(encrypted){
    var decipher = crypto.createDecipher(algorithm, key);
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
};

