var connection = require('../connection');
var path = require('path');
var fs = require('fs');
var Q = require("q");
var Feed = require("../models/Feed");
var APIError = require("../lib/APIError")

function Todo() {

    this.viewAll = function (res) {
        let newFeed = null;
        let size = 0;
        connection.acquire(function (err, con) {
            let object = [];
            let promises = [];
            con.query('select * from Feed order by time desc', function (err, result) {
                if (err) {
                    res.json("Error when querry database");
                } else {
                    size = result.length;
                    for (i in result) {
                        new Promise((resolve, reject) => {
                            let feed = {
                                id: result[i].id,
                                caption: result[i].caption,
                                file_music: result[i].file_music,
                                like_count: result[i].like_count,
                                like_flag: result[i].like_flag,
                                time: result[i].time,
                                id_user: result[i].id_user
                            }
                            resolve(feed);
                        })
                            .then(feed => {
                                return new Promise((resolve, reject) => {
                                    con.query("select * from User where id='" + feed.id_user + "'", function (err, rs) {
                                        if (err) {
                                            return reject("Error when querry database");
                                        } else {
                                            feed.avatar = rs[0].avatar;
                                            feed.username = rs[0].username
                                            resolve(feed);
                                        }
                                    })
                                });
                            })
                            .then(feed => {
                                return new Promise((resolve, reject) => {
                                    let f = feed;
                                    con.query("select * from Comment where id_feed=" + f.id, function (err, rs1) {
                                        if (err) {
                                            reject("Error querry database");
                                        }
                                        f.comment_count = rs1.length;
                                        f.comments = rs1;
                                        resolve(f);
                                    });
                                })
                            })
                            .then(feed => {
                                console.log("feed: " + feed.comments.length + " id: " + feed.id);
                                object.push(feed);
                                console.log("obSize: " + object.length + " size : " + size);
                                if (object.length == size) {
                                    res.json({
                                        feeds: object
                                    });
                                }
                            }).catch(function (error) {
                                console.log(error);
                                res.send(error);
                            })
                    }
                }
            })
        });
    };

    this.create = function (req, res, fileName) {
        console.log(req.file)
        let feed = req.body
        console.log("decode1: " + req.decoded.username)

        connection.acquire(function (err, con) {
            con.query("select * from User where username='" + req.decoded.username + "'", function (err, rs) {
                let date = new Date();
                con.query("INSERT INTO Feed VALUES(0,'" + feed.caption + "','" + rs[0].id + "','" + fileName + "',0,0," + date.getTime() + ")", feed, function (err, result) {
                    if (err) {
                        res.send('Error' + err);
                    }
                    else {
                        connection.acquire(function (err, con) {
                            console.log("id: " + feed.id_user)
                            con.query("SELECT * FROM `Feed` WHERE id_user=" + rs[0].id + " ORDER BY id DESC LIMIT 1", feed, function (err, result) {
                                if (err) {
                                    res.json(new APIError("Server error"));
                                }
                                else {
                                    res.json({
                                        feed: result[0]
                                    });
                                    console.log("result: " + result[0]);
                                    con.release();
                                }
                            });
                        });
                    }
                });
            });
        });
    };

    this.viewOne = function (req, res) {
        let username = req.decoded.username
        connection.acquire(function (err, con) {
            con.query("select * from User where username='" + username + "'", function (err, result) {
                if (err) {
                    res.send('Error' + err);
                }
                else {
                    console.log("id: " + result[0].id);
                    con.query("select * from Feed where id_user='" + result[0].id + "'", function (err, rs) {
                        if (err) {
                            res.send('Error' + err);
                        }
                        else {
                            let object = [];
                            for (i in rs) {
                                let feed = {
                                    id: rs[i].id,
                                    caption: rs[i].caption,
                                    avatar: result[0].avatar,
                                    username: result[0].username,
                                    file_music: rs[i].file_music,
                                    like_count: rs[i].like_count,
                                    like_flag: rs[i].like_flag,
                                    time: rs[i].time
                                }
                                con.query("select * from Comment where id_feed=" + rs[i].id, function (err, rs1) {
                                    feed.comment_counnt = rs1.length
                                    feed.comments = rs1;
                                    object.push(feed);
                                    console.log("onject.length: " + object.length + "rs.length: " + rs.length)
                                    if (object.length == rs.length) {
                                        res.json(object);
                                    }
                                });
                            }
                            con.release();
                        }
                    });
                }
            });
        });
    };

    this.like = function (req, res) {
        let idFeed = req.params.id;
        console.log("idFeed: " + idFeed);
        connection.acquire(function (err, con) {
            con.query("select like_count from Feed where id='" + idFeed + "'", function (err, result, field) {
                if (err) {
                    res.json(new APIError("Error when querry database"));
                } else {
                    console.log("likeCount: " + result[0].like_count);
                    let likeCount = result[0].like_count + 1;
                    con.query("update Feed set like_count=" + likeCount + ",like_flag=1 where id=" + idFeed, function (err, result) {
                        if (err) {
                            res.json(new APIError("Error when querry database"));
                        } else {
                            res.json({
                                like_count: likeCount
                            });
                        }
                    });
                }
                con.release();
            });
        });
    };

    this.unlike = function (req, res) {
        let idFeed = req.params.id;
        console.log("idFeed: " + idFeed);
        connection.acquire(function (err, con) {
            con.query("select like_count from Feed where id='" + idFeed + "'", function (err, result, field) {
                if (err) {
                    res.json(new APIError("Error when querry database"));
                } else {
                    console.log("likeCount: " + result[0].like_count);
                    let likeCount = result[0].like_count - 1;
                    con.query("update Feed set like_count=" + likeCount + ",like_flag=0 where id=" + idFeed, function (err, result) {
                        if (err) {
                            res.json(new APIError("Error when querry database"));
                        } else {
                            res.json({
                                like_count: likeCount
                            });
                        }
                    });
                }
                con.release();
            });
        });
    };

    this.comment = function (req, res) {
        let idFeed = req.params.id;
        let comment = req.body.comment;
        let username = req.decoded.username;
        console.log("user: " + username);
        let listComment = [];
        connection.acquire(function (err, con) {
            con.query("select * from User where username='" + username + "'", function (err, rs) {
                if (err) {
                    res.json(new APIError("Error when querry database 0"));
                } else if (rs.length != 0) {
                    let idUser = rs[0].id;
                    console.log("rs[0].id: " + rs[0].id);
                    let date = new Date();
                    con.query("insert into Comment values(0," + idUser + ",'" + rs[0].username + "','" + rs[0].avatar + "','" + comment + "'," + idFeed + "," + date.getTime() + ")", rs, function (err, rs1, field) {
                        if (err) {
                            res.json(new APIError("Error when querry database 1 + " + err));
                        } else {
                            con.query("select * from Comment where id_feed=" + idFeed, function (err, result) {
                                if (err) {
                                    res.json(new APIError("Error when querry database 3"));
                                } else {
                                    let size = result.length;
                                    for (i in result) {
                                        new Promise((resolve, reject) => {
                                            let response = {
                                                id: result[i].id,
                                                time: result[i].time,
                                                comment: result[i].comment,
                                                id_user_comment: result[i].id_user_comment
                                            };
                                            resolve(response);
                                        })
                                            .then(response => {
                                                return new Promise((resolve, reject) => {
                                                    id_user_comment: result[i].id_user_comment
                                                    con.query("select * from User where id='" + response.id_user_comment + "'", function (err, rs1) {
                                                        if (err) {
                                                            return reject("Error when querry database");
                                                        } else {
                                                            response.avatar = rs1[0].avatar;
                                                            response.username = rs1[0].username
                                                            resolve(response);
                                                        }
                                                    })
                                                });
                                            })
                                            .then(response => {
                                                listComment.push(response);
                                                if (listComment.length == size) {
                                                    res.json({
                                                        comments: listComment
                                                    });
                                                }
                                            }).catch(function (error) {
                                                console.log(error);
                                                res.send(error);
                                            })
                                    }
                                }
                            });
                        }
                        con.release();
                    });
                } else {
                    res.json("no token provider");
                }
            });
        });
    };

    this.comments = function (req, res) {
        let idFeed = req.params.id;
        let listComment = [];
        connection.acquire(function (err, con) {
            con.query("select * from Comment where id_feed='" + idFeed + "'", function (err, result) {
                if (err) {
                    res.json(new APIError("Error when querry database 0"));
                } else {
                    for (i in result) {
                        let comment = {
                            id: result[i].id,
                            time: result[i].time,
                            comment: result[i].comment,
                            idFeed: idFeed
                        };
                        con.query("select * from User where id='" + result[i].id_user_comment + "'", function (err, rs) {
                            if (err) {
                                res.json(new APIError("Error when querry database "));
                            } else {
                                comment.avatar = rs[0].avatar;
                                listComment.push(comment);
                                if (listComment.length == result.length) {
                                    res.json(listComment);
                                }
                            }
                        })
                    }
                }
            });
        });
    };

};
module.exports = new Todo();
