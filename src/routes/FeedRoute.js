var feed = require('../controllers/FeedController');

var timeout=10000
module.exports = {
    viewAll: function (req, res) {
    feed.viewAll(req,res);
    },
    createFeed: function (req, res, fileName,fileNameUserWrite,imageFile) {
            feed.create(req, res, fileName,fileNameUserWrite,imageFile);
    },
    viewOne: function (req, res) {
            feed.viewOne(req, res);
    },
    like: function (req, res) {
            feed.like(req, res);
    },
    unlike: function (req, res) {
            feed.unlike(req, res);
    },
    comment: function (req, res) {
            feed.comment(req, res);
    },
    comments: function (req, res) {
            feed.comments(req, res);
    },
    deleteFeed:function(req,res){
            feed.delete(req,res);
    },
    updateFeed:function(req, res, fileName,fileNameUserWrite){
            feed.updateFeed(req,res,fileName,fileNameUserWrite);
    },
    userLike:function(req,res){
            feed.userLike(req,res);
    },
    viewOneWithID:function(req,res){
            feed.viewOneWithID(req,res);
    }
}

