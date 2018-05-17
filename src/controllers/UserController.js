var connection = require('../connection');
var APIError=require('./../lib/APIError');
var path = require('path');
var fs = require('fs');
var Q = require("q");
var env="http://192.168.1.4:3000/";

function Todo() {

  this.get = function (req, res) {
    console.log("user controller")
    connection.acquire(function (err, con) {
      con.query("select * from User where username='" + req.decoded.username + "'", function (err, result) {
        if (err) return res.status(500).json(new APIError("server error"));
        con.release();
        res.json(result);
      });
    });
  };

  this.update = function (req, res) {
    let user = req.body
    connection.acquire(function (err, con) {
      let date = new Date();
      con.query("update User set username='" + user.username + "',password='" + user.password + "',update_at=" + date.getTime() + ",email='" + user.email + "'", user, function (err, result) {
        if (err) {
          console.log("error at update me: "+err);
          res.status(500).json(new APIError("Server error querry database"));
        }
        else {
          let userSuccess = {
            username: user.username,
            password: user.password
          }
          var token = jwt.sign(userSuccess, config.secret, {
            expiresIn: 2592000 // expires in 30 days
          });
          res.status(200).json({
            success: true,
            token: token,
            user: userSuccess
          });
        }
      });
    });
  };

  this.updateAvatar = function (req, res, filename) {
    let username = req.decoded.username
    connection.acquire(function (err, con) {
      let date = new Date();
      con.query("update User set update_at=" + date.getTime() + ",avatar='" + filename + "' where username='"+username+"'", function (err, result) {
        if (err) {
          console.log("errorrr: "+err);
          res.status(500).json(new APIError("Server error querry database"));
        }
        else {
          console.log("userjjvkjv: "+username);
          con.query("select * from user where username='"+username+"'",function(err,result1){
            if(err){
              res.status(500).json(new APIError("Server error querry database"));
            }else{
              let userUpdate=result1[0];
              userUpdate.avatar=env+"avatar/"+result1[0].avatar;
              res.json({
                user:userUpdate}
              );
              con.release();
            }
          });
        }
      });
    });
  };

  this.download = function (req, res) {
    res.sendFile(req.originalUrl, { root: '../../../../../mba0208/Desktop/server/kr_server/src/uploads/avatars/' });
  }

  this.downloadFile=function (req, res) {
    console.log("Eeeeeee:  "+req.originalUrl);
    res.sendFile(req.originalUrl, { root: '../../../../../mba0208/Desktop/server/kr_server/src/uploads/audios/' });
  }
};
module.exports = new Todo();
