var connection = require('../connection');
var path = require('path');
var fs = require('fs');
var Q = require("q");
var Feed = require("../models/Feed");
var APIError = require("../lib/APIError")
var env="http://192.168.1.4:3000/";

function Todo() {

    this.viewAll = function (res) {
        let newFeed = null;
        let size = 0;
        connection.acquire(function (err, con) {
            let object = [];
            let promises = [];
            con.query('select * from Feed order by time desc', function (err, result) {
                if (err) {
                    res.status(500).json(new APIError("Server error querry database"));
                } else {
                    console.log("env: "+process.env.KARA_DOMAIN);
                    size = result.length;
                    if(result.length!=0){
                        for (i in result) {
                            new Promise((resolve, reject) => {
                                let image=null
                                    if(result[i].image_file!=null){
                                        image=env+result[i].image_file
                                    }
                                let feed = {
                                    id: result[i].id,
                                    caption: result[i].caption,
                                    file_music: env+ result[i].file_music,
                                    // file_music: process.env.KARA_DOMAIN + result[i].file_music,
                                    file_music_user_write: result[i].file_music_user_write,
                                    image_file:image,
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
                                                feed.avatar=env+"avatar/"+rs[0].avatar;
                                                // feed.avatar = process.env.KARA_DOMAIN + rs[0].avatar;
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
                                        con.release();
                                    }
                                }).catch(function (error) {
                                    console.log(error);
                                    res.status(500).json(new APIError("Server error"));
                                    con.release();
                                })
                        }
                    }else{
                        res.json({
                            feeds: object
                        });
                        con.release();
                    }
                    
                }
            })
        });
    };

    this.create = function (req, res, fileName,fileNameUserWrite,imageFile) {
        console.log(req.file)
        let feed = req.body
        console.log("decode1: " + req.decoded.username)

        connection.acquire(function (err, con) {
            con.query("select * from User where username='" + req.decoded.username + "'", function (err, rs) {
                let date = new Date();
                con.query("INSERT INTO Feed VALUES(0,'" + feed.caption + "','" + rs[0].id + "','" + fileName + "','"+fileNameUserWrite+"','"+imageFile+"',0,0," + date.getTime() + ")", feed, function (err, result) {
                    if (err) {
                        console.log("error at create feed: "+err);
                        res.status(500).json(new APIError("Server error"));
                    }
                    else {
                        connection.acquire(function (err, con) {
                            console.log("id: " + feed.id_user)
                            con.query("SELECT * FROM `Feed` WHERE id_user=" + rs[0].id + " ORDER BY id DESC LIMIT 1", feed, function (err, result) {
                                if (err) {
                                    res.status(500).json(new APIError("Server error"));
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
    }

    this.update = function (req, res, fileName,fileNameUserWrite) {
        console.log(req.file)
        let feed = req.body
        console.log("decode1: " + req.decoded.username)

        connection.acquire(function (err, con) {
            con.query("select * from User where username='" + req.decoded.username + "'", function (err, rs) {
                let date = new Date();
                    con.query("update Feed set caption='" + feed.caption + "',file_music='" + fileName + "',file_music_user_write'"+fileNameUserWrite+"',time=" + date.getTime() + ") where id="+feed.id, feed, function (err, result) {
                    if (err) {
                        res.status(500).json(new APIError("Server error"));
                    }
                    else {
                        connection.acquire(function (err, con) {
                            console.log("id: " + feed.id_user)
                            con.query("SELECT * FROM `Feed` WHERE id_user=" + rs[0].id + " ORDER BY id DESC LIMIT 1", feed, function (err, result) {
                                if (err) {
                                    res.status(500).json(new APIError("Server error"));
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
    }

        this.delete = function (req, res) {
            var feedId=req.params.id;
            connection.acquire(function (err, con) {
                    con.query("DELETE from Feed where id='"+feedId +"'", function (err, result) {
                        if (err) {
                            res.status(500).json(new APIError("Server error"));
                        }
                        else {
                            res.json({
                                status:true
                            })
                        }
                    });
                });
        };

    this.viewOne = function (req, res) {
        let username = req.decoded.username
        connection.acquire(function (err, con) {
            con.query("select * from User where username='" + username + "'", function (err, result) {
                if (err) {
                    res.status(500).json(new APIError("Server error querry database"));
                }
                else {
                    console.log("id: " + result[0].id);
                    con.query("select * from Feed where id_user='" + result[0].id + "' ORDER BY time DESC", function (err, rs) {
                        if (err) {
                            res.status(500).json(new APIError("Server error querry database"));
                        }
                        else {
                            let object = [];
                            if(rs.length!=0){
                                for (i in rs) {
                                    var image=null
                                    if(rs[i].image_file!=null){
                                        image=env+rs[i].image_file
                                    }
                                    let feed = {
                                        id: rs[i].id,
                                        caption: rs[i].caption,
                                        avatar: env+"avatar/"+ result[0].avatar,
                                        username: result[0].username,
                                        file_music: env+ rs[i].file_music,
                                        file_music_user_write: rs[i].file_music_user_write,
                                        image_file:image,
                                        like_count: rs[i].like_count,
                                        like_flag: rs[i].like_flag,
                                        time: rs[i].time
                                    }
                                    con.query("select * from Comment where id_feed=" + rs[i].id, function (err, rs1) {
                                        feed.comment_count = rs1.length
                                        feed.comments = rs1;
                                        object.push(feed);
                                        console.log("onject.length: " + object.length + "rs.length: " + rs.length)
                                        if (object.length == rs.length) {
                                            console.log("json respone")
                                            res.json({
                                                feeds:object
                                            });
                                            con.release();
                                        }
                                    });
                                }
                            }else{
                                res.json({
                                    feeds:object
                                })
                            con.release();
                            }
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
                             con.release();
                            
                        }
                    });
                }
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
                             con.release();
                            
                        }
                    });
                }
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
                                                            response.avatar = env+"avatar/"+ rs1[0].avatar;
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
                                                   con.release();
                                                    
                                                }
                                            }).catch(function (error) {
                                                console.log(error);
                                                res.status(500).send(error);
                                                con.release();
                                            })
                                    }
                                }
                            });
                        }
                    });
                } else {
                    res.status(401).json({
                        message: "no token provider"});
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
                    res.status(500).json(new APIError("Error when querry database 0"));
                } else if(result.length!=0){
                    for (i in result) {
                        let comment = {
                            id: result[i].id,
                            time: result[i].time,
                            comment: result[i].comment,
                            idFeed: idFeed
                        };
                        con.query("select * from User where id='" + result[i].id_user_comment + "'", function (err, rs) {
                            if (err) {
                                res.status(500).json(new APIError("Error when querry database "));
                            } else {
                                comment.avatar = env+"avatar/"+rs[0].avatar;
                                listComment.push(comment);
                                if (listComment.length == result.length) {
                                    res.json(listComment);
                                    con.release();
                                }
                            }
                        })
                    }
                }else{
                    res.json(listComment)
                    con.release();
                }
            });
        });
    };

};
module.exports = new Todo();
