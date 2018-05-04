var comment = require('../controllers/CommentController');

module.exports = {
    viewAll: function (req, res) {
        comment.get(res);
    },
    createFeed: function (req, res, fileName) {
        comment.create(req, res, fileName);
    },
    viewOne: function (req, res) {

    }
}
