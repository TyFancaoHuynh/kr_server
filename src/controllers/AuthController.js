var jwt = require('jsonwebtoken');
var ApiError = require('../lib/APIError');
var bcrypt = require('bcryptjs');
var connection = require('../connection');
var config = require('../config');
const HttpStatus = require('http-status');

function Todo() {
    this.register = function (req, res, next) {
        let user = req.body
        console.log("pass: " + user.password + "user  : " + user.username)
        // let hashedPassword = bcrypt.hashSync(user.password, 8);
        connection.acquire(function (err, con) {
            con.query("select * from User where username='" + user.username + "'", user, function (err, result) {
                if (err) return res.status(500).json(new ApiError("Server error"))
                let i = 0;
                for (j in result) {
                    i++;
                }
                if (i == 0) {
                    let date = new Date();
                    con.query("INSERT INTO User VALUES(0,'" + user.username + "','" + user.password + "','" + date.getTime() + "',null,null,null,null,null) ", user, function (err, result) {
                        if (err) {
                            return res.status(500).json(new ApiError("There was a problem registering the user."))
                        }
                        let userSuccess = {
                            username: user.username,
                            password: user.password
                        }
                        con.release();
                        let token = jwt.sign(userSuccess, config.secret, {
                            expiresIn: 2592000 // expires in 24 hours
                        });
                        res.json({
                            success: true,
                            token: token
                        })
                    });
                } else {
                    res.status(500).json(
                        {
                            success:false,
                            message:"Username has existed"
                        }
                    )
                }
            })
        });
    };

    this.checkToken = function (req, res, next) {
        let token = req.headers['x-access-token']
        if (token) {

            // verifies secret and checks exp
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    return res.status(401).json({ success: false, message: 'Failed to authenticate token' });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next();
                }
            });

        } else {
            // if there is no token
            // return an error
            return res.status(401).json({
                success: false,
                message: 'No token provided.'
            });

        }
    };

    this.login = function (req, res) {
        let user = req.body
        console.log("username at login : " + req.body.password)

        connection.acquire(function (err, con) {
            con.query("select * from User where username='" + user.username + "'", user, function (err, result) {
                if (err) {
                    return res.status(500).json(new ApiError("Error on the server"))
                }
                if (result.length != 0) {
                    var object = result[0];
                    console.log("resultlogin: " + bcrypt.compareSync(req.body.password, object.password));
                    // res.json(result)

                    // Check result í not empty , fun bycrypt.haSync wrong
                    con.release();
                    var passwordIsValid = req.body.password === object.password
                    if (!passwordIsValid) return res.status(401).json({
                        message:"Failed to authenticate token'"
                    });
                    let userSuccess = {
                        username: req.body.username,
                        password: req.body.password
                    }
                    var token = jwt.sign(userSuccess, config.secret, {
                        expiresIn: 2592000 // expires in 24 hours
                    });
                    res.status(200).json({
                        success: true,
                        token: token,
                        user:result[0]
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        message: "Username doesn't exist"
                    });
                }

            });
        });
    }
}
module.exports = new Todo()
