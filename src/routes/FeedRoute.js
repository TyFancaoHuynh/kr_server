var feed = require('../controllers/FeedController');

module.exports = {
    viewAll: function (req, res) {
        feed.viewAll(res);
    },
    createFeed: function (req, res, fileName) {
        feed.create(req, res, fileName);
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
    }
}

