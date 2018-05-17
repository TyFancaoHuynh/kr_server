var mysql = require('mysql');

function Connection() {
  this.pool = null;

  this.init = function () {
    this.pool = mysql.createPool({
      connectionLimit: 10,
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'karaoke',
      port:"4000"
    });
  };

  this.acquire = function (callback) {
    this.pool.getConnection(function (err, connection) {
      if(err) console.log("error "+err);
      callback(err, connection);
    });
  };

  this.close = function () {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err)
          return reject(err);
        resolve();
      });
    });
  };
}

module.exports = new Connection();
