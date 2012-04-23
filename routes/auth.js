/**
 * Authentication module
 */

var crypto = require('crypto');
var User = require('../models/User');

// Can improve down the line by making unique per user
var salt = "f#@Xu^%Hg*YBCs";

exports.addUser = addUser;
exports.authenticate = authenticate;
exports.encrypt = encrypt;
exports.getUser = getUser;
exports.removeUser = removeUser;

/**
exports.register = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    console.log('adding user');
    addUser(username, password, function(err, user) {
        console.log('user added');
        req.user = user;
        res.redirect('/tracker');
    });
}*/

// Add user to database
function addUser(username, password, callback) {

    var encrypted = encrypt(password, salt);

    var instance = new User();
    instance.username = username;
    instance.password = encrypted;

    instance.save(function (err) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, instance);
        }

    });

}

// Authenticate
function authenticate(username, password, callback) {

    console.log('authenticating %s:%s', username, password);

    // query the db for the given username
    getUser(username, function(err, user) {
        if (err) callback(err);
        if (!user) return callback(new Error('cannot find user'));

        // apply the same algorithm to the POSTed password, applying
        // the hash against the pass / salt, if there is a match we
        // found the user
        if (user.password == encrypt(password, salt)) return callback(null, user);

        // Otherwise password is invalid
        callback(new Error('invalid password'));
    });

}

// Used to generate a hash of the plain-text password + salt
function encrypt(msg, key) {
    return crypto
        .createHmac('sha256', key)
        .update(msg)
        .digest('hex');
}

// Retrieve user, null for non-existent
function getUser(username, callback) {
    User.findOne({'username': username}, function(err, doc) {
        if (err) {
            callback(err);
        }
        else
            callback(null, doc);
    });
}

// Remove user
function removeUser(username, callback) {
    User.findOne({'username': username}, function(err, doc) {
        if (err) {
            callback(err);
        }
        else {
            if (null == doc) callback(err);
            else {
                doc.remove(function(err) {
                    callback(err);
                });
            }

        }
    });
}
