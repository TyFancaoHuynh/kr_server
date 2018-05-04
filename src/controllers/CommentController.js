var connection = require('../connection');
var path = require('path');
var fs = require('fs');

function Todo() {

    this.get = function (res) {
        // connection.acquire(function (err, con) {
        //     con.query('select * from Feed', function (err, result) {
        //         con.release();
        //         res.send(result);
        //     });
        // });
    };

    this.create = function (req, res, fileName) {
        // console.log(req.file)
        // let feed = req.body
        // console.log("decode1: " + req.decoded.username)

        // connection.acquire(function (err, con) {
        //     con.query("INSERT INTO Feed VALUES(0,'" + feed.caption + "','" + feed.id_user + "','" + fileName + "')", feed, function (err, result) {
        //         if (err) {
        //             res.send('Error' + err);
        //         }
        //         else {
        //             connection.acquire(function (err, con) {
        //                 console.log("id: " + feed.id_user)
        //                 con.query("SELECT * FROM `Feed` WHERE id_user=" + feed.id_user + " ORDER BY id DESC LIMIT 1", feed, function (err, result) {
        //                     if (err) {
        //                         res.send('Error' + err);
        //                     }
        //                     else {
        //                         res.send(result);
        //                         console.log(result)
        //                         con.release();
        //                     }
        //                 });
        //             });
        //         }
        //     });
        // });

    }
};
module.exports = new Todo();
