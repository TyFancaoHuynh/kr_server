var connection = require('../connection');
var path = require('path');
var fs = require('fs');
var Q = require("q");
var Feed = require("../models/Feed");
var APIError = require("../lib/APIError");
var env="http://192.168.43.21:3001/";

function Todo() {

    this.viewAll = function (req,res) {
        var username = req.decoded.username;
        let newFeed = null;
        let size = 0;
        connection.acquire(function (err, con) {
            let object = [];
            let promises = [];
            con.query('select * from Feed order by time desc', function (err, result) {
                if (err) {
                    res.status(500).json(new APIError("Server error querry database"));
                } else {
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
                                    like_count:result[i].like_count,                                   
                                    time: result[i].time,
                                    id_user: result[i].id_user
                                }
                                resolve(feed);
                            })
                            .then(feed=>{
                                return new Promise((resolve,reject)=>{
                                    con.query("select * from `Like` where username = '"+username+"' and id_feed="+feed.id,function(err,result){
                                         if(err) return reject(err);
                                            else{
                                                if(result.length!=0){
                                                    console.log("like_flag at 48: "+result[0].like_flag)
                                                    feed.like_flag=result[0].like_flag;
                                                }else{
                                                    feed.like_flag=0;
                                                }
                                               resolve(feed);                                               
                                            }
                                    })
                                })
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
                                            var comments=rs1;
                                            for(i in rs1){
                                                comments[i].avatar=env+"avatar/"+rs1[i].avatar;
                                            }
                                            f.comments = comments;
                                            resolve(f);
                                        });
                                    })
                                })
                                .then(feed => {
                                    object.push(feed);
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
        let username=req.decoded.username;
        let feed = req.body
        connection.acquire(function (err, con) {
            con.query("select * from User where username='" + req.decoded.username + "'", function (err, rs) {
                if(err) {
                       console.log("username: "+username+"  errr "+err);
                       res.status(500).json(new APIError("Server error"));
                }
                else{
                    let date = new Date();
                    con.query("INSERT INTO Feed VALUES(0,'" + feed.caption + "','" + rs[0].id + "','" + fileName + "','"+fileNameUserWrite+"','"+imageFile+"',0," + date.getTime() + ")", feed, function (err, result) {
                        if (err) {
                            console.log("error at create: "+err)
                            res.status(500).json(new APIError("Server error"));
                        }
                        else {
                            console.log("vo ko loi: 1 ");
                                con.query("SELECT * FROM Feed WHERE id_user=" + rs[0].id + " ORDER BY id DESC LIMIT 1", feed, function (err, result) {
                                    if (err) {
                                        console.log("errr111 at insert like: "+err);
                                        res.status(500).json(new APIError("Server error"));
                                    }
                                    else {
                                        console.log("vo ko loi: 0 "+result[0].id +"username: "+username);
                                       con.query("insert into `Like` values("+result[0].id+",'"+username+"',0)",function(err,res1){
                                        if(err) {
                                            console.log("errr at insert like: "+err)
                                             res.status(500).json(new APIError("Server error"));
                                        }
                                        else{
                                            console.log("vo ko loi: 2 ");
                                            res.json({
                                                feed: result[0]
                                            });
                                            con.release();
                                           }
                                        })  
                                    }
                                });
                        }
                    });
                }
            });
        });
    }

    this.update = function (req, res, fileName,fileNameUserWrite) {
        console.log(req.file)
        let feed = req.body

        connection.acquire(function (err, con) {
            con.query("select * from User where username='" + req.decoded.username + "'", function (err, rs) {
                let date = new Date();
                    con.query("update Feed set caption='" + feed.caption + "',file_music='" + fileName + "',file_music_user_write'"+fileNameUserWrite+"',time=" + date.getTime() + ") where id="+feed.id, feed, function (err, result) {
                    if (err) {
                        res.status(500).json(new APIError("Server error"));
                    }
                    else {
                        connection.acquire(function (err, con) {
                            con.query("SELECT * FROM `Feed` WHERE id_user=" + rs[0].id + " ORDER BY id DESC LIMIT 1", feed, function (err, result) {
                                if (err) {
                                    res.status(500).json(new APIError("Server error"));
                                }
                                else {
                                    res.json({
                                        feed: result[0]
                                    });
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
            let username=req.decoded.username;
            var feedId=req.params.id;
            connection.acquire(function (err, con) {
                    con.query("DELETE from Feed where id='"+feedId +"'", function (err, result) {
                        if (err) {
                            console.log("err at delete feed: "+err)
                            res.status(500).json(new APIError("Server error"));
                        }
                        else {
                            con.query("DELETE from `Like` where id_feed= "+feedId +" and username= '"+username+"'", function (err, result) {
                                if (err) {
                                    console.log("err at delete like 0: "+err)
                                    res.status(500).json(new APIError("Server error"));
                                }else{
                                    res.json({
                                        status:true
                                    })
                                }
                            })
                        
                        }
                    });
                });
        };

    this.viewOne = function (req, res) {
        let id = req.params.id;
        let username= req.decoded.username;
        connection.acquire(function (err, con) {
            con.query("select * from User where id='" + id + "'", function (err, result) {
                if (err) {
                    console.log("err11 at get feed one: "+err);
                    res.status(500).json(new APIError("Server error querry database"));
                }
                else {
                    if(result.length!=0){
                        con.query("select * from Feed where id_user='" + result[0].id + "' ORDER BY time DESC", function (err, rs) {
                            if (err) {
                                console.log("err12 at get feed one: "+err);
                                res.status(500).json(new APIError("Server error querry database"));
                            }
                            else {
                                let object = [];
                                if(rs.length!=0){
                                    for (i in rs) {
                                        var image=null
                                        if(rs[i].image_file !=null){
                                            image=env+rs[i].image_file
                                        }
                                        let feed = {
                                            id: rs[i].id,
                                            caption: rs[i].caption,
                                            avatar: env+"avatar/"+ result[0].avatar,
                                            username: result[0].username,
                                            id_user:rs[i].id_user,
                                            file_music: env+ rs[i].file_music,
                                            file_music_user_write: rs[i].file_music_user_write,
                                            image_file:image,
                                            like_count:rs[i].like_count,
                                            time: rs[i].time
                                        }
                                        con.query("select * from `Like` where id_feed="+rs[i].id +" and username= '"+username+"'",function(err,res1){
                                             if(err)  {
                                                console.log("err13 at get feed one: "+err);
                                                 res.status(500).json(new APIError("Server error querry database"));
                                             }
                                             else {
                                                 if(res1.length!=0){
                                                    feed.like_flag=res1[0].like_flag;
                                                    con.query("select * from Comment where id_feed=" + rs[i].id, function (err, rs1) {
                                                        feed.comment_count = rs1.length
                                                        feed.comments = rs1;
                                                        object.push(feed);
                                                        if (object.length == rs.length) {
                                                            res.json({
                                                                feeds:object
                                                            });
                                                            con.release();
                                                        }
                                                    });
                                                 }
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
                    }else{
                        res.json({
                            feeds:[]
                        })
                    }
                    
                }
            });
        });
    };

    this.like = function (req, res) {
        let username=req.decoded.username;
        let idFeed = req.params.id;
        connection.acquire(function (err, con) {
            con.query("select * from `Feed` where id=" + idFeed, function (err, result, field) {
                if (err) {
                    console.log("errrrrrr1 "+err);
                    res.status(500).json(new APIError("Error when querry database"));
                } else {
                    let likeCount = result[0].like_count + 1;
                    con.query("select * from `Like` where id_feed = " + idFeed +" and username ='"+username+"'",function(err,result2){
                        if (err) {
                            console.log("errr0000"+err);
                            res.status(500).json(new APIError("Error when querry database"));
                        } else {
                            if(result2.length!=0){
                                console.log("vo day ni 1");
                                con.query("update `Like` set like_flag = 1 where id_feed = " + idFeed +" and username ='"+username+"'", function (err, result) {
                                    if (err) {
                                        console.log("errrrrrr2 "+err);
                                        res.status(500).json(new APIError("Error when querry database"));
                                    } else {
                                        con.query("update `Feed` set like_count = "+likeCount+" where id = " + idFeed , function (err, result) {
                                            if (err) {
                                                console.log("errrrrrr2 "+err);
                                                res.status(500).json(new APIError("Error when querry database"));
                                            } else {
                                            res.json({
                                                    like_count: likeCount
                                                });
                                                 con.release();
                                            }
                                            })
                                    }
                                });
                            }else{
                                console.log("vo day ni 2  "+likeCount );
                                con.query("insert into `Like` values("+idFeed+",'"+username+"',1)", function (err, result) {
                                    if (err) {
                                        console.log("errrhhhhh "+err);
                                        res.status(500).json(new APIError("Error when querry database"));
                                    } else {
                                        con.query("update `Feed` set like_count = "+likeCount+" where id = " + idFeed , function (err, result) {
                                            if (err) {
                                                console.log("errrrrrr2 "+err);
                                                res.status(500).json(new APIError("Error when querry database"));
                                            } else {
                                            res.json({
                                                    like_count: likeCount
                                                });
                                                 con.release();
                                            }
                                            })
                                    }
                                });
                            }
                        }
                    })
                }
            });
        });
    };

    this.unlike = function (req, res) {
        let idFeed = req.params.id;
        let username=req.decoded.username;
        connection.acquire(function (err, con) {
            con.query("select * from `Feed` where id=" + idFeed, function (err, result, field) {
                if (err) {
                    console.log("errrrrrr1 "+err);
                    res.status(500).json(new APIError("Error when querry database"));
                } else {
                    let likeCount = result[0].like_count - 1;
                    con.query("update `Like` set like_flag = 0 where id_feed = " + idFeed +" and username ='"+username+"'", function (err, result) {
                        if (err) {
                            console.log("errrrrrr2 "+err);
                            res.status(500).json(new APIError("Error when querry database"));
                        } else {
                            con.query("update `Feed` set like_count = "+likeCount+" where id = " + idFeed , function (err, result) {
                                if (err) {
                                    console.log("errrrrrr2 "+err);
                                    res.status(500).json(new APIError("Error when querry database"));
                                } else {
                                res.json({
                                        like_count: likeCount
                                    });
                                     con.release();
                                }
                                })
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
        let listComment = [];
        connection.acquire(function (err, con) {
            con.query("select * from User where username='" + username + "'", function (err, rs) {
                if (err) {
                    res.json(new APIError("Error when querry database 0"));
                } else if (rs.length != 0) {
                    let idUser = rs[0].id;
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

    this.userLike=function(req,res){
        let feedId=req.params.id;
        let users=[];
        connection.acquire(function (err, con) {
            con.query("select * from `Like` where id_feed=" + feedId +" and like_flag=1", function (err, result) {
                if (err) {
                    console.log("err1 : "+err);
                    res.status(500).json(new APIError("Server error querry database"));
                    con.release();
                }
                else {
                    let size=result.length;
                    if(result.length!=0){
                        for(i in result){
                            con.query("select * from User where username='" + result[i].username + "'", function (err, result1) {
                                if (err) {
                                    console.log("err2 : "+err);
                                    res.status(500).json(new APIError("Server error querry database"));
                                }else{
                                    let user=result1[0];
                                    user.avatar=env+"avatar/"+result1[0].avatar
                                    users.push(user);
                                    if (users.length == size) {
                                        res.json({
                                            users:users
                                        });
                                        con.release();
                                    }
                                }
                            });
                        }
                    }else{
                        res.json(users);
                        con.release();
                    }
                }
            });
        });
    }

    this.viewOneWithID = function (req, res) {
        let idFeed = req.params.id;
        let userId= req.params.userId;
        connection.acquire(function (err, con) {
            con.query("select * from User where id='" + userId + "'", function (err, result) {
                if (err) {
                    console.log("err11 at get feed one: "+err);
                    res.status(500).json(new APIError("Server error querry database"));
                }
                else {
                    if(result.length!=0){
                        con.query("select * from Feed where id_user='" + result[0].id + "' and id="+idFeed+" ORDER BY time DESC", function (err, rs) {
                            if (err) {
                                console.log("err12 at get feed one: "+err);
                                res.status(500).json(new APIError("Server error querry database"));
                            }
                            else {
                                if(rs.length!=0){
                                    for (i in rs) {
                                        var image=null
                                        if(rs[i].image_file !=null){
                                            image=env+rs[i].image_file
                                        }
                                        let feed1 = {
                                            id: rs[i].id,
                                            caption: rs[i].caption,
                                            avatar: env+"avatar/"+ result[0].avatar,
                                            username: result[0].username,
                                            id_user:rs[i].id_user,
                                            file_music: env+ rs[i].file_music,
                                            file_music_user_write: rs[i].file_music_user_write,
                                            image_file:image,
                                            like_count:rs[i].like_count,
                                            time: rs[i].time
                                        }
                                       
                                            res.render("index",{feed:feed1});
                                            // res.json({
                                            //     feeds:object
                                            // });
                                            con.release();
                                        
                                    }
                                }else{
                                    res.render("index",{feed:{}});
                                    con.release();
                                }
                            }
                        });
                    }else{
                        res.render("index",{feed:{}});
                        con.release();
                    }
                    
                }
            });
        });
    };
};
module.exports = new Todo();
