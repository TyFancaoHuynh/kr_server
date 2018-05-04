var connection = require('../connection');

function Todo() {

  this.get = function (req, res) {
    console.log("user controller")
    connection.acquire(function (err, con) {
      con.query("select * from User where username='" + req.decoded.username + "'", function (err, result) {
        if (err) return res.json(new APIError("server error"));
        con.release();
        res.json(result);
      });
    });
  };

  this.update = function (req, res, filename) {
    let user = req.body
    connection.acquire(function (err, con) {
      let date = new Date();
      con.query("update User set update_at=" + date.getTime() + "',avartar='" + filename + "',age=" + user.age + ",gender='" + user.gender + "'", user, function (err, result) {
        if (err) {
          res.send('Error' + err);
        }
        else {
          res.send(user);
        }
      });
    });
  };

  this.download = function (req, res) {
    console.log("req.originalUrl : " + req.originalUrl);
    console.log("dirname : " + __dirname);
    res.sendFile(req.originalUrl, { root: '../../../../../home/hoavot/karaoke_server/src/uploads/avatars/' });
  }
};
module.exports = new Todo();
